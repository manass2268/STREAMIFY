import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from './firebase'; 
import { Analytics } from '@vercel/analytics/react'; // <-- Vercel Analytics imported

import SplashScreen from './components/SplashScreen'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import UpdatePassword from './pages/UpdatePassword';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSplashDone, setIsSplashDone] = useState(false);

  // Firebase Auth Session Engine
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // 1. Cinematic Splash Screen
  if (!isSplashDone) {
    return <SplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  // 2. Auth Loading state
  if (isAuthLoading) {
    return <div className="min-h-screen" style={{ backgroundColor: '#09090E' }}></div>;
  }

  // 3. Main Routing & Analytics Integration
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#09090E' }}>
      <Router>
        <Routes>
          
          {/* LOGIN ROUTES */}
          <Route 
            path="/" 
            element={!user ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" />} 
          />

          {/* DASHBOARD ROUTE (Real Integrated Dashboard) */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/" />} 
          />

          {/* SETTINGS ROUTE */}
          <Route path="/settings/password" element={<UpdatePassword />} />

          {/* CATCH ALL ROUTE */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
      
      {/* Vercel Analytics Tracker Component */}
      <Analytics />
    </div>
  );
}