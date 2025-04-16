import React, { useState } from 'react';

// הקומפוננטה מקבלת את הפונקציה onAddTask מ-App.jsx
function AddTaskForm({ onAddTask }) {
    // State עבור שדה הטקסט הראשי
    const [inputText, setInputText] = useState('');
    // State חדש עבור שדה תאריך היעד
    const [dueDate, setDueDate] = useState(''); // מתחילים ריק
    // State חדש עבור בחירת העדיפות
    const [priority, setPriority] = useState('Medium'); // ברירת מחדל - בינונית

    // פונקציה המופעלת בעת שליחת הטופס
    const handleSubmit = (event) => {
        event.preventDefault(); // מניעת ריענון הדף
        const trimmedInputText = inputText.trim();
        if (!trimmedInputText) return; // אם הקלט הראשי ריק - לא עושים כלום

        // קריאה לפונקציה שהועברה מ-App.jsx להוספת המשימה,
        // כולל העברת הערכים החדשים של תאריך ועדיפות
        onAddTask(trimmedInputText, dueDate, priority);

        // איפוס כל שדות הטופס לאחר ההוספה
        setInputText('');
        setDueDate('');
        setPriority('Medium'); // איפוס לברירת המחדל
    };

    // רינדור הטופס המעודכן
    return (
        // שינינו את הקלאס כדי שנוכל לעצב את הטופס בצורה שונה אם נרצה
        <form onSubmit={handleSubmit} className="add-task-form-detailed">
            {/* שדה הטקסט הראשי */}
            <div className="form-row">
                <input
                    type="text"
                    placeholder="הוסף משימה חדשה..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="task-input-main" // קלאס ספציפי לשדה הראשי
                    required // הוספת דרישה למילוי שדה זה
                />
            </div>

            {/* שורה נוספת עבור תאריך ועדיפות */}
            <div className="form-row form-row-secondary">
                {/* שדה תאריך יעד */}
                <div className="form-group">
                    <label htmlFor="due-date">תאריך יעד:</label>
                    <input
                        type="date"
                        id="due-date" // הוספת id לקישור ל-label
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="date-input"
                    />
                </div>

                {/* בחירת עדיפות */}
                <div className="form-group">
                    <label htmlFor="priority">עדיפות:</label>
                    <select
                        id="priority" // הוספת id לקישור ל-label
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="priority-select"
                    >
                        <option value="Low">נמוכה</option>
                        <option value="Medium">בינונית</option>
                        <option value="High">גבוהה</option>
                    </select>
                </div>

                {/* כפתור ההוספה עבר לסוף */}
                <button type="submit" className="submit-button">הוסף משימה</button>
            </div>
        </form>
    );
}

export default AddTaskForm;