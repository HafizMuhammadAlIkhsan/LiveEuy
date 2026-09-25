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
  Info
} from 'lucide-react';

export const SeriesPage: React.FC = () => {
  const { allMedia, openPlayer, openDetail, toggleWatchlist, isInWatchlist } = useWatch();

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed' | 'mini'>('all');
  const [selectedGenre, setSelectedGenre] = useState('Semua Genre');

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
      // Genre filter
      if (selectedGenre !== 'Semua Genre' && !item.genres.includes(selectedGenre)) return false;

      // Status filter
      if (statusFilter === 'ongoing' && item.totalSeasons && item.totalSeasons < 2) return false;
      if (statusFilter === 'mini' && item.totalSeasons && item.totalSeasons > 1) return false;

      return true;
    });
  }, [allSeries, selectedGenre, statusFilter]);

  const inWatchlist = activeSeries ? isInWatchlist(activeSeries.id) : false;

  return (
    <div className="pt-20 sm:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* ========================================================
          1. BINGE-WATCH SPOTLIGHT BANNER
          ======================================================== */}
      {spotlightSeries && (
        <section className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black group">
          <div className="relative aspect-[21/9] min-h-[380px] sm:min-h-[460px] md:min-h-[500px] w-full">
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
          4. SERIES CATALOG FILTERS
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Semua Serial TV & Drama
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5 text-xs">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'ongoing', label: 'Multi-Musim' },
              { id: 'mini', label: 'Mini-Series' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setStatusFilter(opt.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  statusFilter === opt.id
                    ? 'bg-brand-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-surface-800/80 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Series Catalog Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 pt-2">
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
      </section>

    </div>
  );
};
