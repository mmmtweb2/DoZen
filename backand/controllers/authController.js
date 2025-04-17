// --- server/controllers/authController.js ---

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- פונקציית עזר ליצירת טוקן JWT ---
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    });
};

// --- פונקציה אסינכרונית לרישום משתמש חדש ---
const registerUser = async (req, res) => {
    console.log('Register request body:', req.body);
    const { name, email, password } = req.body;

    try {
        // --- בדיקות קלט בסיסיות ---
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        // --- בדיקה אם המשתמש כבר קיים ---
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // --- הצפנת הסיסמה ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- יצירת המשתמש במסד הנתונים ---
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // --- בדיקה אם המשתמש נוצר בהצלחה ---
        if (user) {
            const token = generateToken(user._id);
            console.log('User registered successfully:', user.email, 'Token:', token);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// --- פונקציה אסינכרונית להתחברות משתמש ---
const loginUser = async (req, res) => {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    try {
        // --- בדיקת קלט ---
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // --- חיפוש המשתמש לפי אימייל ---
        const user = await User.findOne({ email }).select('+password');

        // בדיקה אם המשתמש קיים כלל
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // --- בדיקה אם הסיסמה נכונה ---
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = generateToken(user._id);
            console.log('User logged in successfully:', user.email, 'Token:', token);
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token,
            });
        } else {
            console.log('Password does not match for:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// --- עדכון הייצוא ---
module.exports = {
    registerUser,
    loginUser
};