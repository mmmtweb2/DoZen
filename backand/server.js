// טעינת משתני סביבה מקובץ .env לתהליך
require('dotenv').config();

// ייבוא הספריות הנדרשות
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // <-- ייבוא Mongoose
const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');
const taskRoutes = require('./routes/taskRoutes');

// --- פונקציית חיבור אסינכרונית ל-MongoDB ---
const connectDB = async () => {
    try {
        // קריאה למחרוזת החיבור ממשתני הסביבה
        const conn = await mongoose.connect(process.env.MONGO_URI, {

        });
        console.log(`MongoDB Connected: ${conn.connection.host}`); // הדפסת אישור חיבור
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`); // הדפסת שגיאה אם החיבור נכשל
        process.exit(1); // יציאה מהתהליך במקרה של כשל בחיבור
    }
};
// -----------------------------------------

// --- קריאה לפונקציית החיבור ---
connectDB(); // מפעילים את החיבור למסד הנתונים
// -----------------------------

// יצירת אפליקציית Express
const app = express();

// הגדרת middlewares בסיסיים
app.use(cors());
app.use(express.json());

// נתיב בדיקה בסיסי
app.get('/', (req, res) => {
    res.send('Server is running successfully!');
});

// ... app.use(cors()); app.use(express.json()); ...
app.get('/', (req, res) => { /* ... */ }); // נתיב בדיקה

// --- חיבור נתיבי האימות ---
app.use('/api/auth', authRoutes);

app.use('/api/folders', folderRoutes);

app.use('/api/tasks', taskRoutes);

// הגדרת הפורט שהשרת יאזין לו
const PORT = process.env.PORT || 5000;

// הפעלת השרת והאזנה לפורט שהוגדר
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});