// --- client/src/components/TaskItem.jsx ---
// קוד מתוקן עם תנאים עקביים

import React, { useState } from 'react';
import SubtaskItem from './SubtaskItem'; // ודא שהנתיב נכון אם הוא בתיקיה אחרת
import ShareButton from '../components/sharing/ShareButton'; // ודא שהנתיב נכון

// Optimized SVG Icons
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
        <line x1="16" x2="16" y1="2" y2="6"></line>
        <line x1="8" x2="8" y1="2" y2="6"></line>
        <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
);

// פונקציה להצגת טקסט העדיפות במקום האייקון
const getPriorityText = (priority) => {
    switch (priority) {
        case 'High': return 'גבוהה';
        case 'Medium': return 'בינונית';
        case 'Low': return 'נמוכה';
        default: return 'רגילה'; // או 'בינונית' אם זו ברירת המחדל שלך
    }
};

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

function TaskItem({
    task,
    onToggleComplete,
    onDeleteTask,
    onEditTask,
    onAddSubtask,
    onToggleSubtaskComplete,
    onDeleteSubtask,
    onEditSubtask,
    onSetTaskDueDate,
    onSetTaskPriority
}) {
    // Log for debugging the received task prop
    console.log('Task prop in TaskItem:', task);

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(task.text);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    // Initialize editDateValue correctly from task.dueDate (format YYYY-MM-DD for input type="date")
    const initialDate = task.dueDate ? task.dueDate.split('T')[0] : '';
    const [editDateValue, setEditDateValue] = useState(initialDate);

    // Event handlers
    const handleCheckboxChange = () => onToggleComplete(task._id);
    const handleDeleteClick = () => onDeleteTask(task._id);
    const handleEditClick = () => { setEditText(task.text); setIsEditing(true); };

    const handleSaveClick = () => {
        const trimmedText = editText.trim();
        if (trimmedText) {
            onEditTask(task._id, trimmedText);
            setIsEditing(false);
        } else {
            alert("טקסט המשימה לא יכול להיות ריק.");
        }
    };

    const handleCancelClick = () => setIsEditing(false);
    const handleInputChange = (e) => setEditText(e.target.value);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSaveClick();
        else if (e.key === 'Escape') handleCancelClick();
    };

    const handleNewSubtaskChange = (e) => setNewSubtaskText(e.target.value);

    const handleAddSubtaskSubmit = (e) => {
        e.preventDefault();
        const trimmedText = newSubtaskText.trim();
        if (!trimmedText) return;
        onAddSubtask(task._id, trimmedText);
        setNewSubtaskText('');
    };

    const handleDateClick = () => {
        // Update state with current task date when opening editor
        setEditDateValue(task.dueDate ? task.dueDate.split('T')[0] : '');
        setIsEditingDate(true);
    };

    const handlePriorityClick = () => setIsEditingPriority(true);

    const handleDateChange = (e) => {
        setEditDateValue(e.target.value);
    };

    // Use onBlur for saving date change (or separate save button if preferred)
    const handleDateBlur = () => {
        // Check if the date actually changed
        const currentDate = task.dueDate ? task.dueDate.split('T')[0] : '';
        if (editDateValue !== currentDate) {
            // Allow setting null by sending an empty string or handle it server-side
            onSetTaskDueDate(task._id, editDateValue || null);
        }
        setIsEditingDate(false);
    };

    const handleDateSubmit = (e) => {
        if (e.key === 'Enter') {
            handleDateBlur(); // Use the same logic as blur on Enter
        } else if (e.key === 'Escape') {
            setIsEditingDate(false);
            // Optionally reset editDateValue to original task.dueDate here
            setEditDateValue(task.dueDate ? task.dueDate.split('T')[0] : '');
        }
    };

    const handlePriorityChange = (e) => {
        onSetTaskPriority(task._id, e.target.value);
        setIsEditingPriority(false);
    };

    const handlePriorityBlur = () => setIsEditingPriority(false);

    // Format dueDate for display, handle null/undefined
    const formattedDueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('he-IL') : 'אין תאריך';

    return (
        // Add shared-task class if the user is NOT the owner
        <div className={`task-item-wrapper ${task.subtasks?.length > 0 ? 'has-subtasks' : ''} ${task.isOwner === false ? 'shared-task' : ''}`}>
            <li className={`task-item ${task.completed ? 'completed' : ''}`}>
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={handleCheckboxChange}
                    disabled={isEditing || isEditingDate || isEditingPriority || task.accessType === 'view'} // Disable checkbox if view only
                />

                {isEditing ? (
                    <div className="edit-mode">
                        <input
                            type="text"
                            value={editText}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="edit-input"
                            autoFocus
                        />
                        <button onClick={handleSaveClick} className="save-btn">שמור</button>
                        <button onClick={handleCancelClick} className="cancel-btn">ביטול</button>
                    </div>
                ) : (
                    <>
                        <div className="task-main-info">
                            {/* Allow editing text only if user has edit permission */}
                            <span className="task-text" onDoubleClick={(task.isOwner || task.accessType === 'edit') ? handleEditClick : undefined}>
                                {task.text}
                            </span>
                            <div className="task-details">
                                <div className="detail-item date-detail">
                                    {isEditingDate ? (
                                        <input
                                            type="date"
                                            value={editDateValue}
                                            onChange={handleDateChange}
                                            onBlur={handleDateBlur}
                                            onKeyDown={handleDateSubmit}
                                            autoFocus
                                            className="inline-edit-input date-edit-input"
                                        />
                                    ) : (
                                        <span
                                            className={`due-date ${task.dueDate ? '' : 'no-value'}`}
                                            // Allow editing date only if user has edit permission
                                            onClick={(task.isOwner || task.accessType === 'edit') ? handleDateClick : undefined}
                                            title={task.dueDate ? "שנה תאריך יעד" : "הוסף תאריך יעד"}
                                        >
                                            <CalendarIcon /> {formattedDueDate}
                                        </span>
                                    )}
                                </div>

                                <div className="detail-item priority-detail">
                                    {isEditingPriority ? (
                                        <select
                                            value={task.priority || 'Medium'}
                                            onChange={handlePriorityChange}
                                            onBlur={handlePriorityBlur}
                                            autoFocus
                                            className="inline-edit-input priority-edit-select"
                                        >
                                            <option value="Low">נמוכה</option>
                                            <option value="Medium">בינונית</option>
                                            <option value="High">גבוהה</option>
                                        </select>
                                    ) : (
                                        <span
                                            className={`priority-indicator ${task.priority ? `priority-${task.priority.toLowerCase()}` : 'priority-medium'}`} // Default class if no priority
                                            // Allow editing priority only if user has edit permission
                                            onClick={(task.isOwner || task.accessType === 'edit') ? handlePriorityClick : undefined}
                                            title="שינוי עדיפות"
                                        >
                                            {getPriorityText(task.priority)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="task-actions">
                            {/* כפתור שיתוף - רק לבעלים של המשימה */}
                            {task.isOwner === true && ( // Condition updated to === true
                                <ShareButton
                                    itemType="task"
                                    itemId={task._id}
                                    itemName={task.text}
                                    onShared={() => console.log('Task shared successfully')} // Placeholder, might need actual refresh logic
                                />
                            )}

                            {/* כפתור עריכה - להציג רק אם יש הרשאת עריכה או שהמשתמש הוא הבעלים */}
                            {(task.isOwner === true || task.accessType === 'edit') && ( // Condition updated to === true
                                <button onClick={handleEditClick} className="edit-btn">ערוך</button>
                            )}

                            {/* כפתור מחיקה - להציג רק אם המשתמש הוא הבעלים */}
                            {task.isOwner === true && ( // Condition updated to === true
                                <button onClick={handleDeleteClick} className="delete-btn">מחק</button>
                            )}
                        </div>
                    </>
                )}
            </li>

            <div className="subtasks-section">
                {/* הוספת תת-משימה רק אם יש הרשאת עריכה */}
                {(task.isOwner === true || task.accessType === 'edit') && ( // Condition updated to === true
                    <form onSubmit={handleAddSubtaskSubmit} className="add-subtask-form">
                        <input
                            type="text"
                            placeholder="הוסף תת-משימה..."
                            value={newSubtaskText}
                            onChange={handleNewSubtaskChange}
                            className="add-subtask-input"
                        />
                        <button type="submit" className="add-subtask-btn" title="הוסף תת-משימה">
                            <PlusIcon />
                        </button>
                    </form>
                )}

                {/* Render Subtasks - Consider passing down accessType or isOwner if SubtaskItem needs permissions */}
                {task.subtasks && task.subtasks.length > 0 && (
                    <ul className="subtask-list">
                        {task.subtasks.map(subtask => (
                            <SubtaskItem
                                key={subtask._id || `${task._id}-sub-${Math.random()}`} // Consider more stable key generation if needed
                                subtask={subtask}
                                parentId={task._id}
                                // Pass permissions down if SubtaskItem needs them
                                parentTaskAccessType={task.accessType}
                                parentTaskIsOwner={task.isOwner}
                                // Pass handlers
                                onToggleSubtaskComplete={onToggleSubtaskComplete}
                                onDeleteSubtask={onDeleteSubtask}
                                onEditSubtask={onEditSubtask}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default TaskItem;