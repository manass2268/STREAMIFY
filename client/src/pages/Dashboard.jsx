import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';
import { auth, realtimeDb, db } from '../firebase';
import { signOut, updateProfile, onAuthStateChanged } from 'firebase/auth'; // 🔥 onAuthStateChanged ADD KIYA HAI 🔥
import { ref, set, onDisconnect } from 'firebase/database';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export default function Dashboard() {
  // 🔥 1. LOCAL STORAGE PERSISTENCE (Taaki refresh par wahi page khule) 🔥
  const [showGate, setShowGate] = useState(() => {
    const saved = localStorage.getItem('showGate');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'home');
  const [currentProfile, setCurrentProfile] = useState(() => localStorage.getItem('currentProfile') || null);

  const [pinProfile, setPinProfile] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const pinInputRef = useRef(null);

  const [userData, setUserData] = useState({ name: 'Loading...', email: '', role: 'standard_user', plan: 'free', photoURL: '', uid: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [profiles, setProfiles] = useState([]);
  const [videoQuality, setVideoQuality] = useState('1080p Full HD');
  const [autoPlay, setAutoPlay] = useState(true);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileType, setNewProfileType] = useState('adult');
  const [newAvatar, setNewAvatar] = useState('😊');
  const avatarOptions = ['👩', '👨‍🚀', '😊', '🐼', '🧛‍♂️'];
  
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isOpenQualityDropdown, setIsOpenQualityDropdown] = useState(false);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Loading State
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [friendSearch, setFriendSearch] = useState('');
  const [friendsList, setFriendsList] = useState([
    { id: 1, name: 'Rahul Sharma', avatar: '👨‍🚀', isOnline: true, watching: 'Cyberpunk Chronicles' },
    { id: 2, name: 'Priya Patel', avatar: '👩', isOnline: false, watching: null },
    { id: 3, name: 'Amit Kumar', avatar: '🐼', isOnline: true, watching: 'Elite Force' },
    { id: 4, name: 'Neha Gupta', avatar: '🧛‍♀️', isOnline: false, watching: null }
  ]);
  
  const navigate = useNavigate();

  const showCustomToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // 🔥 2. STATE SAVE KARNE WALA EFFECT 🔥
  useEffect(() => {
    localStorage.setItem('showGate', JSON.stringify(showGate));
    localStorage.setItem('activeTab', activeTab);
    if (currentProfile) localStorage.setItem('currentProfile', currentProfile);
  }, [showGate, activeTab, currentProfile]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔥 3. AUTH STATE CHANGED HOOK (Refresh par data gayab hone ka 100% fix) 🔥
  useEffect(() => {
    let unsubscribeFirestore = null;
    let userStatusRef = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User logged in hai, RTDB connect karo
        userStatusRef = ref(realtimeDb, '/online_users/' + currentUser.uid);
        set(userStatusRef, { name: currentUser.displayName || 'User', online: true, timestamp: Date.now() });
        onDisconnect(userStatusRef).remove();

        // Firestore Data Fetch
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({ 
              uid: currentUser.uid, 
              name: data.name || currentUser.displayName || 'User', 
              email: data.email || currentUser.email || '', 
              role: data.role || 'standard_user', 
              plan: data.subscriptionPlan || 'free', 
              photoURL: currentUser.photoURL || '' 
            });
            setEditName(data.name || currentUser.displayName || '');
            
            if (data.profiles && Array.isArray(data.profiles) && data.profiles.length > 0) {
              setProfiles(data.profiles);
            } else {
              const defaultProfile = [{ id: 1, name: currentUser.displayName || 'Main User', type: 'adult', avatar: '👑', pin: null }];
              setDoc(userDocRef, { profiles: defaultProfile }, { merge: true });
              setProfiles(defaultProfile);
            }

            if (data.settings) { 
              if(data.settings.videoQuality) setVideoQuality(data.settings.videoQuality); 
              if(data.settings.autoPlay !== undefined) setAutoPlay(data.settings.autoPlay); 
            }
          } else {
            const defaultProfile = [{ id: 1, name: currentUser.displayName || 'Main User', type: 'adult', avatar: '👑', pin: null }];
            setDoc(userDocRef, { 
              name: currentUser.displayName || 'User', 
              email: currentUser.email || '', 
              role: 'standard_user', 
              subscriptionPlan: 'free', 
              profiles: defaultProfile, 
              settings: { videoQuality: '1080p Full HD', autoPlay: true } 
            }, { merge: true });
            setProfiles(defaultProfile);
          }
          
          setIsProfileLoading(false); // Data fetch ho gaya, loading band!
        }, (error) => {
          console.error("Firestore Sync Error:", error);
          setIsProfileLoading(false);
          showCustomToast("Sync Error: Please check database connection.", "error");
        });

      } else {
        // Agar user session expire ho gaya toh login par bhej do
        setIsProfileLoading(false);
        navigate('/login');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (userStatusRef) set(userStatusRef, null);
    };
  }, [navigate]);

  useEffect(() => {
    if (pinProfile && pinInputRef.current) pinInputRef.current.focus();
  }, [pinProfile]);

  const handleAction = async (actionType, e = null) => {
    if (e) e.preventDefault();
    const currentUser = auth.currentUser;

    try {
      if (actionType === 'logout') {
        localStorage.clear(); // Logout par sab clear kar do
        if (currentUser) await set(ref(realtimeDb, '/online_users/' + currentUser.uid), null); 
        await signOut(auth); 
        navigate('/login');
      } 
      else if (actionType === 'saveProfile') {
        if (!editName.trim() || !currentUser) return; setIsUpdating(true); await updateProfile(currentUser, { displayName: editName }); await updateDoc(doc(db, 'users', currentUser.uid), { name: editName });
        showCustomToast("Master profile upgraded successfully! 🚀", "success"); setShowProfileModal(false);
      } 
      else if (actionType === 'addProfile') {
        if (!newProfileName.trim()) {
          showCustomToast("Please enter a Profile Name!", "error");
          return;
        }
        if (!currentUser) return;
        
        const newObj = { 
          id: Date.now(), 
          name: newProfileName.trim(), 
          type: newProfileType, 
          avatar: newProfileType === 'kids' ? '🧸' : newAvatar, 
          pin: null 
        };
        
        const previousProfiles = [...profiles]; 
        const updatedProfilesList = [...profiles, newObj];
        setProfiles(updatedProfilesList); 
        
        setNewProfileName(''); 
        setNewProfileType('adult');
        setNewAvatar('😊');
        setShowAddProfileModal(false); 

        try {
          await setDoc(doc(db, 'users', currentUser.uid), { profiles: updatedProfilesList }, { merge: true });
          showCustomToast(`Created Profile: ${newObj.name}! ✨ Saved to Cloud.`, "success");
        } catch (err) {
          console.error("FIREBASE SYNC ERROR:", err);
          setProfiles(previousProfiles);
          showCustomToast(`Cloud Save Failed! Check Firestore Rules or Connection.`, "error");
        }
      } 
      else if (actionType === 'createRoom') {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        await set(ref(realtimeDb, 'rooms/' + roomId), { hostId: currentUser?.uid, hostName: userData.name, createdAt: Date.now(), status: 'waiting' });
        showCustomToast(`Room Created for Live Sync! ID: ${roomId}`, "success");
      } 
      else if (actionType === 'joinRoom') {
        if (!roomIdInput.trim()) return showCustomToast("Please enter a valid Stream Room ID!", "error");
        showCustomToast(`Connecting to Room ${roomIdInput.toUpperCase()} via Live Nodes...`, "success");
      }
      else if (actionType === 'addFriend') {
        if (!friendSearch.trim()) return showCustomToast("Enter a username or email first!", "error");
        showCustomToast(`Friend request sent to ${friendSearch}! 🤝`, "success"); setFriendSearch('');
      }
    } catch (error) { 
      console.error(error);
      showCustomToast(`Failed: Check network or database configuration`, "error"); 
    } 
    finally { setIsUpdating(false); }
  };

  const handleSettingsUpdate = async (key, value) => {
    if(key === 'quality') setVideoQuality(value); if(key === 'autoPlay') setAutoPlay(value);
    if(auth.currentUser) { await updateDoc(doc(db, 'users', auth.currentUser.uid), { [`settings.${key === 'quality' ? 'videoQuality' : 'autoPlay'}`]: value }); showCustomToast("Settings synced with Cloud!", "success"); }
  };

  const handleProfileClick = (profile) => {
    if (profile.pin && profile.pin.length === 4) {
      setPinProfile(profile); setPinInput('');
    } else {
      setCurrentProfile(profile.name); setShowGate(false); showCustomToast(`Welcome back, ${profile.name}! 🍿`, 'success');
    }
  };

  const handlePinChange = (val) => {
    const onlyNums = val.replace(/[^0-9]/g, '');
    setPinInput(onlyNums);
    if (onlyNums.length === 4) {
      if (onlyNums === pinProfile.pin) {
        setCurrentProfile(pinProfile.name); setShowGate(false); setPinProfile(null); setPinInput(''); showCustomToast(`Welcome back, ${pinProfile.name}! 🍿`, 'success');
      } else {
        showCustomToast("Incorrect PIN. Please try again.", "error"); setPinInput('');
      }
    }
  };

  const toggleProfilePin = async (action) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    let updatedProfiles = profiles.map(p => { if (p.name === currentProfile) { return { ...p, pin: action === 'set' ? setupPin : null }; } return p; });
    await updateDoc(doc(db, 'users', currentUser.uid), { profiles: updatedProfiles });
    setProfiles(updatedProfiles);
    showCustomToast(action === 'set' ? "Profile Lock Enabled! 🔒" : "Profile Lock Removed! 🔓", "success"); setSetupPin('');
  };

  const currentProfObj = profiles.find(p => p.name === currentProfile);
  const isCurrentlyLocked = currentProfObj?.pin && currentProfObj.pin.length === 4;

  const PremiumMovieCard = ({ bgImg, title, top10, labelTag }) => (
    <div className="net-movie-card">
      <div className="net-movie-bg" style={{ backgroundImage: `url(${bgImg})` }}></div>
      {top10 && <div className="net-top10-badge">TOP<br/>10</div>}
      <div className="net-movie-overlay"><h4 className="net-movie-title">{title}</h4><button className="net-play-mini">▶</button></div>
      {labelTag && <div className="net-label-tag">{labelTag}</div>}
    </div>
  );

  const renderAddProfileModal = () => (
    <div className="hs-modal-overlay animate-fade-in">
      <div className="hs-modal-content">
        <div className="hs-header">
          <button type="button" className="hs-back-btn" onClick={() => setShowAddProfileModal(false)}>←</button>
          <h2>Create Profile</h2>
          <div style={{ width: '24px' }}></div>
        </div>
        
        <form onSubmit={(e) => handleAction('addProfile', e)} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="hs-avatar-container">
            {avatarOptions.map((av) => (
              <div key={av} className={`hs-avatar ${newAvatar === av ? 'selected' : ''}`} onClick={() => setNewAvatar(av)}>{av}</div>
            ))}
          </div>
          
          <div className="hs-input-group">
            <input type="text" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} required autoFocus />
            <label>Profile Alias</label>
          </div>
          
          <div className="hs-kids-row">
            <span>Is this a Kids Profile?</span>
            <label className="switch-toggle">
              <input type="checkbox" checked={newProfileType === 'kids'} onChange={(e) => setNewProfileType(e.target.checked ? 'kids' : 'adult')} />
              <span className="slider-round"></span>
            </label>
          </div>
          
          <button type="submit" className="hs-fab" disabled={isUpdating}>✓</button>
        </form>
      </div>
    </div>
  );

  if (showGate) {
    return (
      <div className="gate-container">
        {toast.show && <div className={`custom-toast animate-toast-slide ${toast.type}`}><span className="toast-icon">{toast.type === 'success' ? '✨' : '🛡️'}</span><span className="toast-msg">{toast.message}</span></div>}
        <div className="gate-header"><img src={logo} alt="Logo" className="gate-logo" /><span className="brand-text-colored">stream<span className="text-cyan">ify</span></span></div>

        {isProfileLoading ? (
          <div className="animate-pulse-glow" style={{ fontSize: '20px', marginTop: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#808080' }}>
            Loading your profiles... 🍿
          </div>
        ) : pinProfile ? (
          <div className="pin-screen animate-fade-in">
            <p className="pin-subtitle">Profile Lock is currently on.</p><h1 className="pin-title">Enter your PIN to access this profile.</h1>
            <div className="pin-input-wrapper" onClick={() => pinInputRef.current?.focus()}>
              <input ref={pinInputRef} type="password" maxLength={4} value={pinInput} onChange={(e) => handlePinChange(e.target.value)} className="hidden-pin-input" autoFocus />
              {[0, 1, 2, 3].map(i => (<div key={i} className={`pin-box ${pinInput.length === i ? 'active' : ''}`}>{pinInput[i] ? '•' : ''}</div>))}
            </div>
            <button className="pin-back-btn" onClick={() => { setPinProfile(null); setPinInput(''); }}>Back to Profiles</button>
          </div>
        ) : (
          <div className="profiles-screen animate-fade-in">
            <h1 className="gate-main-title">Who's watching?</h1>
            <div className="gate-profiles-grid">
              {profiles.map(p => (
                <div key={p.id} className="gate-profile-card" onClick={() => handleProfileClick(p)}>
                  <div className="gate-avatar-box" style={p.avatar === '😊' ? {background: 'linear-gradient(135deg, #007bff, #a855f7)'} : {}}>{p.avatar}</div>
                  <span className="gate-profile-name">{p.name}</span>
                  {p.pin && p.pin.length === 4 && <span className="gate-lock-icon">🔒</span>}
                </div>
              ))}
              <div className="gate-profile-card" onClick={() => setShowAddProfileModal(true)}><div className="gate-avatar-box gate-add-box">+</div><span className="gate-profile-name">Add Profile</span></div>
            </div>
            <button className="gate-manage-btn" onClick={() => { if(profiles.length > 0) setCurrentProfile(profiles[0].name); setShowGate(false); setActiveTab('profiles'); }}>Manage Profiles</button>
          </div>
        )}

        {showAddProfileModal && renderAddProfileModal()}

        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .gate-container { width: 100vw; height: 100vh; background: #141414; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; overflow: hidden; }
          .gate-header { position: absolute; top: 30px; left: 4%; display: flex; align-items: center; gap: 10px; }
          .gate-logo { height: 36px; filter: drop-shadow(0 0 8px rgba(6,182,212,0.5)); }
          .brand-text-colored { font-size: 28px; font-weight: 900; color: #a855f7; letter-spacing: 1px; }
          .brand-text-colored .text-cyan { color: #06b6d4; }
          .gate-main-title { font-size: 3.5vw; font-weight: 500; margin-bottom: 2em; text-align: center; }
          .gate-profiles-grid { 
            display: flex !important; 
            flex-direction: row !important;
            align-items: center !important; 
            justify-content: center !important; 
            gap: 35px !important;
            flex-wrap: wrap !important; 
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
          }

          .gate-profile-card { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 12px; 
            cursor: pointer; 
            transition: transform 0.25s ease-in-out; 
          }

          .gate-profile-card:hover {
            transform: scale(1.08);
          }

          .gate-avatar-box { 
            width: 130px !important; 
            height: 130px !important; 
            border-radius: 8px; 
            background: linear-gradient(135deg, #a855f7, #06b6d4); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 55px; 
            border: 3px solid transparent; 
            transition: all 0.2s ease; 
          }

          .gate-profile-card:hover .gate-avatar-box {
            border-color: #ffffff !important;
          }

          .gate-add-box { background: transparent; border: 3px solid #808080; color: #808080; }
          .gate-profile-card:hover .gate-add-box { background: white; color: black; border-color: white; }

          .gate-profile-name {
            font-size: 16px !important;
            color: #808080;
            font-weight: 500;
            transition: color 0.2s ease;
          }

          .gate-profile-card:hover .gate-profile-name {
            color: #ffffff !important;
          }
          .gate-lock-icon { font-size: 16px; margin-top: -5px; color: #808080; }
          .gate-manage-btn { background: transparent; border: 1px solid #808080; color: #808080; padding: 10px 24px; font-size: 18px; font-weight: 500; cursor: pointer; transition: 0.3s; letter-spacing: 1px; margin-top: 4em; }
          .gate-manage-btn:hover { border-color: white; color: white; }
          .pin-screen { display: flex; flex-direction: column; align-items: center; }
          .pin-subtitle { font-size: 16px; color: #a3a3a3; margin-bottom: 10px; }
          .pin-title { font-size: 24px; font-weight: 500; margin-bottom: 30px; }
          .pin-input-wrapper { display: flex; gap: 15px; position: relative; cursor: pointer; margin-bottom: 50px; }
          .hidden-pin-input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; z-index: 10; }
          .pin-box { width: 60px; height: 60px; border: 1px solid #808080; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: transparent; transition: 0.3s; }
          .pin-box.active { border-color: white; border-width: 2px; }
          .pin-back-btn { background: transparent; color: #808080; border: none; font-size: 16px; cursor: pointer; transition: 0.2s; }
          .pin-back-btn:hover { color: white; text-decoration: underline; }

          .custom-toast { position: fixed; top: 80px; right: 30px; z-index: 9999; background: rgba(14,14,22,0.9); backdrop-filter: blur(25px); border: 1px solid rgba(229,9,20,0.5); padding: 16px 24px; border-radius: 8px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.85); font-weight: 600; font-size: 14px; }
          .animate-toast-slide { animation: toastSlide 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
          @keyframes toastSlide{from{opacity:0;transform:translateY(-30px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
          @keyframes fadeIn{from{opacity:0;}to{opacity:1;}} .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
          
          .hs-modal-overlay { position: fixed; inset: 0; background: #0a0a0c; z-index: 2000; display: flex; justify-content: center; align-items: center; }
          .hs-modal-content { width: 100%; max-width: 450px; height: 100vh; max-height: 850px; background: #0a0a0c; display: flex; flex-direction: column; padding: 25px; position: relative; box-shadow: 0 0 50px rgba(0,0,0,0.8); }
          .hs-header { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; margin-bottom: 50px; }
          .hs-back-btn { background: transparent; border: none; color: white; font-size: 26px; cursor: pointer; transition: 0.2s; }
          .hs-back-btn:hover { color: #e50914; }
          .hs-header h2 { font-size: 20px; font-weight: 600; color: white; }
          .hs-avatar-container { display: flex; gap: 20px; justify-content: center; align-items: center; margin-bottom: 60px; overflow-x: auto; padding-bottom: 15px; scrollbar-width: none; }
          .hs-avatar { min-width: 60px; height: 60px; border-radius: 50%; background: #1a1a24; display: flex; justify-content: center; align-items: center; font-size: 30px; cursor: pointer; opacity: 0.5; transition: 0.3s; filter: grayscale(80%); }
          .hs-avatar.selected { min-width: 90px; height: 90px; opacity: 1; filter: grayscale(0%); border: 3px solid white; background: linear-gradient(135deg, #007bff, #e50914); font-size: 45px; box-shadow: 0 0 25px rgba(229,9,20,0.4); }
          .hs-input-group { position: relative; margin-bottom: 35px; }
          .hs-input-group input { width: 100%; background: transparent; border: 1.5px solid #444; border-radius: 10px; padding: 18px 15px; color: white; font-size: 16px; outline: none; transition: 0.3s; }
          .hs-input-group input:focus { border-color: white; }
          .hs-input-group label { position: absolute; top: -10px; left: 15px; background: #0a0a0c; padding: 0 5px; font-size: 13px; color: #888; font-weight: 500; transition: 0.3s; }
          .hs-input-group input:focus + label { color: white; }
          .hs-kids-row { display: flex; justify-content: space-between; align-items: center; padding: 0 5px; color: #ccc; font-size: 15px; font-weight: 500; }
          .hs-fab { position: absolute; bottom: 40px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #007bff, #e50914); border: none; color: white; font-size: 24px; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(229,9,20,0.4); transition: 0.3s; }
          .hs-fab:hover { transform: scale(1.08); box-shadow: 0 15px 35px rgba(229,9,20,0.6); }

          @keyframes scaleUp{from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);}} .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
          @keyframes slideUpFade{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}} .animate-slide-up { animation: slideUpFade 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
          @keyframes fadeIn{from{opacity:0;}to{opacity:1;}} .animate-fade-in { animation: fadeIn 0.3s ease forwards; }

          @media (max-width: 900px) {
            .net-navbar { padding: 0 15px; }
            .net-nav-links { display: none; }
            .net-brand { font-size: 20px; }
            .net-search-box input { width: 120px; }
            .cinematic-title { font-size: 40px; }
            .title-sub { font-size: 25px; }
            .hero-content { margin-top: 20px; }
          }
          .animate-pulse-glow { animation: pulseGlowText 1.5s infinite alternate; }
          @keyframes pulseGlowText { from { opacity: 0.5; text-shadow: 0 0 10px rgba(255,255,255,0.2); } to { opacity: 1; text-shadow: 0 0 20px rgba(255,255,255,0.8); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container perspective-container">
      {activeTab !== 'home' && (
        <div className="ambient-background">
          <div className="aurora-orb orb-1 animate-float-slow"></div><div className="aurora-orb orb-2 animate-float-delayed"></div><div className="aurora-orb orb-3 animate-pulse-glow"></div>
        </div>
      )}

      {toast.show && <div className={`custom-toast animate-toast-slide ${toast.type}`}><span className="toast-icon">{toast.type === 'success' ? '✨' : '🛡️'}</span><span className="toast-msg">{toast.message}</span></div>}

      <nav className={`net-navbar ${isScrolled || activeTab !== 'home' ? 'scrolled' : ''}`}>
        <div className="net-nav-left">
          <div className="net-brand" onClick={() => { setShowGate(true); }}>
            <img src={logo} alt="Logo" className="brand-img" />
            <span className="brand-text-colored">stream<span className="text-cyan">ify</span></span>
          </div>
          <ul className="net-nav-links">
            <li className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>Home</li>
            <li className={activeTab === 'friends' ? 'active' : ''} onClick={() => setActiveTab('friends')}>Friends</li>
            <li className={activeTab === 'watchparty' ? 'active' : ''} onClick={() => setActiveTab('watchparty')}>Watch Party</li>
            <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Analytics</li>
          </ul>
        </div>
        <div className="net-nav-right">
          <div className="net-search-box"><span className="search-icon">🔍</span><input type="text" placeholder="Titles, people, genres" /></div>
          <div className="net-nav-icon">🔔<span className="net-badge">3</span></div>
          <div className="net-kids-link" onClick={() => { setCurrentProfile('Kids'); showCustomToast('Switched to Kids Safe Mode 🧸', 'success'); }}><div className="kids-avatar-mini">🧸</div><span>Children</span></div>
          
          <div className="net-profile-menu-container" onMouseEnter={() => setShowProfileMenu(true)} onMouseLeave={() => setShowProfileMenu(false)}>
            <div className="net-profile-trigger">
              <div className="net-main-avatar">{currentProfObj?.avatar || '👑'}</div>
              <span className={`net-caret ${showProfileMenu ? 'rotate' : ''}`}>▼</span>
            </div>
            
            {showProfileMenu && (
              <div className="net-dropdown-menu animate-fade-in">
                <div className="net-dropdown-profiles">
                  {profiles.map((p) => (
                    <div key={p.id} className="net-dropdown-profile-item" onClick={() => { handleProfileClick(p); setShowProfileMenu(false); }}>
                      <div className="net-dropdown-avatar" style={p.avatar === '😊' ? {background: 'linear-gradient(135deg, #007bff, #a855f7)'} : {}}>{p.avatar}</div>
                      <span className="net-dropdown-name">{p.name}</span>
                      {p.pin && p.pin.length === 4 && <span className="net-dropdown-lock">🔒</span>}
                    </div>
                  ))}
                </div>
                <div className="net-dropdown-links">
                  <div className="net-dropdown-item" onClick={() => { setShowGate(true); setShowProfileMenu(false); }}>
                    <span className="net-dropdown-icon">✏️</span> Manage Profiles
                  </div>
                  <div className="net-dropdown-item" onClick={() => { showCustomToast('Transfer Profile feature coming soon!', 'success'); setShowProfileMenu(false); }}>
                    <span className="net-dropdown-icon">🔁</span> Transfer Profile
                  </div>
                  <div className="net-dropdown-item" onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}>
                    <span className="net-dropdown-icon">👤</span> Account Settings
                  </div>
                </div>
                <div className="net-dropdown-divider"></div>
                <div className="net-dropdown-item sign-out" onClick={() => handleAction('logout')}>Sign out of Streamify</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className={`main-content no-sidebar ${activeTab === 'home' ? 'home-active' : ''}`}>
        
        {activeTab === 'home' && (
          <div className="tab-content animate-fade-in">
            <div className="net-hero-banner">
              <div className="net-hero-vignette"></div>
              <div className="net-hero-content">
                <div className="net-series-logo"><h1 className="cinematic-title">CYBERPUNK<br/><span className="title-sub">CHRONICLES</span></h1></div>
                <div className="net-hero-meta"><span className="net-match">98% Match</span><span>2026</span><span className="net-age">U/A 16+</span><span>2 Seasons</span><span className="net-hd">4K Ultra HD</span></div>
                <p className="net-hero-desc">In a dystopian neon-lit metropolis, a rogue hacker and an ex-cop uncover a massive digital conspiracy that threatens the entire grid. Shooting to the No. 1 spot worldwide.</p>
                <div className="net-hero-buttons">
                  <button className="net-btn-play" onClick={() => showCustomToast(`Streaming in ${videoQuality}...`, "success")}><span style={{fontSize:'24px', marginRight:'5px'}}>▶</span> Play</button>
                  <button className="net-btn-info" onClick={() => setActiveTab('watchparty')}><span style={{fontSize:'20px', marginRight:'8px'}}>ℹ️</span> More Info</button>
                </div>
              </div>
            </div>

            <div className="net-sliders-container">
              <div className="net-slider-row">
                <h3 className="net-row-title">Meet Your Next Binge</h3>
                <div className="net-movie-list">
                  {currentProfile === 'Kids' ? (
                    <><PremiumMovieCard title="Panda's Journey" bgImg="https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=600" labelTag="New Episode" /><PremiumMovieCard title="Space Toys" bgImg="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600" top10 labelTag="Watch Now" /><PremiumMovieCard title="Ocean Friends" bgImg="https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=600" labelTag="Recently added" /></>
                  ) : (
                    <><PremiumMovieCard title="Lock Upp" bgImg="https://images.unsplash.com/photo-1574682715975-eb658fbce5ee?q=80&w=600" top10 labelTag="New Episode" /><PremiumMovieCard title="Elite Force" bgImg="https://images.unsplash.com/photo-1506506307338-7f99990b79ac?q=80&w=600" top10 labelTag="Recently added" /><PremiumMovieCard title="Human Vapor" bgImg="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600" labelTag="Watch Now" /><PremiumMovieCard title="Flunked" bgImg="https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=600" labelTag="Recently added" /><PremiumMovieCard title="The Detective" bgImg="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600" /></>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="content-padding-wrapper">
          {activeTab === 'friends' && (
            <div className="tab-content animate-slide-up">
              <h2>Your Network 🤝</h2><p>Connect with friends, see what they are watching, and invite them to watch parties instantly.</p>
              <div className="friend-search-bar 3d-hover-card">
                <input type="text" placeholder="Search username or email to add friend..." value={friendSearch} onChange={(e) => setFriendSearch(e.target.value)} />
                <button className="btn-primary-3d" onClick={(e) => handleAction('addFriend', e)}>Add Friend</button>
              </div>
              <div className="friends-grid">
                {friendsList.map(friend => (
                  <div key={friend.id} className="friend-card 3d-hover-card">
                    <div className="friend-avatar">{friend.avatar}<div className={`status-dot ${friend.isOnline ? 'online' : 'offline'}`}></div></div>
                    <div className="friend-info"><h4>{friend.name}</h4><p className={friend.isOnline ? 'text-cyan' : ''}>{friend.isOnline ? `Watching: ${friend.watching}` : 'Offline'}</p></div>
                    <div className="friend-actions-group">
                      {friend.isOnline ? <button className="btn-invite" onClick={() => showCustomToast(`Watch Party invite sent to ${friend.name}! 🍿`, 'success')}>Invite</button> : <button className="btn-ping" onClick={() => showCustomToast(`Pinged ${friend.name} to come online! 🔔`, 'success')}>Ping</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <div className="tab-content animate-slide-up">
              <h2>Who is watching today? 👥</h2><p>Seamlessly switch cinematic environments or spin up protected Kids profiles.</p>
              <div className="profiles-grid">
                {profiles.map(p => (
                  <div key={p.id} className={`profile-tile 3d-hover-card ${currentProfile === p.name ? 'active-tile' : ''}`} onClick={() => handleProfileClick(p)}>
                    <div className="profile-avatar-box" style={p.avatar === '😊' ? {background: 'linear-gradient(135deg, #007bff, #a855f7)'} : {}}>{p.avatar}</div>
                    <span className="profile-tile-name">{p.name}</span>
                    <span className="profile-tile-type">{p.type === 'kids' ? '🧸 Kids Mode' : '⚡ VIP Standard'}</span>
                    {p.pin && p.pin.length === 4 && <span className="gate-lock-icon" style={{position: 'absolute', bottom: '15px', color: 'white'}}>🔒</span>}
                  </div>
                ))}
                <div className="profile-tile add-tile 3d-hover-card" onClick={() => setShowAddProfileModal(true)}><div className="profile-avatar-box add-icon">+</div><span className="profile-tile-name">Add Profile</span></div>
              </div>
            </div>
          )}

          {activeTab === 'watchparty' && (
            <div className="tab-content animate-slide-up">
              <h2>Real-Time Synchronized Watch Party 🚀</h2><p>Host high-definition remote movie nights with millisecond sync accuracy.</p>
              <div className="party-action-box 3d-hover-card">
                <button className="btn-primary-3d shine-effect" onClick={() => handleAction('createRoom')}>Generate Secure Room Link</button><div className="divider"><span>OR JOIN ACTIVE NODE</span></div>
                <form onSubmit={(e) => handleAction('joinRoom', e)} className="join-form">
                  <input type="text" placeholder="Enter 6-Char Room ID..." value={roomIdInput} onChange={(e) => setRoomIdInput(e.target.value)} className="room-input" />
                  <button type="submit" className="btn-secondary">Sync & Join</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="tab-content animate-slide-up">
              <h2>Cinematic Analytics & Telemetry 📊</h2><p>Monitor your streaming bandwidth consumption and session history.</p>
              <div className="stats-grid">
                <div className="stat-card 3d-hover-card"><h3>Total Stream Duration</h3><p className="stat-number text-gradient">24.5 Hours</p></div>
                <div className="stat-card 3d-hover-card"><h3>Watch Party Nodes Hosted</h3><p className="stat-number text-cyan">5 Rooms Active</p></div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content animate-slide-up">
              <h2>Master Account & OTT Preferences ⚙️</h2><p>Configure hardware acceleration, playback codecs, and cloud sync settings.</p>
              <div className="settings-grid">
                
                <div className="settings-card 3d-hover-card">
                  <h3>🔒 Profile Lock Settings</h3>
                  <p className="settings-desc">Require a 4-digit PIN to access <strong style={{color: 'white'}}>{currentProfile}</strong>.</p>
                  
                  {isCurrentlyLocked ? (
                    <div className="settings-info-box" style={{borderColor: '#46d369', background: 'rgba(70, 211, 105, 0.1)'}}>
                      <p style={{color: '#46d369', fontWeight: 'bold', marginBottom: '10px'}}>✓ Lock is ON</p>
                      <button className="btn-secondary" style={{width:'100%', borderColor: '#e50914', color: '#e50914'}} onClick={() => toggleProfilePin('remove')}>Remove PIN</button>
                    </div>
                  ) : (
                    <div className="settings-info-box">
                      <div className="input-field" style={{marginBottom: '10px'}}>
                        <input 
                          type="password" 
                          maxLength="4" 
                          placeholder="Enter 4-digit PIN" 
                          value={setupPin} 
                          onChange={(e) => setSetupPin(e.target.value.replace(/[^0-9]/g, ''))} 
                          style={{letterSpacing: '10px', fontSize: '20px', textAlign: 'center'}}
                        />
                      </div>
                      <button 
                        className="btn-primary-3d" 
                        style={{width:'100%'}} 
                        onClick={() => setupPin.length === 4 ? toggleProfilePin('set') : showCustomToast("PIN must be exactly 4 digits", "error")}
                      >
                        Enable Lock
                      </button>
                    </div>
                  )}
                </div>

                <div className="settings-card 3d-hover-card">
                  <h3>👤 Master Identity</h3><p className="settings-desc">Encrypted cloud identity parameters.</p>
                  <div className="settings-info-box"><p><strong>Name:</strong> {userData.name}</p><p><strong>Email:</strong> {userData.email || 'N/A'}</p><p><strong>Tier:</strong> <span className="text-cyan">{userData.plan.toUpperCase()} ACCESS</span></p></div>
                  <button className="btn-primary-3d shine-effect" style={{marginTop:'18px', width:'100%'}} onClick={() => setShowProfileModal(true)}>Modify Master Profile ⚡</button>
                </div>

                <div className="settings-card 3d-hover-card">
                  <h3>🎬 Codec & Stream Resolution</h3><p className="settings-desc">Override adaptive bitrate scaling rules.</p>
                  <div className="setting-option">
                    <span>Rendering Resolution</span>
                    <div className="custom-dropdown">
                      <div className="dropdown-selected" onClick={() => setIsOpenQualityDropdown(!isOpenQualityDropdown)}><span>{videoQuality}</span><span className={`dropdown-arrow ${isOpenQualityDropdown ? 'open' : ''}`}>▼</span></div>
                      {isOpenQualityDropdown && (
                        <div className="dropdown-options animate-fade-in">
                          {['720p HD Stream', '1080p Full HD', '4K Ultra HD (HDR)'].map(q => (
                            <div key={q} className={`dropdown-option ${videoQuality === q ? 'selected' : ''}`} onClick={() => { handleSettingsUpdate('quality', q); setIsOpenQualityDropdown(false); }}>{q}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="setting-option"><span>Seamless Episode Auto-Play</span><label className="switch-toggle"><input type="checkbox" checked={autoPlay} onChange={(e) => handleSettingsUpdate('autoPlay', e.target.checked)} /><span className="slider-round"></span></label></div>
                </div>

                <div className="settings-card 3d-hover-card">
                  <h3>🛡️ Session Security</h3><p className="settings-desc">Manage authentication tokens and active nodes.</p>
                  <button className="btn-secondary" style={{width:'100%', marginBottom:'12px'}} onClick={() => navigate('/settings/password')}>Update Encryption Key (Password) 🔑</button>
                  <button className="btn-logout-alt" style={{width:'100%'}} onClick={() => handleAction('logout')}>Revoke All Active Sessions 🚪</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showAddProfileModal && renderAddProfileModal()}

      {showProfileModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowProfileModal(false)}>
          <div className="modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Master Account Configuration 👤</h2><button className="close-btn" onClick={() => setShowProfileModal(false)}>✕</button></div>
            <form onSubmit={(e) => handleAction('saveProfile', e)} className="profile-form">
              <div className="avatar-large">{userData.photoURL ? <img src={userData.photoURL} alt="Profile" referrerPolicy="no-referrer" /> : <span>{userData.name.charAt(0).toUpperCase()}</span>}</div>
              <div className="input-field"><label>Master Identity Handle</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required /></div>
              <div className="input-field"><label>Secured Endpoint (Email)</label><input type="text" value={userData.email} disabled /></div>
              <div className="info-row"><span className="badge badge-purple">{userData.role}</span><span className="badge badge-cyan">{userData.plan.toUpperCase()} TIER</span></div>
              <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setShowProfileModal(false)}>Abort</button><button type="submit" className="btn-primary-3d shine-effect" disabled={isUpdating}>{isUpdating ? "Syncing..." : "Commit Changes"}</button></div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .perspective-container { perspective: 1200px; }
        .dashboard-container { display: flex; flex-direction: column; min-height: 100vh; width: 100vw; background-color: #141414; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; overflow-x: hidden; position: relative; }
        
        .net-navbar { position: fixed; top: 0; left: 0; width: 100%; height: 68px; padding: 0 4%; display: flex; justify-content: space-between; align-items: center; z-index: 1000; transition: background-color 0.4s ease; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 10%, rgba(0,0,0,0)); }
        .net-navbar.scrolled { background-color: #141414; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .net-nav-left { display: flex; align-items: center; gap: 40px; }
        .net-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }
        .brand-img { height: 32px; width: auto; filter: drop-shadow(0 0 8px rgba(6,182,212,0.5)); }
        .brand-text-colored { font-size: 26px; font-weight: 900; color: #a855f7; letter-spacing: 1px; text-shadow: 0 0 10px rgba(168,85,247,0.3); }
        .brand-text-colored .text-cyan { color: #06b6d4; }
        .net-nav-links { display: flex; list-style: none; gap: 20px; margin: 0; padding: 0; }
        .net-nav-links li { font-size: 14px; font-weight: 500; color: #e5e5e5; cursor: pointer; transition: 0.3s; }
        .net-nav-links li:hover { color: #b3b3b3; }
        .net-nav-links li.active { color: #ffffff; font-weight: 700; pointer-events: none; }
        .net-nav-right { display: flex; align-items: center; gap: 22px; }
        .net-search-box { display: flex; align-items: center; background: rgba(0,0,0,0.75); border: 1px solid #ffffff; padding: 5px 12px; border-radius: 4px; gap: 8px; transition: 0.3s; }
        .net-search-box:focus-within { background: rgba(0,0,0,0.9); }
        .search-icon { font-size: 14px; color: white; cursor: pointer; }
        .net-search-box input { background: transparent; border: none; color: white; outline: none; font-size: 13px; width: 180px; transition: width 0.4s ease; }
        .net-nav-icon { position: relative; font-size: 20px; cursor: pointer; }
        .net-badge { position: absolute; top: -3px; right: -5px; background: #e50914; color: white; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 50%; }
        .net-kids-link { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: 0.3s; }
        .net-kids-link:hover { opacity: 0.8; }
        .kids-avatar-mini { background: #007bff; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        
        .net-profile-menu-container { position: relative; cursor: pointer; padding-bottom: 20px; margin-bottom: -20px; }
        .net-profile-trigger { display: flex; align-items: center; gap: 8px; }
        .net-main-avatar { background: linear-gradient(135deg, #a855f7, #e50914); width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .net-caret { font-size: 10px; transition: 0.3s ease; }
        .net-profile-menu-container:hover .net-caret { transform: rotate(180deg); }
        .net-dropdown-menu { position: absolute; top: 50px; right: 0; background: rgba(0,0,0,0.9); border: 1px solid #333; width: 220px; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index: 2000; padding: 15px 0 10px 0; }
        .net-dropdown-menu::before { content: ''; position: absolute; top: -7px; right: 20px; border-width: 0 7px 7px 7px; border-style: solid; border-color: transparent transparent rgba(0,0,0,0.9) transparent; }
        .net-dropdown-menu::after { content: ''; position: absolute; top: -8px; right: 20px; border-width: 0 7px 7px 7px; border-style: solid; border-color: transparent transparent #333 transparent; z-index: -1; }
        .net-dropdown-profiles { margin-bottom: 10px; }
        .net-dropdown-profile-item { display: flex; align-items: center; gap: 12px; padding: 6px 15px; cursor: pointer; transition: 0.2s; }
        .net-dropdown-profile-item:hover .net-dropdown-name { text-decoration: underline; }
        .net-dropdown-avatar { width: 32px; height: 32px; border-radius: 4px; background: linear-gradient(135deg, #a855f7, #e50914); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .net-dropdown-name { font-size: 13px; color: #e5e5e5; font-weight: 500; flex: 1; }
        .net-dropdown-lock { font-size: 12px; opacity: 0.6; }
        .net-dropdown-links { margin-top: 10px; }
        .net-dropdown-item { padding: 10px 15px; font-size: 13px; font-weight: 500; color: #e5e5e5; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: 0.2s; }
        .net-dropdown-item:hover { text-decoration: underline; }
        .net-dropdown-icon { font-size: 16px; opacity: 0.7; filter: grayscale(100%) brightness(200%); width: 20px; text-align: center; }
        .net-dropdown-divider { height: 1px; background: #333; margin: 10px 0; }
        .sign-out { justify-content: center; padding: 12px 15px; font-weight: bold; }

        .sidebar, .top-navbar { display: none !important; }
        .main-content.no-sidebar { width: 100%; height: 100vh; overflow-y: auto; background: transparent; }
        .main-content.no-sidebar:not(.home-active) { padding-top: 80px; }

        .ambient-background { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: -1; }
        .aurora-orb { position: absolute; border-radius: 50%; filter: blur(170px); opacity: 0.16; }
        .orb-1 { top:-20%; left:-10%; width:50vw; height:50vw; background:#e50914; animation:floatSlow 14s infinite ease-in-out; }
        .orb-2 { bottom:-20%; right:-10%; width:55vw; height:55vw; background:#a855f7; animation:floatDelayed 18s infinite ease-in-out; }
        .orb-3 { top:30%; left:40%; width:40vw; height:40vw; background:#007bff; opacity:0.07; animation:pulseGlow 10s infinite ease-in-out; }
        @keyframes floatSlow{0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(40px,30px) scale(1.1);}}
        @keyframes floatDelayed{0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-50px,-40px) scale(1.15);}}
        @keyframes pulseGlow{0%,100%{opacity:0.04;transform:scale(0.9);} 50%{opacity:0.14;transform:scale(1.25);}}
        
        .custom-toast { position: fixed; top: 80px; right: 30px; z-index: 9999; background: rgba(14,14,22,0.9); backdrop-filter: blur(25px); border: 1px solid rgba(229,9,20,0.5); padding: 16px 24px; border-radius: 8px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.85); font-weight: 600; font-size: 14px; }
        .animate-toast-slide { animation: toastSlide 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes toastSlide{from{opacity:0;transform:translateY(-30px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
        
        .content-padding-wrapper { padding: 0 4% 40px 4%; }
        
        .net-hero-banner { width: 100%; height: 85vh; position: relative; background-image: url('https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000'); background-size: cover; background-position: center top; margin-top: -68px; display: flex; align-items: center; padding-left: 4%; }
        .net-hero-vignette { position: absolute; inset: 0; background: linear-gradient(to right, rgba(20,20,20,0.9) 0%, rgba(20,20,20,0.4) 50%, transparent 100%), linear-gradient(to top, #141414 0%, transparent 20%); z-index: 1; }
        .net-hero-content { position: relative; z-index: 2; max-width: 600px; margin-top: 50px; }
        .cinematic-title { font-size: 60px; font-weight: 900; line-height: 1; margin-bottom: 10px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); font-style: italic; }
        .title-sub { font-size: 40px; color: #06b6d4; }
        .net-hero-meta { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: bold; color: #a3a3a3; margin-bottom: 20px; }
        .net-match { color: #46d369; }
        .net-age { border: 1px solid #a3a3a3; padding: 0 4px; border-radius: 3px; font-size: 12px; }
        .net-hd { border: 1px solid #a3a3a3; padding: 0 4px; border-radius: 3px; font-size: 10px; }
        .net-hero-desc { font-size: 18px; color: #fff; line-height: 1.4; margin-bottom: 30px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }
        .net-hero-buttons { display: flex; gap: 15px; }
        .net-btn-play { background: #fff; color: #000; border: none; padding: 10px 30px; border-radius: 4px; font-size: 20px; font-weight: 800; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
        .net-btn-play:hover { background: rgba(255,255,255,0.75); }
        .net-btn-info { background: rgba(109,109,110,0.7); color: #fff; padding: 10px 30px; border-radius: 4px; font-size: 20px; font-weight: 800; cursor: pointer; transition: 0.2s; border: none; display: flex; align-items: center; }
        .net-btn-info:hover { background: rgba(109,109,110,0.4); }

        .net-sliders-container { position: relative; z-index: 5; margin-top: -100px; padding-bottom: 50px; }
        .net-slider-row { margin-bottom: 40px; }
        .net-row-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; padding-left: 4%; }
        .net-movie-list { display: flex; gap: 8px; overflow-x: auto; padding: 10px 4%; scrollbar-width: none; }
        .net-movie-list::-webkit-scrollbar { display: none; }
        .net-movie-card { min-width: 280px; height: 160px; border-radius: 4px; position: relative; overflow: hidden; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; background: #222; }
        .net-movie-card:hover { transform: scale(1.05); z-index: 10; box-shadow: 0 10px 20px rgba(0,0,0,0.8); }
        .net-movie-bg { width: 100%; height: 100%; background-size: cover; background-position: center; transition: 0.3s; }
        .net-movie-card:hover .net-movie-bg { filter: brightness(0.6); }
        .net-top10-badge { position: absolute; top: 0; left: 0; background: #e50914; color: white; padding: 4px 6px; font-size: 10px; font-weight: 900; line-height: 1; border-bottom-right-radius: 4px; text-align: center; }
        .net-label-tag { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); background: #e50914; color: white; padding: 2px 10px; font-size: 11px; font-weight: bold; border-top-left-radius: 4px; border-top-right-radius: 4px; }
        .net-movie-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0; transition: 0.3s; }
        .net-movie-card:hover .net-movie-overlay { opacity: 1; }
        .net-movie-title { color: white; font-size: 18px; font-weight: bold; text-align: center; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); margin-bottom: 10px; }
        .net-play-mini { background: white; color: black; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .net-play-mini:hover { background: #e5e7eb; }

        .friend-search-bar { display: flex; gap: 10px; margin-bottom: 30px; max-width: 500px; background: rgba(20,20,20,0.8); padding: 10px; border-radius: 4px; border: 1px solid #333; }
        .friend-search-bar input { flex: 1; background: #141414; border: 1px solid #444; padding: 12px 15px; border-radius: 4px; color: white; outline: none; font-size: 14px; }
        .friend-search-bar input:focus { border-color: #a855f7; }
        .friends-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .friend-card { background: rgba(20,20,20,0.9); border: 1px solid #333; border-radius: 4px; padding: 20px; display: flex; align-items: center; gap: 15px; transition: 0.3s; }
        .friend-avatar { position: relative; width: 55px; height: 55px; background: #222; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
        .status-dot { position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #141414; }
        .status-dot.online { background: #46d369; box-shadow: 0 0 8px #46d369; }
        .status-dot.offline { background: #808080; }
        .friend-info { flex: 1; }
        .friend-info h4 { font-size: 16px; color: white; margin-bottom: 4px; }
        .friend-info p { font-size: 12px; color: #808080; margin: 0; }
        .btn-invite { background: #e50914; color: white; border: none; padding: 8px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 12px; }
        .btn-invite:hover { background: #f40612; box-shadow: 0 0 10px rgba(229,9,20,0.5); }
        .btn-ping { background: #333; color: white; border: 1px solid #555; padding: 8px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 12px; }
        .btn-ping:hover { background: #444; border-color: #888; }

        .profiles-grid { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 20px; }
        .profile-tile { width: 140px; height: 160px; background: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: 0.3s; position: relative; }
        .profile-tile:hover .profile-avatar-box { border-color: white; }
        .profile-avatar-box { width: 100px; height: 100px; border-radius: 4px; background: linear-gradient(135deg,#a855f7,#06b6d4); display: flex; align-items: center; justify-content: center; font-size: 40px; border: 3px solid transparent; transition: 0.3s; }
        .add-icon { font-size: 50px; font-weight: bold; background: transparent; border: 3px solid #808080; color: #808080; }
        .profile-tile:hover .add-icon { background: white; color: black; border-color: white; }
        .profile-tile-name { font-size: 16px; font-weight: 500; color: #808080; transition: 0.3s; }
        .profile-tile:hover .profile-tile-name { color: white; }
        .profile-tile-type { display: none; }
        
        .party-action-box { background: rgba(20,20,20,0.9); border: 1px solid #333; padding: 30px; border-radius: 8px; max-width: 450px; display: flex; flex-direction: column; gap: 20px; }
        .join-form { display: flex; gap: 10px; }
        .room-input { flex: 1; background: #333; border: none; border-radius: 4px; padding: 12px 15px; color: white; outline: none; font-size: 16px; }
        .room-input:focus { background: #444; }
        .btn-primary-3d { background: #e50914; color: white; border: none; padding: 14px 24px; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .btn-primary-3d:hover { background: #f40612; }
        
        .stats-grid { display: flex; gap: 20px; flex-wrap: wrap; }
        .stat-card { background: rgba(20,20,20,0.9); border: 1px solid #333; padding: 25px; border-radius: 8px; min-width: 250px; }
        .stat-card h3 { font-size: 15px; color: #808080; margin-bottom: 10px; font-weight: 600; }
        .stat-number { font-size: 32px; font-weight: bold; color: white; }
        
        .settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-top: 20px; }
        .settings-card { background: rgba(20,20,20,0.9); border: 1px solid #333; border-radius: 8px; padding: 25px; display: flex; flex-direction: column; }
        .settings-card h3 { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
        .settings-desc { font-size: 13px; color: #808080; margin-bottom: 25px; }
        .settings-info-box { background: #141414; border: 1px solid #333; padding: 15px; border-radius: 4px; display: flex; flex-direction: column; gap: 8px; font-size: 14px; }
        .setting-option { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 15px; position: relative; }
        
        .custom-dropdown { position: relative; width: 200px; user-select: none; }
        .dropdown-selected { background: #141414; border: 1px solid #808080; color: #fff; padding: 12px 15px; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
        .dropdown-selected:hover { border-color: white; }
        .dropdown-arrow { font-size: 10px; transition: 0.3s; color: white; }
        .dropdown-arrow.open { transform: rotate(180deg); }
        .dropdown-options { position: absolute; top: calc(100% + 5px); left: 0; right: 0; background: #141414; border: 1px solid #333; border-radius: 4px; overflow: hidden; z-index: 99; box-shadow: 0 5px 15px rgba(0,0,0,0.8); }
        .dropdown-option { padding: 12px 15px; font-size: 14px; font-weight: 500; color: #e5e5e5; cursor: pointer; transition: 0.2s; }
        .dropdown-option:hover { background: #333; color: #fff; }
        .dropdown-option.selected { background: #e50914; color: white; }
        
        .switch-toggle { position: relative; display: inline-block; width: 50px; height: 26px; }
        .switch-toggle input { opacity: 0; width: 0; height: 0; }
        .slider-round { position: absolute; cursor: pointer; inset: 0; background-color: #808080; transition: 0.3s; border-radius: 34px; }
        .slider-round:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: #fff; transition: 0.3s; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.4); }
        input:checked + .slider-round { background: #e50914; }
        input:checked + .slider-round:before { transform: translateX(24px); }
        
        .btn-logout-alt { background: transparent; color: white; border: 1px solid #808080; padding: 14px; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .btn-logout-alt:hover { border-color: white; background: rgba(255,255,255,0.1); }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-card { background: #141414; border-radius: 8px; padding: 40px; width: 100%; max-width: 450px; box-shadow: 0 15px 40px rgba(0,0,0,0.9); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .modal-header h2 { font-size: 24px; font-weight: bold; }
        .close-btn { background: transparent; border: none; color: #808080; font-size: 28px; cursor: pointer; transition: 0.2s; }
        .close-btn:hover { color: #fff; }
        
        .profile-form { display: flex; flex-direction: column; gap: 20px; }
        .avatar-large { width: 100px; height: 100px; border-radius: 4px; background: linear-gradient(135deg,#a855f7,#e50914); margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; overflow: hidden; }
        .avatar-large img { width: 100%; height: 100%; object-fit: cover; }
        .input-field { display: flex; flex-direction: column; gap: 8px; }
        .input-field label { font-size: 14px; color: #808080; font-weight: bold; }
        .input-field input, .cinematic-select { background: #333; border: none; border-radius: 4px; padding: 14px 16px; color: #fff; outline: none; transition: 0.3s; font-size: 16px; }
        .input-field input:focus, .cinematic-select:focus { background: #444; }
        .input-field input:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .hs-modal-overlay { position: fixed; inset: 0; background: #0a0a0c; z-index: 2000; display: flex; justify-content: center; align-items: center; }
        .hs-modal-content { width: 100%; max-width: 450px; height: 100vh; max-height: 850px; background: #0a0a0c; display: flex; flex-direction: column; padding: 25px; position: relative; box-shadow: 0 0 50px rgba(0,0,0,0.8); }
        .hs-header { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; margin-bottom: 50px; }
        .hs-back-btn { background: transparent; border: none; color: white; font-size: 26px; cursor: pointer; transition: 0.2s; }
        .hs-back-btn:hover { color: #e50914; }
        .hs-header h2 { font-size: 20px; font-weight: 600; color: white; }
        .hs-avatar-container { display: flex; gap: 20px; justify-content: center; align-items: center; margin-bottom: 60px; overflow-x: auto; padding-bottom: 15px; scrollbar-width: none; }
        .hs-avatar-container::-webkit-scrollbar { display: none; }
        .hs-avatar { min-width: 60px; height: 60px; border-radius: 50%; background: #1a1a24; display: flex; justify-content: center; align-items: center; font-size: 30px; cursor: pointer; opacity: 0.5; transition: 0.3s; filter: grayscale(80%); }
        .hs-avatar.selected { min-width: 90px; height: 90px; opacity: 1; filter: grayscale(0%); border: 3px solid white; background: linear-gradient(135deg, #007bff, #e50914); font-size: 45px; box-shadow: 0 0 25px rgba(229,9,20,0.4); }
        .hs-input-group { position: relative; margin-bottom: 35px; }
        .hs-input-group input { width: 100%; background: transparent; border: 1.5px solid #444; border-radius: 10px; padding: 18px 15px; color: white; font-size: 16px; outline: none; transition: 0.3s; }
        .hs-input-group input:focus { border-color: white; }
        .hs-input-group label { position: absolute; top: -10px; left: 15px; background: #0a0a0c; padding: 0 5px; font-size: 13px; color: #888; font-weight: 500; transition: 0.3s; }
        .hs-input-group input:focus + label { color: white; }
        .hs-kids-row { display: flex; justify-content: space-between; align-items: center; padding: 0 5px; color: #ccc; font-size: 15px; font-weight: 500; }
        .hs-fab { position: absolute; bottom: 40px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #007bff, #e50914); border: none; color: white; font-size: 24px; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(229,9,20,0.4); transition: 0.3s; }
        .hs-fab:hover { transform: scale(1.08); box-shadow: 0 15px 35px rgba(229,9,20,0.6); }

        @keyframes scaleUp{from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);}} .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes slideUpFade{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}} .animate-slide-up { animation: slideUpFade 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}} .animate-fade-in { animation: fadeIn 0.3s ease forwards; }

        @media (max-width: 900px) {
          .net-navbar { padding: 0 15px; }
          .net-nav-links { display: none; }
          .net-brand { font-size: 20px; }
          .net-search-box input { width: 120px; }
          .cinematic-title { font-size: 40px; }
          .title-sub { font-size: 25px; }
          .hero-content { margin-top: 20px; }
        }
        .animate-pulse-glow { animation: pulseGlowText 1.5s infinite alternate; }
        @keyframes pulseGlowText { from { opacity: 0.5; text-shadow: 0 0 10px rgba(255,255,255,0.2); } to { opacity: 1; text-shadow: 0 0 20px rgba(255,255,255,0.8); } }
      `}</style>
    </div>
  );
}