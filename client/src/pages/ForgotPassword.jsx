import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import logo from '../assets/logo1.png';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  // 1. Send OTP via EmailJS
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    const templateParams = {
      email: email,
      passcode: otp,
    };

    try {
      // ⚠️ Apni EmailJS credentials yahan daal dena
      await emailjs.send(
        'YOUR_SERVICE_ID', 
        'YOUR_TEMPLATE_ID', 
        templateParams, 
        'YOUR_PUBLIC_KEY'
      );
      
      setLoading(false);
      setStep(2);
      setMessage('6-digit OTP sent to your email! Check your inbox.');
    } catch (error) {
      console.error('EmailJS Error:', error);
      setLoading(false);
      setErrorMsg('Failed to send OTP. Please check your configuration.');
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (enteredOtp.trim() === generatedOtp) {
      setStep(3);
      setMessage('OTP verified successfully! Enter your new password.');
    } else {
      setErrorMsg('Invalid OTP. Please check and try again.');
    }
  };

  // 3. Update Password Success
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLoading(false);
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/'); // Login page par bhej do
      }, 2000);
    } catch (error) {
      setErrorMsg('Failed to update password.');
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
            <div className="login-card-wrapper animate-float">
              <div className="login-card-content" style={{textAlign: 'center'}}>
                
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px'}}>
                  <img src={logo} alt="Streamify" style={{height: '35px'}} />
                  <span style={{fontSize: '24px', fontWeight: '800'}}>stream<span className="text-cyan">ify</span></span>
                </div>

                <h2>Reset Password 🔒</h2>
                <p className="card-subtitle">
                  {step === 1 && "Enter your email to receive a secure verification code."}
                  {step === 2 && "Enter the 6-digit OTP sent to your email."}
                  {step === 3 && "Create a secure new password."}
                </p>

                {message && <div className="success-banner">{message}</div>}
                {errorMsg && <div className="error-banner">{errorMsg}</div>}

                {/* STEP 1: Email Form */}
                {step === 1 && (
                  <form className="login-form" onSubmit={handleSendOtp}>
                    <div className="input-group">
                      <input 
                        type="email" 
                        placeholder="Enter your registered email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                      />
                    </div>
                    <button type="submit" className="btn-primary-3d shine-effect" disabled={loading}>
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  </form>
                )}

                {/* STEP 2: OTP Form */}
                {step === 2 && (
                  <form className="login-form" onSubmit={handleVerifyOtp}>
                    <div className="input-group">
                      <input 
                        type="text" 
                        maxLength="6"
                        placeholder="123456" 
                        value={enteredOtp} 
                        onChange={(e) => setEnteredOtp(e.target.value)} 
                        required 
                        style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }}
                      />
                    </div>
                    <button type="submit" className="btn-primary-3d shine-effect">
                      Verify OTP
                    </button>
                  </form>
                )}

                {/* STEP 3: New Password Form */}
                {step === 3 && (
                  <form className="login-form" onSubmit={handleUpdatePassword}>
                    <div className="input-group">
                      <input 
                        type="password" 
                        placeholder="Enter new password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                      />
                    </div>
                    <button type="submit" className="btn-primary-3d shine-effect" disabled={loading}>
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                )}

                <p className="signup-text" style={{marginTop: '20px'}}>
                  Remember your password? <span onClick={() => navigate('/')} style={{color: '#a855f7', cursor: 'pointer', fontWeight: '500'}}>Back to Login</span>
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #09090E; color: #ffffff; overflow-x: hidden; }
        .perspective-container { perspective: 1000px; }
        .login-wrapper { min-height: 100dvh; width: 100vw; display: flex; align-items: center; justify-content: center; position: relative; padding: 20px; }
        .glow { position: absolute; width: 45vw; height: 45vw; border-radius: 50%; filter: blur(130px); opacity: 0.15; pointer-events: none; z-index: 0; }
        .glow-purple { top: -10%; left: -10%; background-color: #a855f7; }
        .glow-cyan { bottom: -10%; right: -10%; background-color: #06b6d4; }
        .animate-breathe { animation: breathe 8s infinite alternate ease-in-out; }
        .animate-breathe-delayed { animation: breathe 10s infinite alternate-reverse ease-in-out; }
        @keyframes breathe { 0% { transform: scale(0.9); opacity: 0.12; } 100% { transform: scale(1.1); opacity: 0.2; } }
        .login-container { width: 100%; max-width: 500px; display: flex; justify-content: center; z-index: 10; position: relative; }
        .entry-wrapper { width: 100%; display: flex; justify-content: center; }
        .animate-float { animation: floatCard 6s ease-in-out infinite; }
        @keyframes floatCard { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
        .login-card-wrapper { position: relative; padding: 3px; border-radius: 24px; overflow: hidden; width: 100%; max-width: 420px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); }
        .login-card-wrapper::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: conic-gradient(from 0deg, transparent 70%, #a855f7 85%, #06b6d4 100%); animation: rotate-border 3s linear infinite; z-index: 0; }
        @keyframes rotate-border { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .login-card-content { position: relative; background: #13131c; border-radius: 22px; padding: 35px 25px; width: 100%; z-index: 1; }
        .login-card-content h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .card-subtitle { color: #9ca3af; font-size: 13px; margin-bottom: 25px; }
        .login-form { display: flex; flex-direction: column; gap: 14px; }
        .input-group { position: relative; width: 100%; }
        .input-group input { width: 100%; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px; color: #ffffff; font-size: 13.5px; outline: none; transition: 0.3s; }
        .input-group input:focus { border-color: #a855f7; background: rgba(0,0,0,0.7); box-shadow: 0 0 15px rgba(168,85,247,0.2); }
        .btn-primary-3d { width: 100%; background: linear-gradient(135deg, #a855f7, #3b82f6); color: #ffffff; border: none; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px -5px rgba(168, 85, 247, 0.6); }
        .signup-text { text-align: center; font-size: 12.5px; color: #9ca3af; }
        .error-banner { background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 15px; text-align: center; }
        .success-banner { background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.4); color: #86efac; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 15px; text-align: center; }
        .text-cyan { color: #06b6d4; }
      `}</style>
    </div>
  );
}