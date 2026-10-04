import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  Heart, 
  Share2, 
  Star, 
  Send, 
  Smartphone, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { Review } from '../types';
import { apiService } from '../services/api';
import { useModalA11y } from '../hooks/useModalA11y';
import { BillboardAd } from './BillboardAd';
import { CastSection } from './CastSection';
import { handleBackdropError, handleImageError } from '../utils/imageFallback';

export const DetailModal: React.FC = () => {
  const { 
    detailItem, 
    closeDetail, 
    openDetail,
    openPlayer, 
    toggleWatchlist, 
    isInWatchlist, 
    toggleFavorite, 
    isFavorite,
    allMedia,
    user,
    isLoggedIn,
    openAuthModal,
    openMobileSync,
    setSearchQuery
  } = useWatch();

  const navigate = useNavigate();
  const isVip = user?.tier === 'VIP Cinema Ultra' || user?.tier === 'VIP Standard';

  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'cast' | 'similar' | 'reviews'>('overview');
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [userRating, setUserRating] = useState<number>(10);
  const [userComment, setUserComment] = useState<string>('');
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  const handleActorClick = (actorName: string) => {
    closeDetail();
    setSearchQuery(actorName);
    navigate(`/search?q=${encodeURIComponent(actorName)}`);
  };

  // Focus trap, Escape key listener, and body scroll lock
  useModalA11y({
    isOpen: Boolean(detailItem),
    onClose: closeDetail,
    modalRef
  });

  // Sync reviews and reset state when detailItem changes
  useEffect(() => {
    if (detailItem) {
      setReviewsList(detailItem.reviews || []);
      setActiveTab('overview');
      setSelectedSeasonNumber(1);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [detailItem]);

  if (!detailItem) return null;

  const inWatchlist = isInWatchlist(detailItem.id);
  const favorite = isFavorite(detailItem.id);

  const selectedSeason = detailItem.seasons?.find(s => s.seasonNumber === selectedSeasonNumber) || detailItem.seasons?.[0];
  const totalEpisodesCount = detailItem.seasons?.reduce((acc, s) => acc + s.episodes.length, 0) || 0;
  const castCount = detailItem.actors?.length || detailItem.cast?.length || 0;

  const similarMedia = allMedia
    .filter(m => m.id !== detailItem.id && m.genres.some(g => detailItem.genres.includes(g)))
    .slice(0, 6);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setHasCopiedShare(true);
    setTimeout(() => setHasCopiedShare(false), 2000);
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
      await apiService.addReview(detailItem.id, author, userRating, comment);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={closeDetail}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detail Sinema: ${detailItem.title}`}
        className="relative w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[1240px] bg-surface-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl text-slate-100 h-full sm:h-auto max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button: Stays pinned at top-right while content scrolls underneath */}
        <button
          type="button"
          onClick={closeDetail}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 sm:p-2.5 rounded-full bg-black/75 hover:bg-black text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
          aria-label="Tutup Detail"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Unified Scrollable Container: Banner, sticky tabs, episode list, and cast all scroll smoothly */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar scroll-smooth"
        >
          {/* Header Backdrop Banner (16:9 Cinema Widescreen) */}
          <div className="relative aspect-[16/9] min-h-[240px] sm:min-h-[340px] md:min-h-[420px] max-h-[500px] w-full flex-shrink-0">
            <img
              src={detailItem.backdropUrl}
              alt={detailItem.title}
              style={{ viewTransitionName: 'active-media-hero' }}
              onError={handleBackdropError}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-900/90 via-transparent to-transparent" />

            {/* Banner Details & Action Buttons */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 space-y-2 sm:space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  {detailItem.type === 'movie' ? 'Film Layar Lebar' : 'Serial Eksklusif'}
                </span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-white/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  {detailItem.matchScore}% Cocok untuk Anda
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md leading-tight">
                {detailItem.title}
              </h1>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeDetail();
                    openPlayer(detailItem);
                  }}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-600/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white translate-x-0.5" />
                  <span>Putar {detailItem.type === 'tv' ? 'Episode 1' : 'Film'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWatchlist(detailItem.id)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl glass-panel text-white hover:bg-white/20 text-xs sm:text-sm font-medium transition-transform hover:scale-105 cursor-pointer"
                >
                  {inWatchlist ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                  <span className="hidden xs:inline">{inWatchlist ? 'Tersimpan' : 'Koleksi'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(detailItem.id)}
                  className={`p-2.5 rounded-xl glass-panel transition-transform hover:scale-110 cursor-pointer ${
                    favorite ? 'text-rose-500 fill-rose-500 border-rose-500/40' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Sukai"
                >
                  <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white transition-transform hover:scale-110 relative cursor-pointer"
                  title="Bagikan Tautan"
                >
                  <Share2 className="w-4 h-4" />
                  {hasCopiedShare && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-[10px] text-white whitespace-nowrap">
                      Tersalin!
                    </span>
                  )}
                </button>

                {/* Buka di Aplikasi Mobile / Hubungkan ke HP */}
                <button
                  type="button"
                  onClick={() => openMobileSync(detailItem)}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl glass-panel hover:bg-white/20 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
                  title="Buka tayangan ini di aplikasi mobile (QR Code & Deep Link)"
                >
                  <Smartphone className="w-3.5 h-3.5 text-brand-400" />
                  <span className="hidden xs:inline">Buka di HP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dual Billboard Ads (Non-VIP users only) */}
          {!isVip && (
            <div className="px-4 sm:px-6 py-2 bg-surface-950/80 border-b border-white/5">
              <BillboardAd fluid placementIndex={3} />
            </div>
          )}

          {/* Sticky Tab Navigation Bar */}
          <div className="sticky top-0 z-30 flex items-center gap-1 sm:gap-2 px-4 sm:px-6 border-b border-white/10 bg-surface-900/95 backdrop-blur-md overflow-x-auto scrollbar-none shadow-md">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Ringkasan
            </button>

            {detailItem.type === 'tv' && detailItem.seasons && (
              <button
                type="button"
                onClick={() => setActiveTab('episodes')}
                className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'episodes'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Episode & Musim ({totalEpisodesCount})
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('cast')}
              className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'cast'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Pemeran ({castCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('similar')}
              className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'similar'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Mirip Ini
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Ulasan Penonton ({reviewsList.length})
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-4 sm:p-6 space-y-8">
            
            {/* VIEW 1: OVERVIEW TAB (Includes Synopsis, Episodes if Series, Cast, and Similar) */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Synopsis and Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {detailItem.rating} / 10
                      </span>

                      {/* Synchronized IMDb Rating Badge */}
                      {detailItem.imdbId && (
                        <a
                          href={`https://www.imdb.com/title/${detailItem.imdbId}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f5c518] hover:bg-[#e2b616] text-black font-black text-[11px] tracking-tight transition-transform hover:scale-105 shadow-sm"
                          title={`Sinkron dengan database resmi IMDb: ${detailItem.imdbId}`}
                        >
                          <span>IMDb</span>
                          <span className="font-bold text-[10px]">★ {detailItem.imdbRating || detailItem.rating}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-black" />
                        </a>
                      )}

                      <span>•</span>
                      <span>{detailItem.releaseYear}</span>
                      {detailItem.country && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold">
                            {detailItem.country}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded border border-white/20">{detailItem.ageRating}</span>
                      <span>•</span>
                      <span>{detailItem.type === 'tv' ? `${detailItem.totalSeasons || detailItem.seasons?.length || 1} Musim` : detailItem.duration}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/10">{detailItem.quality}</span>
                      <span>•</span>
                      <span>{detailItem.audio}</span>
                    </div>

                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                      {detailItem.overview}
                    </p>

                    {detailItem.tagline && (
                      <p className="text-xs sm:text-sm text-brand-300 italic border-l-2 border-brand-500 pl-3">
                        "{detailItem.tagline}"
                      </p>
                    )}
                  </div>

                  {/* Sidebar metadata */}
                  <div className="bg-surface-800/60 p-4 rounded-2xl border border-white/5 space-y-3 text-xs">

                    <div>
                      <span className="text-slate-400 block mb-1">Negara Asal:</span>
                      <p className="text-slate-200 font-medium">{detailItem.country || 'Indonesia'}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">Pemeran:</span>
                      <p className="text-slate-200 font-medium">{detailItem.cast.join(', ')}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">Sutradara:</span>
                      <p className="text-slate-200 font-medium">{detailItem.director}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">Genre:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {detailItem.genres.map(g => (
                          <span key={g} className="px-2 py-0.5 rounded bg-white/10 text-slate-300">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">Karakteristik Tontonan:</span>
                      <p className="text-slate-300">Menegangkan, Penuh Misteri, Visual Spektakuler, Audio Sinematik</p>
                    </div>
                  </div>
                </div>

                {/* If TV Show: Episodes & Seasons Section directly scrollable */}
                {detailItem.type === 'tv' && detailItem.seasons && (
                  <div className="pt-6 border-t border-white/[0.08] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                          <span>Episode & Musim</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                            {totalEpisodesCount} Episode
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Pilih episode untuk langsung memutar di pemutar sinema LiveEuy
                        </p>
                      </div>

                      {/* Season Selector */}
                      {detailItem.seasons.length > 1 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-400">Musim:</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {detailItem.seasons.map(s => (
                              <button
                                key={s.seasonNumber}
                                type="button"
                                onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                  selectedSeasonNumber === s.seasonNumber
                                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                                    : 'glass-panel text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                {s.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Episodes List Grid */}
                    <div className="space-y-3">
                      {selectedSeason?.episodes.map(ep => (
                        <div
                          key={ep.id}
                          onClick={() => {
                            closeDetail();
                            openPlayer(detailItem, ep);
                          }}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-2xl bg-surface-800/40 hover:bg-surface-800 border border-white/5 hover:border-brand-500/40 transition-all cursor-pointer group"
                        >
                          {/* Thumbnail with hover play overlay */}
                          <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0">
                            <img
                              src={ep.thumbnail}
                              alt={ep.title}
                              loading="lazy"
                              onError={handleBackdropError}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 fill-white translate-x-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                              {ep.duration}
                            </span>
                          </div>

                          {/* Episode Title & Overview */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-400 transition-colors">
                                {ep.episodeNumber}. {ep.title}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                              {ep.overview}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cast Section with circular portraits matching user's screenshot */}
                <div className="pt-6 border-t border-white/[0.08]">
                  <CastSection
                    actors={detailItem.actors}
                    castFallback={detailItem.cast}
                    title="Cast"
                    onActorClick={handleActorClick}
                  />
                </div>

                {/* Similar Recommendations Section */}
                {similarMedia.length > 0 && (
                  <div className="pt-6 border-t border-white/[0.08] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                        {detailItem.type === 'tv' ? 'Serial Terkait' : 'Film Serupa'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('similar')}
                        className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold"
                      >
                        Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {similarMedia.map(item => (
                        <div
                          key={item.id}
                          onClick={() => openDetail(item)}
                          className="group rounded-2xl overflow-hidden bg-surface-800/40 border border-white/5 hover:border-brand-500/40 p-2 cursor-pointer transition-all hover:-translate-y-1"
                        >
                          <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2">
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                            <span className="text-amber-400 font-semibold">★ {item.rating}</span>
                            <span>{item.releaseYear}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: EPISODES TAB (Dedicated View for TV Series) */}
            {activeTab === 'episodes' && detailItem.seasons && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                      <span>Daftar Lengkap Episode & Musim</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {totalEpisodesCount} Episode
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pilih episode untuk langsung memutar di pemutar sinema LiveEuy
                    </p>
                  </div>

                  {/* Season Selector */}
                  {detailItem.seasons.length > 1 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">Musim:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {detailItem.seasons.map(s => (
                          <button
                            key={s.seasonNumber}
                            type="button"
                            onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              selectedSeasonNumber === s.seasonNumber
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                                : 'glass-panel text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {s.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Episodes List */}
                <div className="space-y-3">
                  {selectedSeason?.episodes.map(ep => (
                    <div
                      key={ep.id}
                      onClick={() => {
                        closeDetail();
                        openPlayer(detailItem, ep);
                      }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-2xl bg-surface-800/40 hover:bg-surface-800 border border-white/5 hover:border-brand-500/40 transition-all cursor-pointer group"
                    >
                      {/* Thumbnail with hover play overlay */}
                      <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0">
                        <img
                          src={ep.thumbnail}
                          alt={ep.title}
                          loading="lazy"
                          onError={handleBackdropError}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white translate-x-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                          {ep.duration}
                        </span>
                      </div>

                      {/* Episode Title & Overview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-400 transition-colors">
                            {ep.episodeNumber}. {ep.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {ep.overview}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cast Section directly below episodes list */}
                <div className="pt-6 border-t border-white/[0.08]">
                  <CastSection
                    actors={detailItem.actors}
                    castFallback={detailItem.cast}
                    title="Cast"
                    onActorClick={handleActorClick}
                  />
                </div>
              </div>
            )}

            {/* VIEW 3: CAST TAB */}
            {activeTab === 'cast' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                    Daftar Pemeran & Karakter
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Klik pada foto aktor/aktris untuk menjelajahi karya sinema mereka lainnya
                  </p>
                </div>

                <CastSection
                  actors={detailItem.actors}
                  castFallback={detailItem.cast}
                  title="Cast"
                  onActorClick={handleActorClick}
                />
              </div>
            )}

            {/* VIEW 4: SIMILAR TAB */}
            {activeTab === 'similar' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                    {detailItem.type === 'tv' ? 'Serial Terkait & Rekomendasi' : 'Film Serupa & Rekomendasi'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Berdasarkan kesamaan genre, atmosfer cerita, dan preferensi tontonan Anda
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {similarMedia.map(item => (
                    <div
                      key={item.id}
                      onClick={() => openDetail(item)}
                      className="group rounded-2xl overflow-hidden bg-surface-800/50 border border-white/5 hover:border-brand-500/40 p-2 cursor-pointer transition-all hover:-translate-y-1"
                    >
                      <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                        <span className="text-amber-400 font-semibold">★ {item.rating}</span>
                        <span>{item.releaseYear}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 5: REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Add Review Form or Guest Login Prompt */}
                {!isLoggedIn ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface-800/80 border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div>
                      <span className="text-sm font-bold text-white block">Ingin Memberikan Rating & Ulasan?</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Masuk ke akun LiveEuy Anda untuk memberikan penilaian bintang dan membagikan ulasan kepada komunitas.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Masuk untuk Menulis
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-surface-800/70 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white block">Tulis Ulasan Anda</span>
                      <span className="text-[11px] text-slate-400">
                        Sebagai: <strong className="text-brand-400">{user?.name}</strong>
                      </span>
                    </div>
                    
                    {/* Rating Stars Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Nilai:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setUserRating(val)}
                            className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                              userRating >= val ? 'bg-amber-500 text-black font-bold' : 'bg-white/10 text-slate-400'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-amber-400 font-bold ml-1">{userRating}/10</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Bagikan pendapat Anda tentang sinema ini..."
                        className="flex-1 bg-surface-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-brand-600/20 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviewsList.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Belum ada ulasan untuk tayangan ini. Jadilah yang pertama memberikan ulasan!
                    </div>
                  ) : (
                    reviewsList.map(rev => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-surface-800/40 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rev.avatar}
                              alt={rev.author}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <span className="text-xs font-bold text-white block">{rev.author}</span>
                              <span className="text-[10px] text-slate-400">{rev.date}</span>
                            </div>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {rev.rating}/10
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
