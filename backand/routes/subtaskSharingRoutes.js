const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { User, Task, SharedAccess } = require('../models');
const Subtask = require('../models/Subtask');
const { sendShareInvitation } = require('../services/emailService');
const ShareLink = require('../models/ShareLink');
const crypto = require('crypto');

// שיתוף תת משימה
router.post('/:subtaskId', protect, async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const { email, accessType } = req.body;
        const ownerId = req.user._id;

        // בדיקה שהתת משימה קיימת ושייכת למשתמש
        const task = await Task.findOne({
            'subtasks._id': subtaskId,
            user: ownerId
        });

        if (!task) {
            return res.status(404).json({ error: 'תת משימה לא נמצאה' });
        }

        // מציאת המשתמש לשיתוף
        const userToShare = await User.findOne({ email });
        if (!userToShare) {
            return res.status(404).json({ error: 'משתמש לא נמצא' });
        }

        // בדיקה שהמשתמש לא הבעלים
        if (userToShare._id.toString() === ownerId) {
            return res.status(400).json({ error: 'לא ניתן לשתף עם עצמך' });
        }

        // יצירת שיתוף חדש
        await SharedAccess.create({
            itemId: subtaskId,
            itemType: 'subtask',
            userId: userToShare._id,
            accessType
        });

        res.json({ message: 'תת משימה שותפה בהצלחה' });
    } catch (error) {
        console.error('Error sharing subtask:', error);
        res.status(500).json({ error: 'שגיאה בשיתוף תת משימה' });
    }
});

// הסרת שיתוף תת משימה
router.delete('/:subtaskId/users/:userId', protect, async (req, res) => {
    try {
        const { subtaskId, userId } = req.params;
        const ownerId = req.user._id;

        // בדיקה שהתת משימה קיימת ושייכת למשתמש
        const task = await Task.findOne({
            'subtasks._id': subtaskId,
            user: ownerId
        });

        if (!task) {
            return res.status(404).json({ error: 'תת משימה לא נמצאה' });
        }

        // הסרת השיתוף
        await SharedAccess.deleteOne({
            itemId: subtaskId,
            itemType: 'subtask',
            userId
        });

        res.json({ message: 'שיתוף הוסר בהצלחה' });
    } catch (error) {
        console.error('Error removing subtask share:', error);
        res.status(500).json({ error: 'שגיאה בהסרת השיתוף' });
    }
});

// קבלת רשימת המשתמשים המשותפים של תת משימה
router.get('/:subtaskId/users', protect, async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const ownerId = req.user._id;

        // בדיקה שהתת משימה קיימת ושייכת למשתמש
        const task = await Task.findOne({
            'subtasks._id': subtaskId,
            user: ownerId
        });

        if (!task) {
            return res.status(404).json({ error: 'תת משימה לא נמצאה' });
        }

        // קבלת רשימת המשתמשים המשותפים
        const sharedUsers = await SharedAccess.find({
            itemId: subtaskId,
            itemType: 'subtask'
        }).populate('userId', 'email name');

        res.json({
            sharedWith: sharedUsers.map(share => ({
                id: share.userId._id,
                email: share.userId.email,
                name: share.userId.name,
                accessType: share.accessType
            }))
        });
    } catch (error) {
        console.error('Error getting subtask shared users:', error);
        res.status(500).json({ error: 'שגיאה בקבלת רשימת המשתמשים המשותפים' });
    }
});

