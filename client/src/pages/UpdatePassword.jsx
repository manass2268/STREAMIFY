import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import { auth } from '../firebase'; 
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword, 
  signOut,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth'; 

export default function UpdatePassword() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode'); // Firebase reset token URL se nikal raha hai

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetEmail, setResetEmail] = useState(''); // Reset link wale user ka email
  
  const navigate = useNavigate(); 

  // 🔥 Agar user email ki link se aaya hai, toh link verify karo
  useEffect(() => {
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setResetEmail(email);
        })
        .catch((error) => {
          setErrorMsg("This reset link is invalid or has expired. Please request a new one.");
        });
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let targetEmail = '';

      if (oobCode) {
        // --- 1. RESET PASSWORD FLOW (From Email Link) ---
        if (!resetEmail) throw new Error("Invalid reset link.");
        
        await confirmPasswordReset(auth, oobCode, newPassword);
        targetEmail = resetEmail;
        setSuccessMsg("Password reset successfully! Redirecting to login... 🎉");

      } else {
        // --- 2. UPDATE PASSWORD FLOW (Logged-In User) ---
        const user = auth.currentUser;
        if (!user) throw new Error("No user is currently logged in.");

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        
        targetEmail = user.email;
        setSuccessMsg("Password updated successfully! Sending to login... 🎉");
      }

      // 🔥 Step 3: Backend API call for automatic email notification
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://streamify-backend-ptmq.onrender.com'; 

      try {
        await fetch(`${API_URL}/api/send-password-update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail })
        });
      } catch (backendError) {
        console.error("Email notification failed, but password was updated.");
      }

      // 🔥 Step 4: User ko logout karke Login page par redirect karo
      setTimeout(async () => {
        if (auth.currentUser) await signOut(auth); 
        navigate('/login');  
      }, 2500);

    } catch (error) {
      console.error("Password Action Error:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setErrorMsg("Incorrect current password. Please try again.");
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg("New password should be at least 6 characters.");
      } else {
        setErrorMsg(error.message.replace("Firebase: ", ""));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-password-wrapper perspective-container">
      <div className="glow glow-purple animate-breathe"></div>
      <div className="glow glow-cyan animate-breathe-delayed"></div>

      <div className="settings-card-wrapper animate-slide-up">
        <div className="settings-card-content">
          
          {/* Title change hoga situation ke hisaab se */}
          <h2 style={{ textAlign: 'center' }}>
            {oobCode ? "Reset Password 🔒" : "Update Password 🔐"}
          </h2>
          <p className="card-subtitle" style={{ textAlign: 'center' }}>Secure your Streamify account</p>

          {successMsg && <div className="success-banner">{successMsg}</div>}
          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          {/* Form tab tak nahi dikhega jab tak invalid reset link ho */}
          {(!oobCode || resetEmail) && (
            <form className="update-form" onSubmit={handleSubmit}>
              
              {/* CURRENT PASSWORD (Sirf tab dikhega jab user link se NAHI aaya ho) */}
              {!oobCode && (
                <div className="input-group">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <input 
                    type="password" 
                    placeholder="Enter current password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required={!oobCode}
                  />
                </div>
              )}

              {/* NEW PASSWORD (Dono cases mein dikhega) */}
              <div className="input-group">
                <div className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <input 
                  type="password" 
                  placeholder={oobCode ? "Enter new password" : "Enter new strong password"}
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
              </div>

              <button type="submit" className="btn-primary-3d shine-effect" disabled={loading}>
                {loading ? "Processing..." : (oobCode ? "Reset Password" : "Update Password")}
              </button>
            </form>
          )}

        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .update-password-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          width: 100vw;
          min-height: 100vh;
          background-color: #09090E;
          position: relative;
          overflow: hidden;
        }

        .perspective-container { perspective: 1000px; }

        .glow { position: absolute; width: 45vw; height: 45vw; border-radius: 50%; filter: blur(130px); opacity: 0.15; pointer-events: none; z-index: 0; }
        .glow-purple { top: -10%; left: -10%; background-color: #a855f7; }
        .glow-cyan { bottom: -10%; right: -10%; background-color: #06b6d4; }
        .animate-breathe { animation: breathe 8s infinite alternate ease-in-out; }
        .animate-breathe-delayed { animation: breathe 10s infinite alternate-reverse ease-in-out; }
        @keyframes breathe { 0% { transform: scale(0.9) translate(0, 0); opacity: 0.12; } 100% { transform: scale(1.1) translate(20px, 20px); opacity: 0.2; } }

        .settings-card-wrapper {
          position: relative;
          padding: 3px; 
          border-radius: 24px;
          overflow: hidden;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          z-index: 10;
        }

        .settings-card-wrapper::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: conic-gradient(from 0deg, transparent 70%, #a855f7 85%, #06b6d4 100%);
          animation: rotate-border 3s linear infinite;
          z-index: 0;
        }

        @keyframes rotate-border {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .settings-card-content {
          position: relative;
          background: #13131c; 
          border-radius: 22px;
          padding: 40px;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .settings-card-content h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; color: #fff;}
        .card-subtitle { color: #9ca3af; font-size: 13px; margin-bottom: 25px; }
        
        .update-form { display: flex; flex-direction: column; gap: 16px; width: 100%; }
        
        .input-group { position: relative; width: 100%; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #6b7280; display: flex; pointer-events: none; }
        
        .input-group input { 
          width: 100%; 
          background: rgba(0, 0, 0, 0.5); 
          border: 1px solid rgba(255,255,255,0.05); 
          border-radius: 12px; 
          padding: 12px 12px 12px 42px; 
          color: #ffffff; 
          font-size: 14px; 
          outline: none; 
          transition: 0.3s; 
          box-sizing: border-box; 
        }
        
        .input-group input:focus { 
          border-color: #a855f7; 
          background: rgba(0,0,0,0.7); 
          box-shadow: 0 0 15px rgba(168,85,247,0.2); 
        }

        .btn-primary-3d { 
          width: 100%; 
          background: linear-gradient(135deg, #a855f7, #3b82f6); 
          color: #ffffff; 
          border: none; 
          border-radius: 12px; 
          padding: 14px; 
          font-size: 15px; 
          font-weight: 600; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          cursor: pointer; 
          transition: 0.3s; 
          box-shadow: 0 10px 20px -5px rgba(168, 85, 247, 0.6); 
          margin-top: 10px;
        }
        .btn-primary-3d:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(168, 85, 247, 0.8); }

        .error-banner { background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; text-align: center; }
        .success-banner { background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.4); color: #86efac; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; text-align: center; }

        .animate-slide-up { opacity: 0; transform: translateY(30px); animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideUpFade { to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}