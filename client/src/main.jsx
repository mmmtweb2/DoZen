import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// --- 1. ייבוא ה-AuthProvider ---
import { AuthProvider } from './context/authContext.jsx';


// יצירת שורש ה-DOM
const root = createRoot(document.getElementById('root'));

// רינדור האפליקציה
root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);