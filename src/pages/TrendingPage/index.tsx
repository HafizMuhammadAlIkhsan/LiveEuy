import React, { useState, useMemo } from 'react';
import { useWatch } from '../../context/WatchContext';
import { MediaItem } from '../../types';
import { 
  Flame, 
  TrendingUp, 
  Trophy, 
  Play, 
  Info, 
  Plus, 
  Check, 
  Star, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Sparkles,
  MessageSquare,
  Eye,
  Share2
} from 'lucide-react';

export const TrendingPage: React.FC = () => {
  const { allMedia, openDetail, openPlayer, toggleWatchlist, isInWatchlist } = useWatch();
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Sorted by topRank or trending
  const rankedItems = useMemo(() => {
    return [...allMedia].sort((a, b) => (a.topRank || 99) - (b.topRank || 99));
  }, [allMedia]);

  // Top 3 Podium
  const top1 = rankedItems[0];
  const top2 = rankedItems[1];
  const top3 = rankedItems[2];

  // Viral hashtags
  const trendingTags = [
    { id: 'all', label: '🔥 Semua Trending' },
    { id: 'cyberpunk', label: '#NeoNusantara2099', filterId: 'cyberpunk-neo-nusantara' },
    { id: 'elysium', label: '#DenisVilleneuve4K', filterId: 'chronicles-of-elysium' },
    { id: 'horor', label: '#BayangDiBalikKabut', filterId: 'bayang-di-balik-kabut' },
    { id: 'warkop', label: '#WarkopDimensiLain', filterId: 'warkop-dimensi-lain' },
    { id: 'anime', label: '#SpiritRealmAnime', filterId: 'spirit-realm-chronicles' },
  ];

  // Filtering based on tag
  const filteredList = useMemo(() => {
    if (selectedTag === 'all') return rankedItems;
    const foundTag = trendingTags.find(t => t.id === selectedTag);
    if (foundTag && foundTag.filterId) {
      return rankedItems.filter(item => item.id === foundTag.filterId);
    }
    return rankedItems;
  }, [rankedItems, selectedTag]);

  // Mock movement indicator data
  const getRankMovement = (rank: number) => {
    switch (rank) {
      case 1:
        return { type: 'up', text: '▲ 2 Naik', color: 'text-emerald-400 bg-emerald-500/10' };
      case 2:
        return { type: 'stable', text: '— Stabil #2', color: 'text-slate-400 bg-white/5' };
      case 3:
        return { type: 'up', text: '▲ 1 Naik', color: 'text-emerald-400 bg-emerald-500/10' };
      case 4:
        return { type: 'down', text: '▼ 1 Turun', color: 'text-rose-400 bg-rose-500/10' };
      case 7:
        return { type: 'new', text: '⭐ BARU', color: 'text-amber-400 bg-amber-500/10' };
      case 10:
        return { type: 'up', text: '▲ 3 Naik', color: 'text-emerald-400 bg-emerald-500/10' };
      default:
        return { type: 'stable', text: '— Stabil', color: 'text-slate-400 bg-white/5' };
    }
  };

  return (
    <div className="pt-20 sm:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* ========================================================
          1. HEADER & LIVE TRENDING PULSE
          ======================================================== */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5 fill-rose-500" />
            <span>Paling Populer & Viral di Indonesia</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Tangga Lagu & Trending LiveEuy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Diperbarui secara real-time setiap 60 menit berdasarkan volume pemutaran, durasi tonton, dan engagement komunitas di seluruh Indonesia.
          </p>
        </div>

        {/* Live Velocity Stat Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-surface-800/80 border border-white/5 rounded-2xl px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Jam Ditonton Pekan Ini</span>
            <span className="text-base sm:text-lg font-black text-brand-400">1.842.000+ Jam</span>
          </div>
          <div className="bg-surface-800/80 border border-white/5 rounded-2xl px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Skor Viral Puncak</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">99.4% 🔥</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. TOP 3 PODIUM SHOWCASE
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Podium 3 Teratas Pekan Ini</span>
          </h2>
          <span className="text-xs text-slate-400">#1, #2 & #3 Terfavorit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          
          {/* #2 PODIUM (SILVER) */}
          {top2 && (
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-700/40 via-surface-900 to-surface-950 border border-slate-400/30 p-5 flex flex-col justify-between group shadow-xl">
              <div className="flex items-start justify-between">
                <span className="text-4xl sm:text-5xl font-black text-slate-300 drop-shadow">#2</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-400/20 text-slate-200 border border-slate-400/30">
                  🥈 Runner Up
                </span>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden my-4 bg-black">
                <img src={top2.backdropUrl} alt={top2.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-xs font-bold text-amber-300">★ {top2.rating}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-400 transition-colors truncate">{top2.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{top2.overview}</p>
                <div className="flex items-center gap-2 pt-2">
                  <button onClick={() => openPlayer(top2)} className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                    <Play className="w-3.5 h-3.5 fill-white" /> Putar
                  </button>
                  <button onClick={() => openDetail(top2)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* #1 PODIUM (GOLD - DOMINANT) */}
          {top1 && (
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-amber-500/20 via-surface-900 to-surface-950 border-2 border-amber-500/60 p-6 flex flex-col justify-between group shadow-2xl shadow-amber-500/10 md:-translate-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-5xl sm:text-6xl font-black text-amber-400 drop-shadow-lg">#1</span>
                  <Trophy className="w-7 h-7 text-amber-400 fill-amber-400 animate-pulse" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-surface-950 shadow-lg shadow-amber-400/40">
                  👑 JUARA #1
                </span>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden my-4 bg-black">
                <img src={top1.backdropUrl} alt={top1.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-xs font-bold text-amber-300">★ {top1.rating} • 99% Match</span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-bold">4K UHD</span>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-400 transition-colors">{top1.title}</h3>
                  <p className="text-xs text-amber-300/80 font-medium italic mt-0.5">{top1.tagline}</p>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{top1.overview}</p>
                <div className="flex items-center gap-2 pt-2">
                  <button onClick={() => openPlayer(top1)} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-surface-950 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/25">
                    <Play className="w-4 h-4 fill-surface-950" /> Tonton Juara #1
                  </button>
                  <button onClick={() => openDetail(top1)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* #3 PODIUM (BRONZE) */}
          {top3 && (
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-amber-800/30 via-surface-900 to-surface-950 border border-amber-700/40 p-5 flex flex-col justify-between group shadow-xl">
              <div className="flex items-start justify-between">
                <span className="text-4xl sm:text-5xl font-black text-amber-600 drop-shadow">#3</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-700/20 text-amber-400 border border-amber-700/30">
                  🥉 Juara Tiga
                </span>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden my-4 bg-black">
                <img src={top3.backdropUrl} alt={top3.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-xs font-bold text-amber-300">★ {top3.rating}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-400 transition-colors truncate">{top3.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{top3.overview}</p>
                <div className="flex items-center gap-2 pt-2">
                  <button onClick={() => openPlayer(top3)} className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                    <Play className="w-3.5 h-3.5 fill-white" /> Putar
                  </button>
                  <button onClick={() => openDetail(top3)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================
          3. VIRAL HASHTAGS & SOCIAL TOPICS STRIP
          ======================================================== */}
      <section className="space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Tagar & Topik Pembicaraan Hangat
        </span>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {trendingTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag.id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'bg-surface-800/80 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          4. OFFICIAL TOP 10 LEADERBOARD TABLE
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Peringkat Lengkap Top 10 LiveEuy
            </h2>
          </div>
          <span className="text-xs text-slate-400">Total {filteredList.length} Judul Terpantau</span>
        </div>

        <div className="bg-surface-800/40 border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden">
          {filteredList.map((item, index) => {
            const rank = item.topRank || index + 1;
            const move = getRankMovement(rank);
            const inList = isInWatchlist(item.id);

            return (
              <div
                key={item.id}
                className="p-3 sm:p-4 hover:bg-white/5 transition-colors flex items-center gap-3 sm:gap-6 group"
              >
                {/* Rank & Movement */}
                <div className="w-12 sm:w-16 flex-shrink-0 text-center">
                  <span className="text-2xl sm:text-4xl font-black text-white group-hover:text-brand-400 transition-colors">
                    {rank}
                  </span>
                  <div className={`mt-0.5 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md ${move.color}`}>
                    {move.text}
                  </div>
                </div>

                {/* Poster Thumbnail */}
                <div 
                  onClick={() => openDetail(item)}
                  className="relative w-14 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-black flex-shrink-0 cursor-pointer shadow-md"
                >
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-5 h-5 fill-white text-white" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-slate-300">
                      {item.type === 'movie' ? 'Film' : 'Serial'}
                    </span>
                    <span className="text-[11px] text-amber-400 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {item.quality}
                    </span>
                  </div>

                  <h3 
                    onClick={() => openDetail(item)}
                    className="text-sm sm:text-base font-bold text-white group-hover:text-brand-400 transition-colors truncate cursor-pointer mt-0.5"
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 truncate hidden sm:block mt-0.5">
                    {item.overview}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>{item.genres.slice(0, 2).join(' • ')}</span>
                    <span>•</span>
                    <span>Rilis {item.releaseYear}</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openPlayer(item)}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    title="Putar Sekarang"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span className="hidden sm:inline">Tonton</span>
                  </button>

                  <button
                    onClick={() => toggleWatchlist(item.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      inList
                        ? 'bg-brand-600/20 border-brand-500 text-brand-400'
                        : 'bg-white/5 hover:bg-white/15 border-white/10 text-slate-300'
                    }`}
                    title={inList ? 'Tersimpan di Koleksi' : 'Tambah ke Koleksi'}
                  >
                    {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          5. COMMUNITY BUZZ HIGHLIGHTS
          ======================================================== */}
      <section className="rounded-3xl bg-surface-800/40 border border-white/10 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare className="w-5 h-5 text-brand-400" />
          <h3 className="text-base sm:text-lg font-bold">
            Ulasan Hangat dari Komunitas Penonton
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-900/80 border border-white/5 space-y-2">
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
              <div>
                <h5 className="text-xs font-bold text-white">Rian Pratama</h5>
                <span className="text-[10px] text-amber-400">★ 10/10 • Menonton Cyberpunk Neo Nusantara</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "Efek neon megalopolis dan koreografi bela dirinya setara serial sci-fi Hollywood papan atas. Wajib ditonton di layar lebar!"
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-900/80 border border-white/5 space-y-2">
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
              <div>
                <h5 className="text-xs font-bold text-white">Siti Sarah</h5>
                <span className="text-[10px] text-amber-400">★ 9.5/10 • Menonton Chronicles of Elysium</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "Perjalanan kosmiknya luar biasa hening dan mendalam. Sound mixing Dolby Atmos di headphone memberikan sensasi hampa udara nyata."
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
