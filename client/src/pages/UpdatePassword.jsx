import React, { useState } from 'react';
import { auth } from '../firebase'; 
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const user = auth.currentUser;

    if (!user) {
      setErrorMsg("No user is currently logged in.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Re-authenticate the user (Security verification)
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Step 2: Update to the new password
      await updatePassword(user, newPassword);
      
      setSuccessMsg("Password updated successfully! 🎉");
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error("Update Password Error:", error);
      // Customizing Firebase error messages for better UI
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
    <div className="update-password-wrapper">
      <div className="settings-card-3d animate-slide-up">
        
        <h2>Update Password 🔐</h2>
        <p className="card-subtitle">Secure your Streamify account</p>

        {successMsg && <div className="success-banner">{successMsg}</div>}
        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        <form className="update-form" onSubmit={handleUpdatePassword}>
          
          {/* CURRENT PASSWORD */}
          <div className="input-group">
            <div className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <input 
              type="password" 
              placeholder="Enter current password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              required 
            />
          </div>

          {/* NEW PASSWORD */}
          <div className="input-group">
            <div className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <input 
              type="password" 
              placeholder="Enter new strong password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              minLength="6"
            />
          </div>

          <button type="submit" className="btn-primary-3d shine-effect" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

      </div>

      <style>{`
        .update-password-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          width: 100%;
        }

        .settings-card-3d { 
          background: rgba(18, 18, 26, 0.75); 
          backdrop-filter: blur(24px); 
          border: 1px solid rgba(255, 255, 255, 0.08); 
          border-top: 1px solid rgba(255, 255, 255, 0.25); 
          border-radius: 24px; 
          padding: 40px; 
          width: 100%; 
          max-width: 450px; 
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); 
        }

        .settings-card-3d h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; color: #fff;}
        .card-subtitle { color: #9ca3af; font-size: 13px; margin-bottom: 25px; }
        
        .update-form { display: flex; flex-direction: column; gap: 16px; }
        
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