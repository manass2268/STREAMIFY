import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('streamify_theme_override') || 'auto';
  });

  const [resolvedTheme, setResolvedTheme] = useState('dark');

  // Evaluate IST automated time rules
  useEffect(() => {
    const calculateTheme = () => {
      if (theme !== 'auto') {
        setResolvedTheme(theme);
        return;
      }

      // Current IST time evaluation (UTC+5:30)
      const now = new Date();
      const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
      const istDate = new Date(utcMillis + 5.5 * 3600000);
      const hours = istDate.getHours();

      // Light theme strictly between 10:00 AM and 12:00 PM IST
      if (hours >= 10 && hours < 12) {
        setResolvedTheme('light');
      } else {
        setResolvedTheme('dark');
      }
    };

    calculateTheme();
    const interval = setInterval(calculateTheme, 60000);
    return () => clearInterval(interval);
  }, [theme]);

  // Sync class on root document
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [resolvedTheme]);

  const setManualTheme = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('streamify_theme_override', newTheme);

    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { preferredTheme: newTheme });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setManualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);