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
  Volume2
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
  const [selectedGenre, setSelectedGenre] = useState('Semua Genre');
  const [selectedDecade, setSelectedDecade] = useState<'all' | '2026' | '2020s' | 'classic'>('all');
  const [selectedDuration, setSelectedDuration] = useState<'all' | 'short' | 'standard' | 'epic'>('all');
  const [selectedQuality, setSelectedQuality] = useState<'all' | '4K UHD' | 'Dolby Vision'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'duration'>('popular');
  const [activeUniverse, setActiveUniverse] = useState<string>('all');

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

  // Filtering logic
  const filteredMovies = useMemo(() => {
    return allMovies.filter(item => {
      // Genre filter
      if (selectedGenre !== 'Semua Genre' && !item.genres.includes(selectedGenre)) return false;

      // Decade filter
      if (selectedDecade === '2026' && item.releaseYear !== 2026) return false;
      if (selectedDecade === '2020s' && (item.releaseYear < 2020 || item.releaseYear > 2025)) return false;
      if (selectedDecade === 'classic' && item.releaseYear >= 2020) return false;

      // Duration filter helper
      if (selectedDuration !== 'all' && item.duration) {
        // e.g. "2j 28m" -> 148 mins, "1j 42m" -> 102 mins
        const match = item.duration.match(/(\d+)j\s*(\d+)?m?/);
        if (match) {
          const hours = parseInt(match[1] || '0', 10);
          const mins = parseInt(match[2] || '0', 10);
          const totalMins = hours * 60 + mins;
          if (selectedDuration === 'short' && totalMins >= 90) return false;
          if (selectedDuration === 'standard' && (totalMins < 90 || totalMins > 120)) return false;
          if (selectedDuration === 'epic' && totalMins <= 120) return false;
        }
      }

      // Quality filter
      if (selectedQuality !== 'all' && item.quality !== selectedQuality) return false;

      // Universe filter
      if (activeUniverse === 'scifi' && !item.genres.includes('Fiksi Ilmiah')) return false;
      if (activeUniverse === 'lokal' && !['bayang-di-balik-kabut', 'aroma-karsa-rahasia', 'warkop-dimensi-lain'].includes(item.id)) return false;
      if (activeUniverse === 'thriller' && !item.genres.includes('Horor') && !item.genres.includes('Thriller')) return false;
      if (activeUniverse === 'action' && !item.genres.includes('Aksi')) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.releaseYear - a.releaseYear;
      if (sortBy === 'duration') {
        const getMins = (dur?: string) => {
          if (!dur) return 0;
          const m = dur.match(/(\d+)j\s*(\d+)?m?/);
          return m ? parseInt(m[1] || '0', 10) * 60 + parseInt(m[2] || '0', 10) : 0;
        };
        return getMins(b.duration) - getMins(a.duration);
      }
      return (a.topRank || 99) - (b.topRank || 99);
    });
  }, [allMovies, selectedGenre, selectedDecade, selectedDuration, selectedQuality, activeUniverse, sortBy]);

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
      <section className="bg-surface-800/40 border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Era / Decade */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Era:
            </span>
            <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5">
              {[
                { id: 'all', label: 'Semua' },
                { id: '2026', label: '2026 Baru' },
                { id: '2020s', label: '2020-2025' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedDecade(opt.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedDecade === opt.id ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Durasi:
            </span>
            <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'short', label: '< 90m' },
                { id: 'standard', label: '90-120m' },
                { id: 'epic', label: '> 2 Jam' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedDuration(opt.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedDuration === opt.id ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Urutkan:
            </span>
            <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5">
              {[
                { id: 'popular', label: 'Populer' },
                { id: 'rating', label: 'Rating' },
                { id: 'newest', label: 'Terbaru' },
                { id: 'duration', label: 'Durasi' },
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

        {/* Genre Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-surface-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          4. THEATRICAL MOVIES CATALOG GRID
          ======================================================== */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {filteredMovies.map(item => (
            <MediaCard key={item.id} item={item} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 glass-panel rounded-3xl p-8 max-w-md mx-auto">
          <Film className="w-12 h-12 text-brand-400 mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-white">Tidak Ada Film Yang Sesuai</h3>
          <p className="text-xs text-slate-400">
            Coba ubah filter durasi, dekade, atau genre untuk menemukan film lainnya.
          </p>
          <button
            onClick={() => {
              setSelectedGenre('Semua Genre');
              setSelectedDecade('all');
              setSelectedDuration('all');
              setActiveUniverse('all');
            }}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
          >
            Reset Filter Film
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
