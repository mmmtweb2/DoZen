// --- client/src/components/sharing/ShareButton.jsx ---
/**
 * קומפוננטת כפתור שיתוף
 * מציגה כפתור לפתיחת דיאלוג שיתוף עבור תיקיה או משימה
 */
import React, { useState } from 'react';
import SharingDialog from './SharingDialog';
import './SharingStyles.css';

// אייקון שיתוף
const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline points="16 6 12 2 8 6"></polyline>
        <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
);

/**
 * כפתור שיתוף
 * @param {Object} props - מאפייני הקומפוננטה
 * @param {string} props.itemType - סוג הפריט ('folder' או 'task')
 * @param {string} props.itemId - מזהה הפריט
 * @param {string} props.itemName - שם הפריט לשיתוף (להצגה בדיאלוג)
 * @param {function} props.onShared - פונקציה שתופעל בעת שיתוף מוצלח
 * @param {boolean} props.disabled - האם הכפתור מושבת
 */
function ShareButton({ itemType, itemId, itemName, onShared, disabled = false }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // פתיחת דיאלוג השיתוף
    const openDialog = () => {
        setIsDialogOpen(true);
    };

    // סגירת דיאלוג השיתוף
    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    // טיפול בשיתוף מוצלח
    const handleShared = () => {
        if (onShared) {
            onShared();
        }
    };

    return (
        <>
            <button
                className="share-button-component"
                onClick={openDialog}
                disabled={disabled}
                title={`שתף ${itemType === 'folder' ? 'תיקיה' : 'משימה'}`}
            >
                <ShareIcon />
                <span>שתף</span>
            </button>

            <SharingDialog
                itemType={itemType}
                itemId={itemId}
                itemName={itemName}
                isOpen={isDialogOpen}
                onClose={closeDialog}
                onShared={handleShared}
            />
        </>
    );
}

export default ShareButton;