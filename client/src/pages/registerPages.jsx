import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
// import './AuthPages.css'; // נייבא CSS בהמשך

// הפונקציה מקבלת prop כדי לאפשר חזרה למסך ההתחברות
function RegisterPage({ onSwitchToLogin }) {
    // State מקומי לשדות הטופס
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // State להודעות שגיאה
    const [error, setError] = useState('');

    // קבלת פונקציית ה-register מה-AuthContext
    const { register } = useAuth();

    // טיפול בשליחת טופס ההרשמה
    const handleSubmit = async (event) => {
        event.preventDefault(); // מניעת ריענון
        setError(''); // איפוס שגיאה קודמת

        // בדיקת קלט בסיסית
        if (!name || !email || !password || !confirmPassword) {
            setError('אנא מלא את כל השדות');
            return;
        }
        if (password !== confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            return;
        }
        // אפשר להוסיף בדיקות נוספות (אורך סיסמה, תקינות אימייל)

        try {
            // קריאה לפונקציית ה-register מה-Context
            // כרגע היא משתמשת בנתונים מזויפים, בהמשך נחבר ל-API
            await register(name, email, password);
            // אם ההרשמה הצליחה, ה-AuthProvider יעדכן את ה-state
            // והתצוגה ב-App.jsx תשתנה אוטומטית לאפליקציה הראשית.
        } catch (err) {
            // טיפול בשגיאות שיגיעו מה-API (בהמשך)
            console.error("Registration failed:", err);
            // נניח שהשגיאה היא שהאימייל כבר קיים
            setError('הרשמה נכשלה. ייתכן שהאימייל כבר בשימוש.');
        }
    };

    return (
        // נשתמש באותם קלאסים כמו בדף ההתחברות לעיצוב אחיד
        <div className="auth-page">
            <div className="auth-form-container">
                <h2>הרשמה</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message">{error}</p>} {/* הצגת הודעת שגיאה */}
                    <div className="form-group">
                        <label htmlFor="register-name">שם:</label>
                        <input
                            type="text"
                            id="register-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="register-email">אימייל:</label>
                        <input
                            type="email"
                            id="register-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="register-password">סיסמה:</label>
                        <input
                            type="password"
                            id="register-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6} // הוספת מגבלת אורך מינימלי
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="register-confirm-password">אימות סיסמה:</label>
                        <input
                            type="password"
                            id="register-confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">הירשם</button>
                </form>
                {/* כפתור/קישור למעבר חזרה להתחברות */}
                <button onClick={onSwitchToLogin} className="switch-auth-button">
                    כבר יש לך חשבון? התחבר
                </button>
            </div>
        </div>
    );
}

export default RegisterPage;
