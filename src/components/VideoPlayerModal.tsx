import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  ChevronRight,
  Crown,
  Minimize2,
  Maximize2,
  FastForward
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';

export const VideoPlayerModal: React.FC = () => {
  const { 
    playerState, 
    closePlayer, 
    playNextEpisode, 
    updateWatchProgress,
    user,
    isLoggedIn,
    openAuthModal
  } = useWatch();
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

  // In-app Mini-Player Floating Mode
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-play Next Episode 5-Second Countdown
  const [showNextCountdown, setShowNextCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [isCancelledCountdown, setIsCancelledCountdown] = useState(false);

  // Skip Intro Toast Feedback
  const [showSkipToast, setShowSkipToast] = useState(false);

  const activeVideoUrl = episode?.videoUrl || item?.videoUrl || '';
  const currentTitle = item ? (episode ? `${item.title} - S${episode.seasonNumber}:E${episode.episodeNumber}` : item.title) : '';
  const episodeSubtitle = episode ? episode.title : item?.tagline || '';

  // Determine next episode info if TV series
  const nextEpisodeInfo = useMemo(() => {
    if (!item || !episode || !item.seasons) return null;
    for (const season of item.seasons) {
      const epIndex = season.episodes.findIndex(e => e.id === episode.id);
      if (epIndex !== -1) {
        if (epIndex + 1 < season.episodes.length) {
          return {
            seasonNumber: season.seasonNumber,
            episode: season.episodes[epIndex + 1]
          };
        }
        const nextSeason = item.seasons.find(s => s.seasonNumber === season.seasonNumber + 1);
        if (nextSeason && nextSeason.episodes.length > 0) {
          return {
            seasonNumber: nextSeason.seasonNumber,
            episode: nextSeason.episodes[0]
          };
        }
      }
    }
    return null;
  }, [item, episode]);

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

  // Reset countdown state when episode or item changes
  useEffect(() => {
    setShowNextCountdown(false);
    setIsCancelledCountdown(false);
    setCountdownSeconds(5);
  }, [episode?.id, item?.id]);

  // 5-second countdown timer for auto-playing next episode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showNextCountdown && countdownSeconds > 0) {
      timer = setTimeout(() => {
        setCountdownSeconds(prev => prev - 1);
      }, 1000);
    } else if (showNextCountdown && countdownSeconds === 0) {
      setShowNextCountdown(false);
      playNextEpisode();
    }
    return () => clearTimeout(timer);
  }, [showNextCountdown, countdownSeconds, playNextEpisode]);

  const handlePlayNextNow = () => {
    setShowNextCountdown(false);
    playNextEpisode();
  };

  const handleCancelCountdown = () => {
    setShowNextCountdown(false);
    setIsCancelledCountdown(true);
  };

  const handleSkipIntro = () => {
    // Jump past intro to second 85 (or skip +60s)
    const target = currentTime < 85 ? 85 : currentTime + 60;
    handleSeek(target);
    setShowSkipToast(true);
    setTimeout(() => setShowSkipToast(false), 2500);
  };

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

      // Check auto-play countdown for next episode (trigger 15s before end of TV series episode)
      if (nextEpisodeInfo && dur > 20 && cur >= dur - 15 && !showNextCountdown && !isCancelledCountdown) {
        setShowNextCountdown(true);
        setCountdownSeconds(5);
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
        case 's':
          e.preventDefault();
          if (currentTime >= 3 && currentTime <= 95) {
            handleSkipIntro();
          }
          break;
        case 'p':
          e.preventDefault();
          setIsMinimized(prev => !prev);
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
  }, [isOpen, togglePlay, volume, isMuted, currentTime]);

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
      className={
        isMinimized
          ? "fixed bottom-5 right-5 z-50 w-72 xs:w-80 sm:w-96 aspect-video rounded-2xl bg-black shadow-2xl border border-white/20 overflow-hidden select-none group/mini animate-slide-up"
          : "fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none animate-fade-in"
      }
      onMouseMove={triggerActivity}
      onClick={triggerActivity}
    >
      {/* Ambient Lighting Glow Behind Video (Full-screen mode only) */}
      {!isMinimized && ambientGlow && (
        <div 
          className="absolute inset-0 opacity-40 blur-3xl pointer-events-none scale-125 transition-opacity duration-1000"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(67, 63, 254, 0.4) 0%, rgba(15, 23, 42, 0.8) 70%, transparent 100%)`
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
          if (nextEpisodeInfo && !isCancelledCountdown) {
            setShowNextCountdown(true);
            setCountdownSeconds(5);
          } else if (nextEpisodeInfo) {
            playNextEpisode();
          }
        }}
        onClick={isMinimized ? undefined : togglePlay}
        className={`w-full h-full ${isMinimized ? 'object-cover' : 'object-contain'} cursor-pointer`}
      />

      {/* ========================================================
          IN-APP MINI-PLAYER CONTROLS OVERLAY (When Minimized)
          ======================================================== */}
      {isMinimized && (
        <div 
          onClick={(e) => {
            // Clicking background expands player back to full modal
            if (e.target === e.currentTarget) {
              setIsMinimized(false);
            }
          }}
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/80 opacity-0 group-hover/mini:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5 z-30 cursor-pointer"
        >
          {/* Mini Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white truncate block">
                {currentTitle}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(false);
                }}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Perbesar Layar Penuh"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closePlayer();
                }}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Tutup Pemutar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mini Center Play/Pause Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="p-2.5 rounded-full bg-brand-600/90 hover:bg-brand-500 text-white shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Mini Bottom Bar: Scrubber & Volume & Time */}
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <div
              className="relative h-1 hover:h-1.5 bg-white/30 rounded-full cursor-pointer transition-all overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                handleSeek(percent * duration);
              }}
            >
              <div
                className="absolute top-0 bottom-0 left-0 bg-brand-500 rounded-full"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  className="hover:text-white transition-colors p-0.5"
                  title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => setIsMinimized(false)}
                  className="hover:text-white transition-colors p-0.5"
                  title="Perbesar"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FULL THEATRE PLAYER OVERLAYS (When Not Minimized)
          ======================================================== */}
      {!isMinimized && (
        <>
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
                className="p-1.5 sm:p-2 rounded-full glass-panel hover:bg-white/20 text-white transition-colors flex-shrink-0 cursor-pointer"
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
              {/* VIP / Guest Streaming Mode Badge */}
              {isLoggedIn && user ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>{user.tier}</span>
                </span>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/40 transition-colors cursor-pointer"
                  title="Tingkatkan ke VIP untuk 4K Ultra HD & Dolby Atmos"
                >
                  <span>Mode Tamu</span>
                  <span className="text-white underline hidden xs:inline">Buka 4K VIP</span>
                </button>
              )}

              {/* Mini-Player Button in Top Bar */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 sm:p-2.5 rounded-full glass-panel hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Perkecil ke Mini-Player Mengambang (P)"
              >
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Ambient Glow Switch */}
              <button
                onClick={() => setAmbientGlow(!ambientGlow)}
                className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
                  ambientGlow ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'glass-panel text-slate-400'
                }`}
                title="Efek Cahaya Bioskop (Ambient Glow)"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Stats for nerds toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
                  showStats ? 'bg-indigo-600 text-white' : 'glass-panel text-slate-400 hover:text-white'
                }`}
                title="Statistik Pemutaran / Diagnostik"
              >
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Skip Intro Button (Show during 3 to 85 seconds) */}
          {currentTime > 3 && currentTime < 85 && (
            <div className="absolute bottom-24 sm:bottom-28 right-4 sm:right-6 z-30 animate-fade-in">
              <button
                onClick={handleSkipIntro}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-semibold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                title="Lewati Intro (Tekan S)"
              >
                <FastForward className="w-4 h-4 text-brand-400 fill-brand-400" />
                <span>{currentTime < 20 ? 'Lewati Rekap' : 'Lewati Intro'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-300 font-mono hidden sm:inline">S</span>
              </button>
            </div>
          )}

          {/* Skip Intro Toast Notification */}
          {showSkipToast && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl glass-panel border border-brand-500/40 text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-fade-in pointer-events-none">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Intro Berhasil Dilewati</span>
            </div>
          )}

          {/* Stream Stats Overlay HUD */}
          {showStats && (
            <div className="absolute top-16 sm:top-20 left-4 sm:left-6 z-30 p-3 sm:p-4 rounded-2xl glass-dropdown text-[11px] sm:text-xs font-mono text-slate-300 space-y-1.5 shadow-2xl border border-indigo-500/30 max-w-xs sm:max-w-sm pointer-events-auto animate-fade-in">
              <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-white/10 pb-1">
                <span>LIVE STREAM DIAGNOSTICS</span>
                <button onClick={() => setShowStats(false)} className="hover:text-white cursor-pointer">✕</button>
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

          {/* ========================================================
              AUTO-PLAY NEXT EPISODE COUNTDOWN OVERLAY CARD (Netflix Style)
              ======================================================== */}
          {showNextCountdown && nextEpisodeInfo && (
            <div className="absolute bottom-24 sm:bottom-28 right-4 sm:right-8 z-40 max-w-xs sm:max-w-sm p-4 rounded-2xl glass-dropdown border border-brand-500/40 shadow-2xl backdrop-blur-xl animate-slide-up pointer-events-auto">
              {/* Header with Circular Countdown */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="13"
                        className="stroke-white/20"
                        strokeWidth="2.5"
                        fill="transparent"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="13"
                        className="stroke-brand-500 transition-all duration-1000 ease-linear"
                        strokeWidth="2.5"
                        strokeDasharray={2 * Math.PI * 13}
                        strokeDashoffset={2 * Math.PI * 13 * (1 - countdownSeconds / 5)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-white">
                      {countdownSeconds}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider block">
                      Putar Otomatis
                    </span>
                    <span className="text-xs font-semibold text-white">
                      Episode Selanjutnya dalam {countdownSeconds}s
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCancelCountdown}
                  className="p-1.5 rounded-full hover:bg-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Batal Putar Otomatis"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Next Episode Preview Banner */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-black/40 border border-white/10 mb-3">
                <div className="relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                  <img
                    src={nextEpisodeInfo.episode.thumbnail || item.backdropUrl}
                    alt={nextEpisodeInfo.episode.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white opacity-80" />
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold text-brand-300">
                    S{nextEpisodeInfo.seasonNumber}:E{nextEpisodeInfo.episode.episodeNumber}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">
                    {nextEpisodeInfo.episode.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {nextEpisodeInfo.episode.duration}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayNextNow}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all hover:scale-102 active:scale-98 shadow-lg shadow-brand-600/30 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Putar Sekarang</span>
                </button>
                <button
                  onClick={handleCancelCountdown}
                  className="py-2 px-3 rounded-xl glass-panel hover:bg-white/20 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Batal</span>
                </button>
              </div>
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
                  className="absolute top-0 bottom-0 left-0 bg-brand-500 rounded-full"
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
                  className="p-2 sm:p-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  title={isPlaying ? 'Jeda (Spasi)' : 'Putar (Spasi)'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white translate-x-0.5" />}
                </button>

                <button
                  onClick={() => skipSeconds(-10)}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Mundur 10 detik (Panah Kiri)"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={() => skipSeconds(10)}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Maju 10 detik (Panah Kanan)"
                >
                  <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-1.5 sm:gap-2 group/vol">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
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

              {/* Right Controls: Next Episode, Subtitles, Quality, Speed, Mini-Player, PiP, Fullscreen */}
              <div className="flex items-center gap-1 sm:gap-2">
                
                {/* Next Episode button for TV series */}
                {item.type === 'tv' && (
                  <button
                    onClick={playNextEpisode}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg glass-panel hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
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
                    className={`p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
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
                                className={`px-2 py-1 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
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
                                className={`w-full px-2 py-1 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
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
                                className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
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

                {/* Mini-Player Button */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Perkecil ke Mini-Player Mengambang (P)"
                >
                  <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Native HTML5 Picture-in-Picture */}
                <button
                  onClick={togglePiP}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors hidden sm:block cursor-pointer"
                  title="Mode Gambar dalam Gambar Layar Luar (PiP)"
                >
                  <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title={isFullscreen ? 'Keluar Layar Penuh (F)' : 'Layar Penuh (F)'}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
