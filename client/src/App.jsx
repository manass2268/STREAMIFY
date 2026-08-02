
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

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from './firebase'; 
import { Analytics } from '@vercel/analytics/react';
import WatchPartyLobby from "./watch party/client/pages/LandingPage.jsx";
import WatchPartyRoom from "./watch party/client/pages/MeetingRoom.jsx";
// 🔥 Theme Context Provider (Task 5 Automation & Manual Override)
import { ThemeProvider } from './contexts/ThemeContext';

// Pages & Components (Strictly imported from your pages/ & components/ folders)
import SplashScreen from './components/SplashScreen'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import UpdatePassword from './pages/UpdatePassword';
import Player from './pages/Player';

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

  // 1. Cinematic Splash Screen Transition
  if (!isSplashDone) {
    return <SplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  // 2. Initial Auth Session Resolving State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090E] text-zinc-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm tracking-wider uppercase">Initializing Streamify Session...</span>
        </div>
      </div>
    );
  }

  // 3. Root Router & Global Theme Orchestrator
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#09090E] text-white transition-colors duration-300">
        <Router>
          <Routes>
            <Route path="/watchparty" element={<WatchPartyLobby />} />
            <Route path="/room/:roomId" element={<WatchPartyRoom />} />
            {/* AUTHENTICATION ROUTES */}
            <Route 
              path="/" 
              element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
            />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
            />

            {/* PROTECTED DASHBOARD ROUTE */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
            />

            {/* PROTECTED ACCOUNT SETTINGS ROUTE */}
            <Route 
              path="/settings/password" 
              element={user ? <UpdatePassword /> : <Navigate to="/login" replace />} 
            />

            {/* 🔥 PROTECTED STREAMING PLAYER ROUTE (Must be ABOVE wildcard '*') 🔥 */}
            <Route 
              path="/watch/:id" 
              element={user ? <Player /> : <Navigate to="/login" replace />} 
            />

            {/* WILDCARD CATCH-ALL ROUTE */}
            <Route 
              path="*" 
              element={<Navigate to={user ? "/dashboard" : "/"} replace />} 
            />

          </Routes>
        </Router>
        
        {/* Vercel Analytics Tracker */}
        <Analytics />
      </div>
    </ThemeProvider>
  );
}
}