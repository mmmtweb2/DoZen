
const express = require('express');
const router = express.Router();


const { registerUser, loginUser } = require('../controllers/authController');

// נתיב הרשמה (קיים)
router.post('/register', registerUser);

// --- הוספת נתיב התחברות ---
// כשמגיעה בקשת POST לנתיב /login, היא תפעיל את הפונקציה loginUser
router.post('/login', loginUser);
// ---------------------------

module.exports = router;
