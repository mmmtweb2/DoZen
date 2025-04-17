import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function LoginPage({ onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation
        if (!email || !password) {
            setError('אנא מלא אימייל וסיסמה');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Attempting to login with:', email);
            await login(email, password);
            // Success! The AuthContext will update the user state
        } catch (err) {
            console.error("Login failed:", err);
            // הצגת הודעת השגיאה המדויקת מהשרת
            setError(err.message || 'התחברות נכשלה. בדוק אימייל וסיסמה.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form-container">
                <h2>התחברות</h2>
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="login-email">אימייל:</label>
                        <input
                            type="email"
                            id="login-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
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
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'מתחבר...' : 'התחבר'}
                    </button>
                </form>

                <button
                    onClick={onSwitchToRegister}
                    className="switch-auth-button"
                    disabled={isLoading}
                >
                    אין לך חשבון? הירשם
                </button>
            </div>
        </div>
    );
}

export default LoginPage;