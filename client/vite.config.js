import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // או הפלאגין המתאים לפרויקט שלך

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // או הפלאגין המתאים לפרויקט שלך
  base: '/DoZen/' // <-- הוסף או עדכן את השורה הזו
})