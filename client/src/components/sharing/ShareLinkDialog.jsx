import React, { useState } from 'react';
import { generateShareLink } from '../../services/subtaskService';
import './SharingStyles.css';

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline points="16 6 12 2 8 6"></polyline>
        <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

function ShareLinkDialog({ itemType, itemId, itemName, isOpen, onClose }) {
    const [link, setLink] = useState('');
    const [accessType, setAccessType] = useState('view');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerateLink = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await generateShareLink(itemId, accessType);
            setLink(response.link);
        } catch (err) {
            setError('שגיאה ביצירת קישור שיתוף');
            console.error('Error generating share link:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="sharing-dialog-overlay">
            <div className="sharing-dialog">
                <div className="sharing-dialog-header">
                    <h3>
                        <ShareIcon />
                        יצירת קישור שיתוף ל{itemType === 'folder' ? 'תיקיה' : itemType === 'task' ? 'משימה' : 'תת משימה'}: {itemName}
                    </h3>
                    <button className="close-button" onClick={onClose} aria-label="סגור">
                        <CloseIcon />
                    </button>
                </div>

                <div className="sharing-dialog-content">
                    {error && <div className="error-message">{error}</div>}

                    <div className="share-link-form">
                        <div className="form-group">
                            <label htmlFor="access-type">סוג הרשאה:</label>
                            <select
                                id="access-type"
                                value={accessType}
                                onChange={(e) => setAccessType(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="view">צפייה בלבד</option>
                                <option value="edit">עריכה מלאה</option>
                            </select>
                        </div>

                        <button
                            className="generate-link-button"
                            onClick={handleGenerateLink}
                            disabled={isLoading}
                        >
                            {isLoading ? 'יוצר קישור...' : 'צור קישור שיתוף'}
                        </button>
                    </div>

                    {link && (
                        <div className="share-link-result">
                            <div className="link-display">
                                <input
                                    type="text"
                                    value={link}
                                    readOnly
                                    className="link-input"
                                />
                                <button
                                    className="copy-link-button"
                                    onClick={handleCopyLink}
                                    title="העתק קישור"
                                >
                                    <CopyIcon />
                                    {copied ? 'הועתק!' : 'העתק'}
                                </button>
                            </div>
                            <p className="link-info">
                                הקישור יפוג תוקף תוך 7 ימים ויהיה זמין לשימוש חד פעמי בלבד.
                            </p>
                        </div>
                    )}
                </div>

                <div className="sharing-dialog-footer">
                    <button className="cancel-button" onClick={onClose} disabled={isLoading}>
                        סגור
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareLinkDialog; 