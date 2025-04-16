// --- server/controllers/folderController.js ---
const Folder = require('../models/Folder'); // ייבוא מודל התיקיות
const User = require('../models/User'); // אולי נצטרך בעתיד

// @desc    קבלת כל התיקיות של המשתמש המחובר
// @route   GET /api/folders
// @access  Private (דורש אימות)
const getFolders = async (req, res) => {
    try {
        // req.user נוצר על ידי ה-middleware 'protect' ומכיל את פרטי המשתמש
        const folders = await Folder.find({ user: req.user.id }); // מצא תיקיות שהשדה 'user' שלהן שווה ל-ID של המשתמש המחובר
        res.status(200).json(folders); // החזרת התיקיות כתשובת JSON
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

    if (!name) {
        return res.status(400).json({ message: 'Folder name is required' });
    }

    try {
        // יצירת תיקיה חדשה עם השם שסופק וה-ID של המשתמש המחובר
        const folder = await Folder.create({
            name,
            user: req.user.id
        });
        res.status(201).json(folder); // החזרת התיקיה החדשה שנוצרה
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getFolders,
    createFolder
};       