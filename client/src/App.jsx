import { useState, useEffect } from 'react';
import './App.css';
import FolderList from './components/FolderList';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/loginPage.jsx'; // מומלץ להוסיף סיומת
import RegisterPage from './pages/RegisterPage.jsx'; // מומלץ להוסיף סיומת
import apiService from './services/apiService'; // ייבוא שירות ה-API

function App() {
  // --- שימוש ב-AuthContext ---
  const { user, loading, logout } = useAuth();
  // ---------------------------

  // --- State ---
  const [folders, setFolders] = useState([]); // מתחיל ריק - נטען מה-API
  const [tasks, setTasks] = useState([]); // מתחיל ריק - נטען מה-API
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sortBy, setSortBy] = useState('default');
  const [sortOrder, setSortOrder] = useState('asc');
  const [authView, setAuthView] = useState('login');
  // אפשר להוסיף state נפרד לטעינת משימות אם רוצים חיווי ספציפי
  // const [tasksLoading, setTasksLoading] = useState(false);

  // --- טעינת תיקיות ראשונית ---
  useEffect(() => {
    const loadFolders = async () => {
      if (!user) return; // טען רק אם יש משתמש
      try {
        console.log("Attempting to fetch folders...");
        const fetchedFolders = await apiService.getFolders();
        console.log("Fetched folders:", fetchedFolders);
        setFolders(fetchedFolders || []);
      } catch (error) {
        console.error("Failed to fetch folders:", error);
        setFolders([]); // איפוס במקרה שגיאה
        // טיפול אפשרי בשגיאת 401 (טוקן לא תקין)
        // if (error.message.includes('401') || error.response?.status === 401) { logout(); }
      }
    };
    loadFolders();
  }, [user]); // תלות ב-user

  // --- טעינת משימות בעת בחירת תיקיה ---
  useEffect(() => {
    const loadTasks = async () => {
      if (!selectedFolderId || !user) {
        setTasks([]);
        return;
      }
      // setTasksLoading(true); // התחלת טעינה ספציפית
      try {
        console.log(`Fetching tasks for folder: ${selectedFolderId}`);
        const fetchedTasks = await apiService.getTasks(selectedFolderId);
        console.log("Fetched tasks:", fetchedTasks);
        // MongoDB מחזיר _id, נוודא שה-state משתמש בו
        // אם הקומפוננטות מצפות ל-id, נצטרך למפות או לשנות שם
        // כרגע נשאיר _id, ונצטרך להתאים קומפוננטות אם צריך
        setTasks(fetchedTasks || []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]);
      } finally {
        // setTasksLoading(false); // סיום טעינה ספציפית
      }
    };
    loadTasks();
  }, [selectedFolderId, user]); // תלוי גם ב-user וגם בתיקיה

  // --- פונקציות ניהול תיקיות (addFolder מחובר ל-API) ---
  const addFolder = async (folderName) => {
    if (!folderName.trim()) return;
    try {
      const newFolderFromServer = await apiService.createFolder({ name: folderName.trim() });
      setFolders(prevFolders => [...prevFolders, newFolderFromServer]);
    } catch (error) {
      console.error("Failed to create folder:", error);
      alert(`שגיאה ביצירת תיקיה: ${error.message}`);
    }
  };
  const selectFolder = (folderId) => { setSelectedFolderId(folderId); setCurrentView('folder'); };
  const showDashboard = () => { setSelectedFolderId(null); setCurrentView('dashboard'); };


  // --- פונקציות ניהול משימות (מחוברות ל-API) ---
  const addTask = async (taskText, dueDate, priority) => {
    if (!taskText.trim() || !selectedFolderId) return;
    const taskData = {
      text: taskText.trim(),
      folderId: selectedFolderId,
      dueDate: dueDate || null,
      priority: priority || 'Medium'
    };
    try {
      const newTaskFromServer = await apiService.createTask(taskData);
      // הוספת המשימה החדשה שחזרה מהשרת (עם _id) ל-state
      setTasks(prevTasks => [...prevTasks, newTaskFromServer]);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert(`שגיאה ביצירת משימה: ${error.message}`);
    }
  };

  const toggleComplete = async (taskId) => {
    const taskToToggle = tasks.find(task => task._id === taskId); // שימוש ב-_id
    if (!taskToToggle) return;
    const updateData = { completed: !taskToToggle.completed };
    try {
      // שים לב: ה-API מחזיר את המשימה המעודכנת במלואה
      const updatedTask = await apiService.updateTask(taskId, updateData);
      // החלפת המשימה הישנה בחדשה במערך
      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Failed to toggle task complete:", error);
      alert(`שגיאה בעדכון סטטוס משימה: ${error.message}`);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await apiService.deleteTask(taskId); // קריאה ל-API למחיקה
      // הסרת המשימה מה-state רק לאחר הצלחה
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId)); // שימוש ב-_id
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert(`שגיאה במחיקת משימה: ${error.message}`);
    }
  };

  const editTask = async (taskId, newText) => {
    const updateData = { text: newText };
    try {
      const updatedTask = await apiService.updateTask(taskId, updateData);
      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? updatedTask : task // שימוש ב-_id
      ));
    } catch (error) {
      console.error("Failed to edit task text:", error);
      alert(`שגיאה בעריכת משימה: ${error.message}`);
    }
  };

  const setTaskDueDate = async (taskId, dueDate) => {
    const updateData = { dueDate: dueDate || null };
    try {
      const updatedTask = await apiService.updateTask(taskId, updateData);
      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? updatedTask : task // שימוש ב-_id
      ));
    } catch (error) {
      console.error("Failed to set due date:", error);
      alert(`שגיאה בעדכון תאריך יעד: ${error.message}`);
    }
  };

  const setTaskPriority = async (taskId, priority) => {
    const updateData = { priority: priority };
    try {
      const updatedTask = await apiService.updateTask(taskId, updateData);
      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? updatedTask : task // שימוש ב-_id
      ));
    } catch (error) {
      console.error("Failed to set priority:", error);
      alert(`שגיאה בעדכון עדיפות: ${error.message}`);
    }
  };

  // --- פונקציות תתי-משימות (עדיין מקומיות!) ---
  // הערה: הפונקציות הבאות עדיין פועלות רק על ה-state המקומי.
  // נצטרך ליצור API ייעודי לתתי-משימות ולחבר אותן בהמשך.
  const addSubtask = (parentId, subtaskText) => { /* ... לוגיקה קיימת ... */ };
  const toggleSubtaskComplete = (parentId, subtaskId) => { /* ... לוגיקה קיימת ... */ };
  const deleteSubtask = (parentId, subtaskId) => { /* ... לוגיקה קיימת ... */ };
  const editSubtask = (parentId, subtaskId, newText) => { /* ... לוגיקה קיימת ... */ };
  // -------------------------------------------


  // --- פונקציות מיון (ללא שינוי) ---
  const priorityMap = { High: 3, Medium: 2, Low: 1 };
  const getSortedTasks = (tasksToSort) => { /* ... ללא שינוי ... */ };
  const handleSortChange = (newSortBy) => { /* ... ללא שינוי ... */ };
  // --- סוף פונקציות מיון ---


  // --- חישובים לפני רינדור (ללא שינוי) ---
  const filteredTasks = selectedFolderId ? tasks.filter(task => task.folder === selectedFolderId) : []; // שינוי קל ל-task.folder
  const sortedAndFilteredTasks = getSortedTasks(filteredTasks);
  const selectedFolderName = selectedFolderId ? folders.find(f => f._id === selectedFolderId)?.name : null; // שינוי ל-f._id

  // --- רינדור ---
  if (loading && !user) { // הצג טעינה רק אם אין משתמש ועדיין טוען (בדיקה ראשונית)
    return <div className="loading-container"><p>טוען...</p></div>;
  }

  return (
    <>
      {user ? (
        <div className="app-layout">
          <FolderList
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={selectFolder}
            onAddFolder={addFolder}
            onShowDashboard={showDashboard}
            onLogout={logout}
          />
          <div className="main-content">
            {currentView === 'dashboard' ? (
              <Dashboard tasks={tasks} />
            ) : currentView === 'folder' && selectedFolderId ? (
              <>
                <h1>{selectedFolderName || 'טוען תיקיה...'}</h1>
                <AddTaskForm onAddTask={addTask} />
                <div className="sort-controls">
                  <span>מיין לפי:</span>
                  <button onClick={() => handleSortChange('default')} className={sortBy === 'default' ? 'active' : ''}>ברירת מחדל</button>
                  <button onClick={() => handleSortChange('dueDate')} className={sortBy === 'dueDate' ? 'active' : ''}>תאריך יעד {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}</button>
                  <button onClick={() => handleSortChange('priority')} className={sortBy === 'priority' ? 'active' : ''}>עדיפות {sortBy === 'priority' && (sortOrder === 'desc' ? '↓' : '↑')}</button>
                </div>
                {/* כאן אפשר להוסיף חיווי טעינה אם tasksLoading הוא true */}
                <TaskList
                  tasks={sortedAndFilteredTasks}
                  onToggleComplete={toggleComplete}
                  onDeleteTask={deleteTask}
                  onEditTask={editTask}
                  onAddSubtask={addSubtask}
                  onToggleSubtaskComplete={toggleSubtaskComplete}
                  onDeleteSubtask={deleteSubtask}
                  onEditSubtask={editSubtask}
                  onSetTaskDueDate={setTaskDueDate}
                  onSetTaskPriority={setTaskPriority}
                />
              </>
            ) : (
              <p>אנא בחר תיקיה או עבור לדשבורד.</p>
            )}
          </div>
        </div>
      ) : (
        authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )
      )}
    </>
  );
}


// --- שכפול פונקציות המיון שהושמטו למען הקיצור ---
// (ודא שהפונקציות המלאות נמצאות בקוד שלך למעלה)
// const getSortedTasks = (tasksToSort) => { ... };
// const handleSortChange = (newSortBy) => { ... };
// --- סוף שכפול ---

// --- שכפול פונקציות תתי-משימות שהושמטו למען הקיצור ---
// (ודא שהפונקציות המלאות נמצאות בקוד שלך למעלה)
// const addSubtask = (parentId, subtaskText) => { ... };
// const toggleSubtaskComplete = (parentId, subtaskId) => { ... };
// const deleteSubtask = (parentId, subtaskId) => { ... };
// const editSubtask = (parentId, subtaskId, newText) => { ... };
// --- סוף שכפול ---


export default App;