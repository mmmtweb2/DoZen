// --- server/models/Folder.js ---
const SharedAccess = require('./SharedAccess');
const mongoose = require('mongoose');

// הגדרת סכמה (מבנה) עבור תיקיה
const folderSchema = new mongoose.Schema({
    sharedWith: [sharedAccessSchema],
    // שם התיקיה
    name: {
        type: String,
        required: [true, 'Folder name is required'],
        trim: true // הסרת רווחים מיותרים מההתחלה והסוף
    },
    // קשר למשתמש שיצר את התיקיה
    // שומרים את ה-ID של המשתמש מאוסף ה-'User'
    user: {
        type: mongoose.Schema.Types.ObjectId, // סוג מיוחד ל-ID של MongoDB
        required: true,
        ref: 'User' // מציין שה-ID מתייחס למסמך באוסף 'User'
    }
}, {
    timestamps: true // הוספה אוטומטית של createdAt ו-updatedAt
});

// יצירת וייצוא המודל
// 'Folder' יהפוך לאוסף 'folders' במסד הנתונים
module.exports = mongoose.model('Folder', folderSchema);