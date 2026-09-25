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
      className="relative w-full h-[85vh] min-h-[600px] xs:min-h-[640px] sm:h-[88vh] sm:min-h-[680px] lg:h-[92vh] lg:min-h-[720px] overflow-hidden select-none"
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
        {/* 1. Top shadow overlay: Prevents visual clash with fixed navbar across all screen sizes */}
        <div className="absolute inset-x-0 top-0 h-32 xs:h-40 sm:h-48 md:h-56 bg-gradient-to-b from-[#08090d]/95 via-[#08090d]/60 to-transparent pointer-events-none z-10" />

        {/* 2. Bottom shadow vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/50 to-transparent" />

        {/* 3. Left shadow for readable typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/70 to-transparent w-full md:w-3/4" />

        {/* 4. Radial atmospheric glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Featured Content Details with Responsive Top Clearance and Directional Slide Animation */}
      <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-end pt-24 xs:pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-14 sm:pb-20 md:pb-24 px-4 sm:px-6 lg:px-8 z-10">
        <div 
          key={`content-${currentMedia.id}`}
          className={`max-w-2xl space-y-2.5 sm:space-y-4 ${
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

          {/* Action Buttons (Responsive flex for mobile vs desktop) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-3">
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

        {/* Floating Controls: Mute Toggle & Carousel Switchers positioned comfortably at the bottom */}
        <div className="absolute bottom-14 sm:bottom-18 md:bottom-22 lg:bottom-26 right-4 sm:right-6 md:right-8 flex items-center gap-2 sm:gap-3 z-20">
          <button
            onClick={toggleMute}
            className="p-2 sm:p-3 rounded-full glass-panel hover:bg-white/20 text-white transition-transform hover:scale-110 active:scale-95 shadow-lg"
            title={isMuted ? 'Nyalakan Suara Preview' : 'Bisukan Preview'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {featuredItems.length > 1 && (
            <div className="flex items-center gap-1.5 glass-panel p-1.5 rounded-full hidden xs:flex shadow-xl">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                aria-label="Previous Featured"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1.5 px-1">
                {featuredItems.map((item, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={item.id || idx}
                      onClick={() => changeSlide(idx, idx >= currentIndex ? 'next' : 'prev')}
                      className={`relative h-2 rounded-full overflow-hidden transition-all duration-300 ${
                        isActive ? 'w-8 sm:w-10 bg-white/20' : 'w-2 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    >
                      {isActive && (
                        <div
                          key={`progress-${currentMedia.id}`}
                          className="h-full bg-gradient-to-r from-brand-500 to-secondary-400 rounded-full animate-hero-progress"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                aria-label="Next Featured"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );

};
