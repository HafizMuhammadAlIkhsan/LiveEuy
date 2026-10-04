import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Plus, 
  Check, 
  Heart, 
  Share2, 
  Star, 
  Send, 
  Smartphone, 
  ExternalLink,
  Film,
  Tv,
  Calendar,
  Clock,
  Globe,
  Sparkles
} from 'lucide-react';
import { useWatch } from '../../context/WatchContext';
import { Review, MediaItem } from '../../types';
import { apiService } from '../../services/api';
import { BillboardAd } from '../../components/BillboardAd';
import { CastSection } from '../../components/CastSection';
import { handleBackdropError, handleImageError } from '../../utils/imageFallback';

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { 
    allMedia, 
    openPlayer, 
    toggleWatchlist, 
    isInWatchlist, 
    toggleFavorite, 
    isFavorite,
    user,
    isLoggedIn,
    openAuthModal,
    openMobileSync,
    setSearchQuery
  } = useWatch();

  const isVip = user?.tier === 'VIP Cinema Ultra' || user?.tier === 'VIP Standard';

  // Find item by ID or slug match
  const mediaItem = React.useMemo(() => {
    if (!id) return null;
    const cleanId = id.toLowerCase().trim();
    return allMedia.find(m => 
      m.id.toLowerCase() === cleanId ||
      m.id.toLowerCase() === cleanId.replace(/-\d{4}$/, '') ||
      cleanId.startsWith(m.id.toLowerCase()) ||
      m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanId
    ) || null;
  }, [id, allMedia]);

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [userRating, setUserRating] = useState<number>(10);
  const [userComment, setUserComment] = useState<string>('');
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  // Scroll to top on load & sync reviews
  useEffect(() => {
    window.scrollTo(0, 0);
    if (mediaItem) {
      document.title = `${mediaItem.title} (${mediaItem.releaseYear}) - LiveEuy Sinema 4K`;
      setReviewsList(mediaItem.reviews || []);
      if (mediaItem.seasons && mediaItem.seasons.length > 0) {
        setSelectedSeasonNumber(mediaItem.seasons[0].seasonNumber);
      }
    }
  }, [mediaItem]);

  if (!mediaItem) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center text-slate-400 mb-4 border border-white/10">
          <Film className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Tayangan Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Tayangan film atau serial yang Anda cari tidak tersedia dalam katalog LiveEuy atau tautan telah kedaluwarsa.
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-colors shadow-lg shadow-brand-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(mediaItem.id);
  const favorite = isFavorite(mediaItem.id);
  const selectedSeason = mediaItem.seasons?.find(s => s.seasonNumber === selectedSeasonNumber) || mediaItem.seasons?.[0];

  const similarMedia = allMedia
    .filter(m => m.id !== mediaItem.id && m.genres.some(g => mediaItem.genres.includes(g)))
    .slice(0, 6);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setHasCopiedShare(true);
    setTimeout(() => setHasCopiedShare(false), 2000);
  };

  const handleActorClick = (actorName: string) => {
    setSearchQuery(actorName);
    navigate('/search');
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    const author = user ? `${user.name} (${user.tier})` : 'Anda (Tamu)';
    const avatar = user ? user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
    const comment = userComment.trim();

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author,
      avatar,
      rating: userRating,
      date: 'Baru saja',
      comment
    };

    setReviewsList([newRev, ...reviewsList]);
    setUserComment('');

    try {
      await apiService.addReview(mediaItem.id, author, userRating, comment);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 pb-20 animate-fade-in">
      
      {/* Top Breadcrumb & Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800/80 hover:bg-surface-700 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
          <span>/</span>
          <Link to={mediaItem.type === 'tv' ? '/tv' : '/movies'} className="hover:text-white transition-colors">
            {mediaItem.type === 'tv' ? 'Serial TV' : 'Film'}
          </Link>
          <span>/</span>
          <span className="text-white font-medium truncate max-w-[180px] sm:max-w-none">{mediaItem.title}</span>
        </div>
      </div>

      {/* Main Cinema Backdrop Hero Section */}
      <div className="relative w-full aspect-[21/9] min-h-[360px] sm:min-h-[460px] md:min-h-[520px] max-h-[640px] overflow-hidden bg-black">
        <img
          src={mediaItem.backdropUrl || mediaItem.posterUrl}
          alt={mediaItem.title}
          onError={handleBackdropError}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d]/90 via-[#08090d]/40 to-transparent" />

        {/* Hero Metadata & Action Buttons */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 sm:pb-12 z-10">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-600 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                {mediaItem.type === 'tv' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                {mediaItem.type === 'tv' ? 'Serial TV' : 'Film Bioskop'}
              </span>

              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                {mediaItem.matchScore}% Cocok untuk Anda
              </span>

              {mediaItem.imdbId && (
                <a
                  href={`https://www.imdb.com/title/${mediaItem.imdbId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f5c518] hover:bg-[#e2b616] text-black font-black text-xs tracking-tight transition-transform hover:scale-105 shadow-sm"
                  title="Lihat di IMDb resmi"
                >
                  <span>IMDb</span>
                  <span className="font-bold">★ {mediaItem.imdbRating || mediaItem.rating}</span>
                  <ExternalLink className="w-3 h-3 text-black" />
                </a>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md leading-tight">
              {mediaItem.title}
            </h1>

            {/* Tagline */}
            {mediaItem.tagline && (
              <p className="text-xs sm:text-sm md:text-base text-brand-300 italic">
                "{mediaItem.tagline}"
              </p>
            )}

            {/* Quick Metadata Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300 pt-1">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" />
                {mediaItem.rating} / 10
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {mediaItem.releaseYear}
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded border border-white/20 text-[11px] font-semibold">
                {mediaItem.ageRating}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {mediaItem.type === 'tv' ? `${mediaItem.totalSeasons || mediaItem.seasons?.length || 1} Musim` : mediaItem.duration}
              </span>
              {mediaItem.country && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold text-[11px] flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {mediaItem.country}
                  </span>
                </>
              )}
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[11px] font-mono font-semibold">
                {mediaItem.quality}
              </span>
              <span>•</span>
              <span className="text-[11px] text-slate-300">{mediaItem.audio}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-2 sm:pt-4">
              <button
                onClick={() => openPlayer(mediaItem)}
                className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
                <span>Putar {mediaItem.type === 'tv' ? 'Episode 1' : 'Film Sekarang'}</span>
              </button>

              <button
                onClick={() => toggleWatchlist(mediaItem.id)}
                className="flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl bg-surface-800/80 hover:bg-surface-700 text-white text-xs sm:text-sm font-semibold border border-white/10 transition-all hover:scale-105 cursor-pointer"
              >
                {inWatchlist ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                <span>{inWatchlist ? 'Tersimpan di Koleksi' : 'Tambah ke Koleksi'}</span>
              </button>

              <button
                onClick={() => toggleFavorite(mediaItem.id)}
                className={`p-2.5 sm:p-3 rounded-xl bg-surface-800/80 border transition-all hover:scale-110 cursor-pointer ${
                  favorite ? 'text-rose-500 fill-rose-500 border-rose-500/40 bg-rose-500/10' : 'text-slate-300 hover:text-white border-white/10'
                }`}
                title="Sukai Tayangan"
              >
                <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 sm:p-3 rounded-xl bg-surface-800/80 border border-white/10 text-slate-300 hover:text-white transition-all hover:scale-110 relative cursor-pointer"
                title="Bagikan Tautan Halaman Ini"
              >
                <Share2 className="w-4 h-4" />
                {hasCopiedShare && (
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black/95 text-[11px] text-white whitespace-nowrap shadow-xl border border-white/10">
                    Tautan Tersalin!
                  </span>
                )}
              </button>

              <button
                onClick={() => openMobileSync(mediaItem)}
                className="flex items-center gap-2 px-3.5 py-2.5 sm:py-3 rounded-xl bg-surface-800/80 hover:bg-surface-700 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all hover:scale-105 cursor-pointer border border-white/10"
                title="Buka di HP melalui QR Code atau Deep Link"
              >
                <Smartphone className="w-4 h-4 text-brand-400" />
                <span className="hidden sm:inline">Buka di HP</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Billboard Ads (Non-VIP) */}
      {!isVip && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <BillboardAd fluid placementIndex={4} />
        </div>
      )}

      {/* Main Page Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">

        {/* SECTION: EPISODES & SEASONS (FOR TV SERIES) */}
        {mediaItem.type === 'tv' && mediaItem.seasons && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-brand-400" />
                <span>Episode & Musim</span>
              </h2>

              {/* Season Selector Buttons */}
              {mediaItem.seasons.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Pilih Musim:</span>
                  {mediaItem.seasons.map(s => (
                    <button
                      key={s.seasonNumber}
                      onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedSeasonNumber === s.seasonNumber
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                          : 'bg-surface-800 text-slate-300 hover:text-white hover:bg-surface-700 border border-white/10'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Episodes List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSeason?.episodes.map(ep => (
                <div
                  key={ep.id}
                  onClick={() => openPlayer(mediaItem, ep)}
                  className="group relative flex flex-col p-3 rounded-2xl bg-surface-900/80 hover:bg-surface-800 border border-white/5 hover:border-brand-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-brand-500/10 hover:-translate-y-0.5"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-3">
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      loading="lazy"
                      onError={handleBackdropError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/40 transform group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white translate-x-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                      {ep.duration}
                    </span>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-600/90 backdrop-blur-md text-[10px] font-bold text-white">
                      S{ep.seasonNumber}E{ep.episodeNumber}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                    {ep.episodeNumber}. {ep.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {ep.overview}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: CAST (EXACT MATCH TO IDLIX SCREENSHOT LAYOUT) */}
        <section className="pt-2">
          <CastSection
            actors={mediaItem.actors}
            castFallback={mediaItem.cast}
            title="Cast"
            onActorClick={handleActorClick}
          />
        </section>

        {/* SECTION: OVERVIEW & SIDEBAR METADATA */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-white/10">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Sinopsis & Cerita</span>
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {mediaItem.overview}
            </p>

            {/* Genres Chips */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-2">Kategori Genre:</span>
              <div className="flex flex-wrap gap-2">
                {mediaItem.genres.map(g => (
                  <button
                    key={g}
                    onClick={() => {
                      setSearchQuery(g);
                      navigate('/search');
                    }}
                    className="px-3 py-1 rounded-xl bg-surface-800 hover:bg-brand-600/20 text-slate-300 hover:text-brand-300 text-xs font-medium border border-white/10 hover:border-brand-500/30 transition-colors cursor-pointer"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Metadata Card */}
          <div className="bg-surface-900/80 p-5 rounded-2xl border border-white/10 space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Sutradara:</span>
              <p className="text-slate-100 font-semibold">{mediaItem.director}</p>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Negara Asal:</span>
              <p className="text-slate-100 font-semibold">{mediaItem.country || 'Indonesia'}</p>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Kualitas Streaming:</span>
              <p className="text-slate-100 font-semibold">{mediaItem.quality} • {mediaItem.audio}</p>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Pemeran Lengkap:</span>
              <p className="text-slate-300 leading-relaxed font-medium">{mediaItem.cast.join(', ')}</p>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Karakteristik Tontonan:</span>
              <p className="text-slate-300 leading-relaxed">Penuh Misteri, Alur Memikat, Visual Resolusi Tinggi, Audio Sinematik</p>
            </div>
          </div>
        </section>

        {/* SECTION: SIMILAR MEDIA */}
        {similarMedia.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-brand-400" />
              <span>Tayangan Serupa</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarMedia.map(sim => (
                <div
                  key={sim.id}
                  onClick={() => {
                    const nextPath = sim.type === 'tv' ? `/series/${sim.id}` : `/movie/${sim.id}`;
                    navigate(nextPath);
                  }}
                  className="group rounded-2xl overflow-hidden bg-surface-900/80 border border-white/5 hover:border-brand-500/40 p-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-brand-500/10"
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2 relative">
                    <img
                      src={sim.posterUrl}
                      alt={sim.title}
                      loading="lazy"
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400">
                      ★ {sim.rating}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white truncate group-hover:text-brand-300 transition-colors">
                    {sim.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                    <span>{sim.releaseYear}</span>
                    <span className="text-[10px] uppercase font-mono">{sim.type === 'tv' ? 'Serial' : 'Film'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: REVIEWS & USER RATINGS */}
        <section className="space-y-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Ulasan & Penilaian Penonton ({reviewsList.length})</span>
            </h2>
          </div>

          {!isLoggedIn ? (
            <div className="p-5 rounded-2xl bg-surface-900/80 border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="text-sm font-bold text-white block">Ingin Memberikan Rating & Ulasan?</span>
                <p className="text-xs text-slate-400 mt-1">
                  Masuk ke akun LiveEuy Anda untuk memberikan rating bintang dan membagikan ulasan kepada komunitas pecinta sinema.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors whitespace-nowrap cursor-pointer"
              >
                Masuk untuk Menulis
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddReview} className="p-5 rounded-2xl bg-surface-900/80 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Tulis Ulasan Anda</span>
                <span className="text-xs text-slate-400">
                  Sebagai: <strong className="text-brand-400">{user?.name}</strong>
                </span>
              </div>

              {/* Rating Selector */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">Beri Nilai:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setUserRating(val)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        userRating >= val ? 'bg-amber-500 text-black font-bold' : 'bg-surface-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-amber-400 font-bold ml-1">{userRating}/10</span>
              </div>

              {/* Input Text & Submit */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Bagikan pendapat Anda tentang film atau serial ini..."
                  className="flex-1 bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-brand-600/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-3">
            {reviewsList.map(rev => (
              <div key={rev.id} className="p-4 rounded-2xl bg-surface-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="w-9 h-9 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{rev.author}</span>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {rev.rating}/10
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-12">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
