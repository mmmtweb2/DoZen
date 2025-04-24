import axios from 'axios';

const API_URL = '/api/subtasks';

// יצירת קישור שיתוף
export const generateShareLink = async (subtaskId, accessType = 'view') => {
    try {
        const response = await axios.post(`${API_URL}/${subtaskId}/generate-link`, {
            accessType
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'שגיאה ביצירת קישור שיתוף');
    }
};

// בדיקת קישור שיתוף
export const verifyShareLink = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/verify-link/${token}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'שגיאה בבדיקת קישור');
    }
};

// שימוש בקישור שיתוף
export const useShareLink = async (token) => {
    try {
        const response = await axios.post(`${API_URL}/use-link/${token}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'שגיאה בהפעלת קישור השיתוף');
    }
};

export const shareSubtask = async (subtaskId, email, accessType) => {
    try {
        const response = await axios.post(`${API_URL}/${subtaskId}/share`, {
            email,
            accessType
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'שגיאה בשיתוף תת המשימה');
    }
};

export const removeSubtaskShare = async (subtaskId, userId) => {
    try {
        const response = await axios.delete(`${API_URL}/${subtaskId}/share/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'שגיאה בהסרת השיתוף');
    }
};

export const getSubtaskSharedUsers = async (subtaskId) => {
    try {
        const response = await axios.get(`${API_URL}/${subtaskId}/share`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'שגיאה בטעינת משתמשים משותפים');
    }
}; 