import React from 'react';

/**
 * Single Card Shimmer Placeholder for Movie & Series Cards
 */
export const MediaCardSkeleton: React.FC<{ aspectRatio?: 'portrait' | 'landscape' }> = ({ 
  aspectRatio = 'portrait' 
}) => {
  return (
    <div className="relative rounded-2xl bg-white/[0.03] border border-white/[0.05] overflow-hidden p-2 flex flex-col space-y-2.5 animate-pulse">
      {/* Poster Aspect Shimmer */}
      <div 
        className={`w-full rounded-xl bg-white/[0.06] relative overflow-hidden ${
          aspectRatio === 'portrait' ? 'aspect-[2/3]' : 'aspect-video'
        }`}
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent animate-[shimmer_1.8s_infinite]" />
      </div>

      {/* Info Line Shimmer */}
      <div className="space-y-1.5 px-1 py-0.5">
        <div className="h-3 w-3/4 rounded-md bg-white/[0.08]" />
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-1/4 rounded bg-white/[0.05]" />
          <div className="h-2.5 w-1/4 rounded bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
};

/**
 * Horizontal Carousel Row Skeleton (e.g. "Sedang Hangat", "Film Aksi Terpopuler")
 */
export const MediaRowSkeleton: React.FC<{ count?: number; title?: string }> = ({ 
  count = 6, 
  title 
}) => {
  return (
    <div className="space-y-3.5 my-6 cinema-layout-container">
      {/* Row Header Shimmer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-brand-500/40" />
          {title ? (
            <span className="text-sm font-bold text-slate-400">{title}</span>
          ) : (
            <div className="h-4 w-40 rounded-md bg-white/[0.08] animate-pulse" />
          )}
        </div>
        <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse" />
      </div>

      {/* Horizontal Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, idx) => (
          <MediaCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
};

/**
 * Top Hero Carousel Banner Skeleton
 */
export const HeroBannerSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[52vh] sm:h-[65vh] lg:h-[75vh] bg-[#0c0e15] overflow-hidden animate-pulse">
      {/* Shimmer Wave */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />

      {/* Shadow Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#08090d]/80 via-transparent to-transparent" />

      {/* Content Skeleton Overlay */}
      <div className="absolute bottom-10 sm:bottom-16 left-0 right-0 cinema-layout-container space-y-4">
        {/* Badge & Year */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 rounded-full bg-white/[0.08]" />
          <div className="h-5 w-16 rounded-full bg-white/[0.05]" />
        </div>

        {/* Title */}
        <div className="h-8 sm:h-12 w-2/3 sm:w-1/2 rounded-xl bg-white/[0.1]" />

        {/* Overview snippet */}
        <div className="space-y-1.5 max-w-md hidden sm:block">
          <div className="h-3 w-full rounded bg-white/[0.06]" />
          <div className="h-3 w-4/5 rounded bg-white/[0.06]" />
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-10 w-32 rounded-xl bg-brand-600/30" />
          <div className="h-10 w-28 rounded-xl bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
};

/**
 * Full Page Catalog Grid Skeleton (For MoviesPage, SeriesPage, SearchPage)
 */
export const CatalogGridSkeleton: React.FC<{ count?: number; title?: string }> = ({ 
  count = 12, 
  title 
}) => {
  return (
    <div className="min-h-screen cinema-layout-container py-8 sm:py-10 space-y-8 animate-fade-in">
      {/* Header & Filter Bar Skeleton */}
      <div className="space-y-4 border-b border-white/[0.06] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-brand-500/50" />
          {title ? (
            <h1 className="text-xl sm:text-2xl font-black text-white">{title}</h1>
          ) : (
            <div className="h-7 w-48 rounded-lg bg-white/[0.08] animate-pulse" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        {Array.from({ length: count }).map((_, idx) => (
          <MediaCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
};
