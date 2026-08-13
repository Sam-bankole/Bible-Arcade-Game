import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';

// Firebase Config initialized with your official Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD18asUfskCkrgxhEnqgf6VYTI3jbe7MAs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bible-arcade-game.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://bible-arcade-game-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bible-arcade-game",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bible-arcade-game.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "631092012264",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:631092012264:web:37d4a1e59683eeccbfd55d"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getDatabase(app);

export { ref, onValue, set, update };
