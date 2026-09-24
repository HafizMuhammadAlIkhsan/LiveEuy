import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { MediaItem } from '../types';
import { useWatch } from '../context/WatchContext';

interface TopTenRowProps {
  items: MediaItem[];
}

export const TopTenRow: React.FC<TopTenRowProps> = ({ items }) => {
  const { openDetail } = useWatch();
  const scrollRef = useRef<HTMLDivElement>(null);

  const topItems = items
    .filter(item => item.topRank)
    .sort((a, b) => (a.topRank || 99) - (b.topRank || 99))
    .slice(0, 10);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -scrollRef.current.clientWidth * 0.7 : scrollRef.current.clientWidth * 0.7;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!topItems.length) return null;

  return (
    <div className="relative py-6 group/topten">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-6 h-6 text-brand-500 fill-brand-500" />
          <span>Top 10 Tontonan Terpopuler di Indonesia Hari Ini</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Diperbarui secara real-time berdasarkan jumlah penonton terbanyak
        </p>
      </div>

      {/* Row with Rank Numbers */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Arrows */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-28 bg-black/70 hover:bg-brand-600 text-white rounded-r-xl backdrop-blur-md flex items-center justify-center opacity-0 group-hover/topten:opacity-100 transition-all shadow-xl -ml-2 sm:ml-0"
          aria-label="Geser ke Kiri"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-4 px-2 scroll-smooth"
        >
          {topItems.map((item, index) => {
            const rank = index + 1;
            return (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                className="relative flex-none flex items-center group cursor-pointer"
              >
                {/* Stylized Giant Rank Number */}
                <div className="relative z-0 -mr-6 sm:-mr-8 select-none pointer-events-none">
                  <span className="text-8xl sm:text-9xl font-black font-outline-rank tracking-tighter opacity-80 group-hover:text-brand-600 transition-colors">
                    {rank}
                  </span>
                </div>

                {/* Poster Card */}
                <div className="relative z-10 w-[140px] sm:w-[170px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-surface-800 border border-white/10 group-hover:border-brand-500/60 group-hover:scale-105 group-hover:shadow-brand-500/20 transition-all duration-300">
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                    <span className="text-xs font-bold text-white line-clamp-1">{item.title}</span>
                    <span className="text-[10px] text-brand-300 font-semibold">{item.matchScore}% Match</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-28 bg-black/70 hover:bg-brand-600 text-white rounded-l-xl backdrop-blur-md flex items-center justify-center opacity-0 group-hover/topten:opacity-100 transition-all shadow-xl -mr-2 sm:mr-0"
          aria-label="Geser ke Kanan"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
