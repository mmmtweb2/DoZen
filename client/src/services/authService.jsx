// --- src/services/authService.js ---

// הגדרת כתובת ה-URL הבסיסית של ה-API שלנו
// חשוב לוודא שהפורט (5000) תואם לפורט שבו השרת רץ
const API_URL = 'http://localhost:5000/api/auth/';

// פונקציה אסינכרונית לרישום משתמש
const registerUser = async (name, email, password) => {
    // שליחת בקשת POST לנתיב ההרשמה
    const response = await fetch(API_URL + 'register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // ציון שגוף הבקשה הוא JSON
        },
        // המרת הנתונים למחרוזת JSON ושליחתם בגוף הבקשה
        body: JSON.stringify({ name, email, password }),
    });

    // קבלת התשובה מהשרת כ-JSON
    const data = await response.json();

    // בדיקה אם התשובה מהשרת היא מוצלחת (סטטוס 2xx)
    if (response.ok) {
        return data; // החזרת הנתונים (אמור להכיל פרטי משתמש וטוקן)
    } else {
        // אם השרת החזיר שגיאה, זרוק שגיאה עם ההודעה מהשרת
        throw new Error(data.message || 'Registration failed');
    }
};

// פונקציה אסינכרונית להתחברות משתמש
const loginUser = async (email, password) => {
    // שליחת בקשת POST לנתיב ההתחברות
    const response = await fetch(API_URL + 'login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
        return data; // החזרת הנתונים (משתמש וטוקן)
    } else {
        throw new Error(data.message || 'Login failed');
    }
};

// ייצוא הפונקציות כדי שנוכל להשתמש בהן במקומות אחרים (כמו AuthContext)
const authService = {
    registerUser,
    loginUser
};

export default authService;