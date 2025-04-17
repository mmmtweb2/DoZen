// --- server/routes/subtaskRoutes.js ---
const express = require('express');
const router = express.Router({ mergeParams: true }); // חשוב: מאפשר גישה ל-params של נתיב האב
const { addSubtask, updateSubtask, deleteSubtask } = require('../controllers/subtaskController');
const { protect } = require('../middleware/authMiddleware');

// /:taskId/subtasks - הוספת תת-משימה חדשה
router.post('/', protect, addSubtask);

// /:taskId/subtasks/:subtaskId - עדכון ומחיקה של תת-משימה
router.route('/:subtaskId')
    .put(protect, updateSubtask)
    .delete(protect, deleteSubtask);

module.exports = router;