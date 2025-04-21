import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';

// פונקציית עזר לקבלת תאריך בפורמט YYYY-MM-DD
const getFormattedDate = (offsetDays = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function Dashboard() {
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // טעינת כל המשימות מכל התיקיות
    useEffect(() => {
        const loadAllTasks = async () => {
            try {
                setIsLoading(true);
                // 1. קבלת כל התיקיות
                const folders = await apiService.getFolders();

                // 2. יצירת מערך לאיסוף כל המשימות
                let allTasksTemp = [];

                // 3. טיפול בכל תיקיה בנפרד, אבל לא נכשלים אם תיקיה אחת נכשלת
                if (folders && folders.length > 0) {
                    for (const folder of folders) {
                        try {
                            const folderTasks = await apiService.getTasks(folder._id);
                            if (folderTasks && Array.isArray(folderTasks)) {
                                // הוספת שם התיקיה לכל משימה להצגה
                                const tasksWithFolderInfo = folderTasks.map(task => ({
                                    ...task,
                                    folderName: folder.name
                                }));
                                allTasksTemp = [...allTasksTemp, ...tasksWithFolderInfo];
                            }
                        } catch (folderError) {
                            console.error(`Error fetching tasks for folder ${folder.name}:`, folderError);
                            // ממשיכים לתיקיה הבאה ולא נכשלים לגמרי
                        }
                    }
                }

                setAllTasks(allTasksTemp);
            } catch (err) {
                console.error("Error loading dashboard data:", err);
                setError("לא ניתן לטעון את המשימות. בדוק את החיבור לשרת.");
            } finally {
                setIsLoading(false);
            }
        };

        loadAllTasks();
    }, []);

    // סינון וחישובים
    const todayStr = getFormattedDate();
    const nextWeekStr = getFormattedDate(7);

    const upcomingTasks = allTasks.filter(task =>
        !task.completed &&
        task.dueDate &&
        task.dueDate >= todayStr &&
        task.dueDate <= nextWeekStr
    ).sort((a, b) => (a.dueDate > b.dueDate) ? 1 : -1);

    const overdueTasks = allTasks.filter(task =>
        !task.completed &&
        task.dueDate &&
        task.dueDate < todayStr
    ).sort((a, b) => (a.dueDate > b.dueDate) ? 1 : -1);

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    // תצוגה בזמן טעינה
    if (isLoading) {
        return <div className="dashboard-container">
            <h1>DoZen</h1>
            <p>טוען נתונים...</p>
        </div>;
    }

    // תצוגה במקרה של שגיאה
    if (error) {
        return <div className="dashboard-container">
            <h1>DoZen</h1>
            <p className="error-message">{error}</p>
        </div>;
    }

    return (
        <div className="dashboard-container">
            <h1>DoZen</h1>
            <h3>דף הבית</h3>
            <p>ברוכים הבאים לאפליקציית המשימות!</p>

            <div className="dashboard-stats">
                <p>סה"כ משימות: <strong>{totalTasks}</strong></p>
                <p>משימות פתוחות: <strong>{pendingTasks}</strong></p>
                <p>משימות שהושלמו: <strong>{completedTasks}</strong></p>
            </div>

            <div className="dashboard-section">
                <h3>משימות לשבוע הקרוב ({upcomingTasks.length})</h3>
                {upcomingTasks.length > 0 ? (
                    <ul className="dashboard-task-list">
                        {upcomingTasks.map(task => (
                            <li key={task._id}>
                                <span className="task-text">{task.text}</span>
                                <span className="due-date">(עד: {task.dueDate ? task.dueDate.split('T')[0] : ''})</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-tasks-message">אין משימות קרובות.</p>
                )}
            </div>

            <div className="dashboard-section">
                <h3>משימות שעבר זמנן ({overdueTasks.length})</h3>
                {overdueTasks.length > 0 ? (
                    <ul className="dashboard-task-list overdue-list">
                        {overdueTasks.map(task => (
                            <li key={task._id}>
                                <span className="task-text">{task.text}</span>
                                <span className="due-date">(תאריך יעד: {task.dueDate ? task.dueDate.split('T')[0] : ''})</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-tasks-message">כל הכבוד! אין משימות שעבר זמנן.</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;