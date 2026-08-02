import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function StreamifyPlayer({ videoId, videoSrc, poster, title, onNextEpisode }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [doubleTapAlert, setDoubleTapAlert] = useState(null);

  const controlsTimeoutRef = useRef(null);

  // Auto-Resume feature
  useEffect(() => {
    const savedTime = localStorage.getItem(`streamify_resume_${videoId}`);
    if (savedTime && videoRef.current) {
      videoRef.current.currentTime = parseFloat(savedTime);
    }
  }, [videoId]);

  const saveResumeProgress = useCallback(() => {
    if (videoRef.current && currentTime > 5) {
      localStorage.setItem(`streamify_resume_${videoId}`, currentTime.toString());
    }
  }, [videoId, currentTime]);

  useEffect(() => {
    const timer = setInterval(saveResumeProgress, 5000);
    return () => clearInterval(timer);
  }, [saveResumeProgress]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (offsetSeconds) => {
    if (!videoRef.current) return;
    const nextTime = Math.min(Math.max(0, videoRef.current.currentTime + offsetSeconds), duration);
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolumeChange = (newVolume) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSpeedChange = (speed) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTogglePiP = async () => {
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      await videoRef.current.requestPictureInPicture();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === 'ArrowRight') {
        handleSeek(10);
      } else if (e.key === 'ArrowLeft') {
        handleSeek(-10);
      } else if (e.key === 'f') {
        handleToggleFullscreen();
      } else if (e.key === 'm') {
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, duration]);

  // Mobile double tap gesture seeking
  const handleTouchZone = (side) => {
    if (side === 'right') {
      handleSeek(10);
      setDoubleTapAlert('+10s');
    } else {
      handleSeek(-10);
      setDoubleTapAlert('-10s');
    }
    setTimeout(() => setDoubleTapAlert(null), 800);
  };

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group select-none"
      onMouseMove={() => {
        setShowControls(true);
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {doubleTapAlert && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <span className="bg-black/80 text-white font-bold px-4 py-2 rounded-full text-lg animate-pulse">
            {doubleTapAlert}
          </span>
        </div>
      )}

      {/* Touch zones for mobile gestures */}
      <div className="absolute inset-0 z-10 flex">
        <div className="w-1/3 h-full" onDoubleClick={() => handleTouchZone('left')} />
        <div className="w-1/3 h-full" onClick={handlePlayPause} />
        <div className="w-1/3 h-full" onDoubleClick={() => handleTouchZone('right')} />
      </div>

      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster}
        className="w-full h-full object-contain"
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={onNextEpisode}
      />

      {/* Control Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between text-white text-xs mb-2">
          <span className="font-semibold text-sm">{title}</span>
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>

        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => {
            const time = parseFloat(e.target.value);
            videoRef.current.currentTime = time;
            setCurrentTime(time);
          }}
          className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-3"
        />

        {/* Control Buttons */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={handlePlayPause} className="hover:text-purple-400">
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={() => handleSeek(-10)} className="hover:text-purple-400">⏪ -10s</button>
            <button onClick={() => handleSeek(10)} className="hover:text-purple-400">⏩ +10s</button>
            
            <button onClick={handleToggleMute} className="hover:text-purple-400">
              {isMuted ? '🔇' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-zinc-600 appearance-none accent-purple-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="bg-zinc-800 text-xs rounded px-2 py-1 outline-none border border-zinc-700"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
            <button onClick={handleTogglePiP} className="hover:text-purple-400 text-xs">PiP</button>
            {onNextEpisode && (
              <button onClick={onNextEpisode} className="bg-purple-600 hover:bg-purple-500 text-xs px-2 py-1 rounded">
                Next Ep ⏭
              </button>
            )}
            <button onClick={handleToggleFullscreen} className="hover:text-purple-400">
              {isFullscreen ? '⏹ Exit Full' : '⛶ Fullscreen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}