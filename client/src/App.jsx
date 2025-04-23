import { useState, useEffect } from 'react';
import './App.css';
import './components/sharing/SharingStyles.css';
import FolderList from './components/FolderList';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import apiService from './services/apiService';
import SharedItemsView from './components/sharing/SharedItemsView';
import ShareLinkView from './components/sharing/ShareLinkView';


function App() {
  // Auth context
  const { user, loading, logout } = useAuth();

  // State
  const [folders, setFolders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sortBy, setSortBy] = useState('default');
  const [sortOrder, setSortOrder] = useState('asc');
  const [authView, setAuthView] = useState('login');
  const [showSharedItems, setShowSharedItems] = useState(false);

  // Load folders when user is authenticated
  useEffect(() => {
    const loadFolders = async () => {
      if (!user) return;
      try {
        const fetchedFolders = await apiService.getFolders();
        setFolders(fetchedFolders || []);
      } catch (error) {
        console.error("Failed to fetch folders:", error);
        setFolders([]);
      }
    };

    loadFolders();
  }, [user]);

  // Load tasks when folder is selected
  useEffect(() => {
    const loadTasks = async () => {
      if (!selectedFolderId || !user) {
        setTasks([]);
        return;
      }

      try {
        const fetchedTasks = await apiService.getTasks(selectedFolderId);
        setTasks(fetchedTasks || []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]);
      }
    };

    loadTasks();
  }, [selectedFolderId, user]);

  // Folder management
  const addFolder = async (folderName) => {
    if (!folderName.trim()) return;

    try {
      const newFolder = await apiService.createFolder({ name: folderName.trim() });
      setFolders(prevFolders => [...prevFolders, newFolder]);
    } catch (error) {
      console.error("Failed to create folder:", error);
      alert(`שגיאה ביצירת תיקיה: ${error.message}`);
    }
  };

  const editFolder = async (folderId, newName) => {
    if (!newName.trim()) return;

    try {
      const updatedFolder = await apiService.updateFolder(folderId, { name: newName.trim() });
      setFolders(prevFolders => prevFolders.map(folder =>
        folder._id === folderId ? updatedFolder : folder
      ));
    } catch (error) {
      console.error("Failed to update folder:", error);
      alert(`שגיאה בעדכון תיקיה: ${error.message}`);
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      await apiService.deleteFolder(folderId);
      setFolders(prevFolders => prevFolders.filter(folder => folder._id !== folderId));

      // אם התיקיה שנמחקה הייתה נבחרת, נבחר את הדשבורד
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error("Failed to delete folder:", error);
      alert(`שגיאה במחיקת תיקיה: ${error.message}`);
    }
  };

  const selectFolder = (folderId) => {
    setSelectedFolderId(folderId);
    setCurrentView('folder');
  };

  const showDashboard = () => {
    setSelectedFolderId(null);
    setCurrentView('dashboard');
  };

  // Task management
  const addTask = async (taskText, dueDate, priority) => {
    if (!taskText.trim() || !selectedFolderId) return;

    const taskData = {
      text: taskText.trim(),
      folderId: selectedFolderId,
      dueDate: dueDate || null,
      priority: priority || 'Medium'
    };

    try {
      const newTask = await apiService.createTask(taskData);
      setTasks(prevTasks => [...prevTasks, newTask]);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert(`שגיאה ביצירת משימה: ${error.message}`);
    }
  };

  const toggleComplete = async (taskId) => {
    const taskToToggle = tasks.find(task => task._id === taskId);
    if (!taskToToggle) return;

    try {
      const updatedTask = await apiService.updateTask(taskId, {
        completed: !taskToToggle.completed
      });

      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Failed to toggle task:", error);
      alert(`שגיאה בעדכון סטטוס משימה: ${error.message}`);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await apiService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert(`שגיאה במחיקת משימה: ${error.message}`);
    }
  };

  const editTask = async (taskId, newText) => {
    try {
      const updatedTask = await apiService.updateTask(taskId, { text: newText });
      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Failed to edit task:", error);
      alert(`שגיאה בעריכת משימה: ${error.message}`);
    }
  };

  const setTaskDueDate = async (taskId, dueDate) => {
    try {
      const updatedTask = await apiService.updateTask(taskId, {
        dueDate: dueDate || null
      });

      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Failed to set due date:", error);
      alert(`שגיאה בעדכון תאריך יעד: ${error.message}`);
    }
  };

  const setTaskPriority = async (taskId, priority) => {
    try {
      const updatedTask = await apiService.updateTask(taskId, { priority });
      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Failed to set priority:", error);
      alert(`שגיאה בעדכון עדיפות: ${error.message}`);
    }
  };

  // Subtask management
  const addSubtask = async (parentId, subtaskText) => {
    if (!subtaskText.trim()) return;

    try {
      // שימוש ב-API החדש לתתי-משימות
      const updatedTask = await apiService.addSubtask(parentId, { text: subtaskText.trim() });

      setTasks(prevTasks => prevTasks.map(task =>
        task._id === parentId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Failed to add subtask:", error);
      alert(`שגיאה בהוספת תת-משימה: ${error.message}`);
    }
  };

  const toggleSubtaskComplete = async (parentId, subtaskId) => {
    const parentTask = tasks.find(task => task._id === parentId);
    if (!parentTask || !parentTask.subtasks) return;

    // מציאת תת-המשימה כדי לשנות את הסטטוס שלה
    const subtask = parentTask.subtasks.find(st => st._id === subtaskId);
    if (!subtask) return;

    try {
      // שימוש ב-API החדש לעדכון תת-משימה
      const updatedTask = await apiService.updateSubtask(
        parentId,
        subtaskId,
        { completed: !subtask.completed }
      );

      setTasks(prevTasks => prevTasks.map(task =>
        task._id === parentId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
      alert(`שגיאה בעדכון סטטוס תת-משימה: ${error.message}`);
    }
  };

  const deleteSubtask = async (parentId, subtaskId) => {
    try {
      // שימוש ב-API החדש למחיקת תת-משימה
      const updatedTask = await apiService.deleteSubtask(parentId, subtaskId);

      setTasks(prevTasks => prevTasks.map(task =>
        task._id === parentId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Failed to delete subtask:", error);
      alert(`שגיאה במחיקת תת-משימה: ${error.message}`);
    }
  };

  const editSubtask = async (parentId, subtaskId, newText) => {
    if (!newText.trim()) {
      alert("טקסט תת-המשימה לא יכול להיות ריק.");
      return;
    }

    try {
      // שימוש ב-API החדש לעדכון תת-משימה
      const updatedTask = await apiService.updateSubtask(
        parentId,
        subtaskId,
        { text: newText.trim() }
      );

      setTasks(prevTasks => prevTasks.map(task =>
        task._id === parentId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Failed to edit subtask:", error);
      alert(`שגיאה בעריכת תת-משימה: ${error.message}`);
    }
  };

  // Sorting
  const priorityMap = { High: 3, Medium: 2, Low: 1 };

  const getSortedTasks = (tasksToSort) => {
    if (sortBy === 'default') {
      return [...tasksToSort];
    }

    return [...tasksToSort].sort((a, b) => {
      if (sortBy === 'dueDate') {
        // Handle null dates
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return sortOrder === 'asc' ? 1 : -1;
        if (!b.dueDate) return sortOrder === 'asc' ? -1 : 1;

        return sortOrder === 'asc'
          ? a.dueDate.localeCompare(b.dueDate)
          : b.dueDate.localeCompare(a.dueDate);
      }

      if (sortBy === 'priority') {
        const aPriority = priorityMap[a.priority] || 2;
        const bPriority = priorityMap[b.priority] || 2;

        return sortOrder === 'asc'
          ? aPriority - bPriority
          : bPriority - aPriority;
      }

      return 0;
    });
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle order if clicking the same sort field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      // Default orders depending on field
      setSortOrder(newSortBy === 'priority' ? 'desc' : 'asc');
    }
  };

  // Derived data
  const filteredTasks = selectedFolderId
    ? tasks.filter(task => task.folder === selectedFolderId)
    : [];

  const sortedTasks = getSortedTasks(filteredTasks);

  const selectedFolderName = selectedFolderId
    ? folders.find(f => f._id === selectedFolderId)?.name
    : null;

  // Loading state
  if (loading && !user) {
    return <div className="loading-container"><p>טוען...</p></div>;
  }


  // פונקציה להצגת תצוגת פריטים משותפים
  const showSharedItemsView = () => {
    setCurrentView('shared');
    setShowSharedItems(true);
    setSelectedFolderId(null);
  };

  // פונקציה לבחירת תיקיה משותפת
  const selectSharedFolder = (folderId) => {
    setSelectedFolderId(folderId);
    setCurrentView('folder');
    setShowSharedItems(false);
  };

  const showShareLinkView = () => {
    setCurrentView('share-link');
  };

  return (
    <div className="app">
      {!user ? (
        authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )
      ) : (
        <div className="app-container">
          <FolderList
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={selectFolder}
            onAddFolder={addFolder}
            onEditFolder={editFolder}
            onDeleteFolder={deleteFolder}
            onShowDashboard={showDashboard}
            onShowSharedItems={showSharedItemsView}
            onShowShareLink={showShareLinkView}
          />
          <div className="main-content">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'folder' && (
              <>
                <AddTaskForm onAddTask={addTask} />
                <TaskList
                  tasks={getSortedTasks(tasks)}
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
            )}
            {currentView === 'shared' && <SharedItemsView onSelectFolder={selectSharedFolder} />}
            {currentView === 'share-link' && <ShareLinkView />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;