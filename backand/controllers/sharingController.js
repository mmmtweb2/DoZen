// --- backand/controllers/sharingController.js ---
/**
 * בקר לניהול פעולות שיתוף של תיקיות ומשימות
 * מאפשר הוספה, עדכון והסרה של משתמשים משותפים
 */
const User = require('../models/User');
const Folder = require('../models/Folder');
const Task = require('../models/Task');
const mongoose = require('mongoose');

// --- פונקציות עזר ---

/**
 * בדיקה האם המשתמש קיים לפי אימייל
 * @param {string} email - אימייל המשתמש לחיפוש
 * @returns {Promise<Object>} אובייקט המשתמש אם נמצא
 */
const findUserByEmail = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found with this email');
    }
    return user;
};

/**
 * בדיקת הרשאות לשיתוף - וידוא שהמשתמש הוא הבעלים של הפריט
 * @param {Object} item - האובייקט (תיקיה או משימה) שנבדק
 * @param {string} userId - המזהה של המשתמש שמנסה לשתף
 * @returns {boolean} האם למשתמש יש הרשאה
 */
const verifyOwnership = (item, userId) => {
    return item.user.toString() === userId;
};

// --- בקרים לשיתוף תיקיות ---

/**
 * שיתוף תיקיה עם משתמש אחר
 * @route POST /api/sharing/folders/:folderId
 * @access Private
 */
