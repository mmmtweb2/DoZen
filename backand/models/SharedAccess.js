// --- backand/models/SharedAccess.js ---
/**
 * מודל לניהול הרשאות שיתוף וגישה למשתמשים
 * משמש כמודל משני שיוטמע במודלים של תיקיות ומשימות
 */
const mongoose = require('mongoose');

// סכמה לזכויות גישה למשתמש שותף
const sharedAccessSchema = new mongoose.Schema({
    // המשתמש שאיתו משתפים
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // סוג ההרשאה - צפייה בלבד או עריכה מלאה
    accessType: {
        type: String,
        enum: ['view', 'edit'],
        default: 'view'
    },
    // תאריך השיתוף
    sharedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = sharedAccessSchema;