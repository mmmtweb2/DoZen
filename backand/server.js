// טעינת משתני סביבה מקובץ .env לתהליך
require('dotenv').config();

// ייבוא הספריות הנדרשות
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');
const taskRoutes = require('./routes/taskRoutes');
const subtaskRoutes = require('./routes/subtasksRoutes');
const sharingRoutes = require('./routes/sharingRoutes');
const { protect } = require('./middleware/authMiddleware');

// הגדרות CORS מפורטות - מתוקן עבור Render ו-GitHub Pages
const corsOptions = {
    origin: ['https://mmmtweb2.github.io', 'http://localhost:5173', 'https://dozen-backend.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 // מומלץ להוסיף
};

// --- פונקציית חיבור אסינכרונית ל-MongoDB ---
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // יציאה מהתהליך במקרה של כשל בחיבור
    }
};

// קריאה לפונקציית החיבור
connectDB();

// יצירת אפליקציית Express
const app = express();

// הגדרת middlewares בסיסיים
app.use(cors(corsOptions)); // שימוש בהגדרות CORS המעודכנות
app.use(express.json());

// נתיב בדיקה בסיסי
app.get('/', (req, res) => {
    res.send('Server is running successfully!');
});

// חיבור נתיבי ה-API
app.use('/api/auth', authRoutes);
app.use('/api/folders', protect, folderRoutes);
app.use('/api/tasks', protect, taskRoutes);
app.use('/api/subtasks', protect, subtaskRoutes);
app.use('/api/sharing', protect, sharingRoutes);

// שיתוף תת משימה
app.post('/api/sharing/subtasks/:subtaskId', protect, async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const { email, accessType } = req.body;
        const ownerId = req.user.id; // שינוי משתנה להתאמה למידלוור

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
app.delete('/api/sharing/subtasks/:subtaskId/users/:userId', protect, async (req, res) => {
    try {
        const { subtaskId, userId } = req.params;
        const ownerId = req.user.id; // שינוי משתנה להתאמה למידלוור

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
app.get('/api/sharing/subtasks/:subtaskId/users', protect, async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const ownerId = req.user.id; // שינוי משתנה להתאמה למידלוור

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

// יצירת קישור שיתוף
const generateShareLink = (itemId, itemType) => {
    const token = generateUniqueToken(); // טוקן ייחודי
    return `${FRONTEND_URL}/share/${itemType}/${itemId}?token=${token}`;
};

// בדיקת קישור שיתוף
const verifyShareLink = async (token) => {
    const share = await ShareLink.findOne({ token });
    if (!share || share.expired) {
        throw new Error('קישור לא תקין או שפג תוקפו');
    }
    return share;
};

// מודל לקישור שיתוף
const shareLinkSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    itemId: { type: String, required: true },
    itemType: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiresAt: { type: Date, required: true },
    accessType: { type: String, enum: ['view', 'edit'], default: 'view' },
    used: { type: Boolean, default: false }
});

// נתיב חדש בשרת
app.post('/generate-link', protect, async (req, res) => {
    const { itemId, itemType, accessType } = req.body;
    const token = generateUniqueToken();
    const shareLink = await ShareLink.create({
        token,
        itemId,
        itemType,
        createdBy: req.user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ימים
        accessType
    });
    res.json({ link: generateShareLink(itemId, itemType, token) });
});

// הגדרת הפורט שהשרת יאזין לו
const PORT = process.env.PORT || 5000;

// הפעלת השרת והאזנה לפורט שהוגדר
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});