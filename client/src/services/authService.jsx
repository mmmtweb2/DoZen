// --- src/services/authService.js ---

const API_URL = 'https://dozen.onrender.com/api/auth/';

/**
 * רישום משתמש חדש
 * @param {string} name - שם המשתמש
 * @param {string} email - אימייל
 * @param {string} password - סיסמה
 * @returns {Promise} נתוני משתמש וטוקן JWT
 */
const registerUser = async (name, email, password) => {
    try {
        const response = await fetch(API_URL + 'register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('שרת לא זמין. נסה שוב מאוחר יותר.');
        }
        throw error;
    }
};

/**
 * התחברות משתמש קיים
 * @param {string} email - אימייל
 * @param {string} password - סיסמה
 * @returns {Promise} נתוני משתמש וטוקן JWT
 */
const loginUser = async (email, password) => {
    try {
        const response = await fetch(API_URL + 'login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            // שגיאות כניסה ספציפיות
            if (response.status === 401) {
                throw new Error('אימייל או סיסמה שגויים');
            }
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('שרת לא זמין. נסה שוב מאוחר יותר.');
        }
        throw error;
    }
};

const authService = {
    registerUser,
    loginUser
};

export default authService;