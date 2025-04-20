// --- client/src/services/sharingService.jsx ---
/**
 * שירות API לניהול שיתוף של תיקיות ומשימות
 * מספק פונקציות לשיתוף, הסרת שיתוף וקבלת מידע על פריטים משותפים
 */

const API_BASE_URL = 'https://dozen.onrender.com/api';

const getToken = () => {
    return localStorage.getItem('authToken');
};

// פונקציית עזר לביצוע קריאות מאומתות
const fetchAuthenticated = async (url, options = {}) => {
    try {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { ...options, headers });

        // טיפול בתשובות ללא גוף
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            if (response.ok) return null; // אין תוכן, אבל הבקשה הצליחה
            throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
        }

        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            // שימוש בהודעת שגיאה מהשרת אם קיימת
            throw new Error(data?.message || `API Error: ${response.statusText} (Status: ${response.status})`);
        }
    } catch (error) {
        // שגיאות רשת כלליות
        if (!error.message.includes('API Error')) {
            console.error("Network Error:", error);
            throw new Error("Could not connect to server. Please check your connection.");
        }
        throw error;
    }
};

// --- פונקציות API לשיתוף תיקיות ---

/**
 * שיתוף תיקיה עם משתמש אחר לפי אימייל
 * @param {string} folderId - מזהה התיקיה
 * @param {string} email - אימייל המשתמש לשיתוף
 * @param {string} accessType - סוג ההרשאה (view או edit)
 * @returns {Promise<Object>}
 */
const shareFolder = async (folderId, email, accessType = 'view') => {
    return await fetchAuthenticated(`${API_BASE_URL}/sharing/folders/${folderId}`, {
        method: 'POST',
        body: JSON.stringify({ email, accessType }),
    });
};

/**
 * הסרת משתמש משיתוף תיקיה
 * @param {string} folderId - מזהה התיקיה
 * @param {string} userId - מזהה המשתמש להסרה
 * @returns {Promise<Object>}
 */
const removeUserFromFolder = async (folderId, userId) => {
    return await fetchAuthenticated(`${API_BASE_URL}/sharing/folders/${folderId}/users/${userId}`, {
        method: 'DELETE',
    });
};

/**
 * קבלת רשימת המשתמשים שתיקיה משותפת איתם
 * @param {string} folderId - מזהה התיקיה
 * @returns {Promise<Object>}
 */
const getFolderSharedUsers = async (folderId) => {
    return await fetchAuthenticated(`${API_BASE_URL}/sharing/folders/${folderId}/users`);
};

/**
 * קבלת רשימת תיקיות שמשותפות עם המשתמש המחובר
 * @returns {Promise<Array>}
 */
const getSharedFolders = async () => {
    return await fetchAuthenticated(`${API_BASE_URL}/sharing/folders/shared-with-me`);
};

// --- פונקציות API לשיתוף משימות ---

/**
 * שיתוף משימה עם משתמש אחר לפי אימייל
 * @param {string} taskId - מזהה המשימה
 * @param {string} email - אימייל המשתמש לשיתוף
 * @param {string} accessType - סוג ההרשאה (view או edit)
 * @returns {Promise<Object>}
 */
const shareTask = async (taskId, email, accessType = 'view') => {
    return await fetchAuthenticated(`${API_BASE_URL}/sharing/tasks/${taskId}`, {
        method: 'POST',
        body: JSON.stringify({ email, accessType }),
    });
};

/**
 * הסרת משתמש משיתוף משימה
 * @param {string} taskId - מזהה המשימה
 * @param {string} userId - מזהה המשתמש להסרה
 * @returns {Promise<Object>}
 */
const removeUserFromTask = async (taskId, userId) => {
    return await fetchAuthenticated(`${API_BASE_URL}/sharing/tasks/${taskId}/users/${userId}`, {
        method: 'DELETE',
    });
};

/**
 * קבלת רשימת המשתמשים שמשימה משותפת איתם
 * @param {string} taskId - מזהה המשימה
 * @returns {Promise<Object>}
 */
const getTaskSharedUsers = async (taskId) => {
    return await fetchAuthenticated(`${API_BASE_URL}/sharing/tasks/${taskId}/users`);
};

/**
 * קבלת רשימת משימות שמשותפות עם המשתמש המחובר
 * @returns {Promise<Array>}
 */
const getSharedTasks = async () => {
    return await fetchAuthenticated(`${API_BASE_URL}/sharing/tasks/shared-with-me`);
};

// ייצוא השירות
const sharingService = {
    shareFolder,
    removeUserFromFolder,
    getFolderSharedUsers,
    getSharedFolders,
    shareTask,
    removeUserFromTask,
    getTaskSharedUsers,
    getSharedTasks
};

export default sharingService;