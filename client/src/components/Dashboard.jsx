import React from 'react';

// --- פונקציית עזר לקבלת תאריך בפורמט YYYY-MM-DD ---
// מחזירה את התאריך של היום או תאריך עתידי/קודם
const getFormattedDate = (offsetDays = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // חודשים הם 0-11
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
// -------------------------------------------------

// קומפוננטת הדשבורד המשודרגת
function Dashboard({ tasks = [] }) {

    // --- לוגיקת סינון משימות ---
    const todayStr = getFormattedDate(); // תאריך היום
    const nextWeekStr = getFormattedDate(7); // תאריך בעוד שבוע

    const upcomingTasks = tasks.filter(task =>
        !task.completed && // רק משימות שלא הושלמו
        task.dueDate && // רק אם יש תאריך יעד
        task.dueDate >= todayStr && // שתאריך היעד הוא מהיום ואילך
        task.dueDate <= nextWeekStr // וגם לפני או בתאריך של עוד שבוע
    ).sort((a, b) => (a.dueDate > b.dueDate) ? 1 : -1); // מיון לפי תאריך

    const overdueTasks = tasks.filter(task =>
        !task.completed && // רק משימות שלא הושלמו
        task.dueDate && // רק אם יש תאריך יעד
        task.dueDate < todayStr // שתאריך היעד עבר
    ).sort((a, b) => (a.dueDate > b.dueDate) ? 1 : -1); // מיון לפי תאריך

    // חישובים קיימים
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    // -----------------------------

    return (
        <div className="dashboard-container">
            <h1>DoZen</h1>

            <h3>דף הבית</h3>
            <p>ברוכים הבאים לאפליקציית המשימות!</p>

            {/* סטטיסטיקה קיימת */}
            <div className="dashboard-stats">
                <p>סה"כ משימות: <strong>{totalTasks}</strong></p>
                <p>משימות שהושלמו: <strong>{completedTasks}</strong></p>
            </div>

            {/* --- תצוגת משימות קרובות --- */}
            <div className="dashboard-section">
                <h3>משימות לשבוע הקרוב ({upcomingTasks.length})</h3>
                {upcomingTasks.length > 0 ? (
                    <ul className="dashboard-task-list">
                        {upcomingTasks.map(task => (
                            <li key={task.id}>
                                <span className="task-text">{task.text}</span>
                                <span className="due-date">(עד: {task.dueDate})</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-tasks-message">אין משימות קרובות.</p>
                )}
            </div>
            {/* --------------------------- */}

            {/* --- תצוגת משימות שעבר זמנן --- */}
            <div className="dashboard-section">
                <h3>משימות שעבר זמנן ({overdueTasks.length})</h3>
                {overdueTasks.length > 0 ? (
                    <ul className="dashboard-task-list overdue-list">
                        {overdueTasks.map(task => (
                            <li key={task.id}>
                                <span className="task-text">{task.text}</span>
                                <span className="due-date">(תאריך יעד: {task.dueDate})</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-tasks-message">כל הכבוד! אין משימות שעבר זמנן.</p>
                )}
            </div>
            {/* ----------------------------- */}

        </div>
    );
}

export default Dashboard;
