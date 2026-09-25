import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Info, 
  Plus, 
  Check, 
  Volume2, 
  VolumeX, 
  Flame, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MediaItem } from '../types';
import { useWatch } from '../context/WatchContext';

interface HeroBannerProps {
  featuredItems: MediaItem[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ featuredItems }) => {
  const { openPlayer, openDetail, toggleWatchlist, isInWatchlist } = useWatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentMedia = featuredItems[currentIndex] || featuredItems[0];
  const inWatchlist = currentMedia ? isInWatchlist(currentMedia.id) : false;

  const changeSlide = (newIndex: number, dir: 'next' | 'prev' = 'next') => {
    setDirection(dir);
    // Modern View Transitions API support with directional navigation types
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      try {
        // @ts-ignore
        document.startViewTransition({
          update: () => {
            setCurrentIndex(newIndex);
          },
          types: [dir === 'next' ? 'forward' : 'backward']
        });
        return;
      } catch {
        // Fallback for browsers without types support in startViewTransition
      }
    }
    setCurrentIndex(newIndex);
  };

  // Auto rotate banner every 14 seconds if user doesn't interact or hover
  useEffect(() => {
    if (featuredItems.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      const nextIdx = (currentIndex + 1) % featuredItems.length;
      changeSlide(nextIdx, 'next');
    }, 14000);
    return () => clearInterval(interval);
  }, [featuredItems.length, currentIndex, isPaused]);

  // Restart video when banner item changes
  useEffect(() => {
    setIsVideoLoaded(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + featuredItems.length) % featuredItems.length;
    changeSlide(nextIdx, 'prev');
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % featuredItems.length;
    changeSlide(nextIdx, 'next');
  };

  if (!currentMedia) return null;

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[76vh] min-h-[500px] sm:h-[80vh] sm:min-h-[560px] lg:h-[84vh] lg:min-h-[600px] overflow-hidden select-none group"
    >
      
      {/* Background Media with Ken Burns cinematic zoom and smooth crossfade */}
      <div key={`bg-${currentMedia.id}`} className="absolute inset-0 animate-hero-bg">
        <video
          ref={videoRef}
          src={currentMedia.trailerUrl || currentMedia.videoUrl}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-70 scale-105' : 'opacity-0'
          }`}
          style={{ transition: 'opacity 1s ease-in-out, transform 10s ease-out' }}
        />
        <img
          src={currentMedia.backdropUrl}
          alt={currentMedia.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isVideoLoaded ? 'opacity-0' : 'opacity-80'
          }`}
        />

        {/* Ambient Vignette and Gradient overlays for cinematic depth & navbar contrast */}
        {/* 1. Subtle top shadow overlay for clean navbar blend */}
        <div className="absolute inset-x-0 top-0 h-20 sm:h-24 md:h-28 bg-gradient-to-b from-[#08090d]/80 via-[#08090d]/30 to-transparent pointer-events-none z-10" />

        {/* 2. Bottom shadow vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />

        {/* 3. Left shadow for readable typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/70 to-transparent w-full md:w-3/4" />

        {/* 4. Radial atmospheric glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Netflix Large Edge Chevrons (Appear on hover for desktop/tablet) */}
      <button
        onClick={handlePrev}
        className="hidden md:flex items-center justify-center absolute left-3 lg:left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all hover:scale-110 active:scale-95 shadow-2xl opacity-0 group-hover:opacity-100 duration-300 cursor-pointer"
        aria-label="Slide Film Sebelumnya"
      >
        <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7 -translate-x-0.5" />
      </button>

      <button
        onClick={handleNext}
        className="hidden md:flex items-center justify-center absolute right-3 lg:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all hover:scale-110 active:scale-95 shadow-2xl opacity-0 group-hover:opacity-100 duration-300 cursor-pointer"
        aria-label="Slide Film Selanjutnya"
      >
        <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7 translate-x-0.5" />
      </button>

      {/* Netflix-Style Maturity & Audio Badge on Right Edge */}
      <div className="hidden lg:flex items-center gap-2 absolute right-0 top-1/3 z-20">
        <div className="border-l-4 border-brand-500 bg-black/70 backdrop-blur-md py-1.5 px-3 rounded-l-xl border-y border-r-0 border-white/10 shadow-xl flex items-center gap-2.5 text-xs font-bold text-white">
          <span className="font-mono text-slate-200">{currentMedia.ageRating}</span>
          <span className="w-1 h-1 rounded-full bg-slate-500" />
          <span className="text-[11px] text-brand-300">{currentMedia.quality}</span>
          {currentMedia.audio && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="text-[10px] text-slate-300 uppercase tracking-wider">{currentMedia.audio}</span>
            </>
          )}
        </div>
      </div>

      {/* Featured Content Details raised closer to navbar with balanced padding */}
      <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-end pt-8 sm:pt-10 md:pt-12 pb-20 sm:pb-24 md:pb-28 lg:pb-32 px-4 sm:px-6 lg:px-8 z-10">
        <div 
          key={`content-${currentMedia.id}`}
          className={`max-w-2xl space-y-2 sm:space-y-3.5 ${
            direction === 'next' ? 'animate-hero-next' : 'animate-hero-prev'
          }`}
        >
          {/* Badges Bar (Fluid wrap for mobile & tablet) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-[10px] xs:text-[11px] sm:text-xs font-semibold">
            {currentMedia.topRank && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 text-[10px] sm:text-xs">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
                <span>TOP {currentMedia.topRank} HARI INI</span>
              </span>
            )}
            <span className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-white/10 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {currentMedia.matchScore}% Cocok
            </span>
            <span className="px-1.5 py-0.5 rounded border border-white/20 text-slate-300 font-mono text-[10px] sm:text-[11px]">
              {currentMedia.ageRating}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] sm:text-[11px]">
              {currentMedia.quality}
            </span>
            <span className="text-slate-400 font-medium hidden xs:inline">
              {currentMedia.releaseYear}
            </span>
            <span className="text-slate-400 font-medium">
              {currentMedia.type === 'tv' ? `${currentMedia.totalSeasons} Musim` : currentMedia.duration}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
            {currentMedia.title}
          </h1>

          {/* Tagline */}
          <p className="text-xs sm:text-sm md:text-base font-medium text-brand-300 italic line-clamp-1">
            "{currentMedia.tagline}"
          </p>

          {/* Overview */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl text-shadow">
            {currentMedia.overview}
          </p>

          {/* Genres pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
            {currentMedia.genres.map(genre => (
              <span
                key={genre}
                className="text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-surface-800/80 backdrop-blur-sm text-slate-300 border border-white/5"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1.5 sm:pt-2">
            <button
              onClick={() => openPlayer(currentMedia)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              <span>Putar Sekarang</span>
            </button>

            <button
              onClick={() => toggleWatchlist(currentMedia.id)}
              className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl glass-panel text-white hover:bg-white/20 font-medium text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="hidden xs:inline">Di Koleksi</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-white" />
                  <span className="hidden xs:inline">Koleksi Saya</span>
                </>
              )}
            </button>

            <button
              onClick={() => openDetail(currentMedia)}
              className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-white/20 font-medium text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>Detail</span>
            </button>
          </div>
        </div>

        {/* Unified Slider Bar & Volume Button Row (Setara / Inline at the same level) */}
        <div className="flex items-center justify-between gap-4 pt-3 sm:pt-4 w-full">
          {/* Multi-Segment Story Progress Bar */}
          <div className="flex items-center gap-1.5 w-44 xs:w-56 sm:w-64 md:w-80">
            {featuredItems.map((item, idx) => {
              const isActive = idx === currentIndex;
              const isPast = idx < currentIndex;
              return (
                <button
                  key={item.id || idx}
                  onClick={() => changeSlide(idx, idx >= currentIndex ? 'next' : 'prev')}
                  className="flex-1 h-1 sm:h-1.5 rounded-full overflow-hidden bg-white/20 hover:bg-white/40 transition-colors relative cursor-pointer"
                  title={item.title}
                  aria-label={`Slide ${idx + 1}: ${item.title}`}
                >
                  {isActive ? (
                    <div
                      key={`bar-${currentMedia.id}`}
                      className="h-full bg-gradient-to-r from-brand-500 to-secondary-400 rounded-full animate-hero-progress"
                    />
                  ) : isPast ? (
                    <div className="h-full bg-white/90 rounded-full" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Sound Toggle Button (Inline setara dengan slider di sisi kanan) */}
          <button
            onClick={toggleMute}
            className="p-2 sm:p-2.5 rounded-full glass-panel hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer flex-shrink-0"
            title={isMuted ? 'Nyalakan Suara Preview' : 'Bisukan Preview'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

      </div>

    </div>
  );

};


