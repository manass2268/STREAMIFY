import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { getDatabase } from "firebase/database";

// Env file se real configuration fetch ho rahi hai
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth & Realtime Database
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// ==========================================
// AUTHENTICATION HELPER FUNCTIONS (Cleaned!)
// ==========================================

// 1. Google OAuth Sign-In
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

// 2. GitHub OAuth Sign-In
export const loginWithGithub = async () => {
  const result = await signInWithPopup(auth, githubProvider);
  return result.user;
};

// 3. Email/Password Login
export const loginWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return userCredential.user;
};

// 4. Register new user with Email/Password + Display Name
export const registerWithEmail = async (email, password, fullName) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  if (fullName) {
    await updateProfile(userCredential.user, { displayName: fullName });
  }
  return userCredential.user;
};

// 5. Logout
export const logoutUser = () => signOut(auth);

export default app;
