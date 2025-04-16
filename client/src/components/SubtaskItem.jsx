import React, { useState } from 'react';

function SubtaskItem({ subtask, parentId, onToggleSubtaskComplete, onDeleteSubtask, onEditSubtask }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(subtask.text);

    // --- שינוי לשימוש ב-subtask._id ---
    const handleCheckboxChange = () => { onToggleSubtaskComplete(parentId, subtask._id); };
    const handleDeleteClick = () => { onDeleteSubtask(parentId, subtask._id); };
    const handleEditClick = () => { setEditText(subtask.text); setIsEditing(true); };
    const handleSaveClick = () => {
        const trimmedText = editText.trim();
        if (trimmedText) { onEditSubtask(parentId, subtask._id, trimmedText); setIsEditing(false); }
        else { alert("טקסט תת-המשימה לא יכול להיות ריק."); }
    };
    const handleCancelClick = () => { setIsEditing(false); };
    const handleInputChange = (event) => { setEditText(event.target.value); };
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') { handleSaveClick(); }
        else if (event.key === 'Escape') { handleCancelClick(); }
    };
    // ---------------------------------

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
                    <input type="text" value={editText} onChange={handleInputChange} onKeyDown={handleKeyDown} className="edit-input" autoFocus />
                    <button onClick={handleSaveClick} className="save-btn">שמור</button>
                    <button onClick={handleCancelClick} className="cancel-btn">ביטול</button>
                </div>
            ) : (
                <>
                    <span className="subtask-text">{subtask.text}</span>
                    <div className="task-actions">
                        <button onClick={handleEditClick} className="edit-btn">ערוך</button>
                        <button onClick={handleDeleteClick} className="delete-btn">מחק</button>
                    </div>
                </>
            )}
        </li>
    );
}

export default SubtaskItem;