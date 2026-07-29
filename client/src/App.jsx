import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from './firebase'; 
import { Analytics } from '@vercel/analytics/react';

import SplashScreen from './components/SplashScreen'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import UpdatePassword from './pages/UpdatePassword';

// Player Component
import Player from './pages/Player';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (!isSplashDone) {
    return <SplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  if (isAuthLoading) {
    return <div className="min-h-screen" style={{ backgroundColor: '#09090E' }}></div>;
  }

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

          {/* DASHBOARD ROUTE */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/" />} 
          />

          {/* SETTINGS ROUTE */}
          <Route path="/settings/password" element={<UpdatePassword />} />

          {/* 🔥 PLAYER ROUTE (Must be ABOVE the Catch-All '*') 🔥 */}
          <Route path="/watch/:id" element={<Player />} />

          {/* CATCH ALL ROUTE (Always put this at the very end!) */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      
      <Analytics />
    </div>
  );
}