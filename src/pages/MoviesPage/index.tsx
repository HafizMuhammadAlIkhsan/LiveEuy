import React, { useState, useMemo } from 'react';
import { useWatch } from '../../context/WatchContext';
import { MediaCard } from '../../components/MediaCard';
import { GENRES } from '../../data/mockData';
import { MediaItem } from '../../types';
import { 
  Film, 
  Sparkles, 
  Play, 
  Info, 
  Plus, 
  Check, 
  ArrowUpDown, 
  Clock, 
  Calendar, 
  Award, 
  Clapperboard, 
  SlidersHorizontal,
  Flame,
  Volume2,
  Search,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Star
} from 'lucide-react';

export const MoviesPage: React.FC = () => {
  const { 
    allMedia, 
    openDetail, 
    openPlayer, 
    toggleWatchlist, 
    isInWatchlist,
    isLoggedIn,
    openAuthModal
  } = useWatch();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Semua Genre');
  const [selectedAgeRating, setSelectedAgeRating] = useState<'all' | 'SU' | '13+' | '16+' | '18+'>('all');
  const [selectedDecade, setSelectedDecade] = useState<'all' | '2026' | '2020s' | 'classic'>('all');
  const [selectedDuration, setSelectedDuration] = useState<'all' | 'short' | 'standard' | 'epic'>('all');
  const [selectedQuality, setSelectedQuality] = useState<'all' | '4K UHD' | 'Dolby Vision' | 'HD'>('all');
  const [selectedAudio, setSelectedAudio] = useState<'all' | 'Dolby Atmos' | '5.1 Surround' | 'Stereo'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'title_asc' | 'title_desc' | 'duration_desc' | 'duration_asc'>('popular');
  const [activeUniverse, setActiveUniverse] = useState<string>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // All movie items
  const allMovies = useMemo(() => allMedia.filter(m => m.type === 'movie'), [allMedia]);

  // Featured marquee movie (Denis Villeneuve's Chronicles of Elysium or top movie)
  const marqueeMovie: MediaItem = useMemo(() => {
    return allMovies.find(m => m.id === 'chronicles-of-elysium') || allMovies[0];
  }, [allMovies]);

  // Studio / Universe options
  const universes = [
    { id: 'all', name: 'Semua Koleksi' },
    { id: 'scifi', name: 'Cosmic & Sci-Fi' },
    { id: 'lokal', name: 'Sinema Nusantara' },
    { id: 'thriller', name: 'Horor & Mystery Vault' },
    { id: 'action', name: 'High-Octane Action' },
  ];

  // Genre counts for pills
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Semua Genre': allMovies.length };
    GENRES.forEach(g => {
      if (g !== 'Semua Genre') {
        counts[g] = allMovies.filter(m => m.genres.includes(g)).length;
      }
    });
    return counts;
  }, [allMovies]);

  // Active advanced filters counter
  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    if (selectedAgeRating !== 'all') count++;
    if (selectedDecade !== 'all') count++;
    if (selectedDuration !== 'all') count++;
    if (selectedQuality !== 'all') count++;
    if (selectedAudio !== 'all') count++;
    if (activeUniverse !== 'all') count++;
    return count;
  }, [selectedAgeRating, selectedDecade, selectedDuration, selectedQuality, selectedAudio, activeUniverse]);

  // Total active filters counter
  const totalActiveFiltersCount = useMemo(() => {
    let count = activeAdvancedCount;
    if (searchQuery.trim()) count++;
    if (selectedGenre !== 'Semua Genre') count++;
    if (sortBy !== 'popular') count++;
    return count;
  }, [activeAdvancedCount, searchQuery, selectedGenre, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('Semua Genre');
    setSelectedAgeRating('all');
    setSelectedDecade('all');
    setSelectedDuration('all');
    setSelectedQuality('all');
    setSelectedAudio('all');
    setActiveUniverse('all');
    setSortBy('popular');
  };

  // Helper for duration calculation in minutes
  const parseDurationMins = (dur?: string): number => {
    if (!dur) return 0;
    const match = dur.match(/(\d+)j\s*(\d+)?m?/);
    if (match) {
      const hours = parseInt(match[1] || '0', 10);
      const mins = parseInt(match[2] || '0', 10);
      return hours * 60 + mins;
    }
    const matchMins = dur.match(/(\d+)m/);
    return matchMins ? parseInt(matchMins[1], 10) : 0;
  };

  // Filtering & sorting logic
  const filteredMovies = useMemo(() => {
    return allMovies.filter(item => {
      // In-page search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDirector = item.director?.toLowerCase().includes(q);
        const inCast = item.cast?.some(c => c.toLowerCase().includes(q));
        const inOverview = item.overview?.toLowerCase().includes(q);
        const inGenre = item.genres?.some(g => g.toLowerCase().includes(q));
        if (!inTitle && !inDirector && !inCast && !inOverview && !inGenre) {
          return false;
        }
      }

      // Genre filter
      if (selectedGenre !== 'Semua Genre' && !item.genres.includes(selectedGenre)) return false;

      // Age rating filter
      if (selectedAgeRating !== 'all' && item.ageRating !== selectedAgeRating) return false;

      // Decade filter
      if (selectedDecade === '2026' && item.releaseYear !== 2026) return false;
      if (selectedDecade === '2020s' && (item.releaseYear < 2020 || item.releaseYear > 2025)) return false;
      if (selectedDecade === 'classic' && item.releaseYear >= 2020) return false;

      // Duration filter helper
      if (selectedDuration !== 'all' && item.duration) {
        const totalMins = parseDurationMins(item.duration);
        if (selectedDuration === 'short' && totalMins >= 90) return false;
        if (selectedDuration === 'standard' && (totalMins < 90 || totalMins > 120)) return false;
        if (selectedDuration === 'epic' && totalMins <= 120) return false;
      }

      // Quality filter
      if (selectedQuality !== 'all' && item.quality !== selectedQuality) return false;

      // Audio filter
      if (selectedAudio !== 'all' && item.audio !== selectedAudio) return false;

      // Universe filter
      if (activeUniverse === 'scifi' && !item.genres.includes('Fiksi Ilmiah')) return false;
      if (activeUniverse === 'lokal' && !['bayang-di-balik-kabut', 'aroma-karsa-rahasia', 'warkop-dimensi-lain'].includes(item.id)) return false;
      if (activeUniverse === 'thriller' && !item.genres.includes('Horor') && !item.genres.includes('Thriller')) return false;
      if (activeUniverse === 'action' && !item.genres.includes('Aksi')) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.releaseYear - a.releaseYear;
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title_desc') return b.title.localeCompare(a.title);
      if (sortBy === 'duration_desc') return parseDurationMins(b.duration) - parseDurationMins(a.duration);
      if (sortBy === 'duration_asc') return parseDurationMins(a.duration) - parseDurationMins(b.duration);
      // 'popular': matchScore first, then topRank
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return (a.topRank || 99) - (b.topRank || 99);
    });
  }, [
    allMovies, 
    searchQuery, 
    selectedGenre, 
    selectedAgeRating, 
    selectedDecade, 
    selectedDuration, 
    selectedQuality, 
    selectedAudio, 
    activeUniverse, 
    sortBy
  ]);

  const inWatchlist = marqueeMovie ? isInWatchlist(marqueeMovie.id) : false;

  return (
    <div className="pt-20 sm:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Guest Mode Notice */}
      {!isLoggedIn && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-surface-800/80 border border-brand-500/30 text-xs shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-slate-300">
              Anda sedang dalam <strong>Mode Tamu</strong>: Pratinjau kualitas HD. Beralih ke akun VIP untuk membuka streaming 4K Ultra HD & Dolby Atmos.
            </span>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold whitespace-nowrap shadow transition-colors"
          >
            Masuk / Buka 4K
          </button>
        </div>
      )}

      {/* ========================================================
          1. THEATRICAL CINEMA MARQUEE BILLBOARD
          ======================================================== */}
      {marqueeMovie && (
        <section className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
          <div className="relative aspect-[21/9] min-h-[360px] sm:min-h-[460px] md:min-h-[500px] w-full">
            <img
              src={marqueeMovie.backdropUrl}
              alt={marqueeMovie.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/70 to-transparent w-full md:w-3/4" />

            {/* Content overlay */}
            <div className="absolute inset-0 p-6 sm:p-10 md:p-14 flex flex-col justify-end max-w-3xl space-y-3 sm:space-y-4">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-600 text-white shadow-lg shadow-brand-600/30 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  Premiere Bioskop
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/10">
                  {marqueeMovie.quality}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/10">
                  {marqueeMovie.audio}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ★ {marqueeMovie.rating}
                </span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {marqueeMovie.duration}
                </span>
              </div>

              {/* Title & Tagline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {marqueeMovie.title}
              </h1>
              
              <p className="text-xs sm:text-base text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                {marqueeMovie.overview}
              </p>

              {/* Director and Cast credit */}
              <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                <span>Sutradara: <strong className="text-slate-200">{marqueeMovie.director}</strong></span>
                <span>Pemeran: <strong className="text-slate-200">{marqueeMovie.cast.slice(0, 3).join(', ')}</strong></span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => openPlayer(marqueeMovie)}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-600/30"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Tonton Film Sekarang</span>
                </button>

                <button
                  onClick={() => openDetail(marqueeMovie)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-all"
                >
                  <Info className="w-4 h-4" />
                  <span>Sinopsis & Trailer</span>
                </button>

                <button
                  onClick={() => toggleWatchlist(marqueeMovie.id)}
                  className={`p-3 rounded-xl border transition-all ${
                    inWatchlist
                      ? 'bg-brand-600/20 border-brand-500 text-brand-400'
                      : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                  }`}
                  title={inWatchlist ? 'Hapus dari Koleksi' : 'Tambah ke Koleksi'}
                >
                  {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          2. STUDIO & CINEMATIC UNIVERSE SPOTLIGHT TABS
          ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-brand-400" />
            <span>Koleksi Berdasarkan Kategori Studio</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {filteredMovies.length} Film Bioskop
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {universes.map(uni => (
            <button
              key={uni.id}
              onClick={() => setActiveUniverse(uni.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeUniverse === uni.id
                  ? 'bg-gradient-to-r from-brand-600 to-secondary-500 text-white shadow-lg shadow-brand-600/20 scale-105'
                  : 'bg-surface-800/80 text-slate-300 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              {uni.name}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          3. ADVANCED THEATRICAL FILTER & SORT CONTROLS
          ======================================================== */}
      <section className="bg-surface-800/40 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl backdrop-blur-md">
        
        {/* Top Control Bar: Search + Sort Dropdown + View Mode + Advanced Filter Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Quick Search in page */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul film, aktor, atau sutradara..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface-900/90 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Tools: Sort + Layout Switcher + Advanced Filters Toggle */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Sort Selector Dropdown */}
            <div className="flex items-center gap-1.5 text-xs bg-surface-900/90 px-3 py-1.5 rounded-xl border border-white/10">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-400 flex-none" />
              <span className="text-slate-400 font-medium hidden sm:inline">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Urutkan koleksi film"
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="popular" className="bg-surface-900 text-white">🔥 Paling Populer</option>
                <option value="rating" className="bg-surface-900 text-white">⭐ Rating Tertinggi</option>
                <option value="newest" className="bg-surface-900 text-white">📅 Tahun Rilis Terbaru</option>
                <option value="title_asc" className="bg-surface-900 text-white">🔤 Judul (A – Z)</option>
                <option value="title_desc" className="bg-surface-900 text-white">🔤 Judul (Z – A)</option>
                <option value="duration_desc" className="bg-surface-900 text-white">⏱️ Durasi Terpanjang</option>
                <option value="duration_asc" className="bg-surface-900 text-white">⏱️ Durasi Terpendek</option>
              </select>
            </div>

            {/* Layout Toggle (Grid / List) */}
            <div className="flex items-center bg-surface-900/90 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  layoutMode === 'grid'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Grid Poster"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  layoutMode === 'list'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Daftar Rinci"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Advanced Filters Expand Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showAdvancedFilters || activeAdvancedCount > 0
                  ? 'bg-brand-600/20 border-brand-500/50 text-brand-300'
                  : 'bg-surface-900/90 hover:bg-surface-900 border-white/10 text-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter Lanjutan</span>
              {activeAdvancedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center">
                  {activeAdvancedCount}
                </span>
              )}
              {showAdvancedFilters ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>

          </div>
        </div>

        {/* Genre Pills Carousel */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pt-1">
          {GENRES.map(genre => {
            const count = genreCounts[genre] || 0;
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'bg-surface-900/80 text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/15'
                }`}
              >
                <span>{genre}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white font-bold' : 'bg-white/5 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expandable Advanced Filter Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 animate-in fade-in duration-200">
            
            {/* Age Rating Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                Rating Usia
              </label>
              <div className="flex flex-wrap gap-1 bg-surface-900/80 p-1.5 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'SU', label: 'SU' },
                  { id: '13+', label: '13+' },
                  { id: '16+', label: '16+' },
                  { id: '18+', label: '18+' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedAgeRating(opt.id as any)}
                    className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                      selectedAgeRating === opt.id
                        ? 'bg-brand-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Era / Decade Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                Tahun Rilis
              </label>
              <div className="flex flex-wrap gap-1 bg-surface-900/80 p-1.5 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: '2026', label: '2026 Baru' },
                  { id: '2020s', label: '2020-2025' },
                  { id: 'classic', label: '< 2020' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedDecade(opt.id as any)}
                    className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                      selectedDecade === opt.id
                        ? 'bg-brand-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                Durasi Film
              </label>
              <div className="flex flex-wrap gap-1 bg-surface-900/80 p-1.5 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'short', label: '< 90m' },
                  { id: 'standard', label: '90-120m' },
                  { id: 'epic', label: '> 2 Jam' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedDuration(opt.id as any)}
                    className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                      selectedDuration === opt.id
                        ? 'bg-brand-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Quality Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Resolusi Video
              </label>
              <div className="flex flex-wrap gap-1 bg-surface-900/80 p-1.5 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: '4K UHD', label: '4K UHD' },
                  { id: 'Dolby Vision', label: 'Dolby Vision' },
                  { id: 'HD', label: 'HD 1080p' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedQuality(opt.id as any)}
                    className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                      selectedQuality === opt.id
                        ? 'bg-brand-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Quality Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-brand-400" />
                Format Audio
              </label>
              <div className="flex flex-wrap gap-1 bg-surface-900/80 p-1.5 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'Dolby Atmos', label: 'Atmos' },
                  { id: '5.1 Surround', label: '5.1' },
                  { id: 'Stereo', label: 'Stereo' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedAudio(opt.id as any)}
                    className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                      selectedAudio === opt.id
                        ? 'bg-brand-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Active Filters & Counter Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
          
          <div className="flex flex-wrap items-center gap-1.5">
            <span>
              Menampilkan <strong className="text-white font-semibold">{filteredMovies.length}</strong> dari {allMovies.length} Film Bioskop
            </span>

            {/* Active chips */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-[11px]">
                Cari: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedGenre !== 'Semua Genre' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-[11px]">
                Genre: {selectedGenre}
                <button onClick={() => setSelectedGenre('Semua Genre')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedAgeRating !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-[11px]">
                Usia: {selectedAgeRating}
                <button onClick={() => setSelectedAgeRating('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDecade !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-[11px]">
                Era: {selectedDecade === '2026' ? '2026 Baru' : selectedDecade === '2020s' ? '2020-2025' : 'Klasik'}
                <button onClick={() => setSelectedDecade('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDuration !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-[11px]">
                Durasi: {selectedDuration === 'short' ? '< 90m' : selectedDuration === 'standard' ? '90-120m' : '> 2 Jam'}
                <button onClick={() => setSelectedDuration('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedQuality !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-[11px]">
                Kualitas: {selectedQuality}
                <button onClick={() => setSelectedQuality('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedAudio !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-[11px]">
                Audio: {selectedAudio}
                <button onClick={() => setSelectedAudio('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeUniverse !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-[11px]">
                Studio: {universes.find(u => u.id === activeUniverse)?.name}
                <button onClick={() => setActiveUniverse('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {sortBy !== 'popular' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-[11px]">
                Urutan: {
                  sortBy === 'rating' ? 'Rating Tertinggi' :
                  sortBy === 'newest' ? 'Tahun Terbaru' :
                  sortBy === 'title_asc' ? 'A–Z' :
                  sortBy === 'title_desc' ? 'Z–A' :
                  sortBy === 'duration_desc' ? 'Terpanjang' : 'Terpendek'
                }
                <button onClick={() => setSortBy('popular')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {/* Reset button */}
          {totalActiveFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-brand-400" />
              <span>Reset Semua Filter ({totalActiveFiltersCount})</span>
            </button>
          )}

        </div>

      </section>

      {/* ========================================================
          4. THEATRICAL MOVIES CATALOG (GRID / LIST VIEW)
          ======================================================== */}
      {filteredMovies.length > 0 ? (
        layoutMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {filteredMovies.map(item => (
              <MediaCard key={item.id} item={item} layout="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredMovies.map(item => (
              <MediaCard key={item.id} item={item} layout="list" />
            ))}
          </div>
        )
      ) : (
        <div className="py-16 text-center space-y-4 glass-panel rounded-3xl p-8 max-w-lg mx-auto shadow-2xl border border-white/10">
          <div className="w-16 h-16 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400">
            <Film className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white">Tidak Ada Film Yang Sesuai</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Tidak ditemukan film dengan kriteria filter saat ini. Coba bersihkan pencarian atau ubah filter durasi, rating, dan genre.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Bersihkan Semua Filter</span>
          </button>
        </div>
      )}

      {/* ========================================================
          5. CURATOR'S SPECIAL SHOWCASE: THEATRICAL ACCOLADES
          ======================================================== */}
      <section className="rounded-3xl bg-gradient-to-r from-surface-900 via-surface-800 to-surface-900 border border-white/10 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Award className="w-5 h-5" />
          <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider">
            Sorotan Kurator Bioskop LiveEuy
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Karya Sinematografi Epik</span>
            <p className="text-slate-200 italic font-serif">
              "Chronicles of Elysium mendefinisikan ulang standar visual film fiksi ilmiah modern dengan skala kosmik yang mengagumkan."
            </p>
            <span className="text-slate-400 text-[11px] block">— Indonesian Film Reviewers Guild</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Horor Misteri Terbaik</span>
            <p className="text-slate-200 italic font-serif">
              "Bayang di Balik Kabut membuktikan kepiawaian Joko Anwar dalam merajut ketakutan psikologis dan atmosfer lereng mistis Nusantara."
            </p>
            <span className="text-slate-400 text-[11px] block">— Cinephile Spotlight 2026</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Komedi Menghibur</span>
            <p className="text-slate-200 italic font-serif">
              "Warkop Dimensi Lain berhasil memadukan humor klasik legendaris dengan konsep multiverse yang segar dan kocak."
            </p>
            <span className="text-slate-400 text-[11px] block">— Komedi Cinema ID</span>
          </div>
        </div>
      </section>

    </div>
  );
};
