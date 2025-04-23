// --- client/src/components/sharing/SharingDialog.jsx ---
/**
 * קומפוננטת דיאלוג לניהול שיתוף תיקיות ומשימות
 * מאפשרת למשתמש לשתף פריטים עם אחרים, לנהל הרשאות ולהסיר שיתופים
 */
import { useState, useEffect } from 'react';
import sharingService from '../../services/sharingService';
import './SharingStyles.css';

// אייקונים
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline points="16 6 12 2 8 6"></polyline>
        <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
);

const UserAddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>
);

/**
 * דיאלוג שיתוף משימות ותיקיות
 * @param {Object} props - מאפייני הקומפוננטה
 * @param {string} props.itemType - סוג הפריט לשיתוף ('folder' או 'task')
 * @param {string} props.itemId - מזהה הפריט (תיקיה או משימה)
 * @param {string} props.itemName - שם הפריט לשיתוף
 * @param {boolean} props.isOpen - האם הדיאלוג פתוח
 * @param {function} props.onClose - פונקציה להפעלה בעת סגירת הדיאלוג
 * @param {function} props.onShared - פונקציה להפעלה לאחר שיתוף מוצלח
 */
function SharingDialog({ itemType, itemId, itemName, isOpen, onClose, onShared }) {
    const [sharedUsers, setSharedUsers] = useState([]);
    const [email, setEmail] = useState('');
    const [accessType, setAccessType] = useState('view');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // טעינת רשימת המשתמשים המשותפים בטעינת הדיאלוג
    useEffect(() => {
        if (isOpen && itemId) {
            loadSharedUsers();
        }
    }, [isOpen, itemId]);

    // טעינת רשימת המשתמשים המשותפים
    const loadSharedUsers = async () => {
        if (!itemId) return;

        setIsLoading(true);
        setError('');

        try {
            let users;
            if (itemType === 'folder') {
                users = await sharingService.getFolderSharedUsers(itemId);
            } else if (itemType === 'task') {
                users = await sharingService.getTaskSharedUsers(itemId);
            } else if (itemType === 'subtask') {
                users = await sharingService.getSubtaskSharedUsers(itemId);
            }

            if (users && users.sharedWith) {
                setSharedUsers(users.sharedWith);
            }
        } catch (err) {
            console.error(`Error loading shared users for ${itemType}:`, err);
            setError(`לא ניתן היה לטעון את רשימת המשתמשים המשותפים: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // טיפול בשיתוף חדש
    const handleShare = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('נדרש אימייל לשיתוף');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (itemType === 'folder') {
                await sharingService.shareFolder(itemId, email, accessType);
            } else if (itemType === 'task') {
                await sharingService.shareTask(itemId, email, accessType);
            } else if (itemType === 'subtask') {
                await sharingService.shareSubtask(itemId, email, accessType);
            }

            // טעינה מחדש של רשימת השיתופים
            await loadSharedUsers();

            // ניקוי טופס
            setEmail('');

            // קריאה לפונקציית ההורה
            if (onShared) {
                onShared();
            }
        } catch (err) {
            console.error(`Error sharing ${itemType}:`, err);
            setError(`שגיאה בשיתוף: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // הסרת שיתוף משתמש
    const handleRemoveUser = async (userId) => {
        if (!window.confirm('האם אתה בטוח שברצונך להסיר את השיתוף עם משתמש זה?')) {
            return;
        }

        setIsLoading(true);

        try {
            if (itemType === 'folder') {
                await sharingService.removeUserFromFolder(itemId, userId);
            } else if (itemType === 'task') {
                await sharingService.removeUserFromTask(itemId, userId);
            } else if (itemType === 'subtask') {
                await sharingService.removeUserFromSubtask(itemId, userId);
            }

            // טעינה מחדש של רשימת השיתופים
            await loadSharedUsers();

            // קריאה לפונקציית ההורה
            if (onShared) {
                onShared();
            }
        } catch (err) {
            console.error(`Error removing user from ${itemType}:`, err);
            setError(`שגיאה בהסרת השיתוף: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // אם הדיאלוג סגור, אין מה להציג
    if (!isOpen) return null;

    return (
        <div className="sharing-dialog-overlay">
            <div className="sharing-dialog">
                <div className="sharing-dialog-header">
                    <h3>
                        <ShareIcon />
                        שיתוף {itemType === 'folder' ? 'תיקיה' : itemType === 'task' ? 'משימה' : 'תת משימה'}: {itemName}
                    </h3>
                    <button className="close-button" onClick={onClose} aria-label="סגור">
                        <CloseIcon />
                    </button>
                </div>

                <div className="sharing-dialog-content">
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleShare} className="sharing-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="share-email">שתף עם משתמש (אימייל):</label>
                                <input
                                    type="email"
                                    id="share-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="הזן אימייל של משתמש"
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="access-type">סוג הרשאה:</label>
                                <select
                                    id="access-type"
                                    value={accessType}
                                    onChange={(e) => setAccessType(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="view">צפייה בלבד</option>
                                    <option value="edit">עריכה מלאה</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="share-button"
                                disabled={isLoading}
                            >
                                <UserAddIcon />
                                שתף
                            </button>
                        </div>
                    </form>

                    <div className="shared-users-list">
                        <h4>משתמשים משותפים:</h4>
                        {isLoading && <p>טוען...</p>}

                        {!isLoading && sharedUsers.length === 0 && (
                            <p className="empty-list-message">
                                הפריט הזה אינו משותף עם אף משתמש כרגע.
                            </p>
                        )}

                        {!isLoading && sharedUsers.length > 0 && (
                            <ul>
                                {sharedUsers.map((share) => (
                                    <li key={share.user._id || share.user} className="shared-user-item">
                                        <div className="user-info">
                                            <span className="user-name">
                                                {share.user.name || 'משתמש'}
                                            </span>
                                            <span className="user-email">
                                                {share.user.email || 'אימייל לא זמין'}
                                            </span>
                                            <span className={`access-badge ${share.accessType}`}>
                                                {share.accessType === 'view' ? 'צפייה' : 'עריכה'}
                                            </span>
                                        </div>
                                        <button
                                            className="remove-user-button"
                                            onClick={() => handleRemoveUser(share.user._id || share.user)}
                                            disabled={isLoading}
                                        >
                                            הסר
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="sharing-dialog-footer">
                    <button className="cancel-button" onClick={onClose} disabled={isLoading}>
                        סגור
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SharingDialog;