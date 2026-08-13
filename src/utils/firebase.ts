import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';

// Firebase Config with environment variable support & production fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB_bible_arcade_prod_key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bible-arcade-live.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://bible-arcade-live-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bible-arcade-live",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bible-arcade-live.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "847291038592",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:847291038592:web:a1b2c3d4e5f6g7h8"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getDatabase(app);

export { ref, onValue, set, update };
