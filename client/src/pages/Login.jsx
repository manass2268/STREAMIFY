import React, { useState } from 'react';
import logo from '../assets/logo1.png'; 
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { auth, provider, db } from '../firebase'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Login({ onLoginSuccess }) {
  // Navigation states: 'login', 'signup', 'forgot'
  const [view, setView] = useState('login'); 
  
  // Naya state: About section ka modal toggle karne ke liye
  const [showAbout, setShowAbout] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  // 1. Google Login / Signup Handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL || '',
          lastLoginTime: serverTimestamp(), 
          createdAt: serverTimestamp(),    // Yahan Created Time save ho raha h
          lastLoginTime: serverTimestamp(),    // Yahan Last Login Time save ho raha h
        }, { merge: true }); 
      } catch (dbError) {
        console.error("Error updating database:", dbError);
      }
      
      setSuccessData({ name: user.displayName, email: user.email, photo: user.photoURL });

      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://streamify-backend-ptmq.onrender.com';

      try {
        await fetch(`${API_URL}/api/send-welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: user.displayName, email: user.email })
        });
      } catch (backendErr) {
        console.error("Backend server offline (Ignored for testing):", backendErr);
      }

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        else window.location.reload();
      }, 1500);

    } catch (error) {
      console.error("Error during Google Login:", error.message);
      setErrorMsg("Google login failed. Please try again.");
      setLoading(false);
    }
  };

  // 2. Email & Password Login Handler
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { lastLoginTime: serverTimestamp() }, { merge: true });

      setSuccessData({ name: user.displayName || email.split('@')[0], email: user.email, photo: user.photoURL || null });

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        else window.location.reload();
      }, 1500);

    } catch (error) {
      setErrorMsg(error.message.replace("Firebase: ", ""));
      setLoading(false);
    }
  };

  // 3. Email & Password Signup Handler
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        name: name,
        email: email,
        photoURL: '',
        createdAt: serverTimestamp(),
        lastLoginTime: serverTimestamp(),
      }, { merge: true });

      setSuccessData({ name: name, email: email, photo: null });

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        else window.location.reload();
      }, 1500);

    } catch (error) {
      setErrorMsg(error.message.replace("Firebase: ", ""));
      setLoading(false);
    }
  };

  // 4. Forgot Password Handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Password reset link sent! Check your inbox.');
      setLoading(false);
    } catch (error) {
      setErrorMsg(error.message.replace("Firebase: ", ""));
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper perspective-container">
      <div className="glow glow-purple animate-breathe"></div>
      <div className="glow glow-cyan animate-breathe-delayed"></div>

      {/* --- SUCCESS POPUP --- */}
      {successData && (
        <div className="success-overlay animate-fade-in">
          <div className="success-modal animate-scale-up">
            <div className="success-icon-wrapper">
              {successData.photo ? (
                <img src={successData.photo} alt="Profile" className="user-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="success-check">✓</div>
              )}
            </div>
            <h2>Welcome Back, {successData.name}! 🎉</h2>
            <p className="redirect-text">Authentication successful. Taking you to your dashboard...</p>
          </div>
        </div>
      )}

      {/* --- 🔥 ABOUT US MODAL (Special Treatment) --- */}
      {showAbout && (
        <div className="about-overlay animate-fade-in" onClick={() => setShowAbout(false)}>
          <div className="about-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="about-header">
              <img src={logo} alt="Streamify Logo" className="about-logo" />
              <h2>About <span className="text-cyan">Streamify</span></h2>
            </div>
            
            <div className="about-content">
              <p className="about-desc">
                Streamify is a next-generation OTT platform designed to bring people together through seamless streaming and synchronized watch parties.
              </p>
              
              <div className="team-credits">
                <div className="credit-item">
                  <span className="credit-role">👨‍💻 Core Development</span>
                  <span className="credit-name">Manas Singh</span>
                </div>
                <div className="credit-item">
                  <span className="credit-role">🎨 UI/UX Design</span>
                  <span className="credit-name">Alakh Gautam</span>
                </div>
              </div>

              <div className="easter-egg">
                <p>
                  A proud project engineered by BCA tech enthusiasts from Krishna Group of Institutions (KGI), Kanpur, pushing the boundaries of modern web development and interactive UI design.
                </p>
              </div>

              <button className="btn-close-about shine-effect" onClick={() => setShowAbout(false)}>
                Awesome! Let's Go
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="login-container">
        
        {/* LEFT SIDE: BRANDING */}
        <div className="left-panel">
          <div className="brand-header animate-slide-up delay-1">
            <img src={logo} alt="Streamify" className="brand-logo" />
            <span className="brand-name">stream<span className="text-cyan">ify</span></span>
          </div>

          <h1 className="main-heading animate-slide-up delay-2">
            Watch Together.<br/> <span className="text-gradient">Anywhere.</span>
          </h1>
          
          <p className="subtitle animate-slide-up delay-3">
            Stream unlimited movies, TV shows and more. Download. Queue. Watch Together.
          </p>

          <div className="features-grid animate-slide-up delay-4">
            <div className="feature-item 3d-hover-card">
              <div className="feature-icon icon-purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <h3>Smart Downloads</h3>
              <p>Download and watch offline.</p>
            </div>
            <div className="feature-item 3d-hover-card">
              <div className="feature-icon icon-cyan">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3>Watch Together</h3>
              <p>Real-time sync with friends.</p>
            </div>
            <div className="feature-item 3d-hover-card">
              <div className="feature-icon icon-purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <h3>Go Premium</h3>
              <p>Unlock exclusive content.</p>
            </div>
          </div>
          <div className="pagination-dots animate-fade-in delay-5">
            <div className="dot active"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div>
          </div>
        </div>

        {/* RIGHT SIDE: DYNAMIC FORMS */}
        <div className="right-panel">
          <div className="entry-wrapper animate-slide-up-slow">
            <div className="login-card-3d animate-float">
              
              {/* LOGIN FORM */}
              {view === 'login' && (
                <>
                  <h2>Welcome Back! 👋</h2>
                  <p className="card-subtitle">Login to continue your journey</p>
                  {errorMsg && <div className="error-banner">{errorMsg}</div>}
                  <form className="login-form" onSubmit={handleEmailLogin}>
                    <div className="input-group">
                      <div className="input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                      <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <div className="input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                      <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="forgot-password">
                      <span onClick={() => { setView('forgot'); setErrorMsg(''); }} style={{color: '#a855f7', cursor: 'pointer', fontSize: '13px'}}>Forgot Password?</span>
                    </div>
                    <button type="submit" className="btn-primary-3d shine-effect" disabled={loading}>
                      {loading ? "Logging in..." : "Log In"}
                    </button>
                  </form>
                  <div className="divider"><span>OR</span></div>
                  <div className="social-logins">
                    <button type="button" className="btn-social" onClick={handleGoogleLogin} disabled={loading}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Continue with Google
                    </button>
                  </div>
                  <p className="signup-text">
                    Don't have an account? <span onClick={() => { setView('signup'); setErrorMsg(''); }} style={{color: '#a855f7', cursor: 'pointer', fontWeight: '500'}}>Sign Up</span>
                  </p>
                </>
              )}

              {/* SIGN UP FORM */}
              {view === 'signup' && (
                <>
                  <h2>Create Account 🚀</h2>
                  <p className="card-subtitle">Sign up to get started with Streamify</p>
                  {errorMsg && <div className="error-banner">{errorMsg}</div>}
                  <form className="login-form" onSubmit={handleEmailSignup}>
                    <div className="input-group">
                      <div className="input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                      <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <div className="input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                      <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <div className="input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                      <input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary-3d shine-effect" disabled={loading}>
                      {loading ? "Creating..." : "Sign Up"}
                    </button>
                  </form>
                  <div className="divider"><span>OR</span></div>
                  <div className="social-logins">
                    <button type="button" className="btn-social" onClick={handleGoogleLogin} disabled={loading}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Continue with Google
                    </button>
                  </div>
                  <p className="signup-text">
                    Already have an account? <span onClick={() => { setView('login'); setErrorMsg(''); }} style={{color: '#a855f7', cursor: 'pointer', fontWeight: '500'}}>Log In</span>
                  </p>
                </>
              )}

              {/* FORGOT PASSWORD FORM */}
              {view === 'forgot' && (
                <>
                  <h2>Reset Password 🔒</h2>
                  <p className="card-subtitle">Enter your email and we'll send you a link to recover your account.</p>
                  {successMsg && <div className="success-banner">{successMsg}</div>}
                  {errorMsg && <div className="error-banner">{errorMsg}</div>}
                  <form className="login-form" onSubmit={handleForgotPassword}>
                    <div className="input-group">
                      <div className="input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                      <input type="email" placeholder="Enter your registered email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary-3d shine-effect" disabled={loading}>
                      {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>
                  <p className="signup-text" style={{marginTop: '20px'}}>
                    Remember your password? <span onClick={() => { setView('login'); setErrorMsg(''); setSuccessMsg(''); }} style={{color: '#a855f7', cursor: 'pointer', fontWeight: '500'}}>Back to Login</span>
                  </p>
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* --- SIDE-BY-SIDE GLOBAL FOOTER --- */}
      <div className="global-footer animate-fade-in delay-6">
        <div className="footer-links">
          <span className="footer-item">
            Support: <a href="mailto:support.mstech4407@gmail.com">support.mstech4407@gmail.com</a>
          </span>
          <span className="footer-divider">|</span>
          <span className="footer-item about-link" onClick={() => setShowAbout(true)}>
            About Us
          </span>
        </div>
        <div className="copyright-text">
          © 2026 Streamify. All rights reserved.
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #09090E; color: #ffffff; overflow-x: hidden; }
        
        .success-overlay { position: fixed; inset: 0; background: rgba(9, 9, 14, 0.85); backdrop-filter: blur(12px); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .success-modal { background: #12121c; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 24px; padding: 40px; width: 100%; max-width: 380px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.8); }
        .success-icon-wrapper { width: 80px; height: 80px; margin: 0 auto 20px auto; border-radius: 50%; background: linear-gradient(135deg, #a855f7, #3b82f6); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .user-avatar { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .success-check { font-size: 36px; color: white; font-weight: bold; }
        .success-modal h2 { font-size: 22px; margin-bottom: 8px; }
        .redirect-text { color: #9ca3af; font-size: 13px; }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

        /* 🔥 ABOUT MODAL STYLES */
        .about-overlay { position: fixed; inset: 0; background: rgba(9, 9, 14, 0.85); backdrop-filter: blur(15px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .about-modal { background: rgba(18, 18, 26, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-top: 1px solid rgba(168, 85, 247, 0.3); border-radius: 24px; padding: 40px; width: 100%; max-width: 480px; box-shadow: 0 35px 65px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.15); position: relative; overflow: hidden; }
        .about-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 25px; }
        .about-logo { height: 50px; width: auto; margin-bottom: 15px; filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.4)); }
        .about-header h2 { font-size: 26px; font-weight: 800; letter-spacing: 1px; }
        .about-content { display: flex; flex-direction: column; gap: 20px; text-align: center; }
        .about-desc { color: #d1d5db; font-size: 14.5px; line-height: 1.6; }
        .team-credits { display: flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
        .credit-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
        .credit-item:last-child { border-bottom: none; padding-bottom: 0; }
        .credit-role { color: #9ca3af; font-size: 13px; font-weight: 500; }
        .credit-name { color: #fff; font-weight: 700; font-size: 14px; text-shadow: 0 0 10px rgba(168,85,247,0.4); }
        .easter-egg { font-size: 12.5px; color: #9ca3af; font-style: italic; line-height: 1.5; padding: 0 10px; }
        .btn-close-about { width: 100%; background: linear-gradient(135deg, #a855f7, #3b82f6); color: #ffffff; border: none; border-radius: 12px; padding: 14px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.3s; margin-top: 10px; }

        .perspective-container { perspective: 1000px; }
        
        /* 🔥 FIX FOR TOP CUT-OFF: Top padding badhai aur overflow auto kiya */
        .login-wrapper { 
          min-height: 100vh; 
          width: 100vw; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          position: relative; 
          padding: 8vh 4vw 100px 4vw; /* Upar se thoda space aur niche proper padding */
          overflow-y: auto; /* Screen choti hone par scroll enable hoga */
        }
        
        .glow { position: absolute; width: 45vw; height: 45vw; border-radius: 50%; filter: blur(130px); opacity: 0.15; pointer-events: none; z-index: 0; }
        .glow-purple { top: -10%; left: -10%; background-color: #a855f7; }
        .glow-cyan { bottom: -10%; right: -10%; background-color: #06b6d4; }
        .animate-breathe { animation: breathe 8s infinite alternate ease-in-out; }
        .animate-breathe-delayed { animation: breathe 10s infinite alternate-reverse ease-in-out; }
        @keyframes breathe { 0% { transform: scale(0.9) translate(0, 0); opacity: 0.12; } 100% { transform: scale(1.1) translate(20px, 20px); opacity: 0.2; } }

        /* 🔥 FIX FOR TOP CUT-OFF: Container margin auto kar diya */
        .login-container { 
          width: 100%; 
          max-width: 1100px; 
          display: flex; 
          gap: 40px; 
          z-index: 10; 
          position: relative; 
          align-items: center; 
          justify-content: center; 
          margin: auto; /* Box upar cut nahi hone dega */
        }
        
        .left-panel { flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: left; }
        .brand-header { display: flex; align-items: center; gap: 10px; margin-bottom: 25px; }
        .brand-logo { height: 42px; width: auto; mix-blend-mode: screen; } 
        .brand-name { font-size: 32px; font-weight: 800; letter-spacing: 1px; }
        .text-cyan { color: #06b6d4; }
        .main-heading { font-size: 38px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }
        .text-gradient { background: linear-gradient(to right, #a855f7, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { color: #9ca3af; font-size: 16px; max-width: 400px; line-height: 1.4; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 30px; }
        .3d-hover-card { padding: 10px; border-radius: 16px; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s; }
        .3d-hover-card:hover { transform: translateY(-8px) scale(1.02); background: rgba(255, 255, 255, 0.02); }
        .feature-item h3 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .feature-item p { font-size: 12px; color: #6b7280; line-height: 1.4; }
        .feature-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; transition: 0.3s; }
        .icon-purple { color: #a855f7; }
        .icon-cyan { color: #06b6d4; }
        .pagination-dots { display: flex; gap: 6px; margin-top: 40px; }
        .dot { height: 5px; width: 14px; border-radius: 10px; background: rgba(255, 255, 255, 0.2); transition: 0.3s; }
        .dot.active { width: 22px; background: #a855f7; box-shadow: 0 0 10px #a855f7; }

        .right-panel { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; }
        .entry-wrapper { width: 100%; display: flex; align-items: center; justify-content: center; }
        .animate-float { animation: floatCard 6s ease-in-out infinite; }
        @keyframes floatCard { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }

        .login-card-3d { 
          background: rgba(18, 18, 26, 0.75); 
          backdrop-filter: blur(64px); 
          border: 10px solid rgba(255, 255, 255, 0.08); 
          border-top: 10px solid rgba(62, 53, 53, 0.25); 
          border-radius: 39px; 
          
          /* Padding aur width badha di hai */
          padding: 65px 30px; 
          width: 100%; 
          max-width: 580px; /* Pehle ye 420px tha, ab isko 480px kar diya */
          
          box-shadow: 0 35px 65px rgba(0, 0, 0, 0.7); 
        }
        .login-card-3d h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .card-subtitle { color: #9ca3af; font-size: 13px; margin-bottom: 25px; }
        
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .input-group { position: relative; width: 100%; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #6b7280; display: flex; pointer-events: none; }
        .input-group input { width: 100%; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px 12px 12px 42px; color: #ffffff; font-size: 14px; outline: none; transition: 0.3s; }
        .input-group input:focus { border-color: #a855f7; background: rgba(0,0,0,0.7); box-shadow: 0 0 15px rgba(168,85,247,0.2); }

        .btn-primary-3d { width: 100%; background: linear-gradient(135deg, #a855f7, #3b82f6); color: #ffffff; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px -5px rgba(168, 85, 247, 0.6); }
        
        .divider { display: flex; align-items: center; margin: 20px 0; }
        .divider::before, .divider::after { content: ""; flex: 1; border-top: 1px solid rgba(255,255,255,0.1); }
        .divider span { padding: 0 12px; color: #6b7280; font-size: 11px; }

        .social-logins { display: flex; flex-direction: column; gap: 10px; }
        .btn-social { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #ffffff; border-radius: 12px; padding: 10px; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.3s; }
        .btn-social:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }

        .signup-text { text-align: center; font-size: 13px; color: #9ca3af; margin-top: 25px; }
        .error-banner { background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 15px; text-align: center; }
        .success-banner { background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.4); color: #86efac; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 15px; text-align: center; }

        .global-footer {
          position: absolute;
          bottom: 2vh;
          left: 0;
          width: 100%;
          text-align: center;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0px; 
        }
        .footer-links {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 15px; 
          flex-wrap: wrap; 
        }
        .footer-item {
          font-size: 13px;
          color: #9ca3af;
        }
        .footer-item strong {
          color: #e5e7eb;
          font-weight: 600;
        }
        .footer-item a {
          color: #06b6d4;
          text-decoration: none;
          font-weight: 500;
          transition: 0.2s;
        }
        .footer-item a:hover {
          color: #a855f7;
          text-decoration: underline;
        }
        .footer-divider {
          color: #4b5563;
          font-size: 14px;
        }
        .about-link {
          color: #a855f7 !important;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .about-link:hover {
          color: #fff !important;
          text-shadow: 0 0 10px rgba(168,85,247,0.6);
        }
        .copyright-text {
          font-size: 11px;
          color: #4b5563;
        }

        .animate-slide-up { opacity: 0; transform: translateY(30px); animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up-slow { opacity: 0; transform: translateY(50px); animation: slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { opacity: 0; animation: fadeIn 1s ease-in forwards; }
        .delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; } .delay-3 { animation-delay: 0.3s; } .delay-4 { animation-delay: 0.4s; } .delay-5 { animation-delay: 0.6s; } .delay-6 { animation-delay: 0.8s; }
        @keyframes slideUpFade { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { to { opacity: 1; } }

        @media (max-width: 1024px) {
          .login-container { flex-direction: column; max-width: 450px; padding: 20px 0; }
          .left-panel { display: none; }
          .login-wrapper { padding: 20px 20px 100px 20px; height: auto; min-height: 100vh; }
          .login-card-3d { padding: 25px 20px; max-width: 100%; }
          .global-footer { position: relative; bottom: 0; margin-top: 20px; }
          .footer-links { gap: 10px; } 
          .footer-divider { display: none; } 
          .footer-item { display: block; width: 100%; margin-bottom: 5px;}
        }
      `}</style>
    </div>
  );
}