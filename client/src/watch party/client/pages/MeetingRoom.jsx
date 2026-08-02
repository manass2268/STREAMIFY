import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/grid.css';

export default function MeetingRoom() {
  const { roomId } = useParams(); 
  const navigate = useNavigate();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  // 🔥 Security States for Link Validation
  const [isValidating, setIsValidating] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 🔥 VALIDATION ENGINE: Check if room exists before showing UI
  useEffect(() => {
    fetch(`http://localhost:5000/api/rooms/${roomId}`)
      .then((res) => {
        if (!res.ok) throw new Error("This meeting link is invalid or has expired.");
        return res.json();
      })
      .then((data) => {
        setIsValidating(false); // Code valid hai, UI show karo!
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setTimeout(() => navigate('/'), 3500); // 3.5s baad home page par redirect
      });
  }, [roomId, navigate]);

  // Loading Screen jab backend se check chal raha ho
  if (isValidating) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#0f0f11' }}>
        <h2>Verifying Meeting Code... 🔒</h2>
      </div>
    );
  }

  // Error Screen jab random link daali ho
  if (errorMsg) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', background: '#0f0f11' }}>
        <h2 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>❌</h2>
        <h2>{errorMsg}</h2>
        <p style={{ color: '#a1a1aa', marginTop: '10px' }}>Redirecting to home page...</p>
      </div>
    );
  }

  return (
    <div className="meet-wrapper">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="meet-top-nav">
        <div>
          <strong style={{ fontSize: '18px' }}>Streamify Meet Engine</strong>
          <span style={{ color: 'var(--text-muted)', marginLeft: '12px', fontSize: '14px' }}>
            {roomId} 
          </span>
        </div>
        <div>
          <span style={{ background: '#22c55e22', color: '#22c55e', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            ● Network Stable
          </span>
        </div>
      </header>

      {/* 2. MAIN VIDEO GRID WORKSPACE */}
      <main className="meet-main-workspace">
        <div className="video-grid-container" data-count="1">
          
          {/* LOCAL USER TILE */}
          <div className="participant-tile">
            {isCamOn ? (
              <div style={{ color: 'var(--text-muted)' }}>
                🎥 Camera Stream Loading (WebRTC Next Step...)
              </div>
            ) : (
              <div style={{ fontSize: '48px' }}>👦</div>
            )}
            
            <div className="tile-label">
              <span>You (Host)</span>
              <span>{isMicOn ? "🎙️" : "🔇"}</span>
            </div>
          </div>

        </div>
      </main>

      {/* 3. BOTTOM CONTROL BAR */}
      <footer className="meet-control-bar">
        <div className="control-group">
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="control-group">
          <button 
            className={`btn-icon ${!isMicOn ? 'muted' : ''}`} 
            onClick={() => setIsMicOn(!isMicOn)}
            title="Toggle Microphone"
          >
            {isMicOn ? "🎙️" : "🔇"}
          </button>

          <button 
            className={`btn-icon ${!isCamOn ? 'muted' : ''}`} 
            onClick={() => setIsCamOn(!isCamOn)}
            title="Toggle Camera"
          >
            {isCamOn ? "📷" : "🚫"}
          </button>

          <button className="btn-icon" title="Share Screen">
            🖥️
          </button>

          <button 
            className="btn-icon btn-leave" 
            title="Leave Meeting"
            onClick={() => navigate('/')} 
          >
            📞
          </button>
        </div>

        <div className="control-group">
          <button className="btn-icon" title="Participants">
            👥
          </button>
          <button className="btn-icon" title="Chat">
            💬
          </button>
        </div>
      </footer>
    </div>
  );
}