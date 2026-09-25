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
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll active card into view in the thumbnail strip
  useEffect(() => {
    if (thumbnailStripRef.current) {
      const activeEl = thumbnailStripRef.current.children[currentIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
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
      className="relative w-full h-[82vh] min-h-[580px] sm:h-[86vh] sm:min-h-[640px] lg:h-[88vh] lg:min-h-[680px] overflow-hidden select-none group"
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
        className="hidden md:flex items-center justify-center absolute left-3 lg:left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all hover:scale-110 active:scale-95 shadow-2xl opacity-0 group-hover:opacity-100 duration-300"
        aria-label="Slide Film Sebelumnya"
      >
        <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7 -translate-x-0.5" />
      </button>

      <button
        onClick={handleNext}
        className="hidden md:flex items-center justify-center absolute right-3 lg:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all hover:scale-110 active:scale-95 shadow-2xl opacity-0 group-hover:opacity-100 duration-300"
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

      {/* Featured Content Details matching user's reference screenshot */}
      <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-end pt-14 sm:pt-16 md:pt-20 pb-8 sm:pb-10 md:pb-12 px-4 sm:px-6 lg:px-8 z-10">
        <div 
          key={`content-${currentMedia.id}`}
          className={`max-w-2xl space-y-2.5 sm:space-y-3.5 ${
            direction === 'next' ? 'animate-hero-next' : 'animate-hero-prev'
          }`}
        >
          {/* Media Type Badge (MOVIE / TV SERIES) */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              {currentMedia.type === 'tv' ? 'TV SERIES' : 'MOVIE'}
            </span>
            {currentMedia.topRank && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold">
                <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                <span>TOP {currentMedia.topRank}</span>
              </span>
            )}
          </div>

          {/* Tagline */}
          {currentMedia.tagline && (
            <p className="text-xs sm:text-sm text-slate-300 italic font-medium line-clamp-1">
              {currentMedia.tagline}
            </p>
          )}

          {/* Big Title */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            {currentMedia.title}
          </h1>

          {/* Metadata Row: Rating, Year, Duration, Genres, Quality */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              ★ {currentMedia.rating}
            </span>
            <span>{currentMedia.releaseYear}</span>
            <span>•</span>
            <span>{currentMedia.type === 'tv' ? `${currentMedia.totalSeasons} Musim` : currentMedia.duration}</span>
            <span>•</span>
            <span>{currentMedia.genres.slice(0, 3).join(', ')}</span>
            {currentMedia.quality && (
              <>
                <span>•</span>
                <span className="px-1.5 py-0.2 rounded bg-white/15 text-[10px] font-bold text-slate-200">
                  {currentMedia.quality}
                </span>
              </>
            )}
          </div>

          {/* Overview / Synopsis */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl text-shadow">
            {currentMedia.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <button
              onClick={() => openPlayer(currentMedia)}
              className="flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => toggleWatchlist(currentMedia.id)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl glass-panel text-white hover:bg-white/20 font-medium text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Di Koleksi</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-white" />
                  <span>Koleksi Saya</span>
                </>
              )}
            </button>

            <button
              onClick={() => openDetail(currentMedia)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-white/20 font-medium text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>Detail</span>
            </button>
          </div>

          {/* ========================================================
              EXACT SLIDER MODEL FROM USER'S SCREENSHOT (Dots + Active Capsule Pill)
              ======================================================== */}
          <div className="flex items-center gap-2 pt-3 sm:pt-4">
            {featuredItems.map((item, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={item.id || idx}
                  onClick={() => changeSlide(idx, idx >= currentIndex ? 'next' : 'prev')}
                  className={`transition-all duration-300 rounded-full cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'w-8 sm:w-10 h-2 sm:h-2.5 bg-rose-600 shadow-lg shadow-rose-600/40 ring-1 ring-rose-400/40'
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/30 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}: ${item.title}`}
                  title={item.title}
                >
                  {isActive && (
                    <div
                      key={`bar-${currentMedia.id}`}
                      className="h-full bg-white/70 rounded-full animate-hero-progress"
                    />
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Floating Sound Toggle Button (Discreetly at bottom-right) */}
        <button
          onClick={toggleMute}
          className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 z-20 p-2.5 sm:p-3 rounded-full glass-panel hover:bg-white/20 text-white transition-transform hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
          title={isMuted ? 'Nyalakan Suara Preview' : 'Bisukan Preview'}
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

      </div>
    </div>
  );

};


