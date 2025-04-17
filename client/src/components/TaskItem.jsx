import React, { useState } from 'react';
import SubtaskItem from './SubtaskItem';

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
        default: return 'רגילה';
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
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(task.text);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    const [editDateValue, setEditDateValue] = useState(task.dueDate || '');

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
        setEditDateValue(task.dueDate || '');
        setIsEditingDate(true);
    };

    const handlePriorityClick = () => setIsEditingPriority(true);

    const handleDateChange = (e) => {
        setEditDateValue(e.target.value);
    };

    const handleDateBlur = () => {
        onSetTaskDueDate(task._id, editDateValue);
        setIsEditingDate(false);
    };

    const handleDateSubmit = (e) => {
        if (e.key === 'Enter') {
            onSetTaskDueDate(task._id, editDateValue);
            setIsEditingDate(false);
        } else if (e.key === 'Escape') {
            setIsEditingDate(false);
        }
    };

    const handlePriorityChange = (e) => { onSetTaskPriority(task._id, e.target.value); setIsEditingPriority(false); };

    const handlePriorityBlur = () => setIsEditingPriority(false);

    return (
        <div className={`task-item-wrapper ${task.subtasks?.length > 0 ? 'has-subtasks' : ''}`}>
            <li className={`task-item ${task.completed ? 'completed' : ''}`}>
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={handleCheckboxChange}
                    disabled={isEditing || isEditingDate || isEditingPriority}
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
                            <span className="task-text" onDoubleClick={handleEditClick}>{task.text}</span>
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
                                            onClick={handleDateClick}
                                            title={task.dueDate ? "שנה תאריך יעד" : "הוסף תאריך יעד"}
                                        >
                                            <CalendarIcon /> {task.dueDate ? task.dueDate.split('T')[0] : 'אין תאריך'}
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
                                            className={`priority-indicator ${task.priority ? `priority-${task.priority.toLowerCase()}` : 'no-value'}`}
                                            onClick={handlePriorityClick}
                                            title="שינוי עדיפות"
                                        >
                                            {task.priority ? getPriorityText(task.priority) : "רגילה"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="task-actions">
                            <button onClick={handleEditClick} className="edit-btn">ערוך</button>
                            <button onClick={handleDeleteClick} className="delete-btn">מחק</button>
                        </div>
                    </>
                )}
            </li>

            <div className="subtasks-section">
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

                {task.subtasks && task.subtasks.length > 0 && (
                    <ul className="subtask-list">
                        {task.subtasks.map(subtask => (
                            <SubtaskItem
                                key={subtask._id || `${task._id}-sub-${Math.random()}`}
                                subtask={subtask}
                                parentId={task._id}
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