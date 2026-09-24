import React from 'react';
import { 
  Bookmark, 
  Play,
  Trash2, 
  Clock, 
  Sparkles
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { MediaCard } from './MediaCard';

export const WatchlistView: React.FC = () => {
  const { 
    watchlist, 
    allMedia, 
    watchHistory, 
    toggleWatchlist, 
    openPlayer, 
    setCurrentTab 
  } = useWatch();

  const watchlistItems = allMedia.filter(item => watchlist.includes(item.id));

  // Continue watching items that have progress
  const continueWatchingItems = allMedia.filter(item => {
    const prog = watchHistory[item.id];
    return prog && prog.percentage > 0 && prog.percentage < 98;
  });

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-brand-500 fill-brand-500" />
            <span>Koleksi & Riwayat Tontonan</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Lanjutkan tontonan terakhir Anda dan jelajahi daftar tontonan yang telah disimpan.
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-slate-300 font-mono">
          {watchlistItems.length} Tersimpan
        </span>
      </div>

      {/* SECTION 1: LANJUTKAN MENONTON (CONTINUE WATCHING) */}
      {continueWatchingItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Lanjutkan Menonton</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {continueWatchingItems.map(item => {
              const prog = watchHistory[item.id];
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
                      Tersisa {Math.max(1, Math.round(((prog.duration - prog.currentTime) / 60)))} menit
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
        </div>
      )}

      {/* SECTION 2: DAFTAR KOLEKSI SAYA (SAVED WATCHLIST) */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-brand-400" />
          <span>Daftar Tontonan Anda ({watchlistItems.length})</span>
        </h2>

        {watchlistItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {watchlistItems.map(item => (
              <div key={item.id} className="relative group">
                <MediaCard item={item} layout="grid" />
                
                {/* Remove from watchlist floating button */}
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
          /* Empty Watchlist State */
          <div className="py-16 text-center space-y-4 glass-panel rounded-3xl p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Daftar Koleksi Anda Masih Kosong</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Jelajahi berbagai judul film dan serial menarik di LiveEuy, lalu klik ikon tanda tambah (+) untuk menyimpannya di sini.
            </p>
            <button
              onClick={() => setCurrentTab('home')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-600/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Jelajahi Film Sekarang</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
