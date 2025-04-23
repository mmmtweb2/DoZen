// --- server/controllers/folderController.js ---
const Folder = require('../models/Folder');

// @desc    קבלת תיקיות של המשתמש המחובר (כולל משותפות)
// @route   GET /api/folders
// @access  Private
const getFolders = async (req, res) => {
    try {
        // מציאת תיקיות שהמשתמש יצר
        const ownedFolders = await Folder.find({ user: req.user.id });

        // מציאת תיקיות שמשותפות עם המשתמש
        const sharedFolders = await Folder.find({
            'sharedWith.user': req.user.id
        }).populate('user', 'name email');

        // שילוב שתי הרשימות, עם סימון לתיקיות משותפות
        const allFolders = [
            ...ownedFolders.map(folder => ({
                ...folder.toObject(),
                isOwner: true
            })),
            ...sharedFolders.map(folder => ({
                ...folder.toObject(),
                isOwner: false,
                // מציאת סוג ההרשאה של המשתמש לתיקיה
                accessType: folder.sharedWith.find(
                    s => s.user.toString() === req.user.id
                )?.accessType || 'view'
            }))
        ];

        res.status(200).json(allFolders);
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
        // מציאת התיקיה לפי ה-ID
        const folder = await Folder.findById(req.params.id);

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // בדיקה שהמשתמש הוא הבעלים של התיקיה
        if (folder.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this folder - you must be the owner' });
        }

        // מחיקת התיקיה
        await folder.deleteOne();

        res.status(200).json({ message: 'Folder removed', id: req.params.id });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    עדכון תיקיה קיימת
// @route   PUT /api/folders/:id
// @access  Private
const updateFolder = async (req, res) => {
    try {
        // מציאת התיקיה
        const folder = await Folder.findById(req.params.id);

        if (!folder) {
            return res.status(404).json({ message: 'תיקיה לא נמצאה' });
        }

        // בדיקה שהמשתמש הוא הבעלים של התיקיה
        if (folder.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'אין לך הרשאה לעדכן תיקיה זו - עליך להיות הבעלים' });
        }

        // עדכון התיקיה
        const updatedFolder = await Folder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedFolder);
    } catch (error) {
        console.error('Error updating folder:', error);
        res.status(500).json({ message: 'שגיאת שרת' });
    }
};

module.exports = {
    getFolders,
    createFolder,
    deleteFolder,
    updateFolder
};