const shareFolder = async (req, res) => {
    const { folderId } = req.params;
    const { email, accessType = 'view' } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    if (!['view', 'edit'].includes(accessType)) {
        return res.status(400).json({ message: 'Invalid access type, must be "view" or "edit"' });
    }

    try {
        // מציאת התיקיה
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // וידוא שהמשתמש הנוכחי הוא הבעלים של התיקיה
        if (!verifyOwnership(folder, req.user.id)) {
            return res.status(403).json({ message: 'You do not have permission to share this folder' });
        }

        // מציאת המשתמש השותף לפי אימייל
        const userToShare = await findUserByEmail(email);

        // בדיקה שהמשתמש לא משתף עם עצמו
        if (userToShare._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot share a folder with yourself' });
        }

        // בדיקה האם התיקיה כבר משותפת עם המשתמש
        const isAlreadyShared = folder.sharedWith.some(
            share => share.user.toString() === userToShare._id.toString()
        );

        if (isAlreadyShared) {
            // עדכון הרשאות אם כבר משותף
            folder.sharedWith.forEach(share => {
                if (share.user.toString() === userToShare._id.toString()) {
                    share.accessType = accessType;
                    share.sharedAt = Date.now();
                }
            });
        } else {
            // הוספת המשתמש לרשימת השיתוף
            folder.sharedWith.push({
                user: userToShare._id,
                accessType,
                sharedAt: Date.now()
            });
        }

        await folder.save();

        return res.status(200).json({
            message: isAlreadyShared ? 'Sharing permissions updated' : 'Folder shared successfully',
            folder: {
                _id: folder._id,
                name: folder.name,
                sharedWith: folder.sharedWith
            }
        });

    } catch (error) {
        console.error('Error sharing folder:', error);
        if (error.message === 'User not found with this email') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * הסרת שיתוף תיקיה ממשתמש
 * @route DELETE /api/sharing/folders/:folderId/users/:userId
 * @access Private
 */
const removeUserFromFolder = async (req, res) => {
    const { folderId, userId } = req.params;

    try {
        // מציאת התיקיה
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // וידוא שהמשתמש הנוכחי הוא הבעלים של התיקיה
        if (!verifyOwnership(folder, req.user.id)) {
            return res.status(403).json({ message: 'You do not have permission to modify sharing for this folder' });
        }

        // הסרת המשתמש מרשימת השיתוף
        folder.sharedWith = folder.sharedWith.filter(
            share => share.user.toString() !== userId
        );

        await folder.save();

        return res.status(200).json({
            message: 'User removed from shared folder',
            folderId
        });

    } catch (error) {
        console.error('Error removing user from folder:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * קבלת רשימת כל המשתמשים שתיקיה משותפת איתם
 * @route GET /api/sharing/folders/:folderId/users
 * @access Private
 */
const getFolderSharedUsers = async (req, res) => {
    const { folderId } = req.params;

    try {
        // מציאת התיקיה עם פרטי המשתמשים המשותפים
        const folder = await Folder.findById(folderId)
            .populate('sharedWith.user', 'name email'); // קבלת פרטים בסיסיים על המשתמשים

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // בדיקת הרשאה - רק הבעלים או משתמש שהתיקיה משותפת איתו יכולים לראות את הרשימה
        const userIsOwner = folder.user.toString() === req.user.id;
        const userHasAccess = folder.sharedWith.some(share => share.user._id.toString() === req.user.id);

        if (!userIsOwner && !userHasAccess) {
            return res.status(403).json({ message: 'You do not have permission to view this folder' });
        }

        return res.status(200).json({
            folderId: folder._id,
            name: folder.name,
            owner: folder.user,
            sharedWith: folder.sharedWith
        });

    } catch (error) {
        console.error('Error getting folder shared users:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

// --- בקרים לשיתוף משימות ---

/**
 * שיתוף משימה עם משתמש אחר
 * @route POST /api/sharing/tasks/:taskId
 * @access Private
 */
const shareTask = async (req, res) => {
    const { taskId } = req.params;
    const { email, accessType = 'view' } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    if (!['view', 'edit'].includes(accessType)) {
        return res.status(400).json({ message: 'Invalid access type, must be "view" or "edit"' });
    }

    try {
        // מציאת המשימה
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // וידוא שהמשתמש הנוכחי הוא הבעלים של המשימה
        if (!verifyOwnership(task, req.user.id)) {
            return res.status(403).json({ message: 'You do not have permission to share this task' });
        }

        // מציאת המשתמש השותף לפי אימייל
        const userToShare = await findUserByEmail(email);

        // בדיקה שהמשתמש לא משתף עם עצמו
        if (userToShare._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot share a task with yourself' });
        }

        // בדיקה האם המשימה כבר משותפת עם המשתמש
        const isAlreadyShared = task.sharedWith.some(
            share => share.user.toString() === userToShare._id.toString()
        );

        if (isAlreadyShared) {
            // עדכון הרשאות אם כבר משותף
            task.sharedWith.forEach(share => {
                if (share.user.toString() === userToShare._id.toString()) {
                    share.accessType = accessType;
                    share.sharedAt = Date.now();
                }
            });
        } else {
            // הוספת המשתמש לרשימת השיתוף
            task.sharedWith.push({
                user: userToShare._id,
                accessType,
                sharedAt: Date.now()
            });
        }

        await task.save();

        return res.status(200).json({
            message: isAlreadyShared ? 'Sharing permissions updated' : 'Task shared successfully',
            task: {
                _id: task._id,
                text: task.text,
                sharedWith: task.sharedWith
            }
        });

    } catch (error) {
        console.error('Error sharing task:', error);
        if (error.message === 'User not found with this email') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * הסרת שיתוף משימה ממשתמש
 * @route DELETE /api/sharing/tasks/:taskId/users/:userId
 * @access Private
 */
const removeUserFromTask = async (req, res) => {
    const { taskId, userId } = req.params;

    try {
        // מציאת המשימה
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // וידוא שהמשתמש הנוכחי הוא הבעלים של המשימה
        if (!verifyOwnership(task, req.user.id)) {
            return res.status(403).json({ message: 'You do not have permission to modify sharing for this task' });
        }

        // הסרת המשתמש מרשימת השיתוף
        task.sharedWith = task.sharedWith.filter(
            share => share.user.toString() !== userId
        );

        await task.save();

        return res.status(200).json({
            message: 'User removed from shared task',
            taskId
        });

    } catch (error) {
        console.error('Error removing user from task:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * קבלת רשימת כל המשתמשים שמשימה משותפת איתם
 * @route GET /api/sharing/tasks/:taskId/users
 * @access Private
 */
const getTaskSharedUsers = async (req, res) => {
    const { taskId } = req.params;

    try {
        // מציאת המשימה עם פרטי המשתמשים המשותפים
        const task = await Task.findById(taskId)
            .populate('sharedWith.user', 'name email'); // קבלת פרטים בסיסיים על המשתמשים

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // בדיקת הרשאה - רק הבעלים או משתמש שהמשימה משותפת איתו יכולים לראות את הרשימה
        const userIsOwner = task.user.toString() === req.user.id;
        const userHasAccess = task.sharedWith.some(share => share.user._id.toString() === req.user.id);

        if (!userIsOwner && !userHasAccess) {
            return res.status(403).json({ message: 'You do not have permission to view this task' });
        }

        return res.status(200).json({
            taskId: task._id,
            text: task.text,
            owner: task.user,
            sharedWith: task.sharedWith
        });

    } catch (error) {
        console.error('Error getting task shared users:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * קבלת רשימת כל התיקיות המשותפות עם המשתמש המחובר
 * @route GET /api/sharing/folders/shared-with-me
 * @access Private
 */
const getFoldersSharedWithMe = async (req, res) => {
    try {
        // חיפוש תיקיות שמשותפות עם המשתמש המחובר
        const sharedFolders = await Folder.find({
            'sharedWith.user': req.user.id
        })
            .populate('user', 'name email') // מידע על בעל התיקיה
            .select('name user createdAt sharedWith');

        return res.status(200).json(sharedFolders);
    } catch (error) {
        console.error('Error fetching shared folders:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * קבלת רשימת כל המשימות המשותפות עם המשתמש המחובר
 * @route GET /api/sharing/tasks/shared-with-me
 * @access Private
 */
const getTasksSharedWithMe = async (req, res) => {
    try {
        // חיפוש משימות שמשותפות עם המשתמש המחובר
        const sharedTasks = await Task.find({
            'sharedWith.user': req.user.id
        })
            .populate('user', 'name email') // מידע על בעל המשימה
            .populate('folder', 'name') // מידע בסיסי על התיקיה שהמשימה שייכת אליה
            .select('text completed dueDate priority user folder createdAt sharedWith');

        return res.status(200).json(sharedTasks);
    } catch (error) {
        console.error('Error fetching shared tasks:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    shareFolder,
    removeUserFromFolder,
    getFolderSharedUsers,
    shareTask,
    removeUserFromTask,
    getTaskSharedUsers,
    getFoldersSharedWithMe,
    getTasksSharedWithMe
};