router.post('/:subtaskId/share', protect, async (req, res) => {
    try {
        const subtask = await Subtask.findById(req.params.subtaskId);
        if (!subtask) {
            return res.status(404).json({ message: 'תת משימה לא נמצאה' });
        }

        // בדיקה שהמשתמש הוא הבעלים של המשימה
        if (subtask.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'אין לך הרשאה לשתף משימה זו' });
        }

        const { email, accessType } = req.body;
        const userToShare = await User.findOne({ email });
        if (!userToShare) {
            return res.status(404).json({ message: 'משתמש לא נמצא' });
        }

        // שליחת מייל הזמנה
        await sendShareInvitation(
            email,
            req.user.name,
            subtask.text,
            'תת משימה',
            accessType
        );

        // הוספת המשתמש לרשימת השיתוף
        subtask.sharedWith.push({
            user: userToShare._id,
            accessType,
            sharedAt: new Date()
        });

        await subtask.save();
        res.json({ message: 'השיתוף בוצע בהצלחה' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// פונקציית עזר ליצירת טוקן ייחודי
const generateUniqueToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// יצירת קישור שיתוף חדש
router.post('/:subtaskId/generate-link', protect, async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const { accessType = 'view' } = req.body;

        // בדיקה שהתת משימה קיימת ושייכת למשתמש
        const task = await Task.findOne({
            'subtasks._id': subtaskId,
            user: req.user._id
        });

        if (!task) {
            return res.status(404).json({ error: 'תת משימה לא נמצאה' });
        }

        // יצירת קישור שיתוף חדש
        const token = generateUniqueToken();
        const shareLink = await ShareLink.create({
            token,
            itemId: subtaskId,
            itemType: 'subtask',
            createdBy: req.user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ימים
            accessType
        });

        // יצירת הקישור המלא
        const link = `${process.env.FRONTEND_URL}/share/subtask/${subtaskId}?token=${token}`;

        res.json({
            message: 'קישור שיתוף נוצר בהצלחה',
            link,
            expiresAt: shareLink.expiresAt
        });
    } catch (error) {
        console.error('Error generating share link:', error);
        res.status(500).json({ error: 'שגיאה ביצירת קישור שיתוף' });
    }
});

// בדיקת קישור שיתוף
router.get('/verify-link/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const shareLink = await ShareLink.findOne({ token });

        if (!shareLink) {
            return res.status(404).json({ error: 'קישור לא תקין' });
        }

        if (shareLink.used) {
            return res.status(400).json({ error: 'קישור זה כבר שימש בעבר' });
        }

        if (new Date() > shareLink.expiresAt) {
            return res.status(400).json({ error: 'קישור פג תוקף' });
        }

        // החזרת פרטי השיתוף
        res.json({
            itemId: shareLink.itemId,
            itemType: shareLink.itemType,
            accessType: shareLink.accessType,
            createdBy: shareLink.createdBy
        });
    } catch (error) {
        console.error('Error verifying share link:', error);
        res.status(500).json({ error: 'שגיאה בבדיקת קישור' });
    }
});

// שימוש בקישור שיתוף
router.post('/use-link/:token', protect, async (req, res) => {
    try {
        const { token } = req.params;
        const shareLink = await ShareLink.findOne({ token });

        if (!shareLink) {
            return res.status(404).json({ error: 'קישור לא תקין' });
        }

        if (shareLink.used) {
            return res.status(400).json({ error: 'קישור זה כבר שימש בעבר' });
        }

        if (new Date() > shareLink.expiresAt) {
            return res.status(400).json({ error: 'קישור פג תוקף' });
        }

        // סימון הקישור כמשומש
        shareLink.used = true;
        await shareLink.save();

        // הוספת המשתמש לרשימת השיתוף
        const task = await Task.findOne({ 'subtasks._id': shareLink.itemId });
        if (!task) {
            return res.status(404).json({ error: 'תת משימה לא נמצאה' });
        }

        const subtask = task.subtasks.id(shareLink.itemId);
        if (!subtask) {
            return res.status(404).json({ error: 'תת משימה לא נמצאה' });
        }

        // הוספת המשתמש לרשימת השיתוף
        subtask.sharedWith.push({
            user: req.user._id,
            accessType: shareLink.accessType,
            sharedAt: new Date()
        });

        await task.save();

        res.json({
            message: 'שיתוף הופעל בהצלחה',
            itemId: shareLink.itemId,
            accessType: shareLink.accessType
        });
    } catch (error) {
        console.error('Error using share link:', error);
        res.status(500).json({ error: 'שגיאה בהפעלת קישור השיתוף' });
    }
});

module.exports = router; 