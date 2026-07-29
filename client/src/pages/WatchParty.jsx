import React, { useState, useRef, useEffect } from 'react';

export default function WatchParty({ showCustomToast, TMDB_IMAGE_BASE_URL }) {
  // 🔥 WATCH PARTY STATES 🔥
  const [wpState, setWpState] = useState({
    inRoom: false,
    roomId: '',
    isMuted: false, // Mic Mute
    isCamOn: true,
    isScreenSharing: false,
    isRecording: false,
    activeTab: 'chat',
    chatInput: '',
    messages: [
      { id: 1, sender: 'System', time: '10:30 PM', text: 'Welcome to the Streamify Watch Party! 🍿', isMe: false, avatar: '🤖' }
    ],
    participants: [
      { id: 1, name: 'You (Host)', avatar: '👦', isMicOn: true, isCamOn: true, isSpeaking: false }
    ],
    // 🔥 Video Player Interactive States 🔥
    activeMovie: null,
    isPlaying: true,
    progress: 0,
    showCC: false,
    isVideoMuted: false,
    isFullscreen: false
  });

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showLaterModal, setShowLaterModal] = useState(false);
  const [showReadyPopup, setShowReadyPopup] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const chatContainerRef = useRef(null);
  const menuRef = useRef(null);
  const playerRef = useRef(null); // Reference for Fullscreen API

  // Mock Movies for the In-Room Browser
  const mockMovies = [
    { id: 101, title: 'Avengers: Endgame', backdrop_path: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000' },
    { id: 102, title: 'Inception', backdrop_path: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000' },
    { id: 103, title: 'Interstellar', backdrop_path: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000' },
    { id: 104, title: 'The Dark Knight', backdrop_path: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1000' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowCreateMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // Simulate Video Progress Bar playing automatically
  useEffect(() => {
    let interval;
    if (wpState.inRoom && wpState.activeMovie && wpState.isPlaying && !wpState.isScreenSharing) {
      interval = setInterval(() => {
        setWpState(prev => ({
          ...prev, 
          progress: prev.progress >= 100 ? 0 : prev.progress + 0.5 
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [wpState.inRoom, wpState.activeMovie, wpState.isPlaying, wpState.isScreenSharing]);

  // Handle Fullscreen escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setWpState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const generateRoomId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const randomStr = (length) => Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${randomStr(3)}-${randomStr(4)}-${randomStr(3)}`; 
  };

  const getFullLink = (id) => `streamify.com/wp/${id}`;

  const handleCreateForLater = () => {
    const newId = generateRoomId();
    setGeneratedLink(getFullLink(newId));
    setShowCreateMenu(false);
    setShowLaterModal(true);
    setWpState(prev => ({...prev, roomId: newId})); 
  };

  const handleStartInstant = () => {
    const newId = generateRoomId();
    setWpState(prev => ({...prev, inRoom: true, roomId: newId, activeMovie: null, progress: 0}));
    setGeneratedLink(getFullLink(newId));
    setShowCreateMenu(false);
    setShowReadyPopup(true);
    showCustomToast(`Instant Watch Party Created!`, "success");
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!wpState.roomId.trim()) return;
    setWpState(prev => ({...prev, inRoom: true, activeMovie: null, progress: 0}));
    setShowReadyPopup(false); 
    showCustomToast(`Joined Watch Party: ${wpState.roomId}`, "success");
  };

  const handleLeaveRoom = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    setWpState(prev => ({...prev, inRoom: false, roomId: '', activeMovie: null})); 
    setShowReadyPopup(false);
    showCustomToast("Left Watch Party", "success");
  };

  const copyLinkToClipboard = (linkText) => {
    navigator.clipboard.writeText(linkText);
    showCustomToast("Watch Party link copied", "success");
  };

  const toggleWpControl = (key) => {
    if (key === 'isScreenSharing') {
      showCustomToast(wpState.isScreenSharing ? "Screen sharing stopped" : "You are now sharing your screen", "success");
    }
    if (key === 'showCC') {
      showCustomToast(wpState.showCC ? "Captions turned off" : "Captions turned on", "success");
    }
    setWpState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 🔥 FULLSCREEN FUNCTION 🔥
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerRef.current) {
        playerRef.current.requestFullscreen().catch(err => {
          showCustomToast("Error attempting to enable fullscreen", "error");
        });
      }
    } else {
      document.exitFullscreen();
    }
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!wpState.chatInput.trim()) return;
    setWpState(prev => ({
      ...prev,
      messages: [...prev.messages, { id: Date.now(), sender: 'You', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), text: prev.chatInput, isMe: true, avatar: '👦' }],
      chatInput: ''
    }));
    setTimeout(() => { if(chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, 100);
  };

  const handleSelectMovie = (movie) => {
    setWpState(prev => ({ ...prev, activeMovie: movie, isPlaying: true, progress: 0 }));
    setShowBrowseModal(false);
    showCustomToast(`${movie.title} is now playing for everyone!`, "success");
  };

  const currentDateTime = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const movieBg = wpState.activeMovie?.backdrop_path ? TMDB_IMAGE_BASE_URL + wpState.activeMovie.backdrop_path : '';
  const movieTitle = wpState.activeMovie ? (wpState.activeMovie.title || wpState.activeMovie.name) : 'Waiting for host to select a movie...';

  return (
    <div className={wpState.inRoom ? "wp-room-fullscreen" : "wp-landing-wrapper"}>
      
      {!wpState.inRoom ? (
        // ==========================================
        // LANDING PAGE
        // ==========================================
        <div className="wp-landing-container animate-fade-in">
          <div className="wp-glass-box">
            <div className="wp-split-layout">
              <div className="wp-left-panel">
                <div className="wp-panel-icon">🗓️</div>
                <h2 className="wp-panel-title">Start a Watch Party</h2>
                
                <div className="wp-dropdown-wrapper" ref={menuRef}>
                  <button className="wp-btn-purple" onClick={() => setShowCreateMenu(!showCreateMenu)}>
                    Party Options <span className="wp-dropdown-arrow">{showCreateMenu ? '▲' : '▼'}</span>
                  </button>
                  
                  {showCreateMenu && (
                    <div className="wp-dropdown-menu animate-scale-up">
                      <div className="wp-dropdown-item" onClick={handleCreateForLater}><span className="wp-dd-icon">🔗</span> Generate link for later</div>
                      <div className="wp-dropdown-item" onClick={handleStartInstant}><span className="wp-dd-icon">＋</span> Start an instant party</div>
                      <div className="wp-dropdown-item" onClick={() => showCustomToast("Calendar syncing coming soon!", "success")}><span className="wp-dd-icon">📅</span> Schedule in Streamify Calendar</div>
                    </div>
                  )}
                </div>
                <p className="wp-panel-desc">Create secure, feature-rich watch parties with advanced movie sync and video chat collaboration.</p>
              </div>

              <div className="wp-vertical-divider"></div>

              <div className="wp-right-panel">
                <div className="wp-panel-icon">🔗</div>
                <h2 className="wp-panel-title">Join an Existing Party</h2>
                <form onSubmit={handleJoinRoom} className="wp-join-form">
                  <input type="text" placeholder="streamify.com/wp/abcdefghi" value={wpState.roomId} onChange={(e) => setWpState({...wpState, roomId: e.target.value})} className="wp-input-dark" />
                  <button type="submit" className={`wp-btn-join ${wpState.roomId.trim() ? 'active' : ''}`} disabled={!wpState.roomId.trim()}>Join</button>
                </form>
                <p className="wp-panel-desc-small">Enter a valid Streamify Watch Party code or link to sync up with your friends.</p>
              </div>
            </div>
            <div className="wp-box-footer">{currentDateTime}</div>
          </div>
          <div className="wp-landing-footer">Integrated Streamify Sync • streamify.com • Learn more about Watch Party features</div>

          {/* LATER MODAL */}
          {showLaterModal && (
            <div className="wp-modal-overlay" onClick={() => setShowLaterModal(false)}>
              <div className="wp-later-modal animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="wp-lm-header"><h3>Here's your Watch Party link</h3><button className="wp-close-btn" onClick={() => setShowLaterModal(false)}>✕</button></div>
                <p className="wp-lm-text">Copy this link and send it to your friends. Be sure to save it so you can use it when it's movie time.</p>
                <div className="wp-lm-link-box"><span className="wp-lm-link-text">{generatedLink}</span><button className="wp-lm-copy-btn" onClick={() => copyLinkToClipboard(generatedLink)}>📋</button></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // ==========================================
        // ACTIVE ROOM SCREEN 
        // ==========================================
        <div className="wp-active-layout animate-fade-in">
          
          <main className="wp-main-content">
            
            {/* LEFT: VIDEO PLAYER AREA */}
            <div className="wp-video-col" ref={playerRef}>
              <div className="wp-player-container" style={wpState.activeMovie && !wpState.isScreenSharing ? {backgroundImage: `url(${movieBg})`} : {background: '#111'}}>
                
                {/* 1. SCREEN SHARE OVERLAY */}
                {wpState.isScreenSharing && (
                  <div className="wp-screen-share-overlay animate-fade-in">
                     <div className="wp-ss-icon">🖥️</div>
                     <h2>You are presenting to everyone</h2>
                     <button className="wp-stop-ss-btn" onClick={() => toggleWpControl('isScreenSharing')}>Stop Sharing</button>
                  </div>
                )}

                {/* 2. BLANK SCREEN OVERLAY (Waiting for movie) */}
                {!wpState.activeMovie && !wpState.isScreenSharing && (
                   <div className="wp-blank-screen animate-fade-in">
                      <div className="wp-blank-icon">🍿</div>
                      <h2>Waiting for host to select a movie</h2>
                      <p>Invite your friends using the code below, then browse library to start watching.</p>
                      <button className="wp-browse-btn" onClick={() => setShowBrowseModal(true)}>Browse Movies</button>
                   </div>
                )}

                {/* 3. CLOSED CAPTIONS MOCK (If active) */}
                {wpState.activeMovie && wpState.showCC && !wpState.isScreenSharing && (
                  <div className="wp-cc-text animate-slide-up">
                    [Epic cinematic music playing in the background]
                  </div>
                )}

                {/* 4. ACTUAL MOVIE CONTROLS */}
                {wpState.activeMovie && !wpState.isScreenSharing && (
                  <div className="wp-player-controls">
                    <div className="wp-player-title">{wpState.activeMovie.title}</div>
                    <div className="wp-progress-bar">
                      <div className="wp-progress-fill" style={{width: `${wpState.progress}%`}}></div>
                      <div className="wp-progress-thumb" style={{left: `${wpState.progress}%`}}></div>
                    </div>
                    <div className="wp-controls-row">
                      <div className="wp-cr-left">
                        {/* Play/Pause Button */}
                        <button className="wp-icon-btn" onClick={() => toggleWpControl('isPlaying')} title={wpState.isPlaying ? "Pause" : "Play"}>
                          {wpState.isPlaying ? '⏸' : '▶'}
                        </button>
                        {/* Video Mute/Unmute */}
                        <button className="wp-icon-btn" onClick={() => toggleWpControl('isVideoMuted')} title={wpState.isVideoMuted ? "Unmute Video" : "Mute Video"}>
                          {wpState.isVideoMuted ? '🔇' : '🔊'}
                        </button>
                        <span className="wp-time-text">01:24:35 / 03:01:12</span>
                      </div>
                      <div className="wp-cr-right">
                        {/* CC Toggle */}
                        <button className={`wp-icon-btn ${wpState.showCC ? 'active-text' : ''}`} onClick={() => toggleWpControl('showCC')} title="Toggle Subtitles">CC</button>
                        {/* Settings */}
                        <button className="wp-icon-btn" onClick={() => showCustomToast("Video Quality Settings opened", "success")} title="Settings">⚙️</button>
                        {/* Fullscreen Toggle */}
                        <button className="wp-icon-btn" onClick={toggleFullscreen} title={wpState.isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                          {wpState.isFullscreen ? '🗗' : '⛶'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 5. "YOUR PARTY'S READY" POPUP */}
                {showReadyPopup && !wpState.isFullscreen && (
                  <div className="wp-ready-popup animate-slide-up">
                    <div className="wp-rp-header">
                      <h3>Your Watch Party is ready</h3>
                      <button className="wp-close-btn-dark" onClick={() => setShowReadyPopup(false)}>✕</button>
                    </div>
                    <button className="wp-rp-add-btn" onClick={() => copyLinkToClipboard(generatedLink)}>
                      <span className="wp-rp-add-icon">📋</span> Copy Link
                    </button>
                    <p className="wp-rp-subtitle">Share this Watch Party link with others you want in the room before starting the movie.</p>
                    <div className="wp-rp-link-box">
                      <span className="wp-rp-link-text">{generatedLink}</span>
                    </div>
                    <div className="wp-rp-footer">
                      <span className="wp-rp-shield">🛡️</span> Only people with the link can join your synced session.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: CHAT/PARTICIPANTS SIDEBAR */}
            {/* Hide sidebar if fullscreen */}
            {!wpState.isFullscreen && (
              <div className="wp-sidebar-col">
                <div className="wp-tabs">
                  <button className={`wp-tab ${wpState.activeTab === 'chat' ? 'active' : ''}`} onClick={() => setWpState({...wpState, activeTab: 'chat'})}>Chat</button>
                  <button className={`wp-tab ${wpState.activeTab === 'participants' ? 'active' : ''}`} onClick={() => setWpState({...wpState, activeTab: 'participants'})}>Participants ({wpState.participants.length})</button>
                </div>

                {wpState.activeTab === 'chat' ? (
                  <>
                    <div className="wp-chat-container" ref={chatContainerRef}>
                      {wpState.messages.map(msg => (
                        <div key={msg.id} className={`wp-msg-wrapper ${msg.isMe ? 'msg-mine' : 'msg-other'}`}>
                          <div className="wp-msg-content">
                            <div className="wp-msg-header">
                              <span className="wp-msg-name">{msg.sender}</span> 
                              <span className="wp-msg-time">{msg.time}</span>
                            </div>
                            <div className="wp-msg-bubble">{msg.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form className="wp-chat-input-box" onSubmit={handleSendMessage}>
                      <input type="text" placeholder="Send a message to everyone" value={wpState.chatInput} onChange={(e)=>setWpState({...wpState, chatInput: e.target.value})} />
                      <button type="submit" className="wp-send-btn">➤</button>
                    </form>
                  </>
                ) : (
                  <div className="wp-participants-container">
                    {wpState.participants.map(p => (
                      <div key={p.id} className="wp-participant-item">
                         <div className="wp-p-avatar">{p.avatar}</div>
                         <div className="wp-p-name">{p.name}</div>
                         <div className="wp-p-status">{p.isMicOn ? '🎙️' : '🔇'} {p.isCamOn ? '📷' : '🚫'}</div>
                      </div>
                    ))}
                    {!wpState.activeMovie && (
                       <button className="wp-start-party-btn" onClick={() => setShowBrowseModal(true)}>+ Select Movie</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>

          {/* BOTTOM CONTROL BAR */}
          {/* Hide bottom bar if fullscreen */}
          {!wpState.isFullscreen && (
            <footer className="wp-bottom-bar">
              <div className="wp-bb-left">
                 <div className="wp-bb-time-room">
                   <span className="wp-current-time">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   <span className="wp-divider-pipe">|</span>
                   <span className="wp-room-code">{wpState.roomId}</span>
                 </div>
              </div>

              <div className="wp-bb-center">
                <button className={`wp-bb-main-icon ${wpState.isMuted ? 'muted' : ''}`} onClick={() => toggleWpControl('isMuted')} title="Turn on/off microphone">
                  {wpState.isMuted ? '🔇' : '🎙️'}
                </button>
                <button className={`wp-bb-main-icon ${!wpState.isCamOn ? 'muted' : ''}`} onClick={() => toggleWpControl('isCamOn')} title="Turn on/off camera">
                  {wpState.isCamOn ? '📷' : '🚫'}
                </button>
                <button className={`wp-bb-main-icon ${wpState.showCC ? 'active-border' : ''}`} onClick={() => toggleWpControl('showCC')} title="Turn on captions">CC</button>
                <button className={`wp-bb-main-icon ${wpState.isScreenSharing ? 'active-border' : ''}`} onClick={() => toggleWpControl('isScreenSharing')} title="Share screen">🖥️</button>
                <button className={`wp-bb-main-icon ${wpState.isRecording ? 'recording-active' : ''}`} onClick={() => toggleWpControl('isRecording')} title="Record Session">⏺️</button>
                <button className="wp-bb-leave-btn" onClick={handleLeaveRoom} title="Leave party">📞</button>
              </div>

              <div className="wp-bb-right">
                <button className="wp-icon-btn" title="Party details" onClick={() => setShowReadyPopup(!showReadyPopup)}>ℹ️</button>
                <button className={`wp-icon-btn ${wpState.activeTab === 'participants' ? 'active-text' : ''}`} onClick={() => setWpState({...wpState, activeTab: 'participants'})} title="Show everyone">👥</button>
                <button className={`wp-icon-btn ${wpState.activeTab === 'chat' ? 'active-text' : ''}`} onClick={() => setWpState({...wpState, activeTab: 'chat'})} title="Chat with everyone">💬</button>
              </div>
            </footer>
          )}

          {/* 🔥 BROWSE MOVIES MODAL (Inside Room) 🔥 */}
          {showBrowseModal && (
            <div className="wp-modal-overlay" onClick={() => setShowBrowseModal(false)}>
              <div className="wp-browse-modal animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="wp-lm-header">
                  <h3>Select a Movie to Sync</h3>
                  <button className="wp-close-btn" onClick={() => setShowBrowseModal(false)}>✕</button>
                </div>
                <div className="wp-movie-grid">
                  {mockMovies.map(m => (
                    <div key={m.id} className="wp-movie-card" style={{backgroundImage: `url(${m.backdrop_path})`}} onClick={() => handleSelectMovie(m)}>
                      <div className="wp-mc-overlay">
                        <span>▶ Play</span>
                        <h4>{m.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==========================================
          🔥 CSS STYLES 🔥
          ========================================== */}
      <style>{`
        /* =========================================
           NEW DARK THEME LANDING PAGE CSS
           ========================================= */
        .wp-landing-wrapper { padding-top: 68px; min-height: 100vh; display: flex; flex-direction: column; background: #0a0a0c; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .wp-landing-container { display: flex; flex-direction: column; justify-content: center; align-items: center; flex: 1; padding: 0 5%; }
        .wp-glass-box { background: #18181b; border: 1px solid #27272a; border-radius: 16px; max-width: 900px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.5); position: relative; overflow: hidden; }
        .wp-split-layout { display: flex; width: 100%; min-height: 400px; }
        .wp-left-panel, .wp-right-panel { flex: 1; padding: 50px 40px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .wp-vertical-divider { width: 1px; background: #27272a; margin: 40px 0; }
        .wp-panel-icon { font-size: 32px; color: #a1a1aa; margin-bottom: 15px; }
        .wp-panel-title { font-size: 22px; font-weight: 600; color: #f4f4f5; margin-bottom: 25px; }
        
        .wp-dropdown-wrapper { position: relative; width: 100%; max-width: 300px; margin-bottom: 40px; z-index: 50; }
        .wp-btn-purple { width: 100%; display: flex; justify-content: space-between; align-items: center; background: #8b5cf6; color: white; border: none; padding: 0 20px; height: 50px; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer; transition: 0.2s; }
        .wp-btn-purple:hover { background: #7c3aed; }
        .wp-dropdown-arrow { font-size: 12px; }
        .wp-dropdown-menu { position: absolute; top: calc(100% + 8px); left: 0; width: 100%; background: #27272a; border: 1px solid #3f3f46; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .wp-dropdown-item { padding: 15px 20px; display: flex; align-items: center; gap: 12px; color: #e4e4e7; font-size: 14px; cursor: pointer; transition: 0.2s; text-align: left; }
        .wp-dropdown-item:hover { background: #3f3f46; color: white; }
        .wp-dd-icon { font-size: 16px; color: #a1a1aa; }

        .wp-panel-desc { font-size: 14px; color: #a1a1aa; line-height: 1.5; max-width: 280px; }
        .wp-panel-desc-small { font-size: 13px; color: #71717a; line-height: 1.5; max-width: 250px; margin-top: 20px;}

        .wp-join-form { width: 100%; max-width: 300px; display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; }
        .wp-input-dark { width: 100%; background: #27272a; border: 1px solid #3f3f46; color: white; padding: 0 15px; height: 50px; border-radius: 8px; font-size: 15px; outline: none; transition: 0.2s; text-align: center; }
        .wp-input-dark:focus { border-color: #8b5cf6; }
        .wp-btn-join { width: 100%; height: 50px; background: #3f3f46; color: #a1a1aa; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: not-allowed; transition: 0.2s; }
        .wp-btn-join.active { background: #e4e4e7; color: #18181b; cursor: pointer; }
        .wp-btn-join.active:hover { background: white; }
        .wp-box-footer { position: absolute; bottom: 15px; right: 25px; font-size: 12px; color: #71717a; }
        .wp-landing-footer { margin-top: 30px; font-size: 13px; color: #71717a; text-align: center; }

        @media (max-width: 800px) {
          .wp-split-layout { flex-direction: column; min-height: auto; }
          .wp-vertical-divider { width: 80%; height: 1px; margin: 0 auto; }
          .wp-left-panel, .wp-right-panel { padding: 40px 20px; }
          .wp-box-footer { position: static; text-align: center; padding: 15px; border-top: 1px solid #27272a; width: 100%; }
        }

        /* MODALS */
        .wp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 3000; display: flex; justify-content: center; align-items: center; }
        .wp-later-modal, .wp-browse-modal { background: #18181b; width: 100%; border-radius: 12px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); border: 1px solid #27272a; }
        .wp-later-modal { max-width: 400px; }
        .wp-browse-modal { max-width: 600px; }
        .wp-lm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .wp-lm-header h3 { font-size: 18px; font-weight: 500; color: #f4f4f5; margin: 0; }
        .wp-close-btn { background: transparent; border: none; font-size: 20px; color: #a1a1aa; cursor: pointer; transition: 0.2s;}
        .wp-close-btn:hover { color: white; }
        .wp-lm-text { font-size: 14px; color: #a1a1aa; line-height: 1.5; margin-bottom: 20px; }
        .wp-lm-link-box { background: #27272a; padding: 12px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #3f3f46; }
        .wp-lm-link-text { color: #f4f4f5; font-size: 14px; letter-spacing: 0.5px; user-select: text; }
        .wp-lm-copy-btn { background: transparent; border: none; font-size: 18px; cursor: pointer; color: #a1a1aa; transition: 0.2s; }
        .wp-lm-copy-btn:hover { color: white; }

        /* Movie Browser Grid */
        .wp-movie-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
        .wp-movie-card { height: 120px; border-radius: 8px; background-size: cover; background-position: center; position: relative; cursor: pointer; overflow: hidden; border: 2px solid transparent; transition: 0.2s;}
        .wp-movie-card:hover { border-color: #8b5cf6; transform: scale(1.02); }
        .wp-mc-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0; transition: 0.2s; color: white;}
        .wp-movie-card:hover .wp-mc-overlay { opacity: 1; }
        .wp-mc-overlay span { font-size: 20px; margin-bottom: 5px; color: #8b5cf6;}
        .wp-mc-overlay h4 { font-size: 14px; text-align: center; padding: 0 10px; }

        /* ACTIVE ROOM */
        .wp-room-fullscreen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #0f0f11; z-index: 9999; display: flex; flex-direction: column; color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;}
        .wp-active-layout { display: flex; flex-direction: column; height: 100%; width: 100%; }
        .wp-main-content { flex: 1; display: flex; padding: 15px; gap: 15px; overflow: hidden; background: #0f0f11; margin-top: 68px;}

        /* Video Area */
        .wp-video-col { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative;}
        .wp-player-container { flex: 1; background: #18181b; border-radius: 12px; position: relative; background-size: cover; background-position: center; overflow: hidden; border: 1px solid #27272a; display: flex; justify-content: center; align-items: center;}
        
        .wp-blank-screen { text-align: center; color: #a1a1aa; display: flex; flex-direction: column; align-items: center; gap: 15px; padding: 40px; background: rgba(0,0,0,0.5); border-radius: 16px;}
        .wp-blank-icon { font-size: 60px; margin-bottom: 10px; }
        .wp-blank-screen h2 { color: white; font-size: 24px; }
        .wp-browse-btn { background: #8b5cf6; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: 0.2s; }
        .wp-browse-btn:hover { background: #7c3aed; }

        .wp-screen-share-overlay { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .wp-ss-icon { font-size: 80px; }
        .wp-stop-ss-btn { background: #ef4444; color: white; border: none; padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; margin-top: 10px;}
        .wp-stop-ss-btn:hover { background: #dc2626; }

        .wp-cc-text { position: absolute; bottom: 90px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 8px 16px; border-radius: 4px; font-size: 16px; font-family: sans-serif; letter-spacing: 0.5px;}

        .wp-ready-popup { position: absolute; bottom: 20px; left: 20px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; width: 360px; box-shadow: 0 10px 25px rgba(0,0,0,0.8); z-index: 100;}
        .wp-rp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;}
        .wp-rp-header h3 { color: #f4f4f5; font-size: 18px; font-weight: 500; margin: 0;}
        .wp-close-btn-dark { background: transparent; border: none; color: #a1a1aa; font-size: 18px; cursor: pointer;}
        .wp-close-btn-dark:hover { color: white; }
        .wp-rp-add-btn { background: #8b5cf6; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px; transition: 0.2s; width: 100%;}
        .wp-rp-add-btn:hover { background: #7c3aed; }
        .wp-rp-subtitle { color: #a1a1aa; font-size: 13px; margin-bottom: 10px; line-height: 1.4;}
        .wp-rp-link-box { background: #27272a; padding: 10px 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border: 1px solid transparent;}
        .wp-rp-link-box:hover { border-color: #3f3f46; }
        .wp-rp-link-text { color: #f4f4f5; font-size: 13px; letter-spacing: 0.5px;}
        .wp-rp-footer { display: flex; gap: 10px; font-size: 11px; color: #71717a; line-height: 1.4; align-items: flex-start;}

        /* Video Controls */
        .wp-player-controls { position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: 20px; display: flex; flex-direction: column; gap: 15px; }
        .wp-player-title { font-size: 18px; font-weight: bold; text-shadow: 1px 1px 3px black; margin-bottom: -5px; }
        .wp-progress-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; position: relative; cursor: pointer; }
        .wp-progress-fill { height: 100%; background: #8b5cf6; border-radius: 2px; transition: width 1s linear; }
        .wp-progress-thumb { width: 12px; height: 12px; background: white; border-radius: 50%; position: absolute; top: -4px; box-shadow: 0 0 5px rgba(0,0,0,0.5); transition: left 1s linear; }
        .wp-controls-row { display: flex; justify-content: space-between; align-items: center; }
        .wp-cr-left, .wp-cr-right { display: flex; align-items: center; gap: 15px; }
        .wp-time-text { font-size: 13px; color: #D1D5DB; }
        .active-text { color: #8b5cf6 !important; font-weight: bold;}

        /* Sidebar */
        .wp-sidebar-col { width: 360px; background: #18181b; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0; border: 1px solid #27272a;}
        .wp-tabs { display: flex; border-bottom: 1px solid #27272a; }
        .wp-tab { flex: 1; padding: 15px 0; background: transparent; border: none; color: #a1a1aa; font-size: 14px; font-weight: 500; cursor: pointer; transition: 0.2s;}
        .wp-tab.active { border-bottom: 3px solid #8b5cf6; color: white;}
        
        .wp-chat-container { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
        .wp-msg-wrapper { display: flex; gap: 10px; width: 100%; flex-direction: column;}
        .wp-msg-content { display: flex; flex-direction: column; gap: 4px; }
        .wp-msg-header { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .wp-msg-name { color: #f4f4f5; font-weight: 500; }
        .wp-msg-time { color: #71717a; font-size: 11px; }
        .wp-msg-bubble { font-size: 13px; line-height: 1.4; color: #e4e4e7; }

        .wp-participants-container { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .wp-participant-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: #27272a; border-radius: 8px; }
        .wp-p-avatar { font-size: 24px; width: 40px; height: 40px; background: #3f3f46; border-radius: 50%; display: flex; justify-content: center; align-items: center;}
        .wp-p-name { flex: 1; font-size: 14px; font-weight: 500; }
        .wp-p-status { font-size: 12px; }
        .wp-start-party-btn { background: transparent; border: 1px dashed #8b5cf6; color: #8b5cf6; padding: 10px; border-radius: 8px; cursor: pointer; transition: 0.2s; margin-top: 10px; }
        .wp-start-party-btn:hover { background: rgba(139, 92, 246, 0.1); }

        .wp-chat-input-box { padding: 15px; border-top: 1px solid #27272a; display: flex; gap: 10px; background: #18181b; }
        .wp-chat-input-box input { flex: 1; background: #27272a; border: 1px solid #3f3f46; color: #f4f4f5; padding: 12px 15px; border-radius: 24px; outline: none; font-size: 13px; transition: 0.2s;}
        .wp-chat-input-box input:focus { border-color: #8b5cf6; }
        .wp-send-btn { background: transparent; border: none; color: #8b5cf6; font-size: 18px; cursor: pointer; transition: 0.2s; }
        .wp-send-btn:hover { color: #7c3aed; transform: scale(1.1); }

        /* BOTTOM CONTROL BAR */
        .wp-bottom-bar { height: 80px; background: #0f0f11; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
        .wp-bb-time-room { display: flex; align-items: center; gap: 10px; color: #e4e4e7; font-size: 14px; font-weight: 500;}
        .wp-divider-pipe { color: #3f3f46; }

        .wp-bb-center { display: flex; align-items: center; gap: 12px; }
        .wp-bb-main-icon { width: 44px; height: 44px; border-radius: 50%; background: #27272a; border: 1px solid #3f3f46; color: white; font-size: 16px; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; }
        .wp-bb-main-icon:hover { background: #3f3f46; }
        .wp-bb-main-icon.muted { background: #ef4444; color: white; border-color: #ef4444;}
        .wp-bb-main-icon.active-border { border-color: #8b5cf6; color: #8b5cf6; }
        .wp-bb-main-icon.recording-active { background: #ef4444; border-color: #ef4444; animation: blink 1.5s infinite;}
        
        .wp-bb-leave-btn { width: 64px; height: 44px; border-radius: 22px; background: #ef4444; border: none; color: white; font-size: 18px; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; margin-left: 5px;}
        .wp-bb-leave-btn:hover { background: #dc2626; }

        .wp-bb-right { display: flex; align-items: center; gap: 15px; }
        .wp-icon-btn { background: transparent; border: none; font-size: 18px; color: #a1a1aa; cursor: pointer; transition: 0.2s; }
        .wp-icon-btn:hover { color: white; }

        /* ANIMATIONS */
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-scale-up { animation: scaleUp 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; transform-origin: center;}
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        /* Hide elements dynamically in Fullscreen mode handled via React instead of CSS mostly, but fallback just in case */
        :fullscreen .wp-sidebar-col, :fullscreen .wp-bottom-bar, :fullscreen .wp-ready-popup { display: none !important; }

        @media (max-width: 900px) {
          .wp-active-layout { flex-direction: column; height: auto; }
          .wp-sidebar-col { width: 100%; height: 400px; margin-top: 15px;}
          .wp-bb-time-room, .wp-bb-right { display: none; } 
          .wp-bottom-bar { justify-content: center; }
          .wp-ready-popup { left: 5px; right: 5px; width: auto; bottom: 5px; }
        }
      `}</style>
    </div>
  );
}