// --- client/src/components/TaskItem.jsx ---
// Fixed version with consistent permission checks and improved UX

import React, { useState, useRef, useEffect } from 'react';
import SubtaskItem from './SubtaskItem';
import ShareButton from '../components/sharing/ShareButton';

// Optimized SVG Icons
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
        <line x1="16" x2="16" y1="2" y2="6"></line>
        <line x1="8" x2="8" y1="2" y2="6"></line>
        <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
);

// Function to convert priority values to Hebrew display text
const getPriorityText = (priority) => {
    switch (priority) {
        case 'High': return 'גבוהה';
        case 'Medium': return 'בינונית';
        case 'Low': return 'נמוכה';
        default: return 'בינונית'; // Default value
    }
};

// Function to format dates consistently
const formatDate = (dateString) => {
    if (!dateString) return 'אין תאריך';

    // Check if date is valid
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'תאריך שגוי';
    }

    // Return localized date format
    return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
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
    // קודם הדפס מידע לדיבוג
    console.log('Task details:', {
        id: task._id,
        text: task.text,
        isOwner: task.isOwner,
        user: task.user
    });
    
    // הגדרת משתני הרשאה
    const isOwner = task.isOwner === true || task.user === JSON.parse(localStorage.getItem('user'))?.id;
    const hasEditPermission = isOwner || task.accessType === 'edit';
    const canViewOnly = !isOwner && task.accessType === 'view';
    
    // State hooks
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(task.text);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Initialize editDateValue correctly from task.dueDate (format YYYY-MM-DD for input type="date")
    const initialDate = task.dueDate ? task.dueDate.split('T')[0] : '';
    const [editDateValue, setEditDateValue] = useState(initialDate);

    // Refs for focus management
    const editInputRef = useRef(null);
    const dateInputRef = useRef(null);
    const prioritySelectRef = useRef(null);
    const newSubtaskInputRef = useRef(null);

    // Focus inputs when editing state changes
    useEffect(() => {
        if (isEditing && editInputRef.current) {
            setTimeout(() => {
                if (editInputRef.current) {
                    editInputRef.current.focus();
                    editInputRef.current.select();
                }
            }, 10);
        }
    }, [isEditing]);

    useEffect(() => {
        if (isEditingDate && dateInputRef.current) {
            setTimeout(() => {
                if (dateInputRef.current) {
                    dateInputRef.current.focus();
                }
            }, 10);
        }
    }, [isEditingDate]);

    useEffect(() => {
        if (isEditingPriority && prioritySelectRef.current) {
            setTimeout(() => {
                if (prioritySelectRef.current) {
                    prioritySelectRef.current.focus();
                }
            }, 10);
        }
    }, [isEditingPriority]);

    // Event handlers
    const handleCheckboxChange = () => {
        if (!canViewOnly) {
            onToggleComplete(task._id);
        }
    };

    const handleDeleteClick = () => {
        // Use confirmation dialog instead of direct deletion
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(false);
        onDeleteTask(task._id);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleEditClick = () => {
        setEditText(task.text);
        setIsEditing(true);
    };

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

        // Focus back on input after adding
        setTimeout(() => {
            if (newSubtaskInputRef.current) {
                newSubtaskInputRef.current.focus();
            }
        }, 10);
    };

    const handleDateClick = () => {
        if (canViewOnly) return;

        // Update state with current task date when opening editor
        setEditDateValue(task.dueDate ? task.dueDate.split('T')[0] : '');
        setIsEditingDate(true);
    };

    const handlePriorityClick = () => {
        if (canViewOnly) return;

        setIsEditingPriority(true);
    };

    const handleDateChange = (e) => {
        setEditDateValue(e.target.value);
    };

    // Use onBlur for saving date change
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
            // Reset editDateValue to original task.dueDate
            setEditDateValue(task.dueDate ? task.dueDate.split('T')[0] : '');
        }
    };

    const handlePriorityChange = (e) => {
        onSetTaskPriority(task._id, e.target.value);
        setIsEditingPriority(false);
    };

    const handlePriorityBlur = () => setIsEditingPriority(false);

    return (
        // Add shared-task class if the user is NOT the owner
        <div className={`task-item-wrapper ${task.subtasks?.length > 0 ? 'has-subtasks' : ''} ${isOwner ? '' : 'shared-task'}`}>
            <li className={`task-item ${task.completed ? 'completed' : ''}`}>
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={handleCheckboxChange}
                    disabled={isEditing || isEditingDate || isEditingPriority || canViewOnly}
                />

                {isEditing ? (
                    <div className="edit-mode">
                        <input
                            type="text"
                            value={editText}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="edit-input"
                            ref={editInputRef}
                            autoFocus
                        />
                        <button onClick={handleSaveClick} className="save-btn">שמור</button>
                        <button onClick={handleCancelClick} className="cancel-btn">ביטול</button>
                    </div>
                ) : (
                    <>
                        <div className="task-main-info">
                            {/* Allow editing text only if user has edit permission */}
                            <span
                                className="task-text"
                                onDoubleClick={hasEditPermission ? handleEditClick : undefined}
                                title={hasEditPermission ? "לחץ לחיצה כפולה לעריכה" : undefined}
                            >
                                {task.text}
                            </span>

                            {/* Show shared badge if shared directly */}
                            {!isOwner && (
                                <div className="task-shared-info">
                                    <span className="shared-badge">
                                        משותף {task.user?.name ? `ע"י: ${task.user.name}` : ''}
                                    </span>
                                </div>
                            )}

                            <div className="task-details">
                                <div className="detail-item date-detail">
                                    {isEditingDate ? (
                                        <input
                                            type="date"
                                            value={editDateValue}
                                            onChange={handleDateChange}
                                            onBlur={handleDateBlur}
                                            onKeyDown={handleDateSubmit}
                                            ref={dateInputRef}
                                            className="inline-edit-input date-edit-input"
                                            autoFocus
                                        />
                                    ) : (
                                        <span
                                            className={`due-date ${task.dueDate ? '' : 'no-value'}`}
                                            onClick={hasEditPermission ? handleDateClick : undefined}
                                            title={hasEditPermission ? (task.dueDate ? "שנה תאריך יעד" : "הוסף תאריך יעד") : undefined}
                                            style={hasEditPermission ? { cursor: 'pointer' } : {}}
                                        >
                                            <CalendarIcon /> {formatDate(task.dueDate)}
                                        </span>
                                    )}
                                </div>

                                <div className="detail-item priority-detail">
                                    {isEditingPriority ? (
                                        <select
                                            value={task.priority || 'Medium'}
                                            onChange={handlePriorityChange}
                                            onBlur={handlePriorityBlur}
                                            ref={prioritySelectRef}
                                            className="inline-edit-input priority-edit-select"
                                            autoFocus
                                        >
                                            <option value="Low">נמוכה</option>
                                            <option value="Medium">בינונית</option>
                                            <option value="High">גבוהה</option>
                                        </select>
                                    ) : (
                                        <span
                                            className={`priority-indicator ${task.priority ? `priority-${task.priority.toLowerCase()}` : 'priority-medium'}`}
                                            onClick={hasEditPermission ? handlePriorityClick : undefined}
                                            title={hasEditPermission ? "שינוי עדיפות" : undefined}
                                            style={hasEditPermission ? { cursor: 'pointer' } : {}}
                                        >
                                            {getPriorityText(task.priority)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="task-actions">
                            {/* Share button - only for task owners */}
                            {isOwner && (
                              <button onClick={() => console.log('Would share task:', task._id)}>
                                שתף (דיבוג)
                              </button>
                            )}

                            {/* Edit button - show only if user has edit permission */}
                            {hasEditPermission && (
                                <button onClick={handleEditClick} className="edit-btn" title="ערוך משימה">
                                    ערוך
                                </button>
                            )}

                            {/* Delete button - show only for owners */}
                            {isOwner && (
                                <button onClick={handleDeleteClick} className="delete-btn" title="מחק משימה">
                                    מחק
                                </button>
                            )}
                        </div>
                    </>
                )}
            </li>

            <div className="subtasks-section">
                {/* Add subtask form - only if user has edit permission */}
                {hasEditPermission && (
                    <form onSubmit={handleAddSubtaskSubmit} className="add-subtask-form">
                        <input
                            type="text"
                            placeholder="הוסף תת-משימה..."
                            value={newSubtaskText}
                            onChange={handleNewSubtaskChange}
                            className="add-subtask-input"
                            ref={newSubtaskInputRef}
                        />
                        <button
                            type="submit"
                            className="add-subtask-btn"
                            title="הוסף תת-משימה"
                            disabled={!newSubtaskText.trim()}
                        >
                            <PlusIcon />
                        </button>
                    </form>
                )}

                {/* Render Subtasks with permission props */}
                {task.subtasks && task.subtasks.length > 0 && (
                    <ul className="subtask-list">
                        {task.subtasks.map(subtask => (
                            <SubtaskItem
                                key={subtask._id || `${task._id}-sub-${Math.random()}`}
                                subtask={subtask}
                                parentId={task._id}
                                // Pass permissions down to SubtaskItem
                                parentTaskAccessType={task.accessType}
                                parentTaskIsOwner={isOwner}
                                // Pass handlers
                                onToggleSubtaskComplete={onToggleSubtaskComplete}
                                onDeleteSubtask={onDeleteSubtask}
                                onEditSubtask={onEditSubtask}
                            />
                        ))}
                    </ul>
                )}
            </div>

            {/* Confirmation dialog for deletion */}
            {showDeleteConfirm && (
                <div className="confirm-dialog-overlay">
                    <div className="confirm-dialog">
                        <h3>מחיקת משימה</h3>
                        <p>האם אתה בטוח שברצונך למחוק את המשימה "{task.text}"?</p>
                        <div className="confirm-dialog-buttons">
                            <button className="cancel-button" onClick={cancelDelete}>
                                ביטול
                            </button>
                            <button className="confirm-button confirm-delete" onClick={confirmDelete}>
                                מחק
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaskItem;
