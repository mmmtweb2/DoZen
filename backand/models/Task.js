// --- server/models/Task.js ---
const SharedAccess = require('./SharedAccess');
const mongoose = require('mongoose');

// הגדרת סכמה פנימית עבור תת-משימה (מוטמעת בתוך המשימה הראשית)
const subtaskSchema = new mongoose.Schema({
    sharedWith: [sharedAccessSchema],
    text: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    }
});


// הגדרת סכמה (מבנה) עבור משימה ראשית
const taskSchema = new mongoose.Schema({
    // טקסט המשימה
    text: {
        type: String,
        required: [true, 'Task text is required'],
        trim: true
    },
    // האם המשימה הושלמה
    completed: {
        type: Boolean,
        required: true,
        default: false
    },
    // תאריך יעד (לא חובה)
    dueDate: {
        type: Date, // שימוש בסוג Date של MongoDB/Mongoose
        default: null
    },
    // עדיפות (מחרוזת, לא חובה, ברירת מחדל בינונית)
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', null], // ערכים אפשריים
        default: 'Medium'
    },
    // מערך של תתי-משימות, משתמש בסכמה שהגדרנו למעלה
    subtasks: [subtaskSchema],
    // קשר לתיקיה שאליה המשימה שייכת
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Folder' // קישור למודל Folder
    },
    // קשר למשתמש שיצר את המשימה
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // קישור למודל User
    }
}, {
    timestamps: true // הוספה אוטומטית של createdAt ו-updatedAt
});

// יצירת וייצוא המודל
// 'Task' יהפוך לאוסף 'tasks' במסד הנתונים
module.exports = mongoose.model('Task', taskSchema);