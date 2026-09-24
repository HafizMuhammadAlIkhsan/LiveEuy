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
}

export const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
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

  return (
    <div
      className="relative flex-none w-[170px] sm:w-[210px] md:w-[240px] group cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image Container */}
      <div 
        onClick={() => openDetail(item)}
        className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-surface-800 shadow-lg border border-white/5 group-hover:border-brand-500/40 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-brand-500/10"
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
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold tracking-wider text-white border border-white/10 uppercase">
            {item.quality}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-white/10">
            <Star className="w-3 h-3 fill-amber-400" />
            {item.rating}
          </span>
        </div>

        {/* Continue Watching Progress Bar */}
        {progress && progress.percentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
            <div
              className="h-full bg-brand-500 rounded-r-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 flex flex-col justify-end transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Quick Play & Action icons */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openPlayer(item);
                }}
                className="w-9 h-9 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                title="Putar Sekarang"
              >
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(item.id);
                }}
                className={`w-9 h-9 rounded-full glass-panel flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                  inWatchlist ? 'text-brand-400 border-brand-500/50' : 'text-white hover:text-brand-300'
                }`}
                title={inWatchlist ? 'Hapus dari Koleksi' : 'Tambah ke Koleksi'}
              >
                {inWatchlist ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                className={`w-9 h-9 rounded-full glass-panel flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                  favorite ? 'text-rose-500 fill-rose-500' : 'text-white hover:text-rose-400'
                }`}
                title="Sukai Film Ini"
              >
                <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetail(item);
              }}
              className="w-8 h-8 rounded-full glass-panel text-slate-300 hover:text-white flex items-center justify-center transition-transform hover:scale-110"
              title="Info Detail"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick metadata in hover */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
              <span className="text-emerald-400 font-semibold">{item.matchScore}% Cocok</span>
              <span className="px-1 rounded border border-white/20 text-[10px]">{item.ageRating}</span>
              <span>{item.type === 'tv' ? `${item.totalSeasons} Musim` : item.duration}</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              {item.genres.slice(0, 2).join(' • ')}
            </p>
          </div>
        </div>
      </div>

      {/* Title & info below card */}
      <div className="pt-2 px-1">
        <h3 
          onClick={() => openDetail(item)}
          className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors truncate"
        >
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-0.5">
          <span>{item.releaseYear}</span>
          <span>{item.type === 'movie' ? 'Film' : 'Serial'}</span>
        </div>
      </div>
    </div>
  );
};
