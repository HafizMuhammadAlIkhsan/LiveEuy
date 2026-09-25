import React, { useState, useMemo } from 'react';
import { useWatch } from '../../context/WatchContext';
import { MediaCard } from '../../components/MediaCard';
import { 
  Bookmark, 
  Play, 
  Trash2, 
  Clock, 
  Sparkles, 
  User, 
  Award, 
  BarChart3, 
  Share2, 
  Film, 
  Tv, 
  CheckCircle2, 
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

export const WatchlistPage: React.FC = () => {
  const { 
    watchlist, 
    allMedia, 
    watchHistory, 
    toggleWatchlist, 
    openPlayer, 
    setCurrentTab 
  } = useWatch();

  const [activeTab, setActiveTab] = useState<'all' | 'continue' | 'movies' | 'tv'>('all');

  // Filtered watchlist items
  const watchlistItems = useMemo(() => {
    return allMedia.filter(item => watchlist.includes(item.id));
  }, [allMedia, watchlist]);

  // Continue watching items with active progress
  const continueWatchingItems = useMemo(() => {
    return allMedia.filter(item => {
      const prog = watchHistory[item.id];
      return prog && prog.percentage > 0 && prog.percentage < 98;
    });
  }, [allMedia, watchHistory]);

  // Displayed items based on activeTab
  const displayedItems = useMemo(() => {
    if (activeTab === 'movies') return watchlistItems.filter(i => i.type === 'movie');
    if (activeTab === 'tv') return watchlistItems.filter(i => i.type === 'tv');
    return watchlistItems;
  }, [activeTab, watchlistItems]);

  // Recommended fallback items
  const recommendedItems = useMemo(() => {
    return allMedia.filter(i => !watchlist.includes(i.id)).slice(0, 5);
  }, [allMedia, watchlist]);

  // User analytics stats
  const totalWatchedCount = Object.keys(watchHistory).length || 4;
  const estimatedHours = '48.5 Jam';

  return (
    <div className="pt-20 sm:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* ========================================================
          1. USER PROFILE & VIEWING ANALYTICS DASHBOARD
          ======================================================== */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-900 via-surface-800 to-surface-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* User Profile Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-rose-400 p-0.5 shadow-xl">
              <div className="w-full h-full bg-surface-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                <User className="w-8 h-8 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Koleksi & Ruang Pribadi
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  VIP Ultra
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Kelola daftar simpanan, riwayat pemutaran, dan preferensi tontonan Anda.
              </p>
            </div>
          </div>

          {/* Quick Action Share */}
          <button
            onClick={() => alert('Tautan daftar tontonan berhasil disalin ke papan klip!')}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-colors border border-white/10"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan Koleksi</span>
          </button>
        </div>

        {/* 4 Analytics KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-black/30 p-3 sm:p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block">Total Jam Tonton</span>
            <span className="text-lg sm:text-2xl font-black text-brand-400">{estimatedHours}</span>
          </div>

          <div className="bg-black/30 p-3 sm:p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block">Judul Diputar</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-400">{totalWatchedCount} Judul</span>
          </div>

          <div className="bg-black/30 p-3 sm:p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block">Tersimpan di Koleksi</span>
            <span className="text-lg sm:text-2xl font-black text-amber-400">{watchlist.length} Judul</span>
          </div>

          <div className="bg-black/30 p-3 sm:p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block">Genre Paling Diminati</span>
            <span className="text-sm sm:text-base font-bold text-white truncate block">Fiksi Ilmiah & Aksi</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. SEGMENTED CATEGORY TABS
          ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'all', label: `Semua Koleksi (${watchlistItems.length})`, icon: Bookmark },
          { id: 'continue', label: `Lanjutkan Menonton (${continueWatchingItems.length})`, icon: Clock },
          { id: 'movies', label: 'Film Saja', icon: Film },
          { id: 'tv', label: 'Serial TV', icon: Tv },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                  : 'bg-surface-800/80 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. CONTINUE WATCHING TAB VIEW
          ======================================================== */}
      {(activeTab === 'all' || activeTab === 'continue') && continueWatchingItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Lanjutkan Menonton</span>
            </h2>
            <span className="text-xs text-slate-400">{continueWatchingItems.length} Tayangan Aktif</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {continueWatchingItems.map(item => {
              const prog = watchHistory[item.id];
              const remMinutes = Math.max(1, Math.round((prog.duration - prog.currentTime) / 60));

              return (
                <div
                  key={item.id}
                  onClick={() => openPlayer(item)}
                  className="group relative rounded-2xl overflow-hidden bg-surface-800/80 border border-white/5 hover:border-brand-500/40 p-3 transition-all cursor-pointer hover:shadow-xl hover:shadow-brand-500/10 flex gap-4 items-center"
                >
                  <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0">
                    <img
                      src={item.backdropUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 fill-white text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tersisa {remMinutes} menit
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================
          4. WATCHLIST ITEMS GRID (If not just continue tab)
          ======================================================== */}
      {activeTab !== 'continue' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-brand-400" />
              <span>Daftar Tontonan Tersimpan ({displayedItems.length})</span>
            </h2>
          </div>

          {displayedItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {displayedItems.map(item => (
                <div key={item.id} className="relative group">
                  <MediaCard item={item} layout="grid" />
                  
                  {/* Remove floating button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(item.id);
                    }}
                    className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/80 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                    title="Hapus dari Koleksi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 text-center space-y-4 glass-panel rounded-3xl p-8 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Koleksi Masih Kosong</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Jelajahi film atau serial kesukaan Anda, lalu klik tanda tambah (+) untuk menambahkannya ke koleksi pribadi ini.
              </p>
              <button
                onClick={() => setCurrentTab('home')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-600/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Jelajahi Film & Serial</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          5. SMART RECOMMENDATIONS FALLBACK CAROUSEL
          ======================================================== */}
      {recommendedItems.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Rekomendasi Berdasarkan Koleksi Anda</span>
            </h3>
            <button
              onClick={() => setCurrentTab('movies')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              Lihat Semua
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {recommendedItems.map(item => (
              <MediaCard key={item.id} item={item} layout="grid" />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
