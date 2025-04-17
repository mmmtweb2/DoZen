import React, { useState } from 'react';

function AddTaskForm({ onAddTask }) {
    const [inputText, setInputText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('Medium');

    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmedInputText = inputText.trim();
        if (!trimmedInputText) return;

        onAddTask(trimmedInputText, dueDate, priority);

        // Reset form fields
        setInputText('');
        setDueDate('');
        setPriority('Medium');
    };

    return (
        <form onSubmit={handleSubmit} className="add-task-form-detailed">
            <div className="form-row">
                <input
                    type="text"
                    placeholder="הוסף משימה חדשה..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="task-input-main"
                    required
                />
            </div>

            <div className="form-row form-row-secondary">
                <div className="form-group">
                    <label htmlFor="due-date">תאריך יעד:</label>
                    <input
                        type="date"
                        id="due-date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="date-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="priority">עדיפות:</label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="priority-select"
                    >
                        <option value="Low">נמוכה</option>
                        <option value="Medium">בינונית</option>
                        <option value="High">גבוהה</option>
                    </select>
                </div>

                <button type="submit" className="submit-button">הוסף משימה</button>
            </div>
        </form>
    );
}

export default AddTaskForm;