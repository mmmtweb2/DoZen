// --- server/controllers/subtaskController.js ---
const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    הוספת תת-משימה למשימה קיימת
// @route   POST /api/tasks/:taskId/subtasks
// @access  Private
const addSubtask = async (req, res) => {
    try {
        const { text } = req.body;
        const taskId = req.params.taskId;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Subtask text is required' });
        }

        // מציאת המשימה לפי ה-ID
        const task = await Task.findOne({ _id: taskId, user: req.user.id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or not authorized' });
        }

        // יצירת תת-משימה חדשה
        const newSubtask = {
            _id: new mongoose.Types.ObjectId(),
            text: text.trim(),
            completed: false
        };

        // הוספת תת-המשימה למערך התת-משימות
        task.subtasks.push(newSubtask);
        await task.save();

        res.status(201).json(task);
    } catch (error) {
        console.error('Error adding subtask:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    עדכון תת-משימה
// @route   PUT /api/tasks/:taskId/subtasks/:subtaskId
// @access  Private
const updateSubtask = async (req, res) => {
    try {
        const { taskId, subtaskId } = req.params;
        const { text, completed } = req.body;

        // מציאת המשימה
        const task = await Task.findOne({ _id: taskId, user: req.user.id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or not authorized' });
        }

        // חיפוש תת-המשימה
        const subtaskIndex = task.subtasks.findIndex(s => s._id.toString() === subtaskId);

        if (subtaskIndex === -1) {
            return res.status(404).json({ message: 'Subtask not found' });
        }

        // עדכון תת-המשימה
        if (text !== undefined) {
            task.subtasks[subtaskIndex].text = text;
        }

        if (completed !== undefined) {
            task.subtasks[subtaskIndex].completed = completed;
        }

        await task.save();

        res.status(200).json(task);
    } catch (error) {
        console.error('Error updating subtask:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    מחיקת תת-משימה
// @route   DELETE /api/tasks/:taskId/subtasks/:subtaskId
// @access  Private
const deleteSubtask = async (req, res) => {
    try {
        const { taskId, subtaskId } = req.params;

        // מציאת המשימה
        const task = await Task.findOne({ _id: taskId, user: req.user.id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or not authorized' });
        }

        // מחיקת תת-המשימה מהמערך
        task.subtasks = task.subtasks.filter(s => s._id.toString() !== subtaskId);
        await task.save();

        res.status(200).json(task);
    } catch (error) {
        console.error('Error deleting subtask:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ייצוא של הפונקציות
module.exports = {
    addSubtask,
    updateSubtask,
    deleteSubtask
};