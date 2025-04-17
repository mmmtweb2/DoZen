// --- server/controllers/taskController.js ---
const Task = require('../models/Task');
const Folder = require('../models/Folder');

// @desc    קבלת משימות עבור תיקיה ספציפית של המשתמש המחובר
// @route   GET /api/tasks?folderId=FOLDER_ID
// @access  Private
const getTasks = async (req, res) => {
    const folderId = req.query.folderId;

    if (!folderId) {
        return res.status(400).json({ message: 'Folder ID is required' });
    }

    try {
        // וידוא שהתיקיה שייכת למשתמש המחובר (אבטחה נוספת)
        const folder = await Folder.findById(folderId);

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        if (folder.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to access this folder' });
        }

        // מציאת כל המשימות ששייכות לתיקיה ולמשתמש המחובר
        const tasks = await Task.find({ user: req.user.id, folder: folderId });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error getting tasks:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    יצירת משימה חדשה
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    const { text, dueDate, priority, folderId } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Task text is required' });
    }

    if (!folderId) {
        return res.status(400).json({ message: 'Folder ID is required' });
    }

    try {
        // וידוא שהתיקיה שאליה רוצים להוסיף שייכת למשתמש
        const folder = await Folder.findById(folderId);

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        if (folder.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to access this folder' });
        }

        // יצירת המשימה החדשה
        const task = await Task.create({
            text: text.trim(),
            dueDate: dueDate || null,
            priority: priority || 'Medium',
            folder: folderId,
            user: req.user.id,
            subtasks: []
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    עדכון משימה קיימת
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        // מציאת המשימה לפי ה-ID ולפי המשתמש המחובר
        let task = await Task.findOne({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or not authorized' });
        }

        // וידוא שהמשתמש רשאי לערוך את המשימה (זה כבר נבדק למעלה, זה רק להבהרה)
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized' });
        }

        // עדכון המשימה
        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    מחיקת משימה
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        // מציאת המשימה לפי ה-ID ולפי המשתמש המחובר
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or not authorized' });
        }

        // מחיקת המשימה
        await task.deleteOne();

        res.status(200).json({ message: 'Task removed', id: req.params.id });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};