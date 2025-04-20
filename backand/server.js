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

// הגדרות CORS מפורטות - מתוקן עבור Render ו-GitHub Pages
const corsOptions = {
    origin: 'https://mmmtweb2.github.io',
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
app.use('/api/folders', folderRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:taskId/subtasks', subtaskRoutes);
app.use('/api/sharing', sharingRoutes);

// הגדרת הפורט שהשרת יאזין לו
const PORT = process.env.PORT || 5000;

// הפעלת השרת והאזנה לפורט שהוגדר
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});