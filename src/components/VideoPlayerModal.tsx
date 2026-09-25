import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize, 
  Minimize, 
  PictureInPicture2, 
  Settings, 
  X, 
  SkipForward, 
  Sparkles, 
  Activity,
  Check,
  ChevronRight
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';

export const VideoPlayerModal: React.FC = () => {
  const { playerState, closePlayer, playNextEpisode, updateWatchProgress } = useWatch();
  const { isOpen, item, episode } = playerState;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [selectedSubtitle, setSelectedSubtitle] = useState('Bahasa Indonesia');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [scrubPreviewTime, setScrubPreviewTime] = useState<number | null>(null);
  const [scrubPreviewPos, setScrubPreviewPos] = useState<number>(0);

  const activeVideoUrl = episode?.videoUrl || item?.videoUrl || '';
  const currentTitle = item ? (episode ? `${item.title} - S${episode.seasonNumber}:E${episode.episodeNumber}` : item.title) : '';
  const episodeSubtitle = episode ? episode.title : item?.tagline || '';

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset controls timer
  const triggerActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettingsMenu(false);
      }
    }, 3200);
  }, [isPlaying]);

  // Video time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(cur);
      setDuration(dur);

      if (videoRef.current.buffered.length > 0) {
        setBufferedTime(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
      }

      // Save watch progress periodically
      if (item && dur > 0 && Math.floor(cur) % 5 === 0) {
        updateWatchProgress(item.id, cur, dur, episode?.id);
      }
    }
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    triggerActivity();
  }, [triggerActivity]);

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(seconds, duration));
      setCurrentTime(videoRef.current.currentTime);
      triggerActivity();
    }
  };

  const skipSeconds = (delta: number) => {
    if (videoRef.current) {
      handleSeek(videoRef.current.currentTime + delta);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    if (videoRef.current) {
      const clamped = Math.max(0, Math.min(1, newVol));
      videoRef.current.volume = clamped;
      setVolume(clamped);
      if (clamped > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not available', err);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSettingsMenu(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipSeconds(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skipSeconds(10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        case 'escape':
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          } else {
            closePlayer();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, togglePlay, volume, isMuted]);

  // Scrub bar hover preview calculations
  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setScrubPreviewPos(e.clientX - rect.left);
    setScrubPreviewTime(pos * duration);
  };

  if (!isOpen || !item) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none animate-fade-in"
      onMouseMove={triggerActivity}
      onClick={triggerActivity}
    >
      {/* Ambient Lighting Glow Behind Video */}
      {ambientGlow && (
        <div 
          className="absolute inset-0 opacity-40 blur-3xl pointer-events-none scale-125 transition-opacity duration-1000"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(225, 29, 72, 0.4) 0%, rgba(15, 23, 42, 0.8) 70%, transparent 100%)`
          }}
        />
      )}

      {/* Main Video Element */}
      <video
        ref={videoRef}
        src={activeVideoUrl}
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          playNextEpisode();
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Subtitles Overlay */}
      {selectedSubtitle !== 'Nonaktif' && (
        <div className="absolute bottom-28 left-0 right-0 text-center pointer-events-none px-6">
          <span className="inline-block bg-black/75 backdrop-blur-sm text-yellow-300 px-4 py-1.5 rounded-lg text-lg sm:text-xl font-medium tracking-wide shadow-md">
            [Terjemahan {selectedSubtitle}] Dialog sinematik resolusi tinggi LiveEuy Cinema.
          </span>
        </div>
      )}

      {/* Top Overlay Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            onClick={closePlayer}
            className="p-1.5 sm:p-2 rounded-full glass-panel hover:bg-white/20 text-white transition-colors flex-shrink-0"
            title="Tutup Pemutar (Esc)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-xl font-bold text-white tracking-tight flex items-center gap-2 truncate">
              <span className="truncate">{currentTitle}</span>
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-brand-600 text-white font-mono flex-shrink-0">
                {selectedQuality}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 truncate">{episodeSubtitle}</p>
          </div>
        </div>

        {/* Top Right Quick Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Ambient Glow Switch */}
          <button
            onClick={() => setAmbientGlow(!ambientGlow)}
            className={`p-2 sm:p-2.5 rounded-full transition-colors ${
              ambientGlow ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'glass-panel text-slate-400'
            }`}
            title="Efek Cahaya Bioskop (Ambient Glow)"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Stats for nerds toggle */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-2 sm:p-2.5 rounded-full transition-colors ${
              showStats ? 'bg-indigo-600 text-white' : 'glass-panel text-slate-400 hover:text-white'
            }`}
            title="Statistik Pemutaran / Diagnostik"
          >
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Skip Intro Button (Show during 0 to 40 seconds) */}
      {currentTime > 3 && currentTime < 40 && (
        <div className="absolute bottom-24 sm:bottom-28 right-4 sm:right-6 z-30 animate-fade-in">
          <button
            onClick={() => handleSeek(42)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-semibold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            <span>Lewati Intro</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stream Stats Overlay HUD */}
      {showStats && (
        <div className="absolute top-16 sm:top-20 left-4 sm:left-6 z-30 p-3 sm:p-4 rounded-2xl glass-dropdown text-[11px] sm:text-xs font-mono text-slate-300 space-y-1.5 shadow-2xl border border-indigo-500/30 max-w-xs sm:max-w-sm pointer-events-auto animate-fade-in">
          <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-white/10 pb-1">
            <span>LIVE STREAM DIAGNOSTICS</span>
            <button onClick={() => setShowStats(false)} className="hover:text-white">✕</button>
          </div>
          <div>Resolusi: <span className="text-white font-semibold">3840 x 2160 (4K UHD)</span></div>
          <div>Frame Rate: <span className="text-white font-semibold">60.00 fps</span></div>
          <div>Bitrate Streaming: <span className="text-white font-semibold">18.4 Mbps (HEVC/H.265)</span></div>
          <div>Audio Codec: <span className="text-white font-semibold">Dolby Atmos (E-AC-3 JOC)</span></div>
          <div>Buffer Health: <span className="text-emerald-400 font-semibold">{Math.max(0, bufferedTime - currentTime).toFixed(1)}s ahead</span></div>
          <div>Latency / Dropped Frames: <span className="text-white">0 / 0%</span></div>
          <div>Playback Rate: <span className="text-white">{playbackSpeed}x</span></div>
        </div>
      )}

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {/* Scrubber Progress Bar */}
        <div className="relative mb-2 sm:mb-3 group/scrub py-1">
          {/* Hover Time Tooltip */}
          {scrubPreviewTime !== null && (
            <div 
              className="absolute -top-9 -translate-x-1/2 px-2.5 py-1 rounded bg-black/90 backdrop-blur-md text-white text-xs font-mono border border-white/20 pointer-events-none shadow-lg z-40"
              style={{ left: `${scrubPreviewPos}px` }}
            >
              {formatTime(scrubPreviewTime)}
            </div>
          )}

          <div
            className="relative h-2 hover:h-3 bg-white/20 rounded-full cursor-pointer transition-all overflow-hidden"
            onMouseMove={handleScrubberMouseMove}
            onMouseLeave={() => setScrubPreviewTime(null)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              handleSeek(percent * duration);
            }}
          >
            {/* Buffer Bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full"
              style={{ width: `${(bufferedTime / (duration || 1)) * 100}%` }}
            />
            {/* Played Progress Bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-brand-600 to-rose-500 rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between text-white gap-2">
          
          {/* Left Controls: Play, Rewind, Fast Forward, Volume, Time */}
          <div className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-4">
            <button
              onClick={togglePlay}
              className="p-2 sm:p-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              title={isPlaying ? 'Jeda (Spasi)' : 'Putar (Spasi)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white translate-x-0.5" />}
            </button>

            <button
              onClick={() => skipSeconds(-10)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Mundur 10 detik (Panah Kiri)"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => skipSeconds(10)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Maju 10 detik (Panah Kanan)"
            >
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 sm:gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title={isMuted ? 'Nyalakan Suara (M)' : 'Bisukan Suara (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 sm:w-24 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-brand-500 hidden sm:block"
              />
            </div>

            {/* Time Indicator */}
            <div className="text-[10px] xs:text-xs sm:text-sm font-mono text-slate-300 whitespace-nowrap">
              <span className="text-white font-medium">{formatTime(currentTime)}</span>
              <span className="mx-0.5 sm:mx-1 text-slate-500">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Next Episode, Subtitles, Quality, Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-2.5">
            
            {/* Next Episode button for TV series */}
            {item.type === 'tv' && (
              <button
                onClick={playNextEpisode}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg glass-panel hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
                title="Putar Episode Berikutnya"
              >
                <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400" />
                <span className="hidden md:inline">Episode Selanjutnya</span>
              </button>
            )}

            {/* Settings & Quality Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors ${
                  showSettingsMenu ? 'text-brand-400 bg-white/10' : 'text-slate-300 hover:text-white'
                }`}
                title="Pengaturan Kualitas & Subtitle"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Settings Dropdown Popover */}
              {showSettingsMenu && (
                <div className="absolute bottom-full right-0 mb-3 w-56 sm:w-64 rounded-2xl glass-dropdown p-3 shadow-2xl z-50 text-xs animate-slide-up">
                  <div className="space-y-3">
                    
                    {/* Quality Selector */}
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-[10px] sm:text-xs">
                        Kualitas Video
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {['4K UHD', '1080p', '720p', 'Otomatis'].map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setSelectedQuality(q);
                              setShowSettingsMenu(false);
                            }}
                            className={`px-2 py-1 rounded-lg flex items-center justify-between transition-colors ${
                              selectedQuality === q ? 'bg-brand-600 text-white font-bold' : 'hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <span>{q}</span>
                            {selectedQuality === q && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtitle Selector */}
                    <div className="border-t border-white/10 pt-2">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-[10px] sm:text-xs">
                        Subtitle (Teks Terjemahan)
                      </span>
                      <div className="space-y-1">
                        {['Bahasa Indonesia', 'English', 'Japanese', 'Nonaktif'].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => {
                              setSelectedSubtitle(sub);
                              setShowSettingsMenu(false);
                            }}
                            className={`w-full px-2 py-1 rounded-lg flex items-center justify-between text-left transition-colors ${
                              selectedSubtitle === sub ? 'bg-brand-600 text-white font-bold' : 'hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <span>{sub}</span>
                            {selectedSubtitle === sub && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Speed Selector */}
                    <div className="border-t border-white/10 pt-2">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-[10px] sm:text-xs">
                        Kecepatan Putar
                      </span>
                      <div className="flex items-center justify-between">
                        {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => changeSpeed(spd)}
                            className={`px-1.5 py-0.5 rounded transition-colors ${
                              playbackSpeed === spd ? 'bg-brand-500 text-white font-bold' : 'hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Picture-in-Picture */}
            <button
              onClick={togglePiP}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors hidden sm:block"
              title="Mode Gambar dalam Gambar (PiP)"
            >
              <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Keluar Layar Penuh (F)' : 'Layar Penuh (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
