import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "mothly-exspense-tracker.appspot.com",
  messagingSenderId: "85582219756",
  appId: "1:85582219756:web:fcf2454dacc7f2b49058c9",
  measurementId: "G-CJRQK4GFJ7"
};

// Initialize Firebase with auth persistence
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = getAuth(app);

// Simplify auth persistence
setPersistence(auth, browserLocalPersistence)
  .catch(console.error);

auth.useDeviceLanguage(); // Use device language for auth UI

// Initialize Firestore with persistence
const db = getFirestore(app);

export { auth, db };
export default app;
