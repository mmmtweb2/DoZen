// --- server/routes/taskRoutes.js ---
const express = require('express');
const router = express.Router();

// ייבוא פונקציות ה-Controller (ניצור אותן בהמשך)
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

// ייבוא ה-Middleware להגנה על נתיבים
const { protect } = require('../middleware/authMiddleware');

// הגדרת נתיבים עבור '/api/tasks'
// כל הנתיבים כאן מוגנים - דורשים טוקן אימות
router.route('/')
    .get(protect, getTasks)     // GET /api/tasks?folderId=... - קבלת משימות לתיקיה
    .post(protect, createTask);   // POST /api/tasks - יצירת משימה חדשה

router.route('/:id')
    .put(protect, updateTask)     // PUT /api/tasks/:id - עדכון משימה ספציפית
    .delete(protect, deleteTask); // DELETE /api/tasks/:id - מחיקת משימה ספציפית

// בהמשך נוכל להוסיף נתיבים ספציפיים לתתי-משימות אם נרצה

module.exports = router;