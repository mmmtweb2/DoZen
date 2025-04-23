import React, { useState } from 'react';
import ShareButton from './sharing/ShareButton';
import './FolderList.css';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
const ShareAltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
);

function FolderList({ folders, selectedFolderId, onSelectFolder, onAddFolder, onDeleteFolder, onEditFolder, onShowDashboard, onShowSharedItems, onShowShareLink, onLogout }) {
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editFolderName, setEditFolderName] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const handleAddFolderSubmit = (event) => {
        event.preventDefault();
        const trimmedName = newFolderName.trim();
        if (!trimmedName) return;
        onAddFolder(trimmedName);
        setNewFolderName('');
    };

    const handleEditClick = (folder) => {
        setEditingFolderId(folder._id);
        setEditFolderName(folder.name);
    };

    const handleSaveEdit = async (folderId) => {
        if (editFolderName.trim()) {
            await onEditFolder(folderId, editFolderName.trim());
            setEditingFolderId(null);
            setEditFolderName('');
        }
    };

    const handleCancelEdit = () => {
        setEditingFolderId(null);
        setEditFolderName('');
    };

    const handleDeleteClick = (folderId) => {
        setShowDeleteConfirm(folderId);
    };

    const confirmDelete = async (folderId) => {
        await onDeleteFolder(folderId);
        setShowDeleteConfirm(null);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(null);
    };

    return (
        <div className="folder-list-container">
            <div className="sidebar-top-actions">
                <button onClick={onShowDashboard} className="home-button" title="עבור לדשבורד">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </button>
                <button onClick={onShowSharedItems} className="shared-items-button" title="פריטים משותפים">
                    <ShareAltIcon />
                </button>
                <button onClick={onShowShareLink} className="share-link-button" title="הזן קישור שיתוף">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-3 3a5 5 0 0 0 .54 7.54"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l3-3a5 5 0 0 0-.54-7.54"></path>
                    </svg>
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
                {folders.map((folder) => (
                    <li
                        key={folder._id}
                        className={`folder-item ${folder._id === selectedFolderId ? 'selected' : ''} ${folder.isOwner === false ? 'shared-folder' : ''}`}
                        onClick={() => onSelectFolder(folder._id)}
                    >
                        {editingFolderId === folder._id ? (
                            <div className="edit-mode">
                                <input
                                    type="text"
                                    value={editFolderName}
                                    onChange={(e) => setEditFolderName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit(folder._id);
                                        else if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                    className="edit-input"
                                    autoFocus
                                />
                                <button onClick={() => handleSaveEdit(folder._id)} className="save-btn">שמור</button>
                                <button onClick={handleCancelEdit} className="cancel-btn">ביטול</button>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="folder-name"
                                    onClick={() => onSelectFolder(folder._id)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    <span>{folder.name}</span>
                                </div>
                                <div className="folder-actions">
                                    <button onClick={() => handleEditClick(folder)} className="edit-btn" title="ערוך תיקיה">ערוך</button>
                                    <button onClick={() => handleDeleteClick(folder._id)} className="delete-btn" title="מחק תיקיה">מחק</button>
                                    <ShareButton
                                        itemType="folder"
                                        itemId={folder._id}
                                        itemName={folder.name}
                                        onShared={() => console.log('Folder shared successfully')}
                                    />
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
            <form onSubmit={handleAddFolderSubmit} className="add-folder-form">
                <input
                    type="text"
                    placeholder="שם תיקיה חדשה..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                />
                <button type="submit" title="הוסף תיקיה חדשה">
                    <PlusIcon />
                </button>
            </form>

            {showDeleteConfirm && (
                <div className="confirm-dialog-overlay">
                    <div className="confirm-dialog">
                        <h3>מחיקת תיקיה</h3>
                        <p>האם אתה בטוח שברצונך למחוק את התיקיה "{folders.find(f => f._id === showDeleteConfirm)?.name}"?</p>
                        <p className="warning-text">שים לב: מחיקת תיקיה תמחק גם את כל המשימות והתתי-משימות שבה!</p>
                        <div className="confirm-dialog-buttons">
                            <button className="cancel-button" onClick={cancelDelete}>ביטול</button>
                            <button className="confirm-button confirm-delete" onClick={() => confirmDelete(showDeleteConfirm)}>מחק</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FolderList;