import React, { useState } from 'react';
import sharingService from '../../services/sharingService';
import './SharingStyles.css';

function ShareLinkView() {
    const [shareLink, setShareLink] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!shareLink.trim()) {
            setError('נא להזין קישור שיתוף');
            return;
        }

        try {
            // חילוץ מזהה הפריט מהקישור
            const itemId = extractItemIdFromLink(shareLink);
            if (!itemId) {
                setError('קישור שיתוף לא תקין');
                return;
            }

            // בדיקת סוג הפריט (תיקיה או משימה)
            const itemType = shareLink.includes('/folders/') ? 'folder' : 'task';

            // הוספת הפריט למשתמש
            await sharingService.addSharedItem(itemType, itemId);

            setSuccess('הפריט נוסף בהצלחה');
            setShareLink('');
        } catch (err) {
            console.error('Error adding shared item:', err);
            setError(err.message || 'שגיאה בהוספת הפריט המשותף');
        }
    };

    const extractItemIdFromLink = (link) => {
        try {
            const url = new URL(link);
            const pathParts = url.pathname.split('/');
            return pathParts[pathParts.length - 1];
        } catch (err) {
            return null;
        }
    };

    return (
        <div className="share-link-container">
            <h2>הזן קישור שיתוף</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="share-link-form">
                <div className="form-group">
                    <input
                        type="text"
                        value={shareLink}
                        onChange={(e) => setShareLink(e.target.value)}
                        placeholder="הדבק כאן את קישור השיתוף..."
                        className="share-link-input"
                    />
                </div>
                <button type="submit" className="submit-button">
                    הוסף פריט משותף
                </button>
            </form>

            <div className="share-link-info">
                <h3>איך זה עובד?</h3>
                <ol>
                    <li>העתק את קישור השיתוף שקיבלת</li>
                    <li>הדבק את הקישור בשדה למעלה</li>
                    <li>לחץ על "הוסף פריט משותף"</li>
                </ol>
                <p className="note">
                    הערה: קישור שיתוף תקף רק לפריטים ששותפו איתך באופן ישיר.
                </p>
            </div>
        </div>
    );
}

export default ShareLinkView; 