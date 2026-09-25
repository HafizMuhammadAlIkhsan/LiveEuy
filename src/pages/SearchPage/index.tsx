import React, { useState, useMemo } from 'react';
import { useWatch } from '../../context/WatchContext';
import { MediaCard } from '../../components/MediaCard';
import { GENRES } from '../../data/mockData';
import { 
  Search, 
  X, 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  Star, 
  Film, 
  Tv, 
  SlidersHorizontal,
  Flame,
  Zap,
  Ghost,
  Smile,
  Palette,
  Sword,
  Heart
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { allMedia, searchQuery, setSearchQuery } = useWatch();

  // Local filter states
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'movie' | 'tv'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'newest'>('relevance');

  // Popular search suggestions
  const popularKeywords = [
    'Cyberpunk',
    'Denis Villeneuve',
    'Horor Indonesia',
    'Joko Anwar',
    'Anime 4K',
    'Komedi Multiverse',
    'Iko Uwais',
    '4K UHD',
  ];

  // Visual Category Explorer Cards
  const categoryCards = [
    { name: 'Aksi & Sci-Fi', genre: 'Aksi', icon: Zap, gradient: 'from-amber-600 to-rose-600' },
    { name: 'Fiksi Ilmiah', genre: 'Fiksi Ilmiah', icon: Sparkles, gradient: 'from-cyan-600 to-blue-700' },
    { name: 'Horor & Misteri', genre: 'Horor', icon: Ghost, gradient: 'from-purple-800 to-indigo-950' },
    { name: 'Komedi Menghibur', genre: 'Komedi', icon: Smile, gradient: 'from-yellow-500 to-orange-600' },
    { name: 'Animasi & Anime', genre: 'Animasi', icon: Palette, gradient: 'from-pink-600 to-rose-600' },
    { name: 'Fantasi & Petualangan', genre: 'Fantasi', icon: Sword, gradient: 'from-emerald-600 to-teal-800' },
    { name: 'Drama Mendalam', genre: 'Drama', icon: Heart, gradient: 'from-rose-600 to-red-800' },
  ];

  // Search filtering logic
  const searchResults = useMemo(() => {
    return allMedia.filter(item => {
      // Format
      if (selectedFormat !== 'all' && item.type !== selectedFormat) return false;

      // Min rating
      if (minRating > 0 && item.rating < minRating) return false;

      // Genre
      if (selectedGenre !== 'all' && !item.genres.includes(selectedGenre)) return false;

      // Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchOrig = item.originalTitle?.toLowerCase().includes(query);
        const matchGenre = item.genres.some(g => g.toLowerCase().includes(query));
        const matchCast = item.cast.some(c => c.toLowerCase().includes(query));
        const matchDirector = item.director.toLowerCase().includes(query);
        const matchOverview = item.overview.toLowerCase().includes(query);

        if (!matchTitle && !matchOrig && !matchGenre && !matchCast && !matchDirector && !matchOverview) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.releaseYear - a.releaseYear;
      return (a.topRank || 99) - (b.topRank || 99);
    });
  }, [allMedia, searchQuery, selectedFormat, minRating, selectedGenre, sortBy]);

  // Fallback recommendations if 0 results
  const recommendations = useMemo(() => {
    return allMedia.slice(0, 5);
  }, [allMedia]);

  return (
    <div className="pt-24 sm:pt-28 pb-20 cinema-layout-container space-y-8">
      
      {/* ========================================================
          1. HERO DISCOVERY SEARCH INPUT
          ======================================================== */}
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Pusat Eksplorasi & Pencarian
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Cari berdasarkan judul, pemeran aktor, sutradara, maupun genre favorit Anda.
        </p>

        {/* Large Search Box */}
        <div className="relative mt-2">
          <div className="flex items-center bg-surface-800/90 border-2 border-white/10 focus-within:border-brand-500 rounded-2xl px-4 py-3.5 shadow-2xl transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ketik judul film, serial, aktor, sutradara..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:text-white text-slate-400 rounded-lg hover:bg-white/10 transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Trending Keywords Quick Chips */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-rose-500" /> Sering dicari:
          </span>
          {popularKeywords.map(kw => (
            <button
              key={kw}
              onClick={() => setSearchQuery(kw)}
              className="px-3 py-1 rounded-full text-xs bg-surface-800 hover:bg-brand-600/30 text-slate-300 hover:text-white border border-white/10 hover:border-brand-500/40 transition-colors"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          2. VISUAL GENRE EXPLORATION CARDS (Shown when no search query)
          ======================================================== */}
      {!searchQuery && (
        <section className="space-y-4 pt-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span>Jelajahi Berdasarkan Suasana & Kategori</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categoryCards.map(cat => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  onClick={() => {
                    setSelectedGenre(cat.genre);
                    setSearchQuery(cat.genre);
                  }}
                  className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${cat.gradient} cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl`}
                >
                  <div className="relative z-10 flex flex-col justify-between h-24 sm:h-28">
                    <Icon className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-white">{cat.name}</h4>
                      <span className="text-[11px] text-white/80">Koleksi Pilihan &gt;</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform pointer-events-none" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================
          3. ADVANCED FACETED FILTER BAR
          ======================================================== */}
      <section className="bg-surface-800/50 border border-white/5 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Format selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Format:</span>
            <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'movie', label: 'Film' },
                { id: 'tv', label: 'Serial' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedFormat(opt.id as any)}
                  className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                    selectedFormat === opt.id ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Min Rating */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Rating Min:</span>
            <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5">
              {[
                { id: 0, label: 'Semua' },
                { id: 8.5, label: '★ 8.5+' },
                { id: 9.0, label: '★ 9.0+' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setMinRating(opt.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    minRating === opt.id ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Urutkan:
            </span>
            <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5">
              {[
                { id: 'relevance', label: 'Relevansi' },
                { id: 'rating', label: 'Rating' },
                { id: 'newest', label: 'Terbaru' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    sortBy === opt.id ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Active search result stats */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
          <span>
            {searchQuery.trim() ? (
              <>Hasil pencarian untuk <strong className="text-white">"{searchQuery}"</strong></>
            ) : (
              <>Katalog Eksplorasi Keseluruhan</>
            )}
          </span>
          <span className="font-mono text-brand-400 font-semibold">{searchResults.length} Judul Ditemukan</span>
        </div>
      </section>

      {/* ========================================================
          4. RESULTS GRID
          ======================================================== */}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {searchResults.map(item => (
            <MediaCard key={item.id} item={item} layout="grid" />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="space-y-8">
          <div className="py-16 text-center space-y-4 glass-panel rounded-3xl p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Tidak Ada Judul Yang Cocok</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Kami tidak dapat menemukan film atau serial untuk kata kunci <strong className="text-white">"{searchQuery}"</strong>.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFormat('all');
                setMinRating(0);
                setSelectedGenre('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all"
            >
              Reset Semua Filter Pencarian
            </button>
          </div>

          {/* Popular Fallback */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Mungkin Anda Tertarik Menonton Ini:</span>
            </h4>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5">
              {recommendations.map(item => (
                <MediaCard key={item.id} item={item} layout="grid" />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
