import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function RegisterPage({ onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            setError('אנא מלא את כל השדות');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('הסיסמה חייבת להכיל לפחות 6 תווים');
            setIsLoading(false);
            return;
        }

        try {
            await register(name, email, password);
            // Success! The AuthContext will update the user state
        } catch (err) {
            console.error("Registration failed:", err);
            setError(err.message || 'הרשמה נכשלה. ייתכן שהאימייל כבר בשימוש.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form-container">
                <h2>הרשמה</h2>
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="register-name">שם:</label>
                        <input
                            type="text"
                            id="register-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-confirm-password">אימות סיסמה:</label>
                        <input
                            type="password"
                            id="register-confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'נרשם...' : 'הירשם'}
                    </button>
                </form>

                <button
                    onClick={onSwitchToLogin}
                    className="switch-auth-button"
                    disabled={isLoading}
                >
                    כבר יש לך חשבון? התחבר
                </button>
            </div>
        </div>
    );
}

export default RegisterPage;