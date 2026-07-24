import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen'; // Check karlena path sahi ho
import Login from './pages/Login'; // Apna naya Login page import kiya

export default function App() {
  // Ye state track karegi ki splash screen dikhani hai ya nahi
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {/* Agar showSplash true hai toh SplashScreen dikhao, warna Login dikhao */}
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <Login />
      )}
    </>
  );
}