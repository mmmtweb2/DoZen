import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    // בדיקת טוקן בטעינה ראשונית
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // בעתיד: קריאה לנקודת קצה לאימות הטוקן
                // כעת אנחנו פשוט מניחים שהטוקן תקף ושומרים את הפרטים הבסיסיים
                const parsedToken = parseJwt(token);

                if (parsedToken && parsedToken.id) {
                    setUser({
                        _id: parsedToken.id,
                        name: 'User', // בינתיים ערך זמני
                        token: token
                    });
                } else {
                    // אם הטוקן לא תקין, נתנתק
                    logout();
                }
            } catch (error) {
                console.error("Token verification failed:", error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    // Helper function to parse JWT token
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Error parsing JWT token", e);
            return null;
        }
    };

    // התחברות
    const login = async (email, password) => {
        try {
            setLoading(true);
            console.log(`Attempting to login: ${email}`);
            const data = await authService.loginUser(email, password);

            if (data.token && data._id) {
                localStorage.setItem('authToken', data.token);
                setToken(data.token);
                setUser({
                    _id: data._id,
                    name: data.name,
                    email: data.email
                });
                console.log("Login successful:", data.email);
            } else {
                throw new Error('Invalid login response from server');
            }
        } catch (err) {
            console.error("Login Error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // הרשמה
    const register = async (name, email, password) => {
        try {
            setLoading(true);
            const data = await authService.registerUser(name, email, password);

            if (data.token && data._id) {
                localStorage.setItem('authToken', data.token);
                setToken(data.token);
                setUser({
                    _id: data._id,
                    name: data.name,
                    email: data.email
                });
                console.log("Registration successful:", data.email);
            } else {
                throw new Error('Invalid registration response from server');
            }
        } catch (err) {
            console.error("Registration Error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // התנתקות
    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook מותאם אישית לשימוש נוח בקונטקסט האימות
export const useAuth = () => {
    return useContext(AuthContext);
};