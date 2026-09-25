import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Check, 
  Heart, 
  ChevronDown, 
  Star 
} from 'lucide-react';
import { MediaItem } from '../types';
import { useWatch } from '../context/WatchContext';

interface MediaCardProps {
  item: MediaItem;
  layout?: 'carousel' | 'grid';
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, layout = 'carousel' }) => {
  const { 
    openPlayer, 
    openDetail, 
    toggleWatchlist, 
    isInWatchlist, 
    toggleFavorite, 
    isFavorite,
    watchHistory,
    detailItem 
  } = useWatch();

  const [isHovered, setIsHovered] = useState(false);
  const inWatchlist = isInWatchlist(item.id);
  const favorite = isFavorite(item.id);
  const progress = watchHistory[item.id];

  const containerClasses = layout === 'grid'
    ? 'relative w-full group cursor-pointer transition-all duration-300'
    : 'relative flex-none w-[140px] xs:w-[165px] sm:w-[200px] md:w-[230px] lg:w-[240px] group cursor-pointer transition-all duration-300';

  return (
    <div
      className={containerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image Container */}
      <div 
        onClick={() => openDetail(item)}
        className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-surface-800 shadow-md sm:shadow-lg border border-white/5 group-hover:border-brand-500/40 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-brand-500/10"
      >
        <img
          src={item.posterUrl}
          alt={item.title}
          loading="lazy"
          style={{
            viewTransitionName: detailItem?.id === item.id ? 'active-media-hero' : undefined
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-bold tracking-wider text-white border border-white/10 uppercase">
            {item.quality}
          </span>
          <span className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] sm:text-[11px] font-bold text-amber-400 border border-white/10">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
            {item.rating}
          </span>
        </div>

        {/* Continue Watching Progress Bar */}
        {progress && progress.percentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-white/20">
            <div
              className="h-full bg-brand-500 rounded-r-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}

        {/* Desktop Hover Quick Action Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-2.5 sm:p-3 flex flex-col justify-end transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } hidden md:flex`}
        >
          {/* Quick Play & Action icons */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openPlayer(item);
                }}
                className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                title="Putar Sekarang"
              >
                <Play className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-white translate-x-0.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(item.id);
                }}
                className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full glass-panel flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                  inWatchlist ? 'text-brand-400 border-brand-500/50' : 'text-white hover:text-brand-300'
                }`}
                title={inWatchlist ? 'Hapus dari Koleksi' : 'Tambah ke Koleksi'}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full glass-panel flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                  favorite ? 'text-rose-500 fill-rose-500' : 'text-white hover:text-rose-400'
                }`}
                title="Sukai Film Ini"
              >
                <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetail(item);
              }}
              className="w-7 h-7 lg:w-8 lg:h-8 rounded-full glass-panel text-slate-300 hover:text-white flex items-center justify-center transition-transform hover:scale-110"
              title="Info Detail"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick metadata in hover */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] lg:text-[11px] text-slate-300 font-medium">
              <span className="text-emerald-400 font-semibold">{item.matchScore}% Cocok</span>
              <span className="px-1 rounded border border-white/20 text-[9px]">{item.ageRating}</span>
              <span>{item.type === 'tv' ? `${item.totalSeasons} Musim` : item.duration}</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1">
              {item.genres.slice(0, 2).join(' • ')}
            </p>
          </div>
        </div>
      </div>

      {/* Title & Info Below Card (Optimized for Mobile & Tablet touch) */}
      <div className="pt-2 px-0.5">
        <h3 
          onClick={() => openDetail(item)}
          className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-400 transition-colors truncate"
        >
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
          <span>{item.releaseYear}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 border border-white/5 uppercase font-medium">
            {item.type === 'movie' ? 'Film' : 'Serial'}
          </span>
        </div>
      </div>
    </div>
  );
};
