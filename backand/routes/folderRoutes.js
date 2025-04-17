// --- server/routes/folderRoutes.js ---
// --- server/routes/folderRoutes.js ---
const express = require('express');
const router = express.Router();
const { getFolders, createFolder, deleteFolder } = require('../controllers/folderController');
const { protect } = require('../middleware/authMiddleware');

// הגדרת נתיבים עבור '/api/folders'
// שים לב שהפונקציה 'protect' רצה לפני הפונקציות של ה-controller
router.route('/')
    .get(protect, getFolders)    // GET /api/folders - קבלת תיקיות
    .post(protect, createFolder); // POST /api/folders - יצירת תיקיה

// הוספת נתיב למחיקת תיקיה
router.route('/:id')
    .delete(protect, deleteFolder); // DELETE /api/folders/:id - מחיקת תיקיה

module.exports = router;