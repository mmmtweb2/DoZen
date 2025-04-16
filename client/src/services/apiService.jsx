// --- src/services/apiService.js ---

const API_BASE_URL = 'http://localhost:5000/api'; // ודא שהנתיב נכון

const getToken = () => {
    return localStorage.getItem('authToken');
};

// פונקציית עזר לביצוע קריאות מאומתות
const fetchAuthenticated = async (url, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    // שופרה מעט לטיפול בתשובות ללא גוף (כמו במחיקה)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        if (response.ok) return null; // אין תוכן, אבל הבקשה הצליחה
        else throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
    }

    const data = await response.json();

    if (response.ok) {
        return data;
    } else {
        // ננסה להשתמש בהודעה מהשרת אם קיימת
        throw new Error(data?.message || `API Error: ${response.statusText} (Status: ${response.status})`);
    }
};


// --- פונקציות API לתיקיות (קיימות) ---
const getFolders = async () => {
    return await fetchAuthenticated(`${API_BASE_URL}/folders`);
};
const createFolder = async (folderData) => {
    return await fetchAuthenticated(`${API_BASE_URL}/folders`, {
        method: 'POST',
        body: JSON.stringify(folderData),
    });
};

// --- פונקציות API למשימות ---

// קבלת משימות עבור תיקיה ספציפית
const getTasks = async (folderId) => {
    if (!folderId) return []; // אם אין ID של תיקיה, החזר מערך ריק
    // שליחת ה-folderId כ-query parameter
    return await fetchAuthenticated(`${API_BASE_URL}/tasks?folderId=${folderId}`);
};

// יצירת משימה חדשה
const createTask = async (taskData) => {
    // taskData צריך להכיל text, folderId, ואופציונלית dueDate, priority
    return await fetchAuthenticated(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
    });
};

// עדכון משימה קיימת
const updateTask = async (taskId, updateData) => {
    // updateData הוא אובייקט עם השדות לעדכון, למשל { completed: true }
    return await fetchAuthenticated(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
    });
};

// מחיקת משימה
const deleteTask = async (taskId) => {
    // בקשת DELETE לא מחזירה גוף בדרך כלל, fetchAuthenticated עודכן לטפל בזה
    return await fetchAuthenticated(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
    });
};

// --- פונקציות API לתתי-משימות (נוסיף בעתיד) ---


// ייצוא השירות
const apiService = {
    getFolders,
    createFolder,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};

export default apiService;