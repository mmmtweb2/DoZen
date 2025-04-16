// --- server/middleware/authMiddleware.js ---
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // נייבא את מודל המשתמש כדי למצוא את המשתמש

// פונקציית Middleware להגנה על נתיבים
const protect = async (req, res, next) => {
    let token;

    // בדיקה אם קיים Header מסוג Authorization ומתחיל ב-'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // חילוץ הטוקן מה-Header (החלק שאחרי 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // אימות הטוקן באמצעות הסוד שהגדרנו ב-.env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // מציאת המשתמש במסד הנתונים לפי ה-ID שבטוקן
            // ודא שלא מחזירים את הסיסמה
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                // אם המשתמש לא נמצא (למרות שהטוקן תקין?) - זרוק שגיאה
                throw new Error('User not found');
            }

            // אם הכל תקין, קרא לפונקציה הבאה בשרשרת (ה-controller)
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Not authorized, token failed' }); // Unauthorized
        }
    }

    // אם אין טוקן ב-Header
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' }); // Unauthorized
    }
};

module.exports = { protect };