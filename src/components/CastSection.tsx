import React, { useRef, useState } from 'react';
import { CastMember } from '../types';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

interface CastSectionProps {
  actors?: CastMember[];
  castFallback?: string[];
  title?: string;
  onActorClick?: (actorName: string) => void;
}

// Curated high-resolution fallback portraits for actors without profileUrl
const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
];

export const CastSection: React.FC<CastSectionProps> = ({
  actors,
  castFallback = [],
  title = 'Cast',
  onActorClick
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Resolve display cast items: prefer rich actors array, otherwise map from castFallback
  const castItems: CastMember[] = React.useMemo(() => {
    if (actors && actors.length > 0) {
      return actors;
    }
    return castFallback.map((name, index) => ({
      name,
      character: 'Karakter Utama',
      profileUrl: DEFAULT_AVATARS[index % DEFAULT_AVATARS.length]
    }));
  }, [actors, castFallback]);

  if (castItems.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 360;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleImageError = (uniqueKey: string) => {
    setImageErrors(prev => ({ ...prev, [uniqueKey]: true }));
  };

  return (
    <div className="relative pt-4 pb-2 group/cast-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
            {castItems.length}
          </span>
        </h3>

        {/* Scroll Navigation Arrows */}
        {castItems.length > 4 && (
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-1.5 rounded-full bg-surface-800/80 hover:bg-surface-700 text-slate-300 hover:text-white border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Gulir ke kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-1.5 rounded-full bg-surface-800/80 hover:bg-surface-700 text-slate-300 hover:text-white border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Gulir ke kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Scrollable Row */}
      <div
        ref={scrollContainerRef}
        className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 scroll-smooth scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent select-none -mx-1 px-1"
        style={{ scrollbarGutter: 'stable' }}
      >
        {castItems.map((actor, idx) => {
          const itemKey = `${actor.name}-${idx}`;
          const hasError = imageErrors[itemKey];

          return (
            <div
              key={itemKey}
              onClick={() => onActorClick?.(actor.name)}
              className={`flex flex-col items-center flex-shrink-0 group/actor text-center w-[92px] sm:w-[110px] md:w-[124px] ${
                onActorClick ? 'cursor-pointer' : ''
              }`}
            >
              {/* Circular Avatar Photo (Rounded Full as in IDLIX / TMDB) */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-surface-800 border-2 border-white/15 group-hover/actor:border-brand-500 shadow-xl transition-all duration-300 group-hover/actor:scale-105 ring-2 ring-black/40">
                {actor.profileUrl && !hasError ? (
                  <img
                    src={actor.profileUrl}
                    alt={actor.name}
                    loading="lazy"
                    onError={() => handleImageError(itemKey)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/actor:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-700 via-surface-800 to-surface-900 text-slate-300">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400/80 mb-1" />
                    <span className="text-[10px] font-bold tracking-widest text-slate-400">
                      {actor.name
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  </div>
                )}

                {/* Subtle bottom shadow overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Actor Name (Bold White Text) */}
              <span 
                className="mt-2.5 text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1 group-hover/actor:text-brand-300 transition-colors w-full px-1"
                title={actor.name}
              >
                {actor.name}
              </span>

              {/* Character / Role Name (Muted Secondary Text) */}
              <span 
                className="mt-0.5 text-[11px] sm:text-xs text-slate-400 leading-tight line-clamp-1 w-full px-1"
                title={actor.character}
              >
                {actor.character}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
