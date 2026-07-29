import React, { useState } from 'react';
import logo from '../assets/logo1.png'; 
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, provider, db } from '../firebase'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Signup({ onSignupSuccess, switchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        lastLoginTime: serverTimestamp(),
      }, { merge: true });

      if (onSignupSuccess) onSignupSuccess();

    } catch (error) {
      console.error("Signup Error:", error.message);
      setErrorMsg(error.message.replace("Firebase: ", ""));
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLoginTime: serverTimestamp(),
      }, { merge: true });

      if (onSignupSuccess) onSignupSuccess();
    } catch (error) {
      console.error("Google Signup Error:", error.message);
      setErrorMsg("Google signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper perspective-container">
      <div className="glow glow-purple animate-breathe"></div>
      <div className="glow glow-cyan animate-breathe-delayed"></div>

      <div className="login-container">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="brand-header animate-slide-up delay-1">
            <img src={logo} alt="Streamify" className="brand-logo" />
            <span className="brand-name">stream<span className="text-cyan">ify</span></span>
          </div>

          <h1 className="main-heading animate-slide-up delay-2">
            Start Watching.<br/> <span className="text-gradient">Join Free.</span>
          </h1>
          
          <p className="subtitle animate-slide-up delay-3">
            Create an account to unlock unlimited streaming, synchronized watch parties, and personalized playlists.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="entry-wrapper animate-slide-up-slow">
            <div className="login-card-3d animate-float">
              
              <h2>Create Account 🚀</h2>
              <p className="card-subtitle">Sign up to get started with Streamify</p>

              {errorMsg && <div className="error-banner">{errorMsg}</div>}

              <form className="login-form" onSubmit={handleEmailSignup}>
                <div className="input-group">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="input-group">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="input-group">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <button type="submit" className="btn-primary-3d shine-effect" disabled={loading}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>

              <div className="divider"><span>OR</span></div>

              <div className="social-logins">
                <button type="button" className="btn-social" onClick={handleGoogleSignup} disabled={loading}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
              </div>

              <p className="signup-text">
                Already have an account? <span onClick={switchToLogin} style={{color: '#a855f7', cursor: 'pointer', fontWeight: '500'}}>Log In</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER COPYRIGHT TEXT --- */}
      <div className="footer animate-fade-in">© 2026 Streamify. All rights reserved.</div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #09090E; color: #ffffff; overflow-x: hidden; }
        .perspective-container { perspective: 1000px; }
        .login-wrapper { min-height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; position: relative; padding: 4vh 4vw; }
        
        .glow { position: absolute; width: 45vw; height: 45vw; border-radius: 50%; filter: blur(130px); opacity: 0.15; pointer-events: none; z-index: 0; }
        .glow-purple { top: -10%; left: -10%; background-color: #a855f7; }
        .glow-cyan { bottom: -10%; right: -10%; background-color: #06b6d4; }
        .animate-breathe { animation: breathe 8s infinite alternate ease-in-out; }
        .animate-breathe-delayed { animation: breathe 10s infinite alternate-reverse ease-in-out; }
        @keyframes breathe { 0% { transform: scale(0.9) translate(0, 0); opacity: 0.12; } 100% { transform: scale(1.1) translate(20px, 20px); opacity: 0.2; } }

        .login-container { width: 100%; max-width: 1100px; display: flex; gap: 40px; z-index: 10; position: relative; align-items: center; justify-content: center; }
        .left-panel { flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: left; }
        .brand-header { display: flex; align-items: center; gap: 10px; margin-bottom: 25px; }
        .brand-logo { height: 42px; width: auto; mix-blend-mode: screen; } 
        .brand-name { font-size: 32px; font-weight: 800; letter-spacing: 1px; }
        .text-cyan { color: #06b6d4; }
        .main-heading { font-size: 38px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }
        .text-gradient { background: linear-gradient(to right, #a855f7, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { color: #9ca3af; font-size: 16px; max-width: 400px; line-height: 1.4; }

        .right-panel { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; }
        .entry-wrapper { width: 100%; display: flex; align-items: center; justify-content: center; }
        .animate-float { animation: floatCard 6s ease-in-out infinite; }
        @keyframes floatCard { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }

        .login-card-3d { background: rgba(18, 18, 26, 0.75); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-top: 1px solid rgba(255, 255, 255, 0.25); border-radius: 24px; padding: 35px 40px; width: 100%; max-width: 420px; box-shadow: 0 35px 65px rgba(0, 0, 0, 0.7); }
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

        /* FIXED FOOTER STYLE */
        .footer { position: fixed; bottom: 10px; width: 100%; text-align: center; font-size: 11px; color: #4b5563; z-index: 20; pointer-events: none; }

        @media (max-width: 1024px) {
          .login-container { flex-direction: column; max-width: 450px; padding: 20px 0; }
          .left-panel { display: none; }
          .login-wrapper { padding: 20px; height: auto; min-height: 100vh; }
          .login-card-3d { padding: 25px 20px; max-width: 100%; }
        }
      `}</style>
    </div>
  );
}