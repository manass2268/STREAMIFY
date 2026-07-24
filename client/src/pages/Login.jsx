import React, { useState } from 'react';
import logo from '../assets/logo1.png'; 
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from '../firebase'; 

export default function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Login Successful! User Details:", user);
      
      setSuccessData({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      });

      // Backend API call to trigger real Nodemailer welcome email from support.mstech
      try {
        const response = await fetch('http://localhost:5000/api/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: user.displayName, email: user.email })
        });
        const data = await response.json();
        console.log("Backend Email Response:", data);
      } catch (backendErr) {
        console.error("Failed to connect to backend server:", backendErr);
      }

      // Automatic smooth transition to dashboard after 1.5 seconds
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.reload();
        }
      }, 1500);

    } catch (error) {
      console.error("Error during Google Login:", error.message);
      alert("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper perspective-container">
      {/* --- Animated Ambient Glows --- */}
      <div className="glow glow-purple animate-breathe"></div>
      <div className="glow glow-cyan animate-breathe-delayed"></div>

      {/* --- CLEAN SUCCESS POPUP --- */}
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
            <p className="redirect-text">Login successful. Taking you to your dashboard...</p>
          </div>
        </div>
      )}

      {/* --- Main Content Container --- */}
      <div className="login-container">
        
        {/* ========================================= */}
        {/* LEFT SIDE: BRANDING & FEATURES */}
        {/* ========================================= */}
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <h3>Smart Downloads</h3>
              <p>Download and watch offline.</p>
            </div>

            <div className="feature-item 3d-hover-card">
              <div className="feature-icon icon-cyan">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3>Watch Together</h3>
              <p>Real-time sync with friends.</p>
            </div>

            <div className="feature-item 3d-hover-card">
              <div className="feature-icon icon-purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <h3>Go Premium</h3>
              <p>Unlock exclusive content.</p>
            </div>
          </div>

          <div className="pagination-dots animate-fade-in delay-5">
            <div className="dot active"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT SIDE: 3D FLOATING LOGIN FORM */}
        {/* ========================================= */}
        <div className="right-panel">
          <div className="entry-wrapper animate-slide-up-slow">
            <div className="login-card-3d animate-float">
              
              <div className="theme-toggle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              </div>

              <h2>Welcome Back! 👋</h2>
              <p className="card-subtitle">Login to continue your journey</p>

              <form className="login-form">
                <div className="input-group">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <input type="email" placeholder="Enter your email" />
                </div>

                <div className="input-group">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <input type="password" placeholder="Enter your password" />
                  <button type="button" className="eye-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>

                <div className="forgot-password">
                  <a href="#">Forgot Password?</a>
                </div>

                <button type="button" className="btn-primary-3d shine-effect">
                  Log In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '8px'}}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </form>

              <div className="divider">
                <span>OR</span>
              </div>

              <div className="social-logins">
                <button type="button" className="btn-social" onClick={handleGoogleLogin} disabled={loading}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {loading ? "Authenticating..." : "Continue with Google"}
                </button>
              </div>

              <p className="signup-text">
                Don't have an account? <a href="#">Sign Up</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer animate-fade-in delay-6">
        © 2026 Streamify. All rights reserved.
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
          background-color: #09090E;
          color: #ffffff;
          overflow: hidden;
        }

        .success-overlay {
          position: fixed;
          inset: 0;
          background: rgba(9, 9, 14, 0.85);
          backdrop-filter: blur(12px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-modal {
          background: #12121c;
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 24px;
          padding: 40px;
          width: 100%;
          max-width: 380px;
          text-align: center;
          box-shadow: 0 25px 50px rgba(0,0,0,0.8), 0 0 30px rgba(168, 85, 247, 0.2);
        }

        .success-icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px auto;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
          overflow: hidden;
        }

        .user-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .success-check {
          font-size: 36px;
          color: white;
          font-weight: bold;
        }

        .success-modal h2 {
          font-size: 22px;
          margin-bottom: 8px;
        }

        .redirect-text {
          color: #9ca3af;
          font-size: 13px;
        }

        .animate-scale-up {
          animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .perspective-container { perspective: 1000px; }
        .login-wrapper { height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; position: relative; padding: 2vh 4vw; }
        .glow { position: absolute; width: 45vw; height: 45vw; border-radius: 50%; filter: blur(130px); opacity: 0.15; pointer-events: none; z-index: 0; }
        .glow-purple { top: -10%; left: -10%; background-color: #a855f7; }
        .glow-cyan { bottom: -10%; right: -10%; background-color: #06b6d4; }
        .animate-breathe { animation: breathe 8s infinite alternate ease-in-out; }
        .animate-breathe-delayed { animation: breathe 10s infinite alternate-reverse ease-in-out; }
        @keyframes breathe {
          0% { transform: scale(0.9) translate(0, 0); opacity: 0.12; }
          100% { transform: scale(1.1) translate(20px, 20px); opacity: 0.2; }
        }
        .login-container { width: 100%; max-width: 1100px; height: 100%; max-height: 750px; display: flex; gap: 40px; z-index: 10; position: relative; }
        .animate-slide-up { opacity: 0; transform: translateY(30px); animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up-slow { opacity: 0; transform: translateY(50px); animation: slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { opacity: 0; animation: fadeIn 1s ease-in forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.6s; }
        .delay-6 { animation-delay: 0.8s; }
        @keyframes slideUpFade { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { to { opacity: 1; } }
        .left-panel { flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: left; }
        .brand-header { display: flex; align-items: center; gap: 10px; margin-bottom: 25px; }
        .brand-logo { height: 42px; width: auto; mix-blend-mode: screen; } 
        .brand-name { font-size: 32px; font-weight: 800; letter-spacing: 1px; }
        .text-cyan { color: #06b6d4; }
        .main-heading { font-size: 38px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }
        .text-gradient { background: linear-gradient(to right, #a855f7, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { color: #9ca3af; font-size: 16px; max-width: 400px; line-height: 1.4; margin-bottom: 35px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .3d-hover-card { padding: 10px; border-radius: 16px; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s; }
        .3d-hover-card:hover { transform: translateY(-8px) scale(1.02); background: rgba(255, 255, 255, 0.02); }
        .feature-item h3 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .feature-item p { font-size: 12px; color: #6b7280; line-height: 1.4; }
        .feature-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: inset 0 2px 4px rgba(255,255,255,0.05), 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; transition: 0.3s; }
        .3d-hover-card:hover .feature-icon { box-shadow: inset 0 2px 4px rgba(255,255,255,0.2), 0 8px 15px rgba(168, 85, 247, 0.2); }
        .icon-purple { color: #a855f7; }
        .icon-cyan { color: #06b6d4; }
        .pagination-dots { display: flex; gap: 6px; margin-top: 40px; }
        .dot { height: 5px; width: 14px; border-radius: 10px; background: rgba(255, 255, 255, 0.2); transition: 0.3s; }
        .dot.active { width: 22px; background: #a855f7; box-shadow: 0 0 10px #a855f7; }
        .right-panel { flex: 1; display: flex; align-items: center; justify-content: center; }
        .entry-wrapper { width: 100%; display: flex; align-items: center; justify-content: center; }
        .animate-float { animation: floatCard 6s ease-in-out infinite; }
        @keyframes floatCard { 0% { transform: translateY(0px) rotateX(0deg); } 50% { transform: translateY(-10px) rotateX(2deg); } 100% { transform: translateY(0px) rotateX(0deg); } }
        .login-card-3d { background: rgba(18, 18, 26, 0.65); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-top: 1px solid rgba(255, 255, 255, 0.25); border-left: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 35px 40px; width: 100%; max-width: 420px; box-shadow: 0 35px 65px rgba(0, 0, 0, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.05); max-height: 100%; overflow-y: auto; position: relative; transform-style: preserve-3d; transition: border-color 0.4s; }
        .login-card-3d::-webkit-scrollbar { display: none; }
        .theme-toggle { position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; color: #9ca3af; cursor: pointer; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); transition: 0.3s; }
        .theme-toggle:hover { background: rgba(255, 255, 255, 0.15); color: #fff; transform: rotate(15deg); }
        .login-card-3d h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .card-subtitle { color: #9ca3af; font-size: 13px; margin-bottom: 25px; }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .input-group { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #6b7280; display: flex; pointer-events: none; transition: 0.3s; }
        .input-group input { width: 100%; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px 12px 12px 42px; color: #ffffff; font-size: 14px; outline: none; box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.8); transition: all 0.3s ease; }
        .input-group input:focus { border-color: #a855f7; background: rgba(0,0,0,0.7); box-shadow: inset 0 2px 6px rgba(0,0,0,0.8), 0 0 15px rgba(168,85,247,0.2); }
        .input-group input:focus + .input-icon, .input-group:focus-within .input-icon { color: #a855f7; transform: translateY(-50%) scale(1.1); }
        .eye-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #6b7280; cursor: pointer; display: flex; transition: 0.3s; }
        .eye-btn:hover { color: #fff; }
        .forgot-password { text-align: right; }
        .forgot-password a { color: #a855f7; font-size: 13px; text-decoration: none; transition: 0.2s; }
        .forgot-password a:hover { color: #fff; text-shadow: 0 0 8px rgba(168,85,247,0.8); }
        .btn-primary-3d { width: 100%; background: linear-gradient(135deg, #a855f7, #3b82f6); color: #ffffff; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 10px 20px -5px rgba(168, 85, 247, 0.6), inset 0 2px 0 rgba(255,255,255,0.3); transition: all 0.3s; position: relative; overflow: hidden; }
        .shine-effect::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent); transform: skewX(-20deg); animation: shine 3s infinite; }
        @keyframes shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }
        .divider { display: flex; align-items: center; margin: 20px 0; }
        .divider::before, .divider::after { content: ""; flex: 1; border-top: 1px solid rgba(255,255,255,0.1); }
        .divider span { padding: 0 12px; color: #6b7280; font-size: 11px; }
        .social-logins { display: flex; flex-direction: column; gap: 10px; }
        .btn-social { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #ffffff; border-radius: 12px; padding: 10px; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transition: all 0.3s; }
        .btn-social:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.3); }
        .signup-text { text-align: center; font-size: 13px; color: #9ca3af; margin-top: 25px; }
        .signup-text a { color: #a855f7; text-decoration: none; font-weight: 500; transition: 0.2s; }
        .signup-text a:hover { color: #fff; text-shadow: 0 0 8px rgba(168,85,247,0.8); }
        
        .footer { 
          position: fixed; 
          bottom: 10px; 
          left: 0;
          width: 100%; 
          text-align: center; 
          font-size: 11px; 
          color: #4b5563; 
          z-index: 20;
          pointer-events: none;
        }

        @media (max-width: 1024px) { 
          .left-panel { display: none; } 
          .login-container { max-width: 450px; } 
        }
      `}</style>
    </div>
  );
}