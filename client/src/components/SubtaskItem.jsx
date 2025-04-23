import React, { useState } from 'react';
import ShareButton from '../components/sharing/ShareButton';

function SubtaskItem({ subtask, parentId, onToggleSubtaskComplete, onDeleteSubtask, onEditSubtask }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(subtask.text);

    const handleCheckboxChange = () => {
        onToggleSubtaskComplete(parentId, subtask._id);
    };

    const handleDeleteClick = () => {
        onDeleteSubtask(parentId, subtask._id);
    };

    const handleEditClick = () => {
        setEditText(subtask.text);
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        const trimmedText = editText.trim();
        if (trimmedText) {
            onEditSubtask(parentId, subtask._id, trimmedText);
            setIsEditing(false);
        } else {
            alert("טקסט תת-המשימה לא יכול להיות ריק.");
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSaveClick();
        } else if (event.key === 'Escape') {
            handleCancelClick();
        }
    };

    return (
        <li className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
            <input
                type="checkbox"
                checked={subtask.completed}
                onChange={handleCheckboxChange}
                disabled={isEditing}
            />
            {isEditing ? (
                <div className="edit-mode">
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="edit-input"
                        autoFocus
                    />
                    <button onClick={handleSaveClick} className="save-btn">שמור</button>
                    <button onClick={handleCancelClick} className="cancel-btn">ביטול</button>
                </div>
            ) : (
                <>
                    <span className="subtask-text">{subtask.text}</span>
                    <div className="subtask-actions">
                        <button onClick={handleEditClick} className="edit-btn" title="ערוך תת משימה">ערוך</button>
                        <button onClick={handleDeleteClick} className="delete-btn" title="מחק תת משימה">מחק</button>
                        <ShareButton
                            itemType="subtask"
                            itemId={subtask._id}
                            itemName={subtask.text}
                            onShared={() => console.log('Subtask shared successfully')}
                        />
                    </div>
                </>
            )}
        </li>
    );
}

export default SubtaskItem;