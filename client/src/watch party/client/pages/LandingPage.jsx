import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmoothScroll from '../components/Layout/SmoothScroll';
import PremiumHeroFeatures from '../sections/PremiumHeroFeatures';
import CustomCursor from '../components/Cursor/CustomCursor';
import CinematicLoader from '../components/Animations/CinematicLoader';
import Navbar from '../components/Navigation/Navbar';
import '../styles/grid.css';
import logo from '../assets/logo1.png'; // Imported and passed cleanly to Navbar

export default function LandingPage() {
  const [joinCode, setJoinCode] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // 🔥 Standard React Router Hook
  const navigate = useNavigate();

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3500);
  };

  const generateMeetingCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const randomStr = (length) =>
      Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${randomStr(3)}-${randomStr(4)}-${randomStr(3)}`;
  };

  const handleCreateMeeting = async () => {
    const newRoomCode = generateMeetingCode();
    const tempHostId = `host_${Math.random().toString(36).substring(2, 9)}`; 

    try {
      const API_URL = import.meta.env.VITE_SOCKET_SERVER_URL || "https://streamfiy-backend.vercel.app";
      const response = await fetch(`${API_URL.replace(/\/+$/, '')}/api/rooms`, {
      method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ roomId: newRoomCode, hostId: tempHostId })
});

      if (response.ok) {
        // 🔥 Updated Watch Party Toast Messaging
        showToast("Watch Party room provisioned! Connecting sync matrix...", "success");
        setTimeout(() => {
          navigate(`/room/${newRoomCode}?host=true&userId=${tempHostId}`);
        }, 1200);
      } else {
        const data = await response.json();
        showToast(`Failed to create Watch Party: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Server connection error:", error);
      showToast("Backend matrix disconnected. Please run the server first!", "error");
    }
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    // Clean any full URLs (supports Meet/Streamify room links)
    const cleanedCode = joinCode
      .replace(/.*\/room\//, '')
      .replace(/.*meet\.google\.com\//, '')
      .trim();
      
    navigate(`/room/${cleanedCode}`);
  };

  return (
    <SmoothScroll>
      <CinematicLoader>
        <div className="relative min-h-screen bg-[#05060A] w-full overflow-x-hidden selection:bg-purple-500/30 selection:text-white">
          
          <CustomCursor />

          {toast.show && (
            <div className={`custom-toast ${toast.type}`}>
              <span className="toast-icon">{toast.type === 'error' ? '⚠️' : '✅'}</span>
              <span>{toast.message}</span>
            </div>
          )}

          {/* 🔥 Logo is passed into Navbar so the asset is utilized properly */}
          <Navbar logo={logo} />

          <PremiumHeroFeatures 
            onCreateMeeting={handleCreateMeeting}
            onJoinMeeting={handleJoinMeeting}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
          />
          
        </div>
      </CinematicLoader>
    </SmoothScroll>
  );
}