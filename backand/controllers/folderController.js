// --- server/controllers/folderController.js ---
const Folder = require('../models/Folder');

// @desc    קבלת כל התיקיות של המשתמש המחובר
// @route   GET /api/folders
// @access  Private (דורש אימות)
const getFolders = async (req, res) => {
    try {
        // req.user נוצר על ידי ה-middleware 'protect' ומכיל את פרטי המשתמש
        const folders = await Folder.find({ user: req.user.id });
        res.status(200).json(folders);
    } catch (error) {
        console.error('Error getting folders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    יצירת תיקיה חדשה
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res) => {
    // קבלת שם התיקיה מגוף הבקשה
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Folder name is required' });
    }

    try {
        // יצירת תיקיה חדשה עם השם שסופק וה-ID של המשתמש המחובר
        const folder = await Folder.create({
            name: name.trim(),
            user: req.user.id
        });
        res.status(201).json(folder);
    } catch (error) {
        console.error('Error creating folder:', error);
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({ message: 'Folder with this name already exists' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    מחיקת תיקיה
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolder = async (req, res) => {
    try {
        // מציאת התיקיה לפי ה-ID ולפי המשתמש המחובר
        const folder = await Folder.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found or not authorized' });
        }

        // מחיקת התיקיה
        await folder.deleteOne();

        res.status(200).json({ message: 'Folder removed', id: req.params.id });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getFolders,
    createFolder,
    deleteFolder
};