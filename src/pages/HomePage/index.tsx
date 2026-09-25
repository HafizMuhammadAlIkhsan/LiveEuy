import React from 'react';
import { useWatch } from '../../context/WatchContext';
import { HeroBanner } from '../../components/HeroBanner';
import { MediaRow } from '../../components/MediaRow';
import { TopTenRow } from '../../components/TopTenRow';
import { 
  Play, 
  Sparkles, 
  Tv, 
  Film, 
  Flame, 
  CheckCircle2, 
  ShieldCheck, 
  Wifi, 
  DownloadCloud,
  ChevronRight,
  Clock
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { allMedia, watchHistory, setCurrentTab, openPlayer } = useWatch();

  const featuredItems = allMedia.filter(item => item.isFeatured);
  const trendingItems = allMedia.filter(item => item.isTrending);
  const actionItems = allMedia.filter(item => item.genres.includes('Aksi') || item.genres.includes('Fiksi Ilmiah'));
  const dramaItems = allMedia.filter(item => item.genres.includes('Drama') || item.genres.includes('Thriller'));
  const animationItems = allMedia.filter(item => item.genres.includes('Animasi') || item.genres.includes('Komedi'));

  // Continue watching row
  const continueWatchingItems = allMedia.filter(item => {
    const prog = watchHistory[item.id];
    return prog && prog.percentage > 0 && prog.percentage < 98;
  });

  return (
    <main className="w-full">
      {/* Cinematic Hero Banner Carousel */}
      <HeroBanner featuredItems={featuredItems} />

      {/* Quick Jump Category Chips */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
          {[
            { label: '🔥 Trending Hari Ini', action: () => setCurrentTab('trending') },
            { label: '🎬 Film Bioskop 4K', action: () => setCurrentTab('movies') },
            { label: '📺 Serial TV Populer', action: () => setCurrentTab('tv') },
            { label: '⭐ Koleksi Saya', action: () => setCurrentTab('watchlist') },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={chip.action}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-surface-800/90 hover:bg-surface-700/90 text-slate-200 hover:text-white border border-white/10 hover:border-brand-500/40 transition-all whitespace-nowrap shadow-lg flex items-center gap-1.5 backdrop-blur-md active:scale-95"
            >
              {chip.label}
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-20 space-y-8 sm:space-y-12 pb-20">
        
        {/* Continue Watching Section (if user has active history) */}
        {continueWatchingItems.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Lanjutkan Menonton
                </h2>
              </div>
              <button
                onClick={() => setCurrentTab('watchlist')}
                className="text-xs sm:text-sm text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 group transition-colors"
              >
                <span>Kelola Riwayat</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {continueWatchingItems.slice(0, 3).map(item => {
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

        {/* Top 10 Ranked Row */}
        <TopTenRow items={allMedia} />

        {/* Trending in Indonesia */}
        <MediaRow
          title="Sedang Populer di Indonesia"
          subtitle="Judul film dan serial paling banyak ditonton saat ini"
          items={trendingItems}
          onViewAll={() => setCurrentTab('trending')}
        />

        {/* Action & Sci-Fi Row */}
        <MediaRow
          title="Aksi Spektakuler & Fiksi Ilmiah"
          subtitle="Petualangan beroktan tinggi dan teknologi masa depan"
          items={actionItems}
          onViewAll={() => setCurrentTab('movies')}
        />

        {/* Drama & Thriller Row */}
        <MediaRow
          title="Serial Drama & Cerita Penuh Misteri"
          subtitle="Plot twist tak terduga dan emosi yang menguras air mata"
          items={dramaItems}
          onViewAll={() => setCurrentTab('tv')}
        />

        {/* Animation & Comedy Row */}
        <MediaRow
          title="Animasi, Anime & Komedi Menghibur"
          subtitle="Tontonan seru penuh imajinasi untuk segala usia"
          items={animationItems}
          onViewAll={() => setCurrentTab('movies')}
        />

        {/* LiveEuy Ultra Experience Showcase Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-900 via-surface-800 to-brand-950/40 border border-white/10 p-6 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kualitas Sinema Bioskop</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Nonton Kapan Saja dalam Kualitas 4K Ultra HD & Dolby Atmos
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Rasakan getaran audio surround dan ketajaman gambar bioskop langsung di perangkat ponsel pintar, tablet, maupun Smart TV Anda tanpa jeda iklan.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Resolusi Asli 4K UHD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Dolby Vision & Atmos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Unduh & Nonton Offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Sinkronisasi Multi-Device</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-800/80 backdrop-blur-md rounded-2xl p-5 border border-white/5 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">Bebas Iklan</h4>
                  <p className="text-xs text-slate-400">Streaming lancar tanpa interupsi iklan yang mengganggu alur cerita.</p>
                </div>
                <div className="bg-surface-800/80 backdrop-blur-md rounded-2xl p-5 border border-white/5 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <DownloadCloud className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">Unduhan Cepat</h4>
                  <p className="text-xs text-slate-400">Simpan tayangan favorit Anda untuk dinikmati saat bepergian tanpa internet.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};
