import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown,
  Search,
  Globe,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { MediaCard } from './MediaCard';
import { GENRES, COUNTRIES, YEARS } from '../data/mockData';
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
  const [selectedCountry, setSelectedCountry] = useState('Semua Negara');
  const [selectedYear, setSelectedYear] = useState('Semua Tahun');
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>(forcedType || 'all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'oldest'>('popular');

  const filteredItems = useMemo(() => {
    return allMedia.filter(item => {
      // Type filter
      if (forcedType && item.type !== forcedType) return false;
      if (!forcedType && typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Genre filter
      if (selectedGenre !== 'Semua Genre' && !item.genres.includes(selectedGenre)) return false;

      // Country filter
      if (selectedCountry !== 'Semua Negara' && item.country !== selectedCountry) return false;

      // Year filter
      if (selectedYear !== 'Semua Tahun' && item.releaseYear !== Number(selectedYear)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesGenre = item.genres.some(g => g.toLowerCase().includes(query));
        const matchesCast = item.cast.some(c => c.toLowerCase().includes(query));
        const matchesCountry = item.country?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesGenre && !matchesCast && !matchesCountry) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.releaseYear - a.releaseYear;
      if (sortBy === 'oldest') return a.releaseYear - b.releaseYear;
      return (a.topRank || 99) - (b.topRank || 99);
    });
  }, [allMedia, forcedType, typeFilter, selectedGenre, selectedCountry, selectedYear, searchQuery, sortBy]);

  const hasActiveFilters = selectedGenre !== 'Semua Genre' || selectedCountry !== 'Semua Negara' || selectedYear !== 'Semua Tahun' || (typeFilter !== 'all' && !forcedType);

  const resetFilters = () => {
    setSelectedGenre('Semua Genre');
    setSelectedCountry('Semua Negara');
    setSelectedYear('Semua Tahun');
    setTypeFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="pt-24 pb-16 cinema-layout-container">
      {/* Title Header */}
      <div className="mb-6 space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-sm text-slate-400">{pageSubtitle}</p>
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Menampilkan <span className="text-brand-400 font-bold">{filteredItems.length}</span> judul tayangan
          </span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="space-y-3 mb-8">
        
        {/* Row 1: Format, Country, Year, & Sort Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-800/40 p-3 rounded-2xl border border-white/5">
          
          <div className="flex flex-wrap items-center gap-2.5">
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

            {/* Country Dropdown Filter */}
            <div className="flex items-center gap-1.5 bg-surface-900/80 px-2.5 py-1.5 rounded-xl border border-white/5 text-xs">
              <Globe className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <select
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                aria-label="Filter berdasarkan negara asal"
              >
                {COUNTRIES.map(c => (
                  <option key={c} value={c} className="bg-surface-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Dropdown Filter */}
            <div className="flex items-center gap-1.5 bg-surface-900/80 px-2.5 py-1.5 rounded-xl border border-white/5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                aria-label="Filter berdasarkan tahun rilis"
              >
                {YEARS.map(y => (
                  <option key={y} value={y} className="bg-surface-900 text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button if active */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-colors border border-white/10 hover:border-rose-500/30"
                title="Hapus semua filter"
              >
                <X className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1 hidden md:flex font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" /> Urutkan:
            </span>
            <div className="flex items-center gap-1 bg-surface-900/80 p-1 rounded-xl border border-white/5">
              {[
                { id: 'popular', label: 'Terpopuler' },
                { id: 'rating', label: 'Rating' },
                { id: 'newest', label: 'Tahun: Baru' },
                { id: 'oldest', label: 'Tahun: Lama' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {filteredItems.map(item => (
            <MediaCard key={item.id} item={item} layout="grid" />
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
