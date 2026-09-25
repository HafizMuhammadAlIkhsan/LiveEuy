import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown,
  Search
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { MediaCard } from './MediaCard';
import { GENRES } from '../data/mockData';
import { MediaType } from '../types';

interface CatalogViewProps {
  forcedType?: MediaType;
  pageTitle: string;
  pageSubtitle?: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ 
  forcedType, 
  pageTitle, 
  pageSubtitle 
}) => {
  const { allMedia, searchQuery, setSearchQuery } = useWatch();
  const [selectedGenre, setSelectedGenre] = useState('Semua Genre');
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>(forcedType || 'all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  const filteredItems = useMemo(() => {
    return allMedia.filter(item => {
      // Type filter
      if (forcedType && item.type !== forcedType) return false;
      if (!forcedType && typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Genre filter
      if (selectedGenre !== 'Semua Genre' && !item.genres.includes(selectedGenre)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesGenre = item.genres.some(g => g.toLowerCase().includes(query));
        const matchesCast = item.cast.some(c => c.toLowerCase().includes(query));
        if (!matchesTitle && !matchesGenre && !matchesCast) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.releaseYear - a.releaseYear;
      return (a.topRank || 99) - (b.topRank || 99);
    });
  }, [allMedia, forcedType, typeFilter, selectedGenre, searchQuery, sortBy]);

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <p className="text-sm text-slate-400">{pageSubtitle}</p>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="space-y-4 mb-8">
        
        {/* Row 1: Type & Sort Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-800/40 p-3 rounded-2xl border border-white/5">
          
          {/* Format Selector (only if not forcedType) */}
          {!forcedType && (
            <div className="flex items-center gap-1 bg-surface-900/80 p-1 rounded-xl border border-white/5">
              {[
                { id: 'all', label: 'Semua Format' },
                { id: 'movie', label: 'Film' },
                { id: 'tv', label: 'Serial TV' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTypeFilter(opt.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    typeFilter === opt.id
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1 hidden sm:flex">
              <ArrowUpDown className="w-3.5 h-3.5" /> Urutkan:
            </span>
            <div className="flex items-center gap-1 bg-surface-900/80 p-1 rounded-xl border border-white/5">
              {[
                { id: 'popular', label: 'Terpopuler' },
                { id: 'rating', label: 'Rating Tertinggi' },
                { id: 'newest', label: 'Terbaru' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    sortBy === s.id
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Genre Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                  : 'glass-panel text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="flex justify-center">
              <MediaCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center space-y-4 glass-panel rounded-3xl p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Tidak Ada Hasil Ditemukan</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Tidak ada film atau serial yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
          <button
            onClick={() => {
              setSelectedGenre('Semua Genre');
              setTypeFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
};
