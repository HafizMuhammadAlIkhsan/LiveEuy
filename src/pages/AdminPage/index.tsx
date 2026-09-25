import React, { useState, useMemo } from 'react';
import { useWatch } from '../../context/WatchContext';
import { MediaItem, Episode, Season, User } from '../../types';
import { GENRES } from '../../data/mockData';
import { 
  Sliders, 
  Film, 
  Tv, 
  Users, 
  MessageSquare, 
  Settings, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Flame, 
  Crown, 
  Play, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  Star
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { 
    allMedia, 
    addMedia, 
    updateMedia, 
    deleteMedia, 
    resetMediaToDefault, 
    setCurrentTab,
    openPlayer,
    openDetail
  } = useWatch();

  // Active Admin Sub-Module Tab
  const [activeModule, setActiveModule] = useState<'media' | 'episodes' | 'users' | 'reviews' | 'system'>('media');

  // Search in admin table
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  // Media Modal Form State (Create / Edit)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formOriginalTitle, setFormOriginalTitle] = useState('');
  const [formType, setFormType] = useState<'movie' | 'tv'>('movie');
  const [formTagline, setFormTagline] = useState('');
  const [formOverview, setFormOverview] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formBackdropUrl, setFormBackdropUrl] = useState('');
  const [formReleaseYear, setFormReleaseYear] = useState<number>(2026);
  const [formRating, setFormRating] = useState<number>(8.5);
  const [formMatchScore, setFormMatchScore] = useState<number>(95);
  const [formAgeRating, setFormAgeRating] = useState<'SU' | '13+' | '16+' | '18+' | '21+'>('13+');
  const [formDuration, setFormDuration] = useState('2j 10m');
  const [formTotalSeasons, setFormTotalSeasons] = useState<number>(1);
  const [formQuality, setFormQuality] = useState<'4K UHD' | 'HD' | 'Dolby Vision'>('4K UHD');
  const [formAudio, setFormAudio] = useState<'Dolby Atmos' | '5.1 Surround' | 'Stereo'>('Dolby Atmos');
  const [formDirector, setFormDirector] = useState('');
  const [formCast, setFormCast] = useState('');
  const [formSelectedGenres, setFormSelectedGenres] = useState<string[]>(['Aksi']);
  const [formVideoUrl, setFormVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
  const [formTrailerUrl, setFormTrailerUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formTopRank, setFormTopRank] = useState<number | undefined>(undefined);

  // Episode Module states
  const seriesList = useMemo(() => allMedia.filter(m => m.type === 'tv'), [allMedia]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(seriesList[0]?.id || '');
  const activeSeries = useMemo(() => seriesList.find(s => s.id === selectedSeriesId) || seriesList[0], [seriesList, selectedSeriesId]);

  // Episode Form state
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [epSeasonNumber, setEpSeasonNumber] = useState<number>(1);
  const [epNumber, setEpNumber] = useState<number>(1);
  const [epTitle, setEpTitle] = useState('');
  const [epOverview, setEpOverview] = useState('');
  const [epDuration, setEpDuration] = useState('45m');
  const [epThumbnail, setEpThumbnail] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80');
  const [epVideoUrl, setEpVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');

  // Users Module Mock Data
  const [usersList, setUsersList] = useState<User[]>([
    {
      id: 'usr-101',
      name: 'Hafiz Muhammad',
      email: 'hafiz@liveeuy.id',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      tier: 'VIP Cinema Ultra',
      role: 'admin',
      memberSince: 'Sep 2024',
      watchHours: 48.5,
      devices: 4
    },
    {
      id: 'usr-102',
      name: 'Budi Santoso',
      email: 'budi@liveeuy.id',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      tier: 'VIP Standard',
      role: 'user',
      memberSince: 'Okt 2024',
      watchHours: 14.2,
      devices: 2
    },
    {
      id: 'usr-103',
      name: 'Siti Sarah',
      email: 'siti@liveeuy.id',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      tier: 'VIP Cinema Ultra',
      role: 'user',
      memberSince: 'Nov 2024',
      watchHours: 32.0,
      devices: 3
    },
    {
      id: 'usr-104',
      name: 'Rian Pratama',
      email: 'rian@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      tier: 'Free Guest',
      role: 'user',
      memberSince: 'Jan 2025',
      watchHours: 2.5,
      devices: 1
    }
  ]);

  // Notification Banner
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormOriginalTitle('');
    setFormType('movie');
    setFormTagline('');
    setFormOverview('');
    setFormPosterUrl('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80');
    setFormBackdropUrl('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80');
    setFormReleaseYear(2026);
    setFormRating(8.8);
    setFormMatchScore(96);
    setFormAgeRating('16+');
    setFormDuration('2j 05m');
    setFormTotalSeasons(1);
    setFormQuality('4K UHD');
    setFormAudio('Dolby Atmos');
    setFormDirector('Sutradara Indonesia');
    setFormCast('Aktor Utama 1, Aktor Utama 2');
    setFormSelectedGenres(['Aksi', 'Fiksi Ilmiah']);
    setFormVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
    setFormTrailerUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    setFormIsFeatured(false);
    setFormIsTrending(true);
    setFormTopRank(undefined);
    setIsMediaModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormOriginalTitle(item.originalTitle || '');
    setFormType(item.type);
    setFormTagline(item.tagline);
    setFormOverview(item.overview);
    setFormPosterUrl(item.posterUrl);
    setFormBackdropUrl(item.backdropUrl);
    setFormReleaseYear(item.releaseYear);
    setFormRating(item.rating);
    setFormMatchScore(item.matchScore);
    setFormAgeRating(item.ageRating);
    setFormDuration(item.duration || '2j 00m');
    setFormTotalSeasons(item.totalSeasons || 1);
    setFormQuality(item.quality);
    setFormAudio(item.audio);
    setFormDirector(item.director);
    setFormCast(item.cast.join(', '));
    setFormSelectedGenres(item.genres);
    setFormVideoUrl(item.videoUrl);
    setFormTrailerUrl(item.trailerUrl || '');
    setFormIsFeatured(item.isFeatured || false);
    setFormIsTrending(item.isTrending || false);
    setFormTopRank(item.topRank);
    setIsMediaModalOpen(true);
  };

  // Save Media Form
  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const slug = formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const castArray = formCast.split(',').map(c => c.trim()).filter(Boolean);

    if (editingItem) {
      // Update
      updateMedia(editingItem.id, {
        title: formTitle,
        originalTitle: formOriginalTitle,
        type: formType,
        tagline: formTagline,
        overview: formOverview,
        posterUrl: formPosterUrl,
        backdropUrl: formBackdropUrl,
        releaseYear: formReleaseYear,
        rating: formRating,
        matchScore: formMatchScore,
        ageRating: formAgeRating,
        duration: formType === 'movie' ? formDuration : undefined,
        totalSeasons: formType === 'tv' ? formTotalSeasons : undefined,
        quality: formQuality,
        audio: formAudio,
        director: formDirector,
        cast: castArray,
        genres: formSelectedGenres,
        videoUrl: formVideoUrl,
        trailerUrl: formTrailerUrl,
        isFeatured: formIsFeatured,
        isTrending: formIsTrending,
        topRank: formTopRank
      });
      showToast(`Tayangan "${formTitle}" berhasil diperbarui!`);
    } else {
      // Create
      const newItem: MediaItem = {
        id: slug || `media-${Date.now()}`,
        title: formTitle,
        originalTitle: formOriginalTitle,
        type: formType,
        tagline: formTagline || 'Tayangan terbaru LiveEuy Cinema',
        overview: formOverview || 'Sinopsis belum ditambahkan.',
        posterUrl: formPosterUrl,
        backdropUrl: formBackdropUrl,
        releaseYear: formReleaseYear,
        rating: formRating,
        matchScore: formMatchScore,
        ageRating: formAgeRating,
        duration: formType === 'movie' ? formDuration : undefined,
        totalSeasons: formType === 'tv' ? formTotalSeasons : undefined,
        quality: formQuality,
        audio: formAudio,
        director: formDirector || 'Sutradara',
        cast: castArray.length > 0 ? castArray : ['Aktor Utama'],
        genres: formSelectedGenres,
        videoUrl: formVideoUrl,
        trailerUrl: formTrailerUrl,
        isFeatured: formIsFeatured,
        isTrending: formIsTrending,
        topRank: formTopRank
      };
      addMedia(newItem);
      showToast(`Tayangan baru "${formTitle}" berhasil dipublikasikan ke katalog!`);
    }

    setIsMediaModalOpen(false);
  };

  // Add Episode to Active Series
  const handleAddEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeries || !epTitle.trim()) return;

    const newEp: Episode = {
      id: `ep-${Date.now()}`,
      episodeNumber: epNumber,
      seasonNumber: epSeasonNumber,
      title: epTitle,
      overview: epOverview || 'Sinopsis episode baru.',
      duration: epDuration,
      thumbnail: epThumbnail,
      videoUrl: epVideoUrl
    };

    const existingSeasons = activeSeries.seasons ? [...activeSeries.seasons] : [];
    let targetSeason = existingSeasons.find(s => s.seasonNumber === epSeasonNumber);

    if (targetSeason) {
      targetSeason.episodes.push(newEp);
    } else {
      targetSeason = {
        seasonNumber: epSeasonNumber,
        title: `Musim ${epSeasonNumber}`,
        episodes: [newEp]
      };
      existingSeasons.push(targetSeason);
    }

    updateMedia(activeSeries.id, {
      seasons: existingSeasons,
      totalSeasons: Math.max(activeSeries.totalSeasons || 1, epSeasonNumber)
    });

    setIsEpisodeModalOpen(false);
    setEpTitle('');
    setEpOverview('');
    showToast(`Episode "${epTitle}" berhasil ditambahkan ke ${activeSeries.title}!`);
  };

  // Filtered Media in Admin table
  const filteredAdminMedia = useMemo(() => {
    return allMedia.filter(item => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.director.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allMedia, filterType, searchTerm]);

  return (
    <div className="pt-20 sm:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 animate-slide-up text-xs sm:text-sm font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ========================================================
          1. ADMIN HEADER BAR & QUICK SYSTEM KPI STATS
          ======================================================== */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-900 via-surface-800 to-indigo-950/40 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LiveEuy Admin Console & CMS Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Pusat Manajemen Sistem & Modul
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Kelola katalog film/serial, episode & musim, pengguna & paket VIP, serta moderasi komunitas.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentTab('home')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-colors border border-white/10"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Kembali ke Website</span>
            </button>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tayangan</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10 text-xs sm:text-sm">
          <div className="bg-black/30 p-3 sm:p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Katalog Aktif</span>
            <span className="text-lg sm:text-2xl font-black text-brand-400">{allMedia.length} Judul</span>
          </div>

          <div className="bg-black/30 p-3 sm:p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Serial & Musim</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-400">{seriesList.length} Serial TV</span>
          </div>

          <div className="bg-black/30 p-3 sm:p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Akun Terdaftar</span>
            <span className="text-lg sm:text-2xl font-black text-amber-400">{usersList.length} Pengguna</span>
          </div>

          <div className="bg-black/30 p-3 sm:p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status API Backend</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Spring Boot Online</span>
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. MODULE NAVIGATION TABS
          ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'media', label: `1. Katalog & CMS Media (${allMedia.length})`, icon: Film },
          { id: 'episodes', label: '2. Episode & Musim', icon: Tv },
          { id: 'users', label: `3. Pengguna & Langganan VIP (${usersList.length})`, icon: Users },
          { id: 'reviews', label: '4. Moderasi Ulasan', icon: MessageSquare },
          { id: 'system', label: '5. Pengaturan Sistem & API', icon: Settings },
        ].map(mod => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                  : 'bg-surface-800/80 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          MODULE 1: KATALOG & CMS MEDIA
          ======================================================== */}
      {activeModule === 'media' && (
        <section className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-800/60 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari judul tayangan atau sutradara..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5 text-xs">
              {[
                { id: 'all', label: 'Semua Format' },
                { id: 'movie', label: 'Film Saja' },
                { id: 'tv', label: 'Serial TV' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterType(opt.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    filterType === opt.id ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media Table */}
          <div className="rounded-3xl bg-surface-800/40 border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-surface-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Tayangan</th>
                  <th className="py-3.5 px-3">Tipe</th>
                  <th className="py-3.5 px-3">Rating</th>
                  <th className="py-3.5 px-3">Status Sorotan</th>
                  <th className="py-3.5 px-3">Kualitas</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAdminMedia.map(item => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    {/* Media item info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded-lg flex-shrink-0 shadow"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-white truncate max-w-xs">{item.title}</h4>
                          <span className="text-[11px] text-slate-400 block">
                            {item.releaseYear} • {item.director}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.type === 'movie' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {item.type === 'movie' ? 'Film' : 'Serial'}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {item.rating}
                      </span>
                    </td>

                    {/* Highlights Toggles */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Featured Toggle */}
                        <button
                          onClick={() => {
                            updateMedia(item.id, { isFeatured: !item.isFeatured });
                            showToast(`Status Featured untuk "${item.title}" diubah!`);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            item.isFeatured
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-white/5 text-slate-500 border-white/5'
                          }`}
                          title="Tampilkan di Hero Banner"
                        >
                          Hero ⭐
                        </button>

                        {/* Trending Toggle */}
                        <button
                          onClick={() => {
                            updateMedia(item.id, { isTrending: !item.isTrending });
                            showToast(`Status Trending untuk "${item.title}" diubah!`);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            item.isTrending
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-white/5 text-slate-500 border-white/5'
                          }`}
                          title="Tampilkan di Baris Trending"
                        >
                          Trending 🔥
                        </button>

                        {item.topRank && (
                          <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold text-[10px]">
                            #{item.topRank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quality */}
                    <td className="py-3 px-3">
                      <span className="text-xs text-slate-300 font-mono">{item.quality}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Pratinjau Detail"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white transition-colors"
                          title="Edit Tayangan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus "${item.title}" dari katalog?`)) {
                              deleteMedia(item.id);
                              showToast(`"${item.title}" telah dihapus.`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                          title="Hapus Tayangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================
          MODULE 2: EPISODE & MUSIM
          ======================================================== */}
      {activeModule === 'episodes' && (
        <section className="space-y-6">
          <div className="bg-surface-800/60 p-4 sm:p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Pilih Serial TV yang Dikelola
                </h3>
                <p className="text-xs text-slate-400">
                  Kelola struktur episode mingguan, thumbnail cuplikan, dan link video streaming.
                </p>
              </div>

              {/* Series Selector */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {seriesList.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSeriesId(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      (activeSeries?.id === s.id)
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-surface-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Series Seasons & Episodes */}
            {activeSeries && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Struktur Musim: {activeSeries.title}
                    </span>
                    <span className="text-xs text-brand-400 font-bold">
                      ({activeSeries.totalSeasons || 1} Musim)
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setEpSeasonNumber(1);
                      setEpNumber((activeSeries.seasons?.[0]?.episodes.length || 0) + 1);
                      setIsEpisodeModalOpen(true);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Episode Baru</span>
                  </button>
                </div>

                {/* Seasons Loop */}
                {activeSeries.seasons && activeSeries.seasons.length > 0 ? (
                  <div className="space-y-4">
                    {activeSeries.seasons.map(season => (
                      <div key={season.seasonNumber} className="bg-surface-900/80 rounded-2xl p-4 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span>{season.title} ({season.episodes.length} Episode)</span>
                          <span className="text-slate-500 font-mono">Musim #{season.seasonNumber}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {season.episodes.map(ep => (
                            <div key={ep.id} className="p-3 rounded-xl bg-surface-800/80 border border-white/5 flex gap-3 items-center group">
                              <img src={ep.thumbnail} alt={ep.title} className="w-20 aspect-video rounded-lg object-cover flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-white group-hover:text-brand-400 truncate">
                                  Ep {ep.episodeNumber}: {ep.title}
                                </h5>
                                <span className="text-[10px] text-slate-400 block">{ep.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 glass-panel rounded-2xl">
                    Belum ada episode terdaftar untuk serial ini. Klik tombol Tambah Episode di atas.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          MODULE 3: PENGGUNA & LANGGANAN VIP
          ======================================================== */}
      {activeModule === 'users' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Daftar Pengguna & Status Langganan</h3>
              <p className="text-xs text-slate-400">Atur tier keanggotaan dan hak akses streaming pengguna.</p>
            </div>
          </div>

          <div className="rounded-3xl bg-surface-800/40 border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-surface-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Pengguna</th>
                  <th className="py-3.5 px-3">Role</th>
                  <th className="py-3.5 px-3">Tier Paket</th>
                  <th className="py-3.5 px-3">Maks Perangkat</th>
                  <th className="py-3.5 px-3">Total Jam Tonton</th>
                  <th className="py-3.5 px-4 text-right">Ubah Paket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map(usr => (
                  <tr key={usr.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={usr.avatar} alt={usr.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-white block">{usr.name}</span>
                          <span className="text-[11px] text-slate-400">{usr.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        usr.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-slate-300'
                      }`}>
                        {usr.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {usr.tier}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {usr.devices} Perangkat
                    </td>

                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                      {usr.watchHours} Jam
                    </td>

                    <td className="py-3 px-4 text-right">
                      <select
                        value={usr.tier}
                        onChange={(e) => {
                          const newTier = e.target.value as any;
                          setUsersList(prev => prev.map(u => u.id === usr.id ? { ...u, tier: newTier } : u));
                          showToast(`Paket pengguna ${usr.name} diubah menjadi ${newTier}!`);
                        }}
                        className="bg-surface-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-500"
                      >
                        <option value="Free Guest">Free Guest</option>
                        <option value="VIP Standard">VIP Standard</option>
                        <option value="VIP Cinema Ultra">VIP Cinema Ultra</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================
          MODULE 4: MODERASI KOMUNITAS & ULASAN
          ======================================================== */}
      {activeModule === 'reviews' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Ulasan Komunitas & Rating Masuk</h3>
              <p className="text-xs text-slate-400">Pantau dan moderasi komentar pengguna di setiap film.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allMedia.flatMap(m => (m.reviews || []).map(r => ({ ...r, mediaTitle: m.title, mediaId: m.id }))).map((rev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface-800/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={rev.avatar} alt={rev.author} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h5 className="text-xs font-bold text-white">{rev.author}</h5>
                      <span className="text-[10px] text-brand-400">Pada: {rev.mediaTitle}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    ★ {rev.rating}/10
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                  <span>{rev.date}</span>
                  <button
                    onClick={() => showToast(`Ulasan oleh "${rev.author}" diverifikasi aman!`)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Verifikasi Aman
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================
          MODULE 5: PENGATURAN SISTEM & API
          ======================================================== */}
      {activeModule === 'system' && (
        <section className="space-y-6">
          <div className="bg-surface-800/60 p-6 rounded-3xl border border-white/5 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Konfigurasi Engine & Integrasi REST API</h3>
              <p className="text-xs text-slate-400">Status konektivitas Spring Boot 3 dan Swagger OpenAPI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface-900 border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Spring Boot REST API</span>
                <div className="text-white font-mono text-sm">http://localhost:8080/api/v1/media</div>
                <p className="text-slate-400">Backend mikro/layanan Spring Boot untuk melayani katalog dan durasi tontonan.</p>
                <a
                  href="http://localhost:8080/swagger-ui.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-bold pt-1"
                >
                  <span>Buka Swagger UI Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-surface-900 border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Reset Data Demo</span>
                <p className="text-slate-400">
                  Mengembalikan seluruh katalog film, serial, dan data mock ke kondisi awal pabrik.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Yakin ingin mereset seluruh data katalog ke default mock?')) {
                      resetMediaToDefault();
                      showToast('Seluruh data katalog berhasil direset ke default!');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Katalog ke Default</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          MEDIA CREATE / EDIT MODAL
          ======================================================== */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-surface-900 border border-white/10 p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-4">
              {editingItem ? `Edit Tayangan: ${editingItem.title}` : 'Tambah Tayangan Baru ke Katalog'}
            </h3>

            <form onSubmit={handleSaveMedia} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Judul Tayangan *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Contoh: Cyberpunk: Neo Nusantara"
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Judul Asli/Internasional</label>
                  <input
                    type="text"
                    value={formOriginalTitle}
                    onChange={e => setFormOriginalTitle(e.target.value)}
                    placeholder="Contoh: Neo Nusantara 2099"
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Tipe Media</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="movie">Film Bioskop</option>
                    <option value="tv">Serial TV</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Tahun Rilis</label>
                  <input
                    type="number"
                    value={formReleaseYear}
                    onChange={e => setFormReleaseYear(Number(e.target.value))}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Rating (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formRating}
                    onChange={e => setFormRating(Number(e.target.value))}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Kategori Usia</label>
                  <select
                    value={formAgeRating}
                    onChange={e => setFormAgeRating(e.target.value as any)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="SU">SU (Semua Umur)</option>
                    <option value="13+">13+</option>
                    <option value="16+">16+</option>
                    <option value="18+">18+</option>
                    <option value="21+">21+</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Tagline / Slogan</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={e => setFormTagline(e.target.value)}
                  placeholder="Slogan promosi tayangan..."
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Sinopsis Alur Cerita *</label>
                <textarea
                  rows={3}
                  value={formOverview}
                  onChange={e => setFormOverview(e.target.value)}
                  placeholder="Ringkasan sinopsis..."
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">URL Gambar Poster (2:3)</label>
                  <input
                    type="text"
                    value={formPosterUrl}
                    onChange={e => setFormPosterUrl(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">URL Backdrop Widescreen (16:9)</label>
                  <input
                    type="text"
                    value={formBackdropUrl}
                    onChange={e => setFormBackdropUrl(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Sutradara</label>
                  <input
                    type="text"
                    value={formDirector}
                    onChange={e => setFormDirector(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Pemeran (Pisahkan koma)</label>
                  <input
                    type="text"
                    value={formCast}
                    onChange={e => setFormCast(e.target.value)}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-surface-800/80 border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={e => setFormIsFeatured(e.target.checked)}
                    className="rounded bg-surface-900 border-white/10 text-brand-600 focus:ring-0"
                  />
                  <span className="font-semibold text-white">Tampil di Hero Carousel ⭐</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsTrending}
                    onChange={e => setFormIsTrending(e.target.checked)}
                    className="rounded bg-surface-900 border-white/10 text-rose-600 focus:ring-0"
                  />
                  <span className="font-semibold text-white">Trending 🔥</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Peringkat:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1-10"
                    value={formTopRank || ''}
                    onChange={e => setFormTopRank(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-16 bg-surface-900 border border-white/10 rounded-lg px-2 py-1 text-white text-center"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-600/30"
                >
                  Simpan Tayangan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EPISODE CREATE MODAL
          ======================================================== */}
      {isEpisodeModalOpen && activeSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
            <button
              onClick={() => setIsEpisodeModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white">
              Tambah Episode Baru: {activeSeries.title}
            </h3>

            <form onSubmit={handleAddEpisode} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Nomor Musim</label>
                  <input
                    type="number"
                    min="1"
                    value={epSeasonNumber}
                    onChange={e => setEpSeasonNumber(Number(e.target.value))}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Nomor Episode</label>
                  <input
                    type="number"
                    min="1"
                    value={epNumber}
                    onChange={e => setEpNumber(Number(e.target.value))}
                    className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Judul Episode *</label>
                <input
                  type="text"
                  required
                  value={epTitle}
                  onChange={e => setEpTitle(e.target.value)}
                  placeholder="Contoh: Sinyal Hitam dari Batavia Hilir"
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Durasi (misal: 48m)</label>
                <input
                  type="text"
                  value={epDuration}
                  onChange={e => setEpDuration(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Sinopsis Episode</label>
                <textarea
                  rows={2}
                  value={epOverview}
                  onChange={e => setEpOverview(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">URL Thumbnail Episode</label>
                <input
                  type="text"
                  value={epThumbnail}
                  onChange={e => setEpThumbnail(e.target.value)}
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEpisodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Simpan Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
