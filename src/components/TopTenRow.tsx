import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { MediaItem } from '../types';
import { useWatch } from '../context/WatchContext';
import { handleImageError } from '../utils/imageFallback';

interface TopTenRowProps {
  items: MediaItem[];
}

/**
 * Netflix-Style Stylized 3D Outline Rank Number SVG Component
 * Guarantees that rank "1" has its full serif footprint & angled beak,
 * preventing glyph clipping or being swallowed by the overlapping poster.
 */
const TopTenRankSvg: React.FC<{ rank: number }> = ({ rank }) => {
  const isOne = rank === 1;
  const isTen = rank === 10;

  // Exact proportional viewBoxes tailored to each numeral width
  const viewBox = isTen ? '0 0 145 150' : isOne ? '0 0 72 150' : '0 0 92 150';

  return (
    <svg
      viewBox={viewBox}
      className={`h-[135px] xs:h-[155px] sm:h-[185px] md:h-[215px] lg:h-[245px] select-none pointer-events-none transition-all duration-300 drop-shadow-[2px_5px_8px_rgba(0,0,0,0.9)] overflow-visible ${
        isTen
          ? 'w-[95px] xs:w-[110px] sm:w-[130px] md:w-[150px] lg:w-[170px]'
          : isOne
          ? 'w-[48px] xs:w-[56px] sm:w-[68px] md:w-[80px] lg:w-[90px]'
          : 'w-[62px] xs:w-[72px] sm:w-[88px] md:w-[102px] lg:w-[116px]'
      }`}
      aria-hidden="true"
    >
      <defs>
        {/* Cinematic dark bevel gradient for interior fill */}
        <linearGradient id={`rank-fill-${rank}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#090b12" />
          <stop offset="50%" stopColor="#141826" />
          <stop offset="100%" stopColor="#08090d" />
        </linearGradient>

        {/* Glow filter for card hover effect */}
        <filter id={`rank-glow-${rank}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#575cfb" floodOpacity="0.65" />
        </filter>
      </defs>

      {isOne ? (
        // Dedicated, pixel-perfect Netflix-style numeral "1" vector path
        // Features top angled beak, thick vertical stem, and broad base serif (no clipping)
        <path
          d="M12 52 L33 26 L50 26 L50 114 L66 114 L66 132 L6 132 L6 114 L24 114 L24 52 Z"
          fill={`url(#rank-fill-${rank})`}
          stroke="#52525b"
          strokeWidth="4.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="transition-all duration-300 group-hover:stroke-brand-400 group-hover:drop-shadow-[0_0_12px_rgba(67,63,254,0.7)]"
        />
      ) : isTen ? (
        // Numeral "10" with optimized kerning so "1" and "0" sit tightly like Netflix
        <text
          x="50%"
          y="132"
          textAnchor="middle"
          letterSpacing="-10"
          fontFamily="'Arial Black', 'Impact', 'Plus Jakarta Sans', sans-serif"
          fontWeight="900"
          fontSize="134"
          fill={`url(#rank-fill-${rank})`}
          stroke="#52525b"
          strokeWidth="4.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="transition-all duration-300 group-hover:stroke-brand-400 group-hover:drop-shadow-[0_0_12px_rgba(67,63,254,0.7)]"
        >
          10
        </text>
      ) : (
        // Numerals 2 through 9
        <text
          x="50%"
          y="132"
          textAnchor="middle"
          fontFamily="'Arial Black', 'Impact', 'Plus Jakarta Sans', sans-serif"
          fontWeight="900"
          fontSize="145"
          fill={`url(#rank-fill-${rank})`}
          stroke="#52525b"
          strokeWidth="4.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="transition-all duration-300 group-hover:stroke-brand-400 group-hover:drop-shadow-[0_0_12px_rgba(67,63,254,0.7)]"
        >
          {rank}
        </text>
      )}
    </svg>
  );
};

export const TopTenRow: React.FC<TopTenRowProps> = ({ items }) => {
  const { openDetail } = useWatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const topItems = items
    .filter(item => item.topRank)
    .sort((a, b) => (a.topRank || 99) - (b.topRank || 99))
    .slice(0, 10);

  const checkScrollBounds = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
  }, []);

  useEffect(() => {
    checkScrollBounds();
    const handleResize = () => checkScrollBounds();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollBounds, topItems]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -scrollRef.current.clientWidth * 0.75 : scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScrollBounds, 350);
    }
  };

  if (!topItems.length) return null;

  return (
    <section className="relative py-6 group/topten">
      {/* Header */}
      <div className="cinema-layout-container mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Flame className="w-6 h-6 text-brand-500 fill-brand-500 animate-pulse-slow" />
          <span>Top 10 Tontonan Terpopuler di Indonesia Hari Ini</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Diperbarui secara real-time berdasarkan jumlah penonton terbanyak
        </p>
      </div>

      {/* Row with Netflix-Style Rank Numbers */}
      <div className="relative cinema-layout-container">
        
        {/* Left Navigation Arrow (Only visible if can scroll left) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-12 h-24 sm:h-36 bg-black/80 hover:bg-brand-600/90 text-white rounded-r-2xl backdrop-blur-md flex items-center justify-center opacity-0 group-hover/topten:opacity-100 transition-all shadow-2xl hover:scale-105 active:scale-95 cursor-pointer border border-white/15 border-l-0"
            aria-label="Geser ke Kiri"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* Scrollable Container with generous padding so numbers are never clipped */}
        <div
          ref={scrollRef}
          onScroll={checkScrollBounds}
          className="flex items-end gap-3 xs:gap-4 sm:gap-6 md:gap-7 lg:gap-8 overflow-x-auto scrollbar-none py-4 px-2 sm:px-4 md:px-6 scroll-smooth overscroll-x-contain"
        >
          {topItems.map((item, index) => {
            const rank = index + 1;
            return (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                className="relative flex-none flex items-end group cursor-pointer select-none transition-transform duration-300 hover:scale-[1.03]"
              >
                {/* Stylized Giant Rank Number (Netflix Style) */}
                <div
                  className={`relative z-0 select-none pointer-events-none flex-shrink-0 flex items-end ${
                    rank === 1
                      ? '-mr-2.5 xs:-mr-3 sm:-mr-4 md:-mr-5'
                      : rank === 10
                      ? '-mr-5 xs:-mr-6 sm:-mr-8 md:-mr-10'
                      : '-mr-4 xs:-mr-5 sm:-mr-7 md:-mr-9'
                  }`}
                >
                  <TopTenRankSvg rank={rank} />
                </div>

                {/* Poster Card */}
                <div className="relative z-10 w-[110px] xs:w-[125px] sm:w-[145px] md:w-[165px] lg:w-[185px] aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-surface-800 border border-white/10 group-hover:border-brand-500/80 group-hover:shadow-brand-500/25 transition-all duration-300">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    loading="lazy"
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Subtle hover gradient with title & match score */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 sm:p-3 flex flex-col justify-end">
                    <span className="text-xs sm:text-sm font-bold text-white line-clamp-1">{item.title}</span>
                    <span className="text-[10px] sm:text-xs text-brand-300 font-semibold">{item.matchScore}% Match</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Navigation Arrow (Only visible if can scroll right) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-12 h-24 sm:h-36 bg-black/80 hover:bg-brand-600/90 text-white rounded-l-2xl backdrop-blur-md flex items-center justify-center opacity-0 group-hover/topten:opacity-100 transition-all shadow-2xl hover:scale-105 active:scale-95 cursor-pointer border border-white/15 border-r-0"
            aria-label="Geser ke Kanan"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}
      </div>
    </section>
  );
};
