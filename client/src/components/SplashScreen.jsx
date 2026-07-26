import React, { useEffect, useState } from 'react';
import logo from '../assets/logo1.png'; // Path check kar lena bhai

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    // 1. Generate random glowing floating bubbles (Pink & Cyan)
    const newBubbles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      size: Math.random() * 8 + 4, // Thode bade aur clear bubbles
      left: Math.random() * 100, // 0 to 100% width
      delay: Math.random() * 2, // Random start time
      duration: Math.random() * 4 + 3, // 3 to 7 seconds travel speed
      isPink: Math.random() > 0.5 
    }));
    setBubbles(newBubbles);

    // 2. Timer: 3.5 seconds ka timer
    const timer = setTimeout(() => setFadeOut(true), 3500);
    const finishTimer = setTimeout(() => onFinish(), 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #09090e 0%, #1c1438 40%, #154b7c 100%)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        overflow: 'hidden'
      }}
    >
      {/* --- BACKGROUND FLOATING BUBBLES (100% Fix) --- */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {bubbles.map(b => (
          <div 
            key={b.id}
            style={{
              position: 'absolute', // Ab ye left me stack nahi honge
              borderRadius: '50%',
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              bottom: '-20px',
              backgroundColor: b.isPink ? '#ec4899' : '#06b6d4',
              boxShadow: `0 0 ${b.size * 2}px ${b.isPink ? '#ec4899' : '#06b6d4'}`,
              animation: `floatUp ${b.duration}s linear infinite`,
              animationDelay: `${b.delay}s`,
              opacity: 0
            }}
          />
        ))}
      </div>

      {/* --- CENTER LOGO WITH LIGHT SWEEP EFFECT --- */}
      <div style={{ zIndex: 10, animation: 'zoomIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <div style={{ position: 'relative', overflow: 'hidden', padding: '10px', display: 'flex', justifyContent: 'center' }}>
          {/* Main Logo Image (Size increase kar diya video jaisa) */}
          <img 
            src={logo} 
            alt="Streamify" 
            style={{ 
              width: '350px', // Bada logo
              maxWidth: '80vw',
              filter: 'drop-shadow(0 0 25px rgba(6, 182, 212, 0.6))' 
            }} 
          />
          {/* White Shine/Glare Effect */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: '-100%', 
            width: '50%', 
            height: '100%', 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', 
            transform: 'skewX(-25deg)', 
            animation: 'shine 3s infinite' 
          }}></div>
        </div>
      </div>

      {/* --- BOTTOM TEXT --- */}
      <div style={{ position: 'absolute', bottom: '50px', zIndex: 10, textAlign: 'center', animation: 'slideUp 1s ease-out forwards' }}>
        <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', letterSpacing: '0.2em', margin: 0, fontFamily: 'system-ui, sans-serif', textShadow: '0px 4px 10px rgba(0,0,0,0.5)' }}>
          STREAMIFY
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.3em', marginTop: '12px', fontFamily: 'system-ui, sans-serif' }}>
          Premium OTT Experience
        </p>
      </div>

      {/* --- CSS ANIMATIONS --- */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.9; }
          100% { transform: translateY(-100vh) scale(1.2); opacity: 0; }
        }
        @keyframes shine {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }
        @keyframes zoomIn {
          0% { transform: scale(0.85); opacity: 0; filter: blur(5px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes slideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}