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
  SlidersHorizontal,
  Crown,
  Cloud,
  CloudOff,
  LogIn,
  ShieldCheck,
  BellRing,
  Tv2
} from 'lucide-react';

export const WatchlistPage: React.FC = () => {
  const { 
    watchlist, 
    allMedia, 
    watchHistory, 
    toggleWatchlist, 
    openPlayer, 
    setCurrentTab,
    user,
    isLoggedIn,
    openAuthModal
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
  const estimatedHours = user?.watchHours ? `${user.watchHours} Jam` : '48.5 Jam';

  return (
    <div className="pt-20 sm:pt-24 pb-20 cinema-layout-container space-y-10">
      
      {/* ========================================================
          1. HEADER: LOGGED IN USER PROFILE VS GUEST VAULT TEASER
          ======================================================== */}
      {isLoggedIn && user ? (
        /* LOGGED IN USER DASHBOARD */
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-900 via-surface-800 to-surface-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* User Profile Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.08] p-0.5 border border-white/15 shadow-xl">
                <div className="w-full h-full bg-surface-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>{user.tier}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Sinkronisasi Cloud Aktif • {user.email} • Anggota sejak {user.memberSince || '2024'}
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
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block">Tersimpan di Cloud</span>
              <span className="text-lg sm:text-2xl font-black text-amber-400">{watchlist.length} Judul</span>
            </div>

            <div className="bg-black/30 p-3 sm:p-4 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block">Genre Paling Diminati</span>
              <span className="text-sm sm:text-base font-bold text-white truncate block">Fiksi Ilmiah & Aksi</span>
            </div>
          </div>
        </section>
      ) : (
        /* GUEST VISITOR VAULT NOTICE */
        <section className="relative rounded-2xl overflow-hidden bg-[#0c0e14]/95 border border-white/[0.08] p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                <CloudOff className="w-3.5 h-3.5" />
                <span>Penyimpanan Sementara (Mode Tamu)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Simpan Koleksi & Riwayat Tontonan di Cloud
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Saat ini daftar tontonan Anda tersimpan di penyimpanan browser lokal. Masuk atau buat akun LiveEuy untuk sinkronisasi otomatis ke Smart TV, tablet, maupun ponsel.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 whitespace-nowrap flex items-center gap-2 cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                <span>Aktifkan Akun VIP</span>
              </button>
            </div>
          </div>

          {/* Guest Cloud Features Teaser */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
              <Tv2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Akses di Smart TV & HP</span>
            </div>
            <div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
              <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Lanjut Tonton Tepat Waktu</span>
            </div>
            <div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
              <BellRing className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Notifikasi Rilis Episode</span>
            </div>
            <div className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
              <Crown className="w-4 h-4 text-secondary-400 flex-shrink-0" />
              <span>Kualitas 4K Ultra HD</span>
            </div>
          </div>
        </section>
      )}

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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
          4. WATCHLIST ITEMS GRID
          ======================================================== */}
      {activeTab !== 'continue' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-brand-400" />
              <span>Daftar Tontonan Tersimpan ({displayedItems.length})</span>
            </h2>
            {!isLoggedIn && watchlistItems.length > 0 && (
              <span className="text-xs text-amber-400/90 font-mono">
                *Tersimpan di memori browser lokal
              </span>
            )}
          </div>

          {displayedItems.length > 0 ? (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {displayedItems.map(item => (
                <div key={item.id} className="relative group">
                  <MediaCard item={item} layout="grid" />
                  
                  {/* Remove floating button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(item.id);
                    }}
                    className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/80 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors shadow"
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
              <h3 className="text-lg font-bold text-white">Koleksi Anda Masih Kosong</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Jelajahi film atau serial kesukaan Anda, lalu klik tanda tambah (+) untuk menambahkannya ke koleksi ini.
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
              <span>Rekomendasi Berdasarkan Selera Penonton</span>
            </h3>
            <button
              onClick={() => setCurrentTab('movies')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              Lihat Semua
            </button>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5">
            {recommendedItems.map(item => (
              <MediaCard key={item.id} item={item} layout="grid" />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
