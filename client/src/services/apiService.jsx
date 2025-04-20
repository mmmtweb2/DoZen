// --- src/services/apiService.js ---

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

// --- פונקציות API לתיקיות ---
const getFolders = async () => {
    return await fetchAuthenticated(`${API_BASE_URL}/folders`);
};

const createFolder = async (folderData) => {
    return await fetchAuthenticated(`${API_BASE_URL}/folders`, {
        method: 'POST',
        body: JSON.stringify(folderData),
    });
};

const deleteFolder = async (folderId) => {
    return await fetchAuthenticated(`${API_BASE_URL}/folders/${folderId}`, {
        method: 'DELETE',
    });
};

// --- פונקציות API למשימות ---
const getTasks = async (folderId) => {
    if (!folderId) return []; // אם אין ID של תיקיה, החזר מערך ריק
    return await fetchAuthenticated(`${API_BASE_URL}/tasks?folderId=${folderId}`);
};

const createTask = async (taskData) => {
    return await fetchAuthenticated(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
    });
};

const updateTask = async (taskId, updateData) => {
    return await fetchAuthenticated(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
    });
};

const deleteTask = async (taskId) => {
    return await fetchAuthenticated(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
    });
};

// --- פונקציות API לתתי-משימות ---
const addSubtask = async (taskId, subtaskData) => {
    return await fetchAuthenticated(`${API_BASE_URL}/tasks/${taskId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify(subtaskData),
    });
};

const updateSubtask = async (taskId, subtaskId, updateData) => {
    return await fetchAuthenticated(`${API_BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
    });
};

const deleteSubtask = async (taskId, subtaskId) => {
    return await fetchAuthenticated(`${API_BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
    });
};


// ייצוא השירות
const apiService = {
    getFolders,
    createFolder,
    deleteFolder,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask
};

export default apiService;