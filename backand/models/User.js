const mongoose = require('mongoose');

// הגדרת סכמה (מבנה) עבור משתמש
const userSchema = new mongoose.Schema({
    // שם המשתמש
    name: {
        type: String,
        required: [true, 'Please add a name'] // שדה חובה עם הודעת שגיאה
    },
    // כתובת אימייל
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, // מבטיח שכל אימייל יהיה ייחודי במסד הנתונים
        match: [ // בדיקה בסיסית של תקינות פורמט אימייל
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    // סיסמה (תאוחסן כ-hash מוצפן)
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6, // דרישת אורך מינימלי
        select: false // חשוב: מונע שליפה אוטומטית של הסיסמה בבקשות רגילות
    }
    // בהמשך נוסיף שדות נוספים אם צריך
}, {
    timestamps: true // מוסיף אוטומטית שדות createdAt ו-updatedAt
});

// יצירת וייצוא המודל מהסכמה
// 'User' יהיה שם האוסף (collection) במסד הנתונים (יהפוך ל-'users')
module.exports = mongoose.model('User', userSchema);