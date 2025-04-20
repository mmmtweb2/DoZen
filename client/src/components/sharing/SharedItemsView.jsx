// --- client/src/components/sharing/SharedItemsView.jsx ---
/**
 * קומפוננטה להצגת פריטים משותפים עם המשתמש המחובר
 * מציגה תיקיות ומשימות שמשתמשים אחרים שיתפו עם המשתמש הנוכחי
 */
import React, { useState, useEffect } from 'react';
import sharingService from '../../services/sharingService';
import '../../components/sharing/';

// אייקונים
const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);

const TaskIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
        <line x1="16" x2="16" y1="2" y2="6"></line>
        <line x1="8" x2="8" y1="2" y2="6"></line>
        <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
);

/**
 * קומפוננטה לתצוגת פריטים משותפים
 * @param {Object} props - מאפייני הקומפוננטה
 * @param {function} props.onSelectFolder - פונקציה להפעלה בעת בחירת תיקיה משותפת
 */
function SharedItemsView({ onSelectFolder }) {
    const [sharedFolders, setSharedFolders] = useState([]);
    const [sharedTasks, setSharedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // טעינת פריטים משותפים בעת טעינת הקומפוננטה
    useEffect(() => {
        loadSharedItems();
    }, []);

    // טעינת פריטים משותפים (תיקיות ומשימות)
    const loadSharedItems = async () => {
        setIsLoading(true);
        setError('');

        try {
            // טעינת תיקיות משותפות
            const folders = await sharingService.getSharedFolders();
            setSharedFolders(folders || []);

            // טעינת משימות משותפות
            const tasks = await sharingService.getSharedTasks();
            setSharedTasks(tasks || []);
        } catch (err) {
            console.error('Error loading shared items:', err);
            setError(`לא ניתן היה לטעון פריטים משותפים: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // עיבוד תאריך לפורמט קריא
    const formatDate = (dateString) => {
        if (!dateString) return 'אין תאריך';
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL');
    };

    // הפעלת פונקציית הבחירה בעת לחיצה על תיקיה
    const handleFolderSelect = (folderId) => {
        if (onSelectFolder) {
            onSelectFolder(folderId);
        }
    };

    // בדיקה אם הכל טעון ואין פריטים משותפים
    const noSharedItems = !isLoading && sharedFolders.length === 0 && sharedTasks.length === 0;

    return (
        <div className="shared-items-container">
            <h2>פריטים משותפים איתך</h2>

            {error && <div className="error-message">{error}</div>}

            {isLoading && <div className="loading-message">טוען פריטים משותפים...</div>}

            {noSharedItems && (
                <div className="empty-state">
                    <p>אין פריטים משותפים איתך כרגע.</p>
                    <p className="empty-state-note">כאשר מישהו ישתף איתך תיקיה או משימה, היא תופיע כאן.</p>
                </div>
            )}

            {/* תיקיות משותפות */}
            {sharedFolders.length > 0 && (
                <section className="shared-section shared-folders-section">
                    <h3>
                        <FolderIcon /> תיקיות משותפות ({sharedFolders.length})
                    </h3>
                    <ul className="shared-folders-list">
                        {sharedFolders.map(folder => (
                            <li
                                key={folder._id}
                                className="shared-folder-item"
                                onClick={() => handleFolderSelect(folder._id)}
                            >
                                <div className="shared-item-info">
                                    <div className="shared-item-title">{folder.name}</div>
                                    <div className="shared-item-meta">
                                        <span className="shared-by">
                                            <UserIcon /> {folder.user?.name || 'משתמש'}
                                        </span>
                                        <span className={`access-type ${folder.sharedWith[0]?.accessType || 'view'}`}>
                                            {folder.sharedWith[0]?.accessType === 'edit' ? 'עריכה' : 'צפייה'}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* משימות משותפות */}
            {sharedTasks.length > 0 && (
                <section className="shared-section shared-tasks-section">
                    <h3>
                        <TaskIcon /> משימות משותפות ({sharedTasks.length})
                    </h3>
                    <ul className="shared-tasks-list">
                        {sharedTasks.map(task => (
                            <li key={task._id} className="shared-task-item">
                                <div className="shared-item-info">
                                    <div className="shared-item-title">
                                        {task.text}
                                        {task.completed && <span className="task-completed-badge">הושלם</span>}
                                    </div>
                                    <div className="shared-item-meta">
                                        <span className="shared-by">
                                            <UserIcon /> {task.user?.name || 'משתמש'}
                                        </span>
                                        {task.dueDate && (
                                            <span className="due-date">
                                                <CalendarIcon /> {formatDate(task.dueDate)}
                                            </span>
                                        )}
                                        {task.priority && (
                                            <span className={`priority-indicator priority-${task.priority.toLowerCase()}`}>
                                                {task.priority === 'High' ? 'גבוהה' :
                                                    task.priority === 'Medium' ? 'בינונית' : 'נמוכה'}
                                            </span>
                                        )}
                                        <span className={`access-type ${task.sharedWith[0]?.accessType || 'view'}`}>
                                            {task.sharedWith[0]?.accessType === 'edit' ? 'עריכה' : 'צפייה'}
                                        </span>
                                    </div>
                                </div>
                                {task.folder && (
                                    <div className="shared-task-folder" onClick={(e) => {
                                        e.stopPropagation();
                                        handleFolderSelect(task.folder._id);
                                    }}>
                                        <FolderIcon /> {task.folder.name}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="refresh-button-container">
                <button
                    className="refresh-shared-items-button"
                    onClick={loadSharedItems}
                    disabled={isLoading}
                >
                    רענן רשימה
                </button>
            </div>
        </div>
    );
}

export default SharedItemsView;