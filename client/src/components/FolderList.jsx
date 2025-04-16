import React, { useState } from 'react';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

function FolderList({ folders, selectedFolderId, onSelectFolder, onAddFolder, onShowDashboard, onLogout }) {
    const [newFolderName, setNewFolderName] = useState('');

    const handleInputChange = (event) => { setNewFolderName(event.target.value); };

    const handleAddFolderSubmit = (event) => {
        event.preventDefault();
        const trimmedName = newFolderName.trim();
        if (!trimmedName) return;
        onAddFolder(trimmedName);
        setNewFolderName('');
    };

    return (
        <div className="folder-list-container">
            <div className="sidebar-top-actions">
                <button onClick={onShowDashboard} className="home-button" title="עבור לדשבורד">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </button>
                <button onClick={onLogout} className="logout-button" title="התנתק">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                </button>
            </div>
            <h2>תיקיות</h2>
            <ul className="folder-list">
                <li
                    className={`folder-item ${selectedFolderId === null ? 'selected' : ''}`}
                    onClick={onShowDashboard}
                >
                    דשבורד ראשי
                </li>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />
                {folders.map((folder, index) => (
                    <li
                        key={folder._id || `folder-${index}`} // <-- שימוש ב-index כחלופה
                        className={`folder-item ${folder._id === selectedFolderId ? 'selected' : ''}`}
                        onClick={() => onSelectFolder(folder._id)}
                    >
                        {folder.name}
                    </li>
                ))}
            </ul>
            <form onSubmit={handleAddFolderSubmit} className="add-folder-form">
                <input
                    type="text"
                    placeholder="שם תיקיה חדשה..."
                    value={newFolderName}
                    onChange={handleInputChange}
                />
                <button type="submit" title="הוסף תיקיה חדשה">
                    <PlusIcon />
                </button>
            </form>
        </div>
    );
}

export default FolderList;