// --- server/models/Task.js ---
const mongoose = require('mongoose');

// הגדרת סכמה פנימית עבור תת-משימה (מוטמעת בתוך המשימה הראשית)
const subtaskSchema = new mongoose.Schema({
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
        type: Date,
        default: null
    },
    // עדיפות (מחרוזת, לא חובה, ברירת מחדל בינונית)
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', null],
        default: 'Medium'
    },
    // מערך של תתי-משימות, משתמש בסכמה שהגדרנו למעלה
    subtasks: [subtaskSchema],
    // שדה לשיתוף משימות
    sharedWith: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        accessType: {
            type: String,
            enum: ['view', 'edit'],
            default: 'view'
        },
        sharedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // קשר לתיקיה שאליה המשימה שייכת
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Folder'
    },
    // קשר למשתמש שיצר את המשימה
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

// יצירת וייצוא המודל
module.exports = mongoose.model('Task', taskSchema);