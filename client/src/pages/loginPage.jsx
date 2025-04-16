import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// הפונקציה מקבלת prop כדי לאפשר מעבר להרשמה
function LoginPage({ onSwitchToRegister }) {
    // State מקומי לשדות הטופס
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // State להודעות שגיאה
    const [error, setError] = useState('');

    // קבלת פונקציית ה-login מה-AuthContext
    const { login } = useAuth();

    // טיפול בשליחת טופס ההתחברות
    const handleSubmit = async (event) => {
        event.preventDefault(); // מניעת ריענון
        setError(''); // איפוס שגיאה קודמת

        // בדיקת קלט בסיסית
        if (!email || !password) {
            setError('אנא מלא אימייל וסיסמה');
            return;
        }

        try {
            // קריאה לפונקציית ה-login מה-Context
            // הפונקציה הזו אמורה כעת לקרוא ל-API האמיתי (כפי שעדכנו ב-AuthContext)
            await login(email, password);
            // אם ההתחברות הצליחה, ה-AuthProvider יעדכן את ה-state
            // והתצוגה ב-App.jsx תשתנה אוטומטית לאפליקציה הראשית.
        } catch (err) {
            // טיפול בשגיאות שיגיעו מה-API דרך ה-Context
            console.error("Login failed:", err);
            // הצגת הודעת השגיאה שהגיעה מהשרת (או הודעה כללית)
            setError(err.message || 'התחברות נכשלה. בדוק אימייל וסיסמה.');
        }
        // --- הסרנו את הגדרת הפונקציה המיותרת שהייתה כאן ---
    };

    return (
        // שימוש בקלאסים שהגדרנו ב-App.css למסכי אימות
        <div className="auth-page">
            <div className="auth-form-container">
                <h2>התחברות</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message">{error}</p>} {/* הצגת הודעת שגיאה */}
                    <div className="form-group">
                        <label htmlFor="login-email">אימייל:</label>
                        <input
                            type="email"
                            id="login-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="login-password">סיסמה:</label>
                        <input
                            type="password"
                            id="login-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">התחבר</button>
                </form>
                {/* כפתור למעבר להרשמה */}
                <button onClick={onSwitchToRegister} className="switch-auth-button">
                    אין לך חשבון? הירשם
                </button>
            </div>
        </div>
    );
}

export default LoginPage;