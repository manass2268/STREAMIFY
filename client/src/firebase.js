import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Apni Firebase console wali keys yahan dhyan se replace karna
const firebaseConfig = {
  apiKey: "AIzaSyBET7ZUh5HpZJyHmVG98c16HA7Apo2nlUU",
  authDomain: "streamify-8bebc.firebaseapp.com",
  projectId: "streamify-8bebc",
  storageBucket: "streamify-8bebc.firebasestorage.app",
  messagingSenderId: "896764474933",
  appId: "1:896764474933:web:5b9d65adebea855326e37c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Google Auth ka setup (Jo tumhari file se miss ho gaya tha)
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Ye export line zaroori hai taaki Login.jsx isko padh sake
export { auth, provider };
