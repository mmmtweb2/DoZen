// --- server/controllers/taskController.js ---
const Task = require('../models/Task');   // ייבוא מודל המשימות
const Folder = require('../models/Folder'); // נייבא גם את מודל התיקיות לבדיקות

// @desc    קבלת משימות עבור תיקיה ספציפית של המשתמש המחובר
// @route   GET /api/tasks?folderId=FOLDER_ID
// @access  Private
const getTasks = async (req, res) => {
    // קבלת ID התיקיה מה-query parameters
    const folderId = req.query.folderId;

    // בדיקה אם סופק ID של תיקיה
    if (!folderId) {
        return res.status(400).json({ message: 'Folder ID is required' });
    }

    try {
        // וידוא שהתיקיה שייכת למשתמש המחובר (אבטחה נוספת)
        const folder = await Folder.findById(folderId);
        if (!folder || folder.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Folder not found or not authorized' });
        }

        // מציאת כל המשימות ששייכות גם לתיקיה וגם למשתמש המחובר
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
    // קבלת הנתונים מגוף הבקשה
    const { text, dueDate, priority, folderId } = req.body;

    // בדיקת שדות חובה
    if (!text || !folderId) {
        return res.status(400).json({ message: 'Text and Folder ID are required' });
    }

    try {
        // וידוא שהתיקיה שאליה רוצים להוסיף שייכת למשתמש
        const folder = await Folder.findById(folderId);
        if (!folder || folder.user.toString() !== req.user.id) {
            return res.status(400).json({ message: 'Invalid folder ID or not authorized' });
        }

        // יצירת המשימה החדשה עם ה-ID של המשתמש המחובר
        const task = await Task.create({
            text,
            dueDate: dueDate || null,
            priority: priority || 'Medium',
            folder: folderId,
            user: req.user.id, // ה-ID מגיע מה-middleware 'protect'
            subtasks: [] // מתחילים עם מערך ריק
        });
        res.status(201).json(task); // החזרת המשימה שנוצרה
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
        // מציאת המשימה לפי ה-ID שהתקבל בנתיב ולפי המשתמש המחובר
        let task = await Task.findOne({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or not authorized' });
        }

        // עדכון השדות לפי מה שהתקבל בגוף הבקשה
        // (נוכל להיות יותר ספציפיים לגבי אילו שדות מותר לעדכן)
        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // החזר את המסמך המעודכן
            runValidators: true // הפעל את הבדיקות שהוגדרו בסכמה
        });

        res.status(200).json(task); // החזרת המשימה המעודכנת
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
        // מציאת המשימה לפי ה-ID שהתקבל בנתיב ולפי המשתמש המחובר
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or not authorized' });
        }

        // מחיקת המשימה
        await task.deleteOne(); // או Task.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Task removed', id: req.params.id }); // החזרת הודעת הצלחה
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