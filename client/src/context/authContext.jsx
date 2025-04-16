import React, { createContext, useState, useEffect, useContext } from 'react';
// --- 1. הוספת הייבוא החסר ---
import authService from '../services/authService';
// -----------------------------

// יצירת ה-Context עצמו
const AuthContext = createContext();

// יצירת ה-Provider - הקומפוננטה שתעטוף את האפליקציה ותספק את ה-state
export const AuthProvider = ({ children }) => {
    // State למשתמש המחובר (בהתחלה null)
    const [user, setUser] = useState(null);
    // State לטוקן (ננסה לטעון מ-localStorage בהתחלה)
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    // State למצב טעינה ראשוני (כדי לדעת אם סיימנו לבדוק אם יש טוקן שמור)
    const [loading, setLoading] = useState(true);
    // הערה: לא הוספנו state לשגיאות כאן, כי הן נזרקות הלאה לקומפוננטה שקראה

    // אפקט שרץ פעם אחת כשהקומפוננטה נטענת
    useEffect(() => {
        // לוגיקה לאימות טוקן קיים (עדיין בסיסית)
        if (!token) {
            setLoading(false);
        } else {
            console.log("Token found, assuming logged in for now. Need to verify token and fetch user data.");
            // בהמשך: לאמת טוקן מול השרת ולקבל פרטי משתמש
            // setUser({ ...user data from server ... });
            setLoading(false); // בינתיים נסיים טעינה
        }
    }, [token]);


    // --- עדכון פונקציית התחברות ---
    const login = async (email, password) => {
        try {
            setLoading(true);
            const data = await authService.loginUser(email, password); // שימוש ב-authService
            console.log("Login API response:", data);

            if (data.token && data._id) {
                localStorage.setItem('authToken', data.token);
                setToken(data.token);
                setUser({ _id: data._id, name: data.name, email: data.email });
                // setError(null); // <-- 2. הסרנו את השורה הזו
            } else {
                throw new Error('Invalid login response from server');
            }
        } catch (err) {
            console.error("AuthContext Login Error:", err);
            throw err; // מעבירים את השגיאה הלאה
        } finally {
            setLoading(false);
        }
    };

    // --- עדכון פונקציית הרשמה ---
    const register = async (name, email, password) => {
        try {
            setLoading(true);
            const data = await authService.registerUser(name, email, password); // שימוש ב-authService
            console.log("Register API response:", data);

            if (data.token && data._id) {
                localStorage.setItem('authToken', data.token);
                setToken(data.token);
                setUser({ _id: data._id, name: data.name, email: data.email });
                // setError(null); // <-- 2. הסרנו את השורה הזו
            } else {
                throw new Error('Invalid registration response from server');
            }
        } catch (err) {
            console.error("AuthContext Register Error:", err);
            throw err; // מעבירים את השגיאה הלאה
        } finally {
            setLoading(false);
        }
    };

    // פונקציית התנתקות (נשארת זהה)
    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        console.log("Logout function called");
    };

    // הערך שיהיה זמין לכל הקומפוננטות הילדות
    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout
    };

    // מחזירים את ה-Provider שעוטף את הילדים ומספק להם את הערך
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook מותאם אישית כדי להשתמש ב-AuthContext בקלות בקומפוננטות אחרות
export const useAuth = () => {
    return useContext(AuthContext);
};

