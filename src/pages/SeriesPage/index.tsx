import React, { useState, useMemo } from 'react';
import { useWatch } from '../../context/WatchContext';
import { MediaCard } from '../../components/MediaCard';
import { GENRES } from '../../data/mockData';
import { MediaItem, Season, Episode } from '../../types';
import { 
  Tv, 
  Play, 
  Calendar, 
  Clock, 
  Layers, 
  Sparkles, 
  CheckCircle, 
  Film, 
  Flame, 
  Bookmark, 
  Plus, 
  Check, 
  ChevronRight,
  Info,
  Search,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Star,
  ArrowUpDown,
  SlidersHorizontal,
  Volume2
} from 'lucide-react';

export const SeriesPage: React.FC = () => {
  const { 
    allMedia, 
    openPlayer, 
    openDetail, 
    toggleWatchlist, 
    isInWatchlist, 
    isLoggedIn,
    openAuthModal
  } = useWatch();

  // All TV series items
  const allSeries = useMemo(() => allMedia.filter(m => m.type === 'tv'), [allMedia]);

  // Spotlight series
  const spotlightSeries: MediaItem = useMemo(() => {
    return allSeries.find(s => s.id === 'cyberpunk-neo-nusantara') || allSeries[0];
  }, [allSeries]);

  // Interactive Episode Explorer selection
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(spotlightSeries?.id || '');
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'mini'>('all');
  const [selectedGenre, setSelectedGenre] = useState('Semua Genre');
  const [selectedAgeRating, setSelectedAgeRating] = useState<'all' | 'SU' | '13+' | '16+' | '18+'>('all');
  const [selectedDecade, setSelectedDecade] = useState<'all' | '2026' | '2020s' | 'classic'>('all');
  const [selectedQuality, setSelectedQuality] = useState<'all' | '4K UHD' | 'Dolby Vision' | 'HD'>('all');
  const [selectedAudio, setSelectedAudio] = useState<'all' | 'Dolby Atmos' | '5.1 Surround' | 'Stereo'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'title_asc' | 'title_desc' | 'seasons_desc' | 'seasons_asc'>('popular');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Genre counts for pills
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Semua Genre': allSeries.length };
    GENRES.forEach(g => {
      if (g !== 'Semua Genre') {
        counts[g] = allSeries.filter(s => s.genres.includes(g)).length;
      }
    });
    return counts;
  }, [allSeries]);

  // Active advanced filters counter
  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    if (selectedAgeRating !== 'all') count++;
    if (selectedDecade !== 'all') count++;
    if (selectedQuality !== 'all') count++;
    if (selectedAudio !== 'all') count++;
    return count;
  }, [selectedAgeRating, selectedDecade, selectedQuality, selectedAudio]);

  // Total active filters counter
  const totalActiveFiltersCount = useMemo(() => {
    let count = activeAdvancedCount;
    if (searchQuery.trim()) count++;
    if (selectedGenre !== 'Semua Genre') count++;
    if (statusFilter !== 'all') count++;
    if (sortBy !== 'popular') count++;
    return count;
  }, [activeAdvancedCount, searchQuery, selectedGenre, statusFilter, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('Semua Genre');
    setStatusFilter('all');
    setSelectedAgeRating('all');
    setSelectedDecade('all');
    setSelectedQuality('all');
    setSelectedAudio('all');
    setSortBy('popular');
  };

  // Currently active explored series
  const activeSeries = useMemo(() => {
    return allSeries.find(s => s.id === selectedSeriesId) || spotlightSeries;
  }, [allSeries, selectedSeriesId, spotlightSeries]);

  // Active season episodes
  const activeSeason = useMemo(() => {
    if (!activeSeries?.seasons || activeSeries.seasons.length === 0) return null;
    return activeSeries.seasons.find(s => s.seasonNumber === selectedSeasonNumber) || activeSeries.seasons[0];
  }, [activeSeries, selectedSeasonNumber]);

  // Weekly airing schedule mock
  const airingSchedule = [
    { day: 'Senin', time: '20:00 WIB', title: 'Legends of Valkyrie', ep: 'Musim 1 Episode 3', badge: 'Episode Baru' },
    { day: 'Rabu', time: '19:30 WIB', title: 'Spirit Realm: Jiwa Penjaga', ep: 'Simulcast Anime Ep 3', badge: 'Simulcast 4K' },
    { day: 'Jumat', time: '21:00 WIB', title: 'Cyberpunk: Neo Nusantara', ep: 'Musim 2 Episode 2', badge: 'Original Premiere' },
    { day: 'Minggu', time: '18:00 WIB', title: 'Warkop Multiverse', ep: 'Spesial Akhir Pekan', badge: 'Spesial' },
  ];

  // Filtered series list
  const filteredSeries = useMemo(() => {
    return allSeries.filter(item => {
      // In-page search
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

      // Status filter
      if (statusFilter === 'ongoing' && item.totalSeasons && item.totalSeasons < 2) return false;
      if (statusFilter === 'mini' && item.totalSeasons && item.totalSeasons > 1) return false;

      // Age rating filter
      if (selectedAgeRating !== 'all' && item.ageRating !== selectedAgeRating) return false;

      // Decade filter
      if (selectedDecade === '2026' && item.releaseYear !== 2026) return false;
      if (selectedDecade === '2020s' && (item.releaseYear < 2020 || item.releaseYear > 2025)) return false;
      if (selectedDecade === 'classic' && item.releaseYear >= 2020) return false;

      // Quality filter
      if (selectedQuality !== 'all' && item.quality !== selectedQuality) return false;

      // Audio filter
      if (selectedAudio !== 'all' && item.audio !== selectedAudio) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.releaseYear - a.releaseYear;
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title_desc') return b.title.localeCompare(a.title);
      if (sortBy === 'seasons_desc') return (b.totalSeasons || 1) - (a.totalSeasons || 1);
      if (sortBy === 'seasons_asc') return (a.totalSeasons || 1) - (b.totalSeasons || 1);
      // 'popular': matchScore first, then topRank
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return (a.topRank || 99) - (b.topRank || 99);
    });
  }, [
    allSeries,
    searchQuery,
    selectedGenre,
    statusFilter,
    selectedAgeRating,
    selectedDecade,
    selectedQuality,
    selectedAudio,
    sortBy
  ]);

  const inWatchlist = activeSeries ? isInWatchlist(activeSeries.id) : false;

  return (
    <div className="pt-20 sm:pt-24 pb-20 cinema-layout-container space-y-8">
      
      {/* Guest Mode Notice */}
      {!isLoggedIn && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-surface-800/80 border border-brand-500/30 text-xs shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-slate-300">
              Anda sedang dalam <strong>Mode Tamu</strong>: Masuk ke akun LiveEuy untuk membuka seluruh episode multi-musim dan dapatkan notifikasi rilis episode baru setiap pekan.
            </span>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold whitespace-nowrap shadow transition-colors"
          >
            Masuk Akun
          </button>
        </div>
      )}

      {/* ========================================================
          1. BINGE-WATCH SPOTLIGHT BANNER (16:9 Cinema Widescreen)
          ======================================================== */}
      {spotlightSeries && (
        <section className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
          <div className="relative aspect-[16/9] min-h-[380px] sm:min-h-[460px] md:min-h-[500px] lg:min-h-[540px] xl:max-h-[640px] 2xl:max-h-[720px] w-full">
            <img
              src={spotlightSeries.backdropUrl}
              alt={spotlightSeries.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/70 to-transparent w-full md:w-3/4" />

            {/* Content */}
            <div className="absolute inset-0 p-6 sm:p-10 md:p-14 flex flex-col justify-end max-w-3xl space-y-3 sm:space-y-4">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-600 text-white shadow-lg shadow-brand-600/30 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5" />
                  Serial Original Unggulan
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {spotlightSeries.totalSeasons} Musim Lengkap
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ★ {spotlightSeries.rating}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/15 text-white">
                  {spotlightSeries.quality}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {spotlightSeries.title}
              </h1>

              <p className="text-xs sm:text-base text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                {spotlightSeries.overview}
              </p>

              <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                <span>Pemeran Utama: <strong className="text-slate-200">{spotlightSeries.cast.slice(0, 3).join(', ')}</strong></span>
                <span>Format: <strong className="text-slate-200">Episode Mingguan 4K HDR</strong></span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => openPlayer(spotlightSeries)}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-600/30"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mulai Musim 1 Episode 1</span>
                </button>

                <button
                  onClick={() => openDetail(spotlightSeries)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-all"
                >
                  <Info className="w-4 h-4" />
                  <span>Detail & Semua Episode</span>
                </button>

                <button
                  onClick={() => toggleWatchlist(spotlightSeries.id)}
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
          2. WEEKLY EPISODE RELEASE SCHEDULE
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Jadwal Rilis Episode Baru Pekan Ini
            </h2>
          </div>
          <span className="text-xs text-brand-400 font-semibold hidden sm:inline">
            Waktu Indonesia Barat (WIB)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {airingSchedule.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-surface-800/80 border border-white/5 hover:border-brand-500/30 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider bg-white/5 px-2.5 py-0.5 rounded-md">
                  {item.day}
                </span>
                <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400">{item.ep}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-white/5">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Tayang pukul {item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          3. INTERACTIVE IN-PAGE EPISODE EXPLORER
          ======================================================== */}
      {activeSeries && activeSeries.seasons && activeSeries.seasons.length > 0 && (
        <section className="bg-surface-800/40 border border-white/10 rounded-3xl p-5 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-brand-400 font-bold uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Episode Explorer Langsung</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Jelajahi Episode: {activeSeries.title}
              </h3>
            </div>

            {/* Switch Series Selector */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {allSeries.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSeriesId(s.id);
                    setSelectedSeasonNumber(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    (selectedSeriesId || spotlightSeries?.id) === s.id
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-surface-900 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Season Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {activeSeries.seasons.map(s => (
              <button
                key={s.seasonNumber}
                onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedSeasonNumber === s.seasonNumber
                    ? 'bg-white text-surface-950 shadow-lg'
                    : 'bg-surface-900 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {s.title} ({s.episodes.length} Episode)
              </button>
            ))}
          </div>

          {/* Episode Cards Grid */}
          {activeSeason && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSeason.episodes.map(ep => (
                <div
                  key={ep.id}
                  onClick={() => openPlayer(activeSeries)}
                  className="group relative rounded-2xl overflow-hidden bg-surface-900/90 border border-white/5 hover:border-brand-500/40 p-3 transition-all cursor-pointer hover:shadow-xl space-y-3"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-white">
                      {ep.duration}
                    </span>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-600/90 text-[10px] font-bold text-white">
                      Ep. {ep.episodeNumber}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                      {ep.episodeNumber}. {ep.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {ep.overview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          4. SERIES CATALOG FILTERS & SORT CONTROLS
          ======================================================== */}
      <section className="bg-surface-800/40 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl backdrop-blur-md">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Katalog Serial TV & Drama
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredSeries.length} Serial TV
          </span>
        </div>

        {/* Top Control Bar: Search + Status + Sort Dropdown + View Mode + Advanced Filter Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Quick Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul serial, pemeran, atau sutradara..."
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

          {/* Right Tools: Status Filter + Sort + Layout Switcher + Advanced Filters Toggle */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Status Format Pills */}
            <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/10 text-xs">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'ongoing', label: 'Multi-Musim' },
                { id: 'mini', label: 'Mini-Series' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setStatusFilter(opt.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                    statusFilter === opt.id
                      ? 'bg-brand-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort Selector Dropdown */}
            <div className="flex items-center gap-1.5 text-xs bg-surface-900/90 px-3 py-1.5 rounded-xl border border-white/10">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-400 flex-none" />
              <span className="text-slate-400 font-medium hidden sm:inline">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Urutkan serial TV"
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="popular" className="bg-surface-900 text-white">🔥 Paling Populer</option>
                <option value="rating" className="bg-surface-900 text-white">⭐ Rating Tertinggi</option>
                <option value="newest" className="bg-surface-900 text-white">📅 Tahun Rilis Terbaru</option>
                <option value="title_asc" className="bg-surface-900 text-white">🔤 Judul (A – Z)</option>
                <option value="title_desc" className="bg-surface-900 text-white">🔤 Judul (Z – A)</option>
                <option value="seasons_desc" className="bg-surface-900 text-white">📺 Musim Terbanyak</option>
                <option value="seasons_asc" className="bg-surface-900 text-white">📺 Mini-Series (1 Musim)</option>
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
          <div className="pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in duration-200">
            
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
              Menampilkan <strong className="text-white font-semibold">{filteredSeries.length}</strong> dari {allSeries.length} Serial TV
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

            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-[11px]">
                Status: {statusFilter === 'ongoing' ? 'Multi-Musim' : 'Mini-Series'}
                <button onClick={() => setStatusFilter('all')} className="hover:text-white">
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

            {sortBy !== 'popular' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-[11px]">
                Urutan: {
                  sortBy === 'rating' ? 'Rating Tertinggi' :
                  sortBy === 'newest' ? 'Tahun Terbaru' :
                  sortBy === 'title_asc' ? 'A–Z' :
                  sortBy === 'title_desc' ? 'Z–A' :
                  sortBy === 'seasons_desc' ? 'Musim Terbanyak' : 'Mini-Series'
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

      {/* Series Catalog Grid / List View */}
      {filteredSeries.length > 0 ? (
        layoutMode === 'grid' ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5 lg:gap-6 pt-2">
            {filteredSeries.map(item => (
              <div key={item.id} className="relative group">
                <MediaCard item={item} layout="grid" />
                {item.totalSeasons && (
                  <div className="absolute top-2 left-2 z-20 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-brand-600/90 backdrop-blur-md text-[10px] font-bold text-white shadow">
                      {item.totalSeasons} Musim
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 pt-2">
            {filteredSeries.map(item => (
              <MediaCard key={item.id} item={item} layout="list" />
            ))}
          </div>
        )
      ) : (
        <div className="py-16 text-center space-y-4 glass-panel rounded-3xl p-8 max-w-lg mx-auto shadow-2xl border border-white/10">
          <div className="w-16 h-16 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400">
            <Tv className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white">Tidak Ada Serial Yang Sesuai</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Tidak ditemukan serial TV dengan kriteria filter saat ini. Coba bersihkan pencarian atau ubah filter status, rating, dan genre.
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

    </div>
  );
};
