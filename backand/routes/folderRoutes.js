// --- server/routes/folderRoutes.js ---
const express = require('express');
const router = express.Router();
const { getFolders, createFolder } = require('../controllers/folderController'); // נייבא בהמשך
const { protect } = require('../middleware/authMiddleware'); // ייבוא ה-Middleware שיצרנו

// הגדרת נתיבים עבור '/api/folders'
// שים לב שהפונקציה 'protect' רצה לפני הפונקציות של ה-controller
router.route('/')
    .get(protect, getFolders) // GET /api/folders - קבלת תיקיות (מוגן)
    .post(protect, createFolder); // POST /api/folders - יצירת תיקיה (מוגן)

// בהמשך נוסיף נתיבים לעדכון ומחיקת תיקיות (למשל, /:id)

module.exports = router;