import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface MediaRowProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  onViewAll?: () => void;
}

export const MediaRow: React.FC<MediaRowProps> = ({ 
  title, 
  subtitle, 
  items, 
  onViewAll 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -scrollRef.current.clientWidth * 0.75 : scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 400);
    }
  };

  if (!items.length) return null;

  return (
    <div className="relative py-4 group/row">
      {/* Row Header */}
      <div className="cinema-layout-container flex items-end justify-between mb-3.5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
              {items.length}
            </span>
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs sm:text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 group-hover:translate-x-0.5"
          >
            <span>Jelajahi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Row Carousel Area */}
      <div className="relative cinema-layout-container">
        
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-24 bg-black/70 hover:bg-brand-600/90 text-white rounded-r-xl backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-xl -ml-2 sm:ml-0"
            aria-label="Geser ke Kiri"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
        >
          {items.map(item => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-24 bg-black/70 hover:bg-brand-600/90 text-white rounded-l-xl backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all shadow-xl -mr-2 sm:mr-0"
            aria-label="Geser ke Kanan"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
