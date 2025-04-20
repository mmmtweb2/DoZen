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
        // בדיקה האם התיקיה קיימת
        const folder = await Folder.findById(folderId);

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // בדיקת הרשאות גישה לתיקיה
        const isOwner = folder.user.toString() === req.user.id;
        const isSharedWithUser = folder.sharedWith?.some(
            share => share.user.toString() === req.user.id
        );

        // אם המשתמש אינו הבעלים ואינו ברשימת השיתוף - אין גישה
        if (!isOwner && !isSharedWithUser) {
            return res.status(403).json({ message: 'Not authorized to access this folder' });
        }

        // מציאת כל המשימות השייכות לתיקיה
        const tasks = await Task.find({ folder: folderId });

        // הוספת מידע על בעלות והרשאות לכל משימה
        const tasksWithPermissions = tasks.map(task => {
            const taskObj = task.toObject();

            // בדיקה האם המשתמש הוא הבעלים של המשימה
            const isTaskOwner = task.user.toString() === req.user.id;

            // בדיקה האם המשימה משותפת ישירות עם המשתמש
            const taskSharing = task.sharedWith?.find(
                share => share.user.toString() === req.user.id
            );

            // מציאת הרשאות המשתמש למשימה
            let accessType = 'none';

            if (isTaskOwner) {
                // בעלים יש לו הרשאת עריכה מלאה
                accessType = 'edit';
            } else if (taskSharing) {
                // אם המשימה משותפת ישירות, קח את ההרשאה מהשיתוף
                accessType = taskSharing.accessType;
            } else if (isSharedWithUser) {
                // אם התיקיה משותפת, קח את ההרשאה מהשיתוף של התיקיה
                const folderSharing = folder.sharedWith.find(
                    share => share.user.toString() === req.user.id
                );
                accessType = folderSharing?.accessType || 'view';
            }

            return {
                ...taskObj,
                isOwner: isTaskOwner,
                accessType
            };
        });

        res.status(200).json(tasksWithPermissions);
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
        // בדיקה האם התיקיה קיימת
        const folder = await Folder.findById(folderId);

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // בדיקת הרשאות ליצירת משימה בתיקיה
        const isOwner = folder.user.toString() === req.user.id;

        // אם המשתמש אינו הבעלים, בדוק אם יש לו הרשאת עריכה לתיקיה
        if (!isOwner) {
            const sharedAccess = folder.sharedWith.find(
                share => share.user.toString() === req.user.id
            );

            if (!sharedAccess || sharedAccess.accessType !== 'edit') {
                return res.status(403).json({
                    message: 'You do not have permission to create tasks in this folder'
                });
            }
        }

        // יצירת המשימה החדשה
        const task = await Task.create({
            text: text.trim(),
            dueDate: dueDate || null,
            priority: priority || 'Medium',
            folder: folderId,
            user: req.user.id, // המשתמש היוצר הוא תמיד הבעלים של המשימה
            subtasks: [],
            sharedWith: [] // אתחול מערך השיתוף כריק
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
        // מציאת המשימה
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // בדיקת הרשאות עריכה למשימה
        const isOwner = task.user.toString() === req.user.id;

        // בדיקה אם המשימה משותפת ישירות עם המשתמש
        const taskSharing = task.sharedWith.find(
            share => share.user.toString() === req.user.id
        );

        let hasEditPermission = isOwner;

        // אם המשימה משותפת ישירות, בדוק הרשאות
        if (taskSharing && taskSharing.accessType === 'edit') {
            hasEditPermission = true;
        }
        // אם לא, בדוק אם התיקיה משותפת עם הרשאות עריכה
        else if (!isOwner && !taskSharing) {
            const folder = await Folder.findById(task.folder);
            const folderSharing = folder?.sharedWith.find(
                share => share.user.toString() === req.user.id
            );

            if (folderSharing && folderSharing.accessType === 'edit') {
                hasEditPermission = true;
            }
        }

        if (!hasEditPermission) {
            return res.status(403).json({ message: 'You do not have permission to edit this task' });
        }

        // עדכון המשימה
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(updatedTask);
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
        // מציאת המשימה
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // רק הבעלים יכול למחוק משימה
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the owner can delete a task' });
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