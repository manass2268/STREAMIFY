import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';
import { auth, realtimeDb, db } from '../firebase';
import { signOut, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { ref, set, onDisconnect } from 'firebase/database';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export default function Dashboard() {
  const navigate = useNavigate();

  // ==========================================
  // 1. ALL STATES
  // ==========================================
  const [showGate, setShowGate] = useState(() => {
    const saved = localStorage.getItem('showGate');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'home');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 🔥 FIX: Loading State wapas add kar diya
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [userData, setUserData] = useState({ name: 'Loading...', email: '', role: 'standard_user', plan: 'free', photoURL: '', uid: '' });
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(() => localStorage.getItem('currentProfile') || null);
  
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newAvatar, setNewAvatar] = useState('😊');
  const avatarOptions = ['👩', '👨‍🚀', '😊', '🐼', '🧛‍♂️'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // TMDB CATEGORY STATES
  const [heroMovie, setHeroMovie] = useState(null);
  const [movieData, setMovieData] = useState({
    trending: [], topRated: [], action: [], comedy: [], 
    horror: [], romance: [], sciFi: [], thriller: [], 
    crime: [], mystery: [], kids: [], kidsRev: []
  });

  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; 
  const API_KEY = "4e2f2d31c8fd1c86574cd70c54d9dbbd"; 

  const currentProfObj = profiles.find(p => p.name === currentProfile);

  // ==========================================
  // 🔥 SMART VERTICAL INFINITE SCROLL ENGINE 🔥
  // ==========================================
  const baseAdultRows = [
    { id: 'r1', title: 'Trending Now', dataKey: 'trending', isTop10: true },
    { id: 'r2', title: 'Top Rated Masterpieces', dataKey: 'topRated', isTop10: false },
    { id: 'r3', title: 'Action & Adventure', dataKey: 'action', isTop10: false },
    { id: 'r4', title: 'Sci-Fi & Fantasy', dataKey: 'sciFi', isTop10: false },
    { id: 'r5', title: 'Laugh Out Loud', dataKey: 'comedy', isTop10: false },
    { id: 'r6', title: 'Gritty & Ominous Thrillers', dataKey: 'thriller', isTop10: false },
    { id: 'r7', title: 'Crime Detectives', dataKey: 'crime', isTop10: false },
    { id: 'r8', title: 'Epic Romances', dataKey: 'romance', isTop10: false },
    { id: 'r9', title: 'Chills & Horror', dataKey: 'horror', isTop10: false },
    { id: 'r10', title: 'Mind-Bending Mysteries', dataKey: 'mystery', isTop10: false },
  ];

  const baseKidsRows = [
    { id: 'k1', title: 'Animation & Fun', dataKey: 'kids', isTop10: true },
    { id: 'k2', title: 'Learn & Play', dataKey: 'kidsRev', isTop10: false },
    { id: 'k3', title: 'Family Movie Night', dataKey: 'kids', isTop10: false },
  ];

  const [visibleRows, setVisibleRows] = useState([]);
  const bottomBoundaryRef = useRef(null);

  useEffect(() => {
    setVisibleRows(currentProfile === 'Kids' ? baseKidsRows : baseAdultRows);
  }, [currentProfile]);

  const loadMoreRows = useCallback(() => {
    setVisibleRows(prev => {
      if (prev.length > 30) return prev; 
      const base = currentProfile === 'Kids' ? baseKidsRows : baseAdultRows;
      const appendedRows = base.map(row => ({ ...row, id: row.id + '_' + Date.now() + Math.random() }));
      return [...prev, ...appendedRows];
    });
  }, [currentProfile]);

  useEffect(() => {
    if (!bottomBoundaryRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRows();
        }
      },
      { rootMargin: '800px', threshold: 0 }
    );
    observer.observe(bottomBoundaryRef.current);
    return () => observer.disconnect();
  }, [loadMoreRows]);


  // ==========================================
  // 2. LIFECYCLE HOOKS (API FETCHING)
  // ==========================================

  useEffect(() => {
    const fetchAllMovies = async () => {
      try {
        const endpoints = [
          { key: 'trending', url: `/trending/all/week?api_key=${API_KEY}&language=en-US` },
          { key: 'topRated', url: `/movie/top_rated?api_key=${API_KEY}&language=en-US` },
          { key: 'action', url: `/discover/movie?api_key=${API_KEY}&with_genres=28` },
          { key: 'comedy', url: `/discover/movie?api_key=${API_KEY}&with_genres=35` },
          { key: 'horror', url: `/discover/movie?api_key=${API_KEY}&with_genres=27` },
          { key: 'romance', url: `/discover/movie?api_key=${API_KEY}&with_genres=10749` },
          { key: 'sciFi', url: `/discover/movie?api_key=${API_KEY}&with_genres=878` },
          { key: 'thriller', url: `/discover/movie?api_key=${API_KEY}&with_genres=53` },
          { key: 'crime', url: `/discover/movie?api_key=${API_KEY}&with_genres=80` },
          { key: 'mystery', url: `/discover/movie?api_key=${API_KEY}&with_genres=9648` },
          { key: 'kids', url: `/discover/movie?api_key=${API_KEY}&with_genres=16` }
        ];

        const responses = await Promise.all(endpoints.map(ep => fetch(`https://api.themoviedb.org/3${ep.url}`)));
        const data = await Promise.all(responses.map(res => res.json()));

        let newObj = {};
        endpoints.forEach((ep, index) => {
          newObj[ep.key] = data[index].results ? data[index].results.filter(m => m.backdrop_path) : [];
        });
        
        newObj.kidsRev = [...newObj.kids].reverse();
        setMovieData(newObj);
        if (newObj.trending.length > 0) setHeroMovie(newObj.trending[Math.floor(Math.random() * newObj.trending.length)]);
      } catch (error) { console.error("TMDB Fetch Error"); }
    };
    fetchAllMovies();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]); return;
    }
    const fetchSearch = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=en-US&query=${searchQuery}&page=1`);
        const data = await res.json();
        setSearchResults(data.results ? data.results.filter(m => m.backdrop_path || m.poster_path) : []);
      } catch (error) { console.error("Search failed"); }
    };
    const timeoutId = setTimeout(fetchSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('showGate', JSON.stringify(showGate));
    localStorage.setItem('activeTab', activeTab);
    if (currentProfile) localStorage.setItem('currentProfile', currentProfile);
  }, [showGate, activeTab, currentProfile]);

  // 🔥 FIX: Firebase Authentication & Profile Setup 🔥
  useEffect(() => {
    let unsubscribeFirestore = null;
    let userStatusRef = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        userStatusRef = ref(realtimeDb, '/online_users/' + currentUser.uid);
        set(userStatusRef, { name: currentUser.displayName || 'User', online: true, timestamp: Date.now() });
        onDisconnect(userStatusRef).remove();

        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({ uid: currentUser.uid, name: data.name || currentUser.displayName || 'User', email: data.email || currentUser.email || '' });
            
            if (data.profiles && data.profiles.length > 0) {
              setProfiles(data.profiles);
            } else {
              const defaultProfile = [{ id: 1, name: currentUser.displayName || 'Main User', type: 'adult', avatar: '👑', pin: null }];
              setDoc(userDocRef, { profiles: defaultProfile }, { merge: true });
              setProfiles(defaultProfile);
            }
          } else {
             const defaultProfile = [{ id: 1, name: currentUser.displayName || 'Main User', type: 'adult', avatar: '👑', pin: null }];
             setDoc(userDocRef, { name: currentUser.displayName || 'User', email: currentUser.email || '', profiles: defaultProfile }, { merge: true });
             setProfiles(defaultProfile);
          }
          setIsProfileLoading(false); // Stop loading animation
        });
      } else {
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

  const showCustomToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  // 🔥 FIX: Add Profile and Logout Logic 🔥
  const handleAction = async (actionType, e = null) => {
    if (e) e.preventDefault();
    const currentUser = auth.currentUser;

    try {
      setIsUpdating(true);
      if (actionType === 'logout') {
        localStorage.clear(); 
        if (currentUser) await set(ref(realtimeDb, '/online_users/' + currentUser.uid), null); 
        await signOut(auth); 
        navigate('/login');
      } 
      else if (actionType === 'addProfile') {
        if (!newProfileName.trim()) return showCustomToast("Please enter a Profile Name!", "error");
        const newObj = { id: Date.now(), name: newProfileName.trim(), type: 'adult', avatar: newAvatar, pin: null };
        const updatedProfilesList = [...profiles, newObj];
        setProfiles(updatedProfilesList); 
        setNewProfileName(''); setNewAvatar('😊'); setShowAddProfileModal(false); 
        await updateDoc(doc(db, 'users', currentUser.uid), { profiles: updatedProfilesList });
        showCustomToast(`Created Profile: ${newObj.name}! ✨`, "success");
      }
    } catch (error) { showCustomToast(`Action Failed!`, "error"); } 
    finally { setIsUpdating(false); }
  };

  const handleProfileClick = (profile) => {
    setCurrentProfile(profile.name); setShowGate(false); 
  };

  // ==========================================
  // 4. MINI COMPONENTS (EXACT NETFLIX CARDS)
  // ==========================================

  const NetflixCard = React.memo(({ movie, index, isTop10 }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerKey, setTrailerKey] = useState(null);
    const hoverTimeoutRef = useRef(null);

    const handleMouseEnter = () => {
      setIsHovered(true); 
      hoverTimeoutRef.current = setTimeout(async () => {
        if (!trailerKey) {
          try {
            const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
            const res = await fetch(`https://api.themoviedb.org/3/${type}/${movie.id}/videos?api_key=${API_KEY}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              const trailer = data.results.find(vid => vid.site === "YouTube" && vid.type === "Trailer") || data.results.find(vid => vid.site === "YouTube");
              if (trailer) {
                setTrailerKey(trailer.key);
                setShowTrailer(true);
              }
            }
          } catch (e) {}
        } else {
          setShowTrailer(true);
        }
      }, 1500); 
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setShowTrailer(false);
      clearTimeout(hoverTimeoutRef.current);
    };

    const imagePath = movie.backdrop_path || movie.poster_path;
    if (!imagePath) return null;

    const title = movie.title || movie.name || "Unknown";
    const isTV = movie.first_air_date ? true : false;
    
    let originClass = "origin-center";
    if (index % 10 === 0) originClass = "origin-left"; 
    else if (index % 10 === 9) originClass = "origin-right";

    return (
      <div className={`netflix-card-container ${originClass}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="card-image-wrapper">
          <img src={`${TMDB_IMAGE_BASE_URL}${imagePath}`} alt={title} className="netflix-card-img" loading="lazy" />
          {showTrailer && trailerKey && (
            <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}`} title="trailer" allow="autoplay; encrypted-media" className="netflix-card-trailer" frameBorder="0" loading="lazy" />
          )}
          {isTop10 && <div className="net-top10-badge">TOP<br/>10</div>}
          <div className="recently-added-badge">Recently added</div>
        </div>
        {!isHovered && <div className="net-movie-title-overlay">{title}</div>}

        <div className="netflix-card-details">
          <div className="ncd-buttons">
            <div className="ncd-actions-left">
              <button className="ncd-btn play-btn-exact" onClick={() => showCustomToast(`Playing ${title}`, 'success')} title="Play"><svg viewBox="0 0 24 24" width="20" height="20" fill="black"><path d="M6 4l15 8-15 8z"></path></svg></button>
              <button className="ncd-btn round-btn" onClick={() => showCustomToast(`Added to My List`, 'success')} title="Add"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"></path></svg></button>
              <button className="ncd-btn round-btn" title="Like"><svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"></path></svg></button>
            </div>
            <button className="ncd-btn round-btn info-btn" title="More Info"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg></button>
          </div>
          <div className="ncd-meta">
            <span className="ncd-match">98% Match</span><span className="ncd-age-badge">A</span><span className="dot">•</span>
            <span>{isTV ? '6 Episodes' : '2h 15m'}</span><span className="dot">•</span><span className="ncd-hd-badge">HD</span>
          </div>
          <div className="ncd-genres">Gritty <span className="pipe">|</span> Action <span className="pipe">|</span> Thriller</div>
        </div>
      </div>
    );
  });

  const NetflixRow = React.memo(({ title, movies, isTop10Row }) => {
    const rowRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [loopedMovies, setLoopedMovies] = useState([]);

    useEffect(() => {
      if (movies && movies.length > 0) setLoopedMovies([...movies, ...movies]);
    }, [movies]);

    const scroll = (direction) => {
      if (rowRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = rowRef.current;
        const scrollAmount = clientWidth * 0.8; 
        if (direction === 'right') {
          if (scrollLeft + clientWidth >= scrollWidth - (clientWidth * 1.5)) setLoopedMovies(prev => prev.length < 60 ? [...prev, ...movies] : prev);
          rowRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
          setShowLeftArrow(true);
        } else {
          if (scrollLeft <= 0) rowRef.current.scrollTo({ left: scrollWidth / 2, behavior: 'smooth' }); 
          else rowRef.current.scrollTo({ left: scrollLeft - scrollAmount, behavior: 'smooth' });
          if (scrollLeft - scrollAmount <= 0) setShowLeftArrow(false);
        }
      }
    };

    if (!movies || movies.length === 0) return null;

    return (
      <div className="netflix-row-wrapper">
        <h3 className="netflix-row-title">{title}</h3>
        <div className="netflix-row-container">
          {showLeftArrow && <button className="slider-arrow left-arrow" onClick={() => scroll('left')}>&#10094;</button>}
          <div className="netflix-row" ref={rowRef}>
            {loopedMovies.map((movie, index) => <NetflixCard key={`${title}-${movie.id}-${index}`} movie={movie} index={index} isTop10={isTop10Row && (index % movies.length) < 5} />)}
          </div>
          <button className="slider-arrow right-arrow" onClick={() => scroll('right')}>&#10095;</button>
        </div>
      </div>
    );
  });

  // ==========================================
  // 5. MAIN RENDER (UI)
  // ==========================================

  // 🔥 FIX: Restored the Gate UI with Loading and Add Profile 🔥
  if (showGate) {
    return (
      <div className="gate-container">
        <div className="gate-header"><img src={logo} alt="Logo" className="gate-logo" /><span className="brand-text-colored">stream<span className="text-cyan">ify</span></span></div>
        
        {isProfileLoading ? (
          <div className="animate-pulse-glow" style={{ fontSize: '20px', color: '#808080', marginTop: '30vh' }}>
            Loading your cinematic profiles... 🍿
          </div>
        ) : (
          <div className="profiles-screen animate-fade-in">
            <h1 className="gate-main-title">Who's watching?</h1>
            <div className="gate-profiles-grid">
              {profiles.map(p => (
                <div key={p.id} className="gate-profile-card" onClick={() => handleProfileClick(p)}>
                  <div className="gate-avatar-box" style={p.avatar === '😊' ? {background: 'linear-gradient(135deg, #007bff, #a855f7)'} : {}}>{p.avatar}</div>
                  <span className="gate-profile-name">{p.name}</span>
                </div>
              ))}
              {/* Add Profile Button */}
              <div className="gate-profile-card" onClick={() => setShowAddProfileModal(true)}>
                <div className="gate-avatar-box gate-add-box">+</div>
                <span className="gate-profile-name">Add Profile</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Adding Profile */}
        {showAddProfileModal && (
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
                <div className="hs-input-group"><input type="text" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} required autoFocus /><label>Profile Alias</label></div>
                <button type="submit" className="hs-fab" disabled={isUpdating}>✓</button>
              </form>
            </div>
          </div>
        )}

        <InlineStyles />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {toast.show && (<div className={`custom-toast animate-toast-slide ${toast.type}`}><span className="toast-msg">{toast.message}</span></div>)}

      <nav className={`net-navbar ${isScrolled || activeTab !== 'home' ? 'scrolled' : ''}`}>
        <div className="net-nav-left">
          <div className="net-brand" onClick={() => setShowGate(true)}><img src={logo} alt="Logo" className="brand-img" /><span className="brand-text-colored">stream<span className="text-cyan">ify</span></span></div>
          <ul className="net-nav-links">
            <li className={activeTab === 'home' ? 'active' : ''} onClick={() => {setActiveTab('home'); setSearchQuery('');}}>Home</li>
            <li onClick={() => showCustomToast('TV Shows coming soon')}>TV Shows</li>
            <li onClick={() => showCustomToast('Movies coming soon')}>Movies</li>
          </ul>
        </div>
        <div className="net-nav-right">
          <div className="net-search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Titles, people, genres" value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); if(activeTab !== 'home') setActiveTab('home');}} />
          </div>
          <div className="net-kids-link" onClick={() => setCurrentProfile('Kids')}><div className="kids-avatar-mini">🧸</div></div>
          <div className="net-profile-trigger" onClick={() => handleAction('logout')} title="Logout">
             <div className="net-main-avatar">{currentProfObj?.avatar || '👑'}</div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'home' && (
          <div className="tab-content animate-fade-in">
            {searchQuery.trim() !== '' ? (
              <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '50px' }}>
                <h2 style={{ paddingLeft: '4%', marginBottom: '30px', fontSize: '24px', fontWeight: 'bold' }}>Search Results for "{searchQuery}"</h2>
                <div className="search-results-grid">
                  {searchResults.length > 0 ? searchResults.map((movie, index) => (
                    <NetflixCard key={`search-${movie.id}`} movie={movie} index={index} />
                  )) : (
                    <p style={{ marginLeft: '4%', color: '#808080' }}>No movies found.</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="net-hero-banner" style={{ 
                  backgroundImage: heroMovie?.backdrop_path ? `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})` : 'url(https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000)'
                }}>
                  <div className="net-hero-vignette"></div>
                  <div className="net-hero-content">
                    <h1 className="cinematic-title">{heroMovie?.title || heroMovie?.name || "Loading..."}</h1>
                    <div className="net-hero-meta">
                      <span className="net-match">Top 10 in India Today</span>
                      <span className="net-age">U/A 16+</span>
                      <span className="net-hd">4K Ultra HD</span>
                    </div>
                    <p className="net-hero-desc">
                      {heroMovie?.overview ? (heroMovie.overview.length > 180 ? heroMovie.overview.substring(0, 180) + "..." : heroMovie.overview) : "Fetching live data from TMDB..."}
                    </p>
                    <div className="net-hero-buttons">
                      <button className="net-btn-play"><span>▶</span> Play</button>
                      <button className="net-btn-info"><span>ⓘ</span> More Info</button>
                    </div>
                  </div>
                </div>

                <div className="net-sliders-container">
                  {visibleRows.map((row) => (
                    <NetflixRow key={row.id} title={row.title} movies={movieData[row.dataKey]} isTop10Row={row.isTop10} />
                  ))}
                  
                  {/* Invisible boundary to load rows seamlessly */}
                  <div ref={bottomBoundaryRef} style={{ width: '100%', height: '5px', background: 'transparent' }}></div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <InlineStyles />
    </div>
  );
}

// ==========================================
// 6. STYLES COMPONENT (CSS MAGIC)
// ==========================================
const InlineStyles = () => (
  <style>{`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    html, body, #root { 
      min-height: 100vh; 
      overflow-y: auto !important; 
      overflow-x: hidden; 
      background-color: #141414; 
      color: #fff; 
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
    }
    
    .dashboard-container { min-height: 100vh; width: 100%; display: flex; flex-direction: column; overflow-x: hidden; }
    .main-content { flex: 1; padding-bottom: 50px; overflow-y: visible; }

    .net-navbar { position: fixed; top: 0; left: 0; width: 100%; height: 68px; padding: 0 4%; display: flex; justify-content: space-between; align-items: center; z-index: 2000; transition: background-color 0.4s ease; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 10%, rgba(0,0,0,0)); }
    .net-navbar.scrolled { background-color: #141414; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
    .net-nav-left, .net-nav-right { display: flex; align-items: center; gap: 20px; }
    .net-brand { display: flex; align-items: center; gap: 5px; cursor: pointer; }
    .brand-img { height: 28px; filter: drop-shadow(0 0 5px rgba(6,182,212,0.5)); }
    .brand-text-colored { 
      font-size: 26px; 
      font-weight: 900; 
      color: #ffffff; 
      letter-spacing: 1px; 
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8); 
    }
    
    .brand-text-colored .text-cyan { 
      background: linear-gradient(to right, #a855f7, #00d2ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
    }
    .net-nav-links { display: flex; list-style: none; gap: 20px; margin-left: 20px; }
    .net-nav-links li { font-size: 14px; font-weight: 500; color: #e5e5e5; cursor: pointer; transition: 0.3s; }
    .net-nav-links li:hover, .net-nav-links li.active { color: #ffffff; font-weight: bold; }
    
    .net-search-box { display: flex; align-items: center; background: rgba(0,0,0,0.75); border: 1px solid #ffffff; padding: 5px 12px; border-radius: 4px; gap: 8px; }
    .net-search-box input { background: transparent; border: none; color: white; outline: none; font-size: 14px; width: 200px; }
    .net-main-avatar, .kids-avatar-mini { width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .net-main-avatar { background: linear-gradient(135deg, #a855f7, #e50914); }
    .kids-avatar-mini { background: #007bff; }

    .net-hero-banner { width: 100%; height: 85vh; position: relative; background-color: #141414; background-size: cover; background-position: center top; transition: background-image 0.5s ease-in-out;}
    .net-hero-vignette { position: absolute; inset: 0; background: linear-gradient(to right, rgba(20,20,20,0.9) 0%, rgba(20,20,20,0.2) 50%, transparent 100%), linear-gradient(to top, #141414 0%, transparent 25%); z-index: 1; }
    .net-hero-content { position: absolute; z-index: 2; bottom: 15%; left: 4%; max-width: 45%; }
    
    .cinematic-title { font-size: 45px; font-weight: 900; line-height: 1.1; margin-bottom: 15px; text-transform: uppercase; text-shadow: 2px 2px 4px rgba(0,0,0,0.6); }
    .net-hero-meta { display: flex; align-items: center; gap: 10px; font-weight: bold; color: #a3a3a3; margin-bottom: 15px; font-size: 14px; }
    .net-match { color: #46d369; }
    .net-age { border: 1px solid #a3a3a3; padding: 0 4px; border-radius: 2px; }
    .net-hd { border: 1px solid #a3a3a3; padding: 0 4px; border-radius: 2px; font-size: 10px; }
    .net-hero-desc { font-size: 16px; line-height: 1.5; margin-bottom: 25px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }
    .net-hero-buttons { display: flex; gap: 15px; }
    .net-btn-play { background: #fff; color: #000; border: none; padding: 8px 24px; border-radius: 4px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
    .net-btn-play:hover { background: rgba(255,255,255,0.75); }
    .net-btn-info { background: rgba(109,109,110,0.7); color: #fff; border: none; padding: 8px 24px; border-radius: 4px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
    .net-btn-info:hover { background: rgba(109,109,110,0.4); }

    .net-sliders-container { margin-top: -100px; position: relative; z-index: 10; padding-bottom: 50px; }
    
    .netflix-row-wrapper { margin-bottom: 2vw; position: relative; z-index: 1; transition: z-index 0.2s; }
    .netflix-row-wrapper:hover { z-index: 50; } 

    .netflix-row-title { font-size: 1.4vw; font-weight: bold; margin-bottom: -15px; padding-left: 4%; color: #e5e5e5; position: relative; z-index: 2; text-shadow: 1px 1px 2px black;}
    
    .netflix-row-container { position: relative; padding: 0 4%; }
    
    .slider-arrow { position: absolute; top: 100px; bottom: 350px; width: 4%; background: rgba(0,0,0,0.5); border: none; color: white; font-size: 40px; cursor: pointer; z-index: 20; opacity: 0; transition: opacity 0.3s ease, background 0.3s ease; display: flex; align-items: center; justify-content: center; }
    .slider-arrow:hover { background: rgba(0,0,0,0.8); font-size: 50px; }
    .left-arrow { left: 0; border-top-right-radius: 4px; border-bottom-right-radius: 4px; }
    .right-arrow { right: 0; border-top-left-radius: 4px; border-bottom-left-radius: 4px; }
    .netflix-row-wrapper:hover .slider-arrow { opacity: 1; }

    .netflix-row { 
      display: flex; gap: 8px; 
      overflow-x: scroll; 
      overflow-y: hidden;
      padding-top: 100px; padding-bottom: 350px; 
      margin-top: -100px; margin-bottom: -350px;
      scroll-behavior: smooth; 
      will-change: transform;
    }
    .netflix-row::-webkit-scrollbar { display: none; }

    .netflix-card-container { min-width: 260px; width: 260px; height: 146px; background-color: #141414; border-radius: 4px; position: relative; cursor: pointer; transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; transition-delay: 0s; z-index: 1; will-change: transform;}
    
    .origin-center { transform-origin: center center; }
    .origin-left { transform-origin: left center; }
    .origin-right { transform-origin: right center; }

    .card-image-wrapper { width: 100%; height: 100%; position: absolute; top: 0; left: 0; border-radius: 4px; overflow: hidden; background: #222;}
    .netflix-card-img { width: 100%; height: 100%; object-fit: cover; z-index: 1;}
    .netflix-card-trailer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 2; pointer-events: none;}
    
    .net-movie-title-overlay { position: absolute; bottom: 5px; left: 10px; right: 10px; font-weight: bold; font-size: 14px; text-shadow: 1px 1px 3px black; z-index: 5; text-align: center; opacity: 1; transition: 0.3s;}
    
    .net-top10-badge { position: absolute; top: 0; left: 0; background: #e50914; color: white; padding: 4px 6px; font-size: 10px; font-weight: 900; line-height: 1.1; border-bottom-right-radius: 4px; border-top-left-radius: 4px; text-align: center; z-index: 15; box-shadow: 2px 2px 5px rgba(0,0,0,0.5); }
    
    .recently-added-badge { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); background: #e50914; color: white; padding: 4px 10px; font-size: 11px; font-weight: bold; border-top-left-radius: 4px; border-top-right-radius: 4px; z-index: 10; opacity: 0; transition: opacity 0.3s; white-space: nowrap; box-shadow: 0 -2px 5px rgba(0,0,0,0.5); }

    .netflix-card-details { position: absolute; top: 100%; left: 0; right: 0; background-color: #181818; padding: 15px; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; opacity: 0; visibility: hidden; transition: opacity 0.2s ease, visibility 0.2s ease; box-shadow: 0 15px 25px rgba(0,0,0,0.9); z-index: 100; border: 1px solid #333; border-top: none; display: flex; flex-direction: column; gap: 12px; }
    
    .netflix-card-container:hover { transform: scale(1.45) !important; z-index: 1000 !important; box-shadow: 0 15px 40px rgba(0,0,0,1); border-bottom-left-radius: 0; border-bottom-right-radius: 0; transition-delay: 0s;}
    .netflix-card-container:hover .card-image-wrapper { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
    .netflix-card-container:hover .netflix-card-details { opacity: 1; visibility: visible; transition-delay: 0s;}
    .netflix-card-container:hover .recently-added-badge { opacity: 1; }
    .netflix-card-container:hover .net-movie-title-overlay { opacity: 0; }

    .ncd-buttons { display: flex; justify-content: space-between; align-items: center; margin-top: 5px; }
    .ncd-actions-left { display: flex; gap: 8px; }
    .ncd-btn { width: 34px; height: 34px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); background: #2a2a2a; color: white; display: flex; justify-content: center; align-items: center; cursor: pointer; font-size: 16px; transition: 0.2s; }
    .ncd-btn:hover { border-color: white; background: #444; }
    .play-btn-exact { background: white; color: black; border-color: white; padding-left: 2px; font-size: 16px; }
    .play-btn-exact:hover { background: #e5e5e5; }

    .ncd-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: bold; color: #bcbcbc; margin-top: 2px;}
    .ncd-match { color: #46d369; }
    .ncd-age-badge { background: transparent; border: 1px solid #808080; padding: 1px 6px; border-radius: 2px; color: white; font-size: 11px; }
    .ncd-hd-badge { border: 1px solid #808080; padding: 1px 4px; border-radius: 2px; font-size: 10px; color: white; }
    .ncd-meta .dot { font-size: 10px; }

    .ncd-genres { font-size: 13px; color: #fff; font-weight: 500; display: flex; align-items: center;}
    .ncd-genres .pipe { color: #666; margin: 0 8px; font-weight: normal; font-size: 10px;}

    .search-results-grid { display: flex; flex-wrap: wrap; gap: 20px; padding: 0 4%; justify-content: flex-start; overflow-y: visible; padding-top: 40px; margin-top: -40px;}

    /* MODAL STYLES RE-ADDED */
    .hs-modal-overlay { position: fixed; inset: 0; background: #0a0a0c; z-index: 3000; display: flex; justify-content: center; align-items: center; }
    .hs-modal-content { width: 100%; max-width: 450px; height: 100vh; max-height: 600px; background: #141414; display: flex; flex-direction: column; padding: 25px; position: relative; box-shadow: 0 0 50px rgba(0,0,0,0.8); border: 1px solid #333; border-radius: 8px;}
    .hs-header { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; margin-bottom: 50px; }
    .hs-back-btn { background: transparent; border: none; color: white; font-size: 26px; cursor: pointer; transition: 0.2s; }
    .hs-back-btn:hover { color: #e50914; }
    .hs-header h2 { font-size: 20px; font-weight: 600; color: white; }
    .hs-avatar-container { display: flex; gap: 20px; justify-content: center; align-items: center; margin-bottom: 60px; overflow-x: auto; padding-bottom: 15px; scrollbar-width: none; }
    .hs-avatar-container::-webkit-scrollbar { display: none; }
    .hs-avatar { min-width: 60px; height: 60px; border-radius: 50%; background: #1a1a24; display: flex; justify-content: center; align-items: center; font-size: 30px; cursor: pointer; opacity: 0.5; transition: 0.3s; filter: grayscale(80%); }
    .hs-avatar.selected { min-width: 90px; height: 90px; opacity: 1; filter: grayscale(0%); border: 3px solid white; background: linear-gradient(135deg, #007bff, #e50914); font-size: 45px; box-shadow: 0 0 25px rgba(229,9,20,0.4); }
    .hs-input-group { position: relative; margin-bottom: 35px; }
    .hs-input-group input { width: 100%; background: transparent; border: 1.5px solid #444; border-radius: 4px; padding: 18px 15px; color: white; font-size: 16px; outline: none; transition: 0.3s; }
    .hs-input-group input:focus { border-color: white; }
    .hs-input-group label { position: absolute; top: -10px; left: 15px; background: #141414; padding: 0 5px; font-size: 13px; color: #888; font-weight: 500; transition: 0.3s; }
    .hs-input-group input:focus + label { color: white; }
    .hs-fab { position: absolute; bottom: 40px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background: #e50914; border: none; color: white; font-size: 24px; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(229,9,20,0.4); transition: 0.3s; }
    .hs-fab:hover { transform: scale(1.08); background: #f40612;}
    .animate-pulse-glow { animation: pulseGlowText 1.5s infinite alternate; }
    @keyframes pulseGlowText { from { opacity: 0.5; text-shadow: 0 0 10px rgba(255,255,255,0.2); } to { opacity: 1; text-shadow: 0 0 20px rgba(255,255,255,0.8); } }

    @media (max-width: 900px) {
      .netflix-card-container { min-width: 150px; width: 150px; height: 85px; }
      .cinematic-title { font-size: 30px; }
      .net-hero-desc { font-size: 14px; }
      .net-hero-content { max-width: 80%; }
    }

    .custom-toast { position: fixed; top: 80px; right: 30px; z-index: 9999; background: rgba(14,14,22,0.9); backdrop-filter: blur(25px); border: 1px solid rgba(229,9,20,0.5); padding: 16px 24px; border-radius: 8px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.85); font-weight: 600; font-size: 14px; }
    .animate-toast-slide { animation: toastSlide 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes toastSlide{from{opacity:0;transform:translateY(-30px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
    
    .gate-container { width: 100vw; height: 100vh; background: #141414; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
    .gate-header { position: absolute; top: 30px; left: 4%; display: flex; align-items: center; gap: 10px; }
    .gate-logo { height: 36px; filter: drop-shadow(0 0 8px rgba(6,182,212,0.5)); }
    .gate-main-title { font-size: 3.5vw; font-weight: 500; margin-bottom: 2em; text-align: center; }
    .gate-profiles-grid { display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: center !important; gap: 35px !important; flex-wrap: wrap !important; width: 100%; max-width: 900px; margin: 0 auto; }
    .gate-profile-card { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; transition: transform 0.25s ease-in-out; }
    .gate-profile-card:hover { transform: scale(1.08); }
    .gate-avatar-box { width: 130px !important; height: 130px !important; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #06b6d4); display: flex; align-items: center; justify-content: center; font-size: 55px; border: 3px solid transparent; transition: all 0.2s ease; }
    .gate-profile-card:hover .gate-avatar-box { border-color: #ffffff !important; }
    .gate-add-box { background: transparent; border: 3px solid #808080; color: #808080; }
    .gate-profile-card:hover .gate-add-box { background: white; color: black; border-color: white; }
    .gate-profile-name { font-size: 16px !important; color: #808080; font-weight: 500; transition: color 0.2s ease; }
    .gate-profile-card:hover .gate-profile-name { color: #ffffff !important; }
  `}</style>
);