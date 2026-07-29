import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 🔥 Agar URL me "?play=true" hai toh direct movie chalegi, warna Modal khulega
  const autoPlay = searchParams.get('play') === 'true';
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  // Movie Details state
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_KEY = "4e2f2d31c8fd1c86574cd70c54d9dbbd";
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

  // Multi-server streaming URLs
  const servers = [
    { name: 'Server 1 (VidSrc Pro)', url: `https://vidsrc.to/embed/movie/${id}` },
    { name: 'Server 2 (2Embed API)', url: `https://www.2embed.cc/embed/${id}` },
    { name: 'Server 3 (SuperEmbed)', url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` },
    { name: 'Server 4 (VidSrc XYZ)', url: `https://vidsrc.xyz/embed/movie?tmdb=${id}` },
  ];

  const [currentServer, setCurrentServer] = useState(servers[0].url);
  const [activeIdx, setActiveIdx] = useState(0);

  // TMDB se movie metadata lana Modal ke liye
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`);
        const data = await res.json();
        if (data.id) {
          setMovie(data);
        } else {
          // Fallback agar TV show ho
          const tvRes = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`);
          const tvData = await tvRes.json();
          setMovie(tvData);
        }
      } catch (err) {
        console.error("Failed to fetch movie details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  // ==========================================
  // VIEW 1: NETFLIX DETAILS MODAL (Card click pe ye khulega)
  // ==========================================
  if (!isPlaying) {
    return (
      <div className="modal-screen animate-fade-in" onClick={() => navigate(-1)}>
        <div className="netflix-modal-card" onClick={(e) => e.stopPropagation()}>
          
          {/* CLOSE BUTTON */}
          <button className="modal-close-btn" onClick={() => navigate(-1)}>✕</button>

          {/* HERO BACKDROP IN MODAL */}
          <div 
            className="modal-hero" 
            style={{ 
              backgroundImage: movie?.backdrop_path ? `url(${TMDB_IMAGE_BASE_URL}${movie.backdrop_path})` : 'none' 
            }}
          >
            <div className="modal-hero-vignette"></div>
            <div className="modal-hero-content">
              <h1 className="modal-movie-title">{movie?.title || movie?.name || 'Loading...'}</h1>
              
              <div className="modal-action-row">
                <button className="modal-play-btn" onClick={() => setIsPlaying(true)}>
                  <span>▶</span> Play
                </button>
                <button className="modal-icon-btn" title="Add to My List">+</button>
                <button className="modal-icon-btn" title="Like">👍</button>
              </div>
            </div>
          </div>

          {/* META & STORY SECTION */}
          <div className="modal-body">
            <div className="modal-body-left">
              <div className="modal-meta-tags">
                <span className="match-tag">98% Match</span>
                <span className="year-tag">{movie?.release_date?.substring(0, 4) || '2026'}</span>
                <span className="age-badge">U/A 16+</span>
                <span className="hd-badge">4K Ultra HD</span>
              </div>
              
              <p className="modal-overview">
                {movie?.overview || "A ruthless enemy forces our heroes to fight against impossible odds, endangering everything they have built. But they won't let go so easily."}
              </p>
            </div>

            <div className="modal-body-right">
              <div className="modal-info-item">
                <span className="info-label">Genres: </span>
                <span className="info-val">
                  {movie?.genres?.map(g => g.name).join(', ') || 'Action, Thriller, Adrenaline Rush'}
                </span>
              </div>
              <div className="modal-info-item">
                <span className="info-label">Original Language: </span>
                <span className="info-val">{movie?.original_language?.toUpperCase() || 'EN'}</span>
              </div>
              <div className="modal-info-item">
                <span className="info-label">Status: </span>
                <span className="info-val">{movie?.status || 'Released'}</span>
              </div>
            </div>
          </div>

        </div>

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          .modal-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            z-index: 5000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow-y: auto;
          }

          .netflix-modal-card {
            width: 100%;
            max-width: 850px;
            background: #18181b;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.9);
            border: 1px solid #27272a;
            max-height: 90vh;
            overflow-y: auto;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }

          .netflix-modal-card::-webkit-scrollbar { display: none; }

          .modal-close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #18181b;
            color: #fff;
            border: none;
            font-size: 18px;
            cursor: pointer;
            z-index: 20;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
          }
          .modal-close-btn:hover { background: #27272a; }

          .modal-hero {
            width: 100%;
            height: 400px;
            background-size: cover;
            background-position: center;
            position: relative;
            display: flex;
            align-items: flex-end;
          }

          .modal-hero-vignette {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, #18181b 5%, transparent 60%);
          }

          .modal-hero-content {
            position: relative;
            z-index: 5;
            padding: 30px;
            width: 100%;
          }

          .modal-movie-title {
            font-size: 36px;
            font-weight: 900;
            margin-bottom: 20px;
            text-shadow: 2px 2px 5px rgba(0,0,0,0.8);
            text-transform: uppercase;
          }

          .modal-action-row {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .modal-play-btn {
            background: white;
            color: black;
            border: none;
            padding: 10px 28px;
            border-radius: 4px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: 0.2s;
          }
          .modal-play-btn:hover { background: #e5e5e5; }

          .modal-icon-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.5);
            background: rgba(42,42,42,0.6);
            color: white;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
          }
          .modal-icon-btn:hover { border-color: white; background: rgba(60,60,60,0.8); }

          .modal-body {
            padding: 20px 30px 40px;
            display: flex;
            gap: 30px;
          }

          .modal-body-left { flex: 2; }
          .modal-body-right { flex: 1; display: flex; flex-direction: column; gap: 12px; font-size: 14px; }

          .modal-meta-tags {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 14px;
          }

          .match-tag { color: #46d369; }
          .year-tag { color: #a3a3a3; }
          .age-badge { border: 1px solid #808080; padding: 1px 6px; border-radius: 2px; font-size: 12px; }
          .hd-badge { border: 1px solid #808080; padding: 1px 6px; border-radius: 2px; font-size: 10px; }

          .modal-overview {
            font-size: 15px;
            line-height: 1.6;
            color: #d4d4d8;
          }

          .info-label { color: #71717a; }
          .info-val { color: #e4e4e7; font-weight: 500; }

          .animate-fade-in { animation: fadeIn 0.25s ease forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

          @media (max-width: 768px) {
            .modal-hero { height: 260px; }
            .modal-movie-title { font-size: 24px; }
            .modal-body { flex-direction: column; padding: 15px 20px 30px; }
          }
        `}</style>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: FULL SCREEN STREAMING PLAYER
  // ==========================================
  return (
    <div className="player-screen">
      
      {/* TOP HEADER CONTROLS */}
      <div className="player-top-bar">
        {/* BACK BUTTON */}
        <button className="player-back-btn" onClick={() => navigate(-1)}>
          <span>←</span> Back
        </button>

        {/* SERVER SWITCHER BUTTONS */}
        <div className="server-switcher">
          <span className="server-label">Switch Server:</span>
          {servers.map((s, idx) => (
            <button
              key={idx}
              className={`server-btn ${activeIdx === idx ? 'active' : ''}`}
              onClick={() => {
                setCurrentServer(s.url);
                setActiveIdx(idx);
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* FULL SCREEN MOVIE PLAYER */}
      <iframe 
        key={currentServer}
        src={currentServer} 
        width="100%" 
        height="100%" 
        frameBorder="0" 
        allowFullScreen 
        title="Streamify Player"
        className="player-iframe"
        referrerPolicy="no-referrer"
      ></iframe>

      {/* STYLES */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; background: #000; }
        
        .player-screen {
          width: 100vw;
          height: 100vh;
          background-color: #000;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .player-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
        }

        .player-top-bar {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: none;
        }

        .player-back-btn, .server-btn {
          pointer-events: auto;
        }

        .player-back-btn {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .player-back-btn:hover {
          background: rgba(139, 92, 246, 0.9);
          border-color: #8b5cf6;
          transform: scale(1.05);
        }

        .server-switcher {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.7);
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(5px);
          pointer-events: auto;
        }

        .server-label {
          color: #a1a1aa;
          font-size: 13px;
          margin-right: 4px;
        }

        .server-btn {
          background: #27272a;
          color: #e4e4e7;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: 0.2s;
        }

        .server-btn:hover {
          background: #3f3f46;
          color: white;
        }

        .server-btn.active {
          background: #8b5cf6;
          color: white;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .player-top-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .player-back-btn {
            padding: 8px 15px;
            font-size: 13px;
          }
          .server-switcher {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}