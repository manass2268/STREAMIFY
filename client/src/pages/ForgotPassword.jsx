import React, { useState } from 'react';
import logo from '../assets/logo1.png'; 
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase'; 

export default function ForgotPassword({ backToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset link sent! Check your inbox.');
      setLoading(false);
    } catch (error) {
      console.error("Reset Error:", error.message);
      setErrorMsg(error.message.replace("Firebase: ", ""));
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper perspective-container">
      <div className="glow glow-purple animate-breathe"></div>
      <div className="glow glow-cyan animate-breathe-delayed"></div>

      <div className="login-container" style={{justifyContent: 'center'}}>
        <div className="right-panel" style={{flex: 'none', width: '100%', maxWidth: '450px'}}>
          <div className="entry-wrapper animate-slide-up-slow">
            <div className="login-card-3d animate-float" style={{textAlign: 'center'}}>
              
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px'}}>
                <img src={logo} alt="Streamify" style={{height: '35px'}} />
                <span style={{fontSize: '24px', fontWeight: '800'}}>stream<span className="text-cyan">ify</span></span>
              </div>

              <h2>Reset Password 🔒</h2>
              <p className="card-subtitle">Enter your email and we'll send you a link to get back into your account.</p>

              {message && <div className="success-banner">{message}</div>}
              {errorMsg && <div className="error-banner">{errorMsg}</div>}

              <form className="login-form" onSubmit={handleResetPassword}>
                <div className="input-group">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <input 
                    type="email" 
                    placeholder="Enter your registered email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>

                <button type="submit" className="btn-primary-3d shine-effect" disabled={loading}>
                  {loading ? "Sending Link..." : "Send Reset Link"}
                </button>
              </form>

              <p className="signup-text" style={{marginTop: '20px'}}>
                Remember your password? <span onClick={backToLogin} style={{color: '#a855f7', cursor: 'pointer', fontWeight: '500'}}>Back to Login</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer animate-fade-in">© 2026 Streamify. All rights reserved.</div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #09090E; color: #ffffff; overflow: hidden; }
        .perspective-container { perspective: 1000px; }
        .login-wrapper { height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; position: relative; padding: 2vh 4vw; }
        .glow { position: absolute; width: 45vw; height: 45vw; border-radius: 50%; filter: blur(130px); opacity: 0.15; pointer-events: none; z-index: 0; }
        .glow-purple { top: -10%; left: -10%; background-color: #a855f7; }
        .glow-cyan { bottom: -10%; right: -10%; background-color: #06b6d4; }
        .animate-breathe { animation: breathe 8s infinite alternate ease-in-out; }
        .animate-breathe-delayed { animation: breathe 10s infinite alternate-reverse ease-in-out; }
        @keyframes breathe { 0% { transform: scale(0.9); opacity: 0.12; } 100% { transform: scale(1.1); opacity: 0.2; } }
        .login-container { width: 100%; max-width: 1100px; display: flex; justify-content: center; z-index: 10; position: relative; }
        .entry-wrapper { width: 100%; display: flex; justify-content: center; }
        .animate-float { animation: floatCard 6s ease-in-out infinite; }
        @keyframes floatCard { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .login-card-3d { background: rgba(18, 18, 26, 0.65); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-top: 1px solid rgba(255, 255, 255, 0.25); border-radius: 24px; padding: 35px 40px; width: 100%; max-width: 420px; box-shadow: 0 35px 65px rgba(0, 0, 0, 0.7); }
        .login-card-3d h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .card-subtitle { color: #9ca3af; font-size: 13px; margin-bottom: 25px; }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .input-group { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #6b7280; display: flex; pointer-events: none; }
        .input-group input { width: 100%; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px 12px 12px 42px; color: #ffffff; font-size: 14px; outline: none; transition: 0.3s; }
        .input-group input:focus { border-color: #a855f7; background: rgba(0,0,0,0.7); box-shadow: 0 0 15px rgba(168,85,247,0.2); }
        .btn-primary-3d { width: 100%; background: linear-gradient(135deg, #a855f7, #3b82f6); color: #ffffff; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        .signup-text { text-align: center; font-size: 13px; color: #9ca3af; }
        .error-banner { background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 15px; text-align: center; }
        .success-banner { background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.4); color: #86efac; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 15px; text-align: center; }
        .footer { position: fixed; bottom: 10px; width: 100%; text-align: center; font-size: 11px; color: #4b5563; z-index: 20; pointer-events: none; }
      `}</style>
    </div>
  );
}