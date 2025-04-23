// --- backand/controllers/sharingController.js ---
/**
 * בקר לניהול פעולות שיתוף של תיקיות ומשימות
 * מאפשר הוספה, עדכון והסרה של משתמשים משותפים
 */
const User = require('../models/User');
const Folder = require('../models/Folder');
const Task = require('../models/Task');
const mongoose = require('mongoose');
const ShareLink = require('../models/ShareLink');

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

// --- בקרים לשיתוף באמצעות קישורים ---

/**
 * יצירת קישור שיתוף לפריט
 * @route POST /api/sharing/:itemType/:itemId/generate-link
 * @access Private
 */
const generateShareLink = async (req, res) => {
    const { itemType, itemId } = req.params;
    const { accessType = 'view' } = req.body;
    const userId = req.user._id;

    try {
        let item;
        if (itemType === 'folder') {
            item = await Folder.findById(itemId);
        } else if (itemType === 'task') {
            item = await Task.findById(itemId);
        } else {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (!verifyOwnership(item, userId)) {
            return res.status(403).json({ message: 'Not authorized to share this item' });
        }

        // יצירת טוקן ייחודי
        const token = new mongoose.Types.ObjectId().toString();

        // שמירת פרטי השיתוף
        const shareInfo = {
            token,
            itemType,
            itemId,
            accessType,
            createdBy: userId,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ימים
            used: false
        };

        // שמירה במסד הנתונים
        await ShareLink.create(shareInfo);

        // יצירת הקישור המלא
        const shareLink = `${process.env.FRONTEND_URL}/share/${token}`;

        res.status(200).json({
            success: true,
            shareLink,
            expiresAt: shareInfo.expiresAt
        });
    } catch (error) {
        console.error('Error generating share link:', error);
        res.status(500).json({ message: 'Error generating share link' });
    }
};

/**
 * אימות קישור שיתוף
 * @route GET /api/sharing/verify-link/:token
 * @access Public
 */
const verifyShareLink = async (req, res) => {
    const { token } = req.params;

    try {
        const shareInfo = await ShareLink.findOne({ token });

        if (!shareInfo) {
            return res.status(404).json({ message: 'Share link not found' });
        }

        if (shareInfo.used) {
            return res.status(400).json({ message: 'Share link has already been used' });
        }

        if (new Date() > shareInfo.expiresAt) {
            return res.status(400).json({ message: 'Share link has expired' });
        }

        res.status(200).json({
            success: true,
            itemType: shareInfo.itemType,
            accessType: shareInfo.accessType
        });
    } catch (error) {
        console.error('Error verifying share link:', error);
        res.status(500).json({ message: 'Error verifying share link' });
    }
};

/**
 * שימוש בקישור שיתוף
 * @route POST /api/sharing/use-link/:token
 * @access Private
 */
const useShareLink = async (req, res) => {
    const { token } = req.params;
    const userId = req.user._id;

    try {
        const shareInfo = await ShareLink.findOne({ token });

        if (!shareInfo) {
            return res.status(404).json({ message: 'Share link not found' });
        }

        if (shareInfo.used) {
            return res.status(400).json({ message: 'Share link has already been used' });
        }

        if (new Date() > shareInfo.expiresAt) {
            return res.status(400).json({ message: 'Share link has expired' });
        }

        // סימון הקישור כמשומש
        shareInfo.used = true;
        shareInfo.usedBy = userId;
        shareInfo.usedAt = new Date();
        await shareInfo.save();

        // הוספת המשתמש לרשימת המשתמשים המשותפים
        if (shareInfo.itemType === 'folder') {
            const folder = await Folder.findById(shareInfo.itemId);
            if (!folder.sharedWith.includes(userId)) {
                folder.sharedWith.push(userId);
                await folder.save();
            }
        } else if (shareInfo.itemType === 'task') {
            const task = await Task.findById(shareInfo.itemId);
            if (!task.sharedWith.includes(userId)) {
                task.sharedWith.push(userId);
                await task.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Share link used successfully'
        });
    } catch (error) {
        console.error('Error using share link:', error);
        res.status(500).json({ message: 'Error using share link' });
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
    getTasksSharedWithMe,
    generateShareLink,
    verifyShareLink,
    useShareLink
};