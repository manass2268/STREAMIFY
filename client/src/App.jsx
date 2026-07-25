import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; 

// --- Apne Pages Import Karo ---
import Login from './pages/Login';
import UpdatePassword from './pages/UpdatePassword';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Firebase Auth State Listener: Check karega ki user logged in hai ya nahi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Jab tak Firebase user ka status check kar raha hai, tab tak loading dikhao
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090E', color: '#06b6d4', fontSize: '20px', fontWeight: 'bold' }}>
        Loading Streamify...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        
        {/* 1. HOME / LOGIN ROUTE */}
        {/* Agar user nahi hai toh Login dikhao, agar hai toh Dashboard par bhej do */}
        <Route 
          path="/" 
          element={!user ? <Login /> : <Navigate to="/dashboard" />} 
        />

        {/* 2. DASHBOARD ROUTE (Dummy structure for now) */}
        {/* Sirf tabhi khulega jab user logged in ho */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
                <h1>Streamify Dashboard 🍿</h1>
                <p>Welcome back, {user.displayName || user.email}!</p>
                {/* Yahan navbar me tum Update Password ka link de sakte ho */}
                <a href="/settings/password" style={{ color: '#a855f7', textDecoration: 'none', marginTop: '20px', display: 'inline-block' }}>
                  Go to Security Settings ⚙️
                </a>
              </div>
            ) : (
              <Navigate to="/" />
            )
          } 
        />

        {/* 3. 🔥 UPDATE PASSWORD ROUTE */}
        {/* Sirf logged in users ko hi apna password change karne ki permission hai */}
        <Route 
          path="/settings/password" 
          element={user ? <UpdatePassword /> : <Navigate to="/" />} 
        />

        {/* 4. CATCH ALL ROUTE (Agar koi galat URL daale toh wapas home par bhej do) */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}