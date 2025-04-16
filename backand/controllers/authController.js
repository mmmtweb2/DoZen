// --- server/controllers/authController.js ---

const User = require('../models/User'); // ייבוא מודל המשתמש שיצרנו
const bcrypt = require('bcryptjs'); // ייבוא ספריית הצפנת סיסמאות
const jwt = require('jsonwebtoken'); // ייבוא ספריית JWT ליצירת טוקנים

// --- פונקציית עזר ליצירת טוקן JWT ---
const generateToken = (id) => {
    // יוצר טוקן שמכיל את ה-ID של המשתמש
    // חותם אותו באמצעות הסוד מה-.env ותוקף מה-.env
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d' // ברירת מחדל ל-30 יום
    });
};
// ------------------------------------

// --- פונקציה אסינכרונית לרישום משתמש חדש ---
const registerUser = async (req, res) => {
    console.log('Register request body:', req.body); // הדפסה לדיבוג
    // קבלת שם, אימייל וסיסמה מגוף הבקשה (req.body)
    const { name, email, password } = req.body;

    try {
        // --- בדיקות קלט בסיסיות ---
        if (!name || !email || !password) {
            // אם אחד השדות חסר
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        // --- בדיקה אם המשתמש כבר קיים ---
        const userExists = await User.findOne({ email }); // חיפוש משתמש לפי אימייל
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // --- הצפנת הסיסמה ---
        const salt = await bcrypt.genSalt(10); // יצירת "מלח" להצפנה (10 סיבובים)
        const hashedPassword = await bcrypt.hash(password, salt); // הצפנת הסיסמה

        // --- יצירת המשתמש במסד הנתונים ---
        const user = await User.create({
            name,
            email,
            password: hashedPassword, // שמירת הסיסמה המוצפנת
        });

        // --- בדיקה אם המשתמש נוצר בהצלחה ---
        if (user) {
            // אם כן, נחזיר תשובת הצלחה (201 Created)
            // נשלח חזרה את פרטי המשתמש (בלי הסיסמה) ואת הטוקן
            const token = generateToken(user._id); // יצירת טוקן למשתמש החדש
            console.log('User registered successfully:', user.email, 'Token:', token); // הדפסה לדיבוג
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token, // שליחת הטוקן ללקוח
            });
        } else {
            // אם הייתה בעיה ביצירת המשתמש (נדיר אם אין שגיאה אחרת)
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        // טיפול בשגיאות כלליות (למשל, בעיות במסד הנתונים)
        console.error('Registration error:', error); // הדפסת השגיאה ללוג השרת
        res.status(500).json({ message: 'Server error during registration' });
    }
};
// ------------------------------------------

// --- פונקציה אסינכרונית להתחברות משתמש ---
const loginUser = async (req, res) => {
    console.log('Login request body:', req.body); // הדפסה לדיבוג
    // קבלת אימייל וסיסמה מגוף הבקשה
    const { email, password } = req.body;

    try {
        // --- בדיקת קלט ---
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // --- חיפוש המשתמש לפי אימייל ---
        // חשוב: שימוש ב- .select('+password') כדי לקבל גם את הסיסמה המוצפנת,
        // שבדרך כלל מוסתרת בגלל הגדרת select: false בסכמה.
        const user = await User.findOne({ email }).select('+password');

        // --- בדיקה אם המשתמש קיים והסיסמה נכונה ---
        // משתמשים ב-bcrypt.compare כדי להשוות את הסיסמה שהתקבלה עם הסיסמה המוצפנת במסד הנתונים
        if (user && (await bcrypt.compare(password, user.password))) {
            // אם המשתמש קיים והסיסמאות תואמות
            const token = generateToken(user._id); // יצירת טוקן חדש
            console.log('User logged in successfully:', user.email, 'Token:', token); // הדפסה לדיבוג
            // החזרת תשובה מוצלחת עם פרטי המשתמש (בלי הסיסמה) והטוקן
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token,
            });
        } else {
            // אם המשתמש לא נמצא או שהסיסמה שגויה
            res.status(401).json({ message: 'Invalid email or password' }); // שגיאת Unauthorized
        }
    } catch (error) {
        // טיפול בשגיאות כלליות
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
// ---------------------------------------

// --- עדכון הייצוא ---
module.exports = {
    registerUser,
    loginUser
};