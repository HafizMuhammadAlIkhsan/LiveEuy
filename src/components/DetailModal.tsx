import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  Heart, 
  Share2, 
  Star, 
  Send
} from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { Review } from '../types';
import { apiService } from '../services/api';

export const DetailModal: React.FC = () => {
  const { 
    detailItem, 
    closeDetail, 
    openPlayer, 
    toggleWatchlist, 
    isInWatchlist, 
    toggleFavorite, 
    isFavorite,
    allMedia,
    user,
    isLoggedIn,
    openAuthModal
  } = useWatch();

  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'similar' | 'reviews'>('overview');
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [userRating, setUserRating] = useState<number>(10);
  const [userComment, setUserComment] = useState<string>('');
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  // Sync reviews when detailItem changes
  React.useEffect(() => {
    if (detailItem) {
      setReviewsList(detailItem.reviews || []);
      setActiveTab('overview');
      setSelectedSeasonNumber(1);
    }
  }, [detailItem]);

  if (!detailItem) return null;

  const inWatchlist = isInWatchlist(detailItem.id);
  const favorite = isFavorite(detailItem.id);

  const selectedSeason = detailItem.seasons?.find(s => s.seasonNumber === selectedSeasonNumber) || detailItem.seasons?.[0];

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={closeDetail}
    >
      <div 
        className="relative w-full max-w-4xl bg-surface-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl text-slate-100 max-h-[94vh] sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Backdrop Banner */}
        <div className="relative h-56 sm:h-80 md:h-96 w-full flex-shrink-0">
          <img
            src={detailItem.backdropUrl}
            alt={detailItem.title}
            style={{ viewTransitionName: 'active-media-hero' }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-900/90 via-transparent to-transparent" />

          {/* Close Button */}
          <button
            onClick={closeDetail}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Banner Details & Action Buttons */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
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
                onClick={() => {
                  closeDetail();
                  openPlayer(detailItem);
                }}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-600/30 transition-transform hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white translate-x-0.5" />
                <span>Putar {detailItem.type === 'tv' ? 'Episode 1' : 'Film'}</span>
              </button>

              <button
                onClick={() => toggleWatchlist(detailItem.id)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl glass-panel text-white hover:bg-white/20 text-xs sm:text-sm font-medium transition-transform hover:scale-105"
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                <span className="hidden xs:inline">{inWatchlist ? 'Tersimpan' : 'Koleksi'}</span>
              </button>

              <button
                onClick={() => toggleFavorite(detailItem.id)}
                className={`p-2.5 rounded-xl glass-panel transition-transform hover:scale-110 ${
                  favorite ? 'text-rose-500 fill-rose-500 border-rose-500/40' : 'text-slate-300 hover:text-white'
                }`}
                title="Sukai"
              >
                <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white transition-transform hover:scale-110 relative"
                title="Bagikan Tautan"
              >
                <Share2 className="w-4 h-4" />
                {hasCopiedShare && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-[10px] text-white whitespace-nowrap">
                    Tersalin!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 px-6 border-b border-white/10 bg-surface-900/50 flex-shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Ringkasan
          </button>

          {detailItem.type === 'tv' && detailItem.seasons && (
            <button
              onClick={() => setActiveTab('episodes')}
              className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'episodes'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Episode & Musim ({detailItem.seasons.reduce((acc, s) => acc + s.episodes.length, 0)})
            </button>
          )}

          <button
            onClick={() => setActiveTab('similar')}
            className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'similar'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Mirip Ini
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Ulasan Penonton ({reviewsList.length})
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span className="font-semibold text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {detailItem.rating} / 10
                  </span>
                  <span>•</span>
                  <span>{detailItem.releaseYear}</span>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 rounded border border-white/20">{detailItem.ageRating}</span>
                  <span>•</span>
                  <span>{detailItem.type === 'tv' ? `${detailItem.totalSeasons} Musim` : detailItem.duration}</span>
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
          )}

          {/* TAB 2: EPISODES (FOR TV SHOWS) */}
          {activeTab === 'episodes' && detailItem.seasons && (
            <div className="space-y-4">
              {/* Season Selector */}
              {detailItem.seasons.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Pilih Musim:</span>
                  <div className="flex gap-2">
                    {detailItem.seasons.map(s => (
                      <button
                        key={s.seasonNumber}
                        onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          selectedSeasonNumber === s.seasonNumber
                            ? 'bg-brand-600 text-white'
                            : 'glass-panel text-slate-300 hover:text-white'
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Episodes List */}
              <div className="space-y-3">
                {selectedSeason?.episodes.map(ep => (
                  <div
                    key={ep.id}
                    onClick={() => {
                      closeDetail();
                      openPlayer(detailItem, ep);
                    }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-2xl bg-surface-800/40 hover:bg-surface-800 border border-white/5 hover:border-brand-500/30 transition-all cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0">
                      <img
                        src={ep.thumbnail}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 fill-white translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                        {ep.duration}
                      </span>
                    </div>

                    {/* Episode Info */}
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

          {/* TAB 3: SIMILAR */}
          {activeTab === 'similar' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {similarMedia.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    closeDetail();
                    setTimeout(() => useWatch, 100);
                  }}
                  className="group rounded-2xl overflow-hidden bg-surface-800/50 border border-white/5 hover:border-brand-500/40 p-2 cursor-pointer transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
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
          )}

          {/* TAB 4: REVIEWS & RATING FORM */}
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
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors whitespace-nowrap"
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
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => setUserRating(val)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
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
                      placeholder="Bagikan pendapat Anda tentang film ini..."
                      className="flex-1 bg-surface-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-brand-600/20"
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
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
