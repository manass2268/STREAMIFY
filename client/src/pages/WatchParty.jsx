import { useState } from 'react';

export default function WatchPartyDashboard() {
  const [joinCode, setJoinCode] = useState('');

  // 1. 🔥 Start a Watch Party (Generates unique room and opens Meet Engine)
  const handleStartParty = () => {
    // Unique Room ID generate karein (jaise: wp-abc123xyz)
    const uniqueRoomId = 'wp-' + Math.random().toString(36).substring(2, 9);
    
    // Aapke naye Streamify Meet Engine ka local port URL
    const meetEngineUrl = `http://localhost:5173/room/${uniqueRoomId}?host=true`;
    
    // Naye tab me ya same tab me redirect karein
    window.location.href = meetEngineUrl;
  };

  // 2. 🔥 Join an Existing Watch Party (Takes room code and opens Meet Engine)
  const handleJoinParty = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    // Clean up code format
    const cleanRoomId = joinCode.trim().replace(/^.*[\\/]/, '');

    // Meet Engine ka URL
    const meetEngineUrl = `http://localhost:5173/room/${cleanRoomId}?host=false`;
    
    window.location.href = meetEngineUrl;
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-white flex flex-col items-center justify-center p-6">
      
      {/* Top Nav Header Mock */}
      <div className="absolute top-6 left-8 flex items-center gap-3">
        <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
          STREAMIFY
        </span>
      </div>

      <div className="w-full max-w-4xl bg-[#080911]/90 border border-white/10 rounded-[30px] p-8 shadow-[0_0_50px_rgba(139,92,246,0.15)] backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* LEFT BOX: Start a Watch Party */}
        <div className="flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
            🎬
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Start a Watch Party</h2>
          <p className="text-gray-400 text-xs mb-6 leading-relaxed">
            Create secure, feature-rich watch parties with Meet-style Waiting Rooms & host controls.
          </p>
          <button 
            onClick={handleStartParty}
            className="w-full py-3 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' }}
          >
            Start Party Now
          </button>
        </div>

        {/* RIGHT BOX: Join an Existing Party */}
        <div className="flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
            🔗
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Join an Existing Party</h2>
          <p className="text-gray-400 text-xs mb-6 leading-relaxed">
            Host must approve your entry before you can view the stream. Enter code below.
          </p>
          
          <form onSubmit={handleJoinParty} className="w-full flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="e.g. wp-abc123xyz" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white text-sm outline-none focus:border-cyan-400 transition-colors text-center font-mono"
            />
            <button 
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
            >
              Ask to Join
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}