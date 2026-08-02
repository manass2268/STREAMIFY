import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBET7ZUh5HpZJyHmVG98c16HA7Apo2nlUU",
  authDomain: "streamify-8bebc.firebaseapp.com",
  databaseURL:
    "https://streamify-8bebc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "streamify-8bebc",
  storageBucket: "streamify-8bebc.firebasestorage.app",
  messagingSenderId: "896764474933",
  appId: "1:896764474933:web:5b9d65adebea855326e37c",
  // YEH LINE ADD KARNA SABSE ZAROORI HAI 👇
  databaseURL:
    "https://streamify-8bebc-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const provider = new GoogleAuthProvider();

// Clean and single export for all services
export { auth, db, provider, realtimeDb };
