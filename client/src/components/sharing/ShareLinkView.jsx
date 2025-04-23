import React, { useState } from 'react';
import { verifyShareLink, useShareLink } from '../../services/subtaskService';
import './SharingStyles.css';

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-3 3a5 5 0 0 0 .54 7.54"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l3-3a5 5 0 0 0-.54-7.54"></path>
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

function ShareLinkView() {
    const [link, setLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [shareInfo, setShareInfo] = useState(null);

    const handleVerifyLink = async () => {
        setIsLoading(true);
        setError('');
        setShareInfo(null);

        try {
            // חילוץ הטוקן מהקישור
            const token = link.split('token=')[1];
            if (!token) {
                throw new Error('קישור לא תקין');
            }

            const info = await verifyShareLink(token);
            setShareInfo(info);
        } catch (err) {
            setError(err.message || 'שגיאה בבדיקת הקישור');
            console.error('Error verifying share link:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseLink = async () => {
        if (!shareInfo) return;

        setIsLoading(true);
        setError('');

        try {
            const token = link.split('token=')[1];
            await useShareLink(token);
            setLink('');
            setShareInfo(null);
            // כאן אפשר להוסיף הודעת הצלחה או ניתוב לדף המתאים
        } catch (err) {
            setError(err.message || 'שגיאה בשימוש בקישור');
            console.error('Error using share link:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="share-link-view">
            <h2>
                <LinkIcon />
                הזן קישור שיתוף
            </h2>

            <div className="share-link-form">
                <div className="form-group">
                    <label htmlFor="share-link">קישור שיתוף:</label>
                    <input
                        type="text"
                        id="share-link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="הדבק כאן את קישור השיתוף"
                        disabled={isLoading}
                    />
                </div>

                <button
                    className="verify-link-button"
                    onClick={handleVerifyLink}
                    disabled={isLoading || !link}
                >
                    {isLoading ? 'בודק...' : 'בדוק קישור'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    <ErrorIcon />
                    {error}
                </div>
            )}

            {shareInfo && (
                <div className="share-info">
                    <h3>פרטי השיתוף:</h3>
                    <p>
                        <strong>סוג הפריט:</strong>{' '}
                        {shareInfo.itemType === 'folder' ? 'תיקיה' :
                            shareInfo.itemType === 'task' ? 'משימה' : 'תת משימה'}
                    </p>
                    <p>
                        <strong>הרשאות:</strong>{' '}
                        {shareInfo.accessType === 'view' ? 'צפייה בלבד' : 'עריכה מלאה'}
                    </p>

                    <button
                        className="use-link-button"
                        onClick={handleUseLink}
                        disabled={isLoading}
                    >
                        {isLoading ? 'מעבד...' : 'הפעל שיתוף'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ShareLinkView; 