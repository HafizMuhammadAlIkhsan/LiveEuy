import React, { useState, useMemo } from 'react';
import { useWatch } from '../../context/WatchContext';
import { MediaItem } from '../../types';
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
  Clock, 
  Crown, 
  LogIn, 
  HelpCircle, 
  ChevronDown, 
  User as UserIcon, 
  Check, 
  X 
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { 
    allMedia, 
    watchHistory, 
    setCurrentTab, 
    openPlayer, 
    user, 
    isLoggedIn, 
    openAuthModal,
    featuredOrder
  } = useWatch();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Provide ordered blockbuster film slides according to admin CMS configuration
  const featuredItems = useMemo(() => {
    const ordered = featuredOrder
      .map(id => allMedia.find(m => m.id === id))
      .filter((m): m is MediaItem => Boolean(m));
    if (ordered.length >= 5) return ordered;
    const remaining = allMedia.filter(m => !ordered.some(o => o.id === m.id));
    return [...ordered, ...remaining].slice(0, 10);
  }, [allMedia, featuredOrder]);
  const trendingItems = allMedia.filter(item => item.isTrending);
  const actionItems = allMedia.filter(item => item.genres.includes('Aksi') || item.genres.includes('Fiksi Ilmiah'));
  const dramaItems = allMedia.filter(item => item.genres.includes('Drama') || item.genres.includes('Thriller'));
  const animationItems = allMedia.filter(item => item.genres.includes('Animasi') || item.genres.includes('Komedi'));

  // Continue watching row (for logged in users)
  const continueWatchingItems = allMedia.filter(item => {
    const prog = watchHistory[item.id];
    return prog && prog.percentage > 0 && prog.percentage < 98;
  });

  const faqs = [
    {
      q: 'Bagaimana cara mulai menonton di LiveEuy?',
      a: 'Sebagai Tamu (Guest), Anda dapat langsung menonton cuplikan dan film tertentu dalam kualitas HD. Untuk menikmati resolusi 4K UHD, Dolby Atmos, dan simpan riwayat di semua perangkat, silakan buat akun VIP.'
    },
    {
      q: 'Apakah bisa digunakan di Smart TV dan Ponsel sekaligus?',
      a: 'Ya! Paket VIP Cinema Ultra mendukung hingga 4 perangkat aktif bersamaan dengan sinkronisasi riwayat cloud instan.'
    },
    {
      q: 'Apakah ada kontrak atau biaya tersembunyi?',
      a: 'Tidak ada kontrak. Anda dapat menikmati masa uji coba gratis dan berhenti berlangganan kapan saja tanpa penalti.'
    }
  ];

  return (
    <main className="w-full">
      {/* Cinematic Hero Banner Carousel */}
      <HeroBanner featuredItems={featuredItems} />

      {/* ========================================================
          USER STATUS RIBBON: LOGGED IN VS GUEST
          ======================================================== */}
      {isLoggedIn && user ? (
        /* LOGGED IN USER GREETING RIBBON */
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-surface-800 via-surface-900 to-amber-950/30 border border-amber-500/20 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Selamat datang kembali, {user.name}!</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {user.tier}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Streaming 4K Ultra HD & Dolby Atmos aktif tanpa interupsi iklan.
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('watchlist')}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              <span>Koleksi & Statistik Tontonan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* GUEST VISITOR PROMOTIONAL BILLBOARD */
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-brand-950 via-surface-900 to-secondary-950/40 border border-brand-500/30 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-secondary-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">Mode Tamu (Guest)</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    Coba Gratis
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Buka Kualitas 4K Ultra HD & Dolby Atmos
                </h3>
                <p className="text-xs text-slate-300">
                  Buat akun untuk menyimpan riwayat tontonan, sinkronisasi antar-perangkat, dan nikmati film bioskop bebas iklan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => openAuthModal('login')}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Masuk Akun
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Daftar VIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Jump Category Chips */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
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
        
        {/* ========================================================
            CONTINUE WATCHING ROW (DIFFERENTIATED LOGGED IN VS GUEST)
            ======================================================== */}
        {isLoggedIn ? (
          /* LOGGED IN USER: ACTIVE PROGRESS */
          continueWatchingItems.length > 0 && (
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
          )
        ) : (
          /* GUEST USER: CLOUD SYNC PROMPT TEASER */
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-surface-800/40 border border-dashed border-white/15 p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Fitur Riwayat Cloud VIP</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Ingin Melanjutkan Tontonan Anda Tanpa Kehilangan Menit Terakhir?
                </h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  Dalam Mode Tamu, riwayat pemutaran tidak tersinkronisasi. Masuk untuk menyimpan menit film otomatis dan lanjutkan di TV atau ponsel Anda.
                </p>
              </div>
              <button
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/25 transition-all flex-shrink-0 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </button>
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

        {/* ========================================================
            GUEST ONLY SECTION: SUBSCRIPTION PLANS & FAQ
            ======================================================== */}
        {!isLoggedIn && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-6">
            
            {/* Subscription Tier Cards */}
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold">
                <Crown className="w-3.5 h-3.5" />
                <span>Pilihan Paket Langganan</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Pilih Paket Sesuai Gaya Menonton Anda
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Bebas ganti paket atau batalkan kapan saja dengan jaminan kepuasan tanpa syarat.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
                {/* Free Guest */}
                <div className="p-6 rounded-3xl bg-surface-900 border border-white/10 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Tamu (Free Guest)</span>
                    <h4 className="text-2xl font-black text-white">Gratis</h4>
                    <p className="text-xs text-slate-400">Pratinjau film & serial dengan kualitas standar.</p>
                    <ul className="space-y-2 pt-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Resolusi HD 720p</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1 Perangkat Aktif</li>
                      <li className="flex items-center gap-2 text-slate-500"><X className="w-3.5 h-3.5 text-slate-600" /> Tanpa Dolby Atmos</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                  >
                    Mode Tamu Aktif
                  </button>
                </div>

                {/* VIP Standard */}
                <div className="p-6 rounded-3xl bg-surface-900 border border-white/10 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-brand-400 uppercase">VIP Standard</span>
                    <h4 className="text-2xl font-black text-white">Rp 49.000<span className="text-xs font-normal text-slate-400">/bln</span></h4>
                    <p className="text-xs text-slate-400">Pengalaman streaming bebas iklan dengan Full HD.</p>
                    <ul className="space-y-2 pt-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Resolusi Full HD 1080p</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Bebas Iklan</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 2 Perangkat Sekaligus</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Riwayat & Koleksi Cloud</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
                  >
                    Pilih Standard
                  </button>
                </div>

                {/* VIP Cinema Ultra */}
                <div className="relative p-6 rounded-3xl bg-gradient-to-b from-brand-950 via-surface-900 to-surface-900 border-2 border-brand-500 shadow-2xl space-y-4 flex flex-col justify-between">
                  <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-brand-500 to-secondary-500 text-white shadow">
                    PALING POPULER
                  </span>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase">VIP Cinema Ultra</span>
                    <h4 className="text-2xl font-black text-white">Rp 89.000<span className="text-xs font-normal text-slate-400">/bln</span></h4>
                    <p className="text-xs text-slate-300">Kualitas bioskop premier tertinggi untuk sekeluarga.</p>
                    <ul className="space-y-2 pt-2 text-xs text-slate-200">
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> 4K Ultra HD & Dolby Vision</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Audio Spasial Dolby Atmos</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> 4 Perangkat Bersamaan</li>
                      <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Unduh & Nonton Offline</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    Mulai Uji Coba VIP
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="rounded-3xl bg-surface-800/40 border border-white/10 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <HelpCircle className="w-5 h-5 text-brand-400" />
                <h4 className="text-lg font-bold">Pertanyaan yang Sering Diajukan (FAQ)</h4>
              </div>
              <div className="divide-y divide-white/5">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="py-3">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === idx && (
                      <p className="text-xs text-slate-400 mt-2 pl-1 leading-relaxed">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

      </div>
    </main>
  );
};
