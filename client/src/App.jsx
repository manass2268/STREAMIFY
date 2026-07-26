import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// 🔥 Yahan signOut import add kiya gaya hai
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { auth } from './firebase'; 

import SplashScreen from './components/SplashScreen'; 
import Login from './pages/Login';
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

  // 3. Main Routing
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

          {/* DASHBOARD ROUTE (Temporary testing dashboard with Logout) */}
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <div style={{ color: 'white', textAlign: 'center', padding: '50px', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>Streamify Dashboard 🍿</h1>
                  <p style={{ color: '#9ca3af', marginBottom: '30px' }}>Welcome back, {user.displayName || user.email}!</p>
                  
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    
                    <a href="/settings/password" style={{ 
                      background: 'linear-gradient(135deg, #a855f7, #06b6d4)', 
                      color: 'white', 
                      padding: '12px 24px', 
                      borderRadius: '12px', 
                      textDecoration: 'none', 
                      fontWeight: 'bold',
                      boxShadow: '0 10px 20px -5px rgba(168, 85, 247, 0.4)'
                    }}>
                      Go to Security Settings ⚙️
                    </a>

                    {/* 🔥 NAYA LOGOUT BUTTON */}
                    <button 
                      onClick={async () => {
                        await signOut(auth);
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        color: '#ef4444',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: '0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.target.style.borderColor = '#ef4444';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                      }}
                    >
                      Logout 🚪
                    </button>

                  </div>
                </div>
              ) : (
                <Navigate to="/" />
              )
            } 
          />

          {/* UPDATE & RESET PASSWORD ROUTE (Ab yeh sabke liye khula hai taaki email link kaam kare) */}
          <Route path="/settings/password" element={<UpdatePassword />} />

          {/* CATCH ALL ROUTE */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
    </div>
  );
}