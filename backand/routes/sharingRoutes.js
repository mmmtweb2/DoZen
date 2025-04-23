// --- backand/routes/sharingRoutes.js ---
/**
 * נתיבים לניהול שיתוף של תיקיות ומשימות
 * מאפשרים פעולות לשיתוף פריטים, הסרת שיתוף וקבלת מידע על פריטים משותפים
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    shareFolder,
    removeUserFromFolder,
    getFolderSharedUsers,
    shareTask,
    removeUserFromTask,
    getTaskSharedUsers,
    getFoldersSharedWithMe,
    getTasksSharedWithMe,
    generateShareLink,
    verifyShareLink,
    useShareLink
} = require('../controllers/sharingController');

// --- נתיבים לשיתוף תיקיות ---

// שיתוף תיקיה עם משתמש
router.post('/folders/:folderId', protect, shareFolder);

// הסרת משתמש משיתוף תיקיה
router.delete('/folders/:folderId/users/:userId', protect, removeUserFromFolder);

// קבלת רשימת משתמשים שתיקיה משותפת איתם
router.get('/folders/:folderId/users', protect, getFolderSharedUsers);

// קבלת רשימת תיקיות שמשותפות עם המשתמש המחובר
router.get('/folders/shared-with-me', protect, getFoldersSharedWithMe);

// --- נתיבים לשיתוף משימות ---

// שיתוף משימה עם משתמש
router.post('/tasks/:taskId', protect, shareTask);

// הסרת משתמש משיתוף משימה
router.delete('/tasks/:taskId/users/:userId', protect, removeUserFromTask);

// קבלת רשימת משתמשים שמשימה משותפת איתם
router.get('/tasks/:taskId/users', protect, getTaskSharedUsers);

// קבלת רשימת משימות שמשותפות עם המשתמש המחובר
router.get('/tasks/shared-with-me', protect, getTasksSharedWithMe);

// --- נתיבים לשיתוף באמצעות קישורים ---

// יצירת קישור שיתוף
router.post('/:itemType/:itemId/generate-link', protect, generateShareLink);

// אימות קישור שיתוף
router.get('/verify-link/:token', verifyShareLink);

// שימוש בקישור שיתוף
router.post('/use-link/:token', protect, useShareLink);

module.exports = router;