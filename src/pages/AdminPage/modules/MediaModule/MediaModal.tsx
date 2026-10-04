import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  ExternalLink, 
  Users, 
  Plus, 
  Trash2,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { MediaItem, CastMember } from '../../../../types';
import { GENRES, COUNTRIES } from '../../../../data/mockData';
import { sanitizeUrl } from '../../../../utils/security';
import { StreamHealthResult, MediaFormDraft } from '../../types';
import { saveMediaDraft, loadMediaDraft, clearMediaDraft } from '../../utils';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MediaItem | null;
  onSave: (itemData: {
    title: string;
    originalTitle: string;
    type: 'movie' | 'tv';
    tagline: string;
    overview: string;
    posterUrl: string;
    backdropUrl: string;
    releaseYear: number;
    country: string;
    rating: number;
    matchScore: number;
    ageRating: 'SU' | '13+' | '16+' | '18+' | '21+';
    duration?: string;
    totalSeasons?: number;
    quality: '4K UHD' | 'HD' | 'Dolby Vision';
    audio: 'Dolby Atmos' | '5.1 Surround' | 'Stereo';
    director: string;
    cast: string[];
    actors: CastMember[];
    genres: string[];
    videoUrl: string;
    trailerUrl: string;
    isFeatured: boolean;
    isTrending: boolean;
    topRank?: number;
  }) => void;
  runStreamHealthCheck: (url: string) => Promise<void>;
  isTestingStream: boolean;
  streamHealthResult: StreamHealthResult | null;
  setStreamHealthResult: (res: StreamHealthResult | null) => void;
  isPreviewPlayerOpen: boolean;
  setIsPreviewPlayerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave,
  runStreamHealthCheck,
  isTestingStream,
  streamHealthResult,
  setStreamHealthResult,
  isPreviewPlayerOpen,
  setIsPreviewPlayerOpen
}) => {
  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formOriginalTitle, setFormOriginalTitle] = useState('');
  const [formType, setFormType] = useState<'movie' | 'tv'>('movie');
  const [formTagline, setFormTagline] = useState('');
  const [formOverview, setFormOverview] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formBackdropUrl, setFormBackdropUrl] = useState('');
  const [formReleaseYear, setFormReleaseYear] = useState<number>(2026);
  const [formCountry, setFormCountry] = useState('Indonesia');
  const [formRating, setFormRating] = useState<number>(8.8);
  const [formMatchScore, setFormMatchScore] = useState<number>(96);
  const [formAgeRating, setFormAgeRating] = useState<'SU' | '13+' | '16+' | '18+' | '21+'>('16+');
  const [formDuration, setFormDuration] = useState('2j 05m');
  const [formTotalSeasons, setFormTotalSeasons] = useState<number>(1);
  const [formQuality, setFormQuality] = useState<'4K UHD' | 'HD' | 'Dolby Vision'>('4K UHD');
  const [formAudio, setFormAudio] = useState<'Dolby Atmos' | '5.1 Surround' | 'Stereo'>('Dolby Atmos');
  const [formDirector, setFormDirector] = useState('Sutradara Indonesia');
  const [formCast, setFormCast] = useState('Aktor Utama 1, Aktor Utama 2');
  const [formActors, setFormActors] = useState<CastMember[]>([
    { name: 'Aktor Utama 1', character: 'Peran Utama', profileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80' },
    { name: 'Aktor Utama 2', character: 'Peran Pendamping', profileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80' }
  ]);
  const [formSelectedGenres, setFormSelectedGenres] = useState<string[]>(['Aksi', 'Fiksi Ilmiah']);
  const [formVideoUrl, setFormVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
  const [formTrailerUrl, setFormTrailerUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(true);
  const [formTopRank, setFormTopRank] = useState<number | undefined>(undefined);

  // Autosave Draft State
  const [savedDraft, setSavedDraft] = useState<MediaFormDraft | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Initialize or reset form based on editingItem
  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setFormTitle(editingItem.title);
      setFormOriginalTitle(editingItem.originalTitle || '');
      setFormType(editingItem.type);
      setFormTagline(editingItem.tagline || '');
      setFormOverview(editingItem.overview || '');
      setFormPosterUrl(editingItem.posterUrl);
      setFormBackdropUrl(editingItem.backdropUrl);
      setFormReleaseYear(editingItem.releaseYear);
      setFormCountry(editingItem.country || 'Indonesia');
      setFormRating(editingItem.rating);
      setFormMatchScore(editingItem.matchScore);
      setFormAgeRating(editingItem.ageRating);
      setFormDuration(editingItem.duration || '2j 00m');
      setFormTotalSeasons(editingItem.totalSeasons || 1);
      setFormQuality(editingItem.quality);
      setFormAudio(editingItem.audio);
      setFormDirector(editingItem.director);
      setFormCast(editingItem.cast.join(', '));
      if (editingItem.actors && editingItem.actors.length > 0) {
        setFormActors(editingItem.actors);
      } else {
        setFormActors(editingItem.cast.map(c => ({ name: c, character: 'Pemeran Utama', profileUrl: '' })));
      }
      setFormSelectedGenres(editingItem.genres);
      setFormVideoUrl(editingItem.videoUrl);
      setFormTrailerUrl(editingItem.trailerUrl || '');
      setFormIsFeatured(editingItem.isFeatured || false);
      setFormIsTrending(editingItem.isTrending || false);
      setFormTopRank(editingItem.topRank);
      setSavedDraft(null);
    } else {
      // Check for available draft
      const draft = loadMediaDraft();
      if (draft && draft.formTitle) {
        setSavedDraft(draft);
      } else {
        setSavedDraft(null);
      }
    }
  }, [isOpen, editingItem]);

  // Handle Autosave Draft when creating new item
  useEffect(() => {
    if (!isOpen || editingItem) return;

    if (formTitle.trim()) {
      const timer = setTimeout(() => {
        saveMediaDraft({
          formTitle,
          formOriginalTitle,
          formType,
          formTagline,
          formOverview,
          formPosterUrl,
          formBackdropUrl,
          formReleaseYear,
          formCountry,
          formRating,
          formMatchScore,
          formAgeRating,
          formDuration,
          formTotalSeasons,
          formQuality,
          formAudio,
          formDirector,
          formCast,
          formActors,
          formSelectedGenres,
          formVideoUrl,
          formTrailerUrl,
          formIsFeatured,
          formIsTrending,
          formTopRank
        });
        setDraftSavedToast(true);
        setTimeout(() => setDraftSavedToast(false), 2000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    isOpen,
    editingItem,
    formTitle,
    formOriginalTitle,
    formType,
    formTagline,
    formOverview,
    formPosterUrl,
    formBackdropUrl,
    formReleaseYear,
    formCountry,
    formRating,
    formMatchScore,
    formAgeRating,
    formDuration,
    formTotalSeasons,
    formQuality,
    formAudio,
    formDirector,
    formCast,
    formActors,
    formSelectedGenres,
    formVideoUrl,
    formTrailerUrl,
    formIsFeatured,
    formIsTrending,
    formTopRank
  ]);

  const handleApplyDraft = () => {
    if (!savedDraft) return;
    setFormTitle(savedDraft.formTitle || '');
    setFormOriginalTitle(savedDraft.formOriginalTitle || '');
    setFormType(savedDraft.formType || 'movie');
    setFormTagline(savedDraft.formTagline || '');
    setFormOverview(savedDraft.formOverview || '');
    setFormPosterUrl(savedDraft.formPosterUrl || '');
    setFormBackdropUrl(savedDraft.formBackdropUrl || '');
    setFormReleaseYear(savedDraft.formReleaseYear || 2026);
    setFormCountry(savedDraft.formCountry || 'Indonesia');
    setFormRating(savedDraft.formRating || 8.8);
    setFormMatchScore(savedDraft.formMatchScore || 96);
    setFormAgeRating(savedDraft.formAgeRating || '16+');
    setFormDuration(savedDraft.formDuration || '2j 05m');
    setFormTotalSeasons(savedDraft.formTotalSeasons || 1);
    setFormQuality(savedDraft.formQuality || '4K UHD');
    setFormAudio(savedDraft.formAudio || 'Dolby Atmos');
    setFormDirector(savedDraft.formDirector || '');
    setFormCast(savedDraft.formCast || '');
    setFormActors(savedDraft.formActors || []);
    setFormSelectedGenres(savedDraft.formSelectedGenres || ['Aksi']);
    setFormVideoUrl(savedDraft.formVideoUrl || '');
    setFormTrailerUrl(savedDraft.formTrailerUrl || '');
    setFormIsFeatured(savedDraft.formIsFeatured || false);
    setFormIsTrending(savedDraft.formIsTrending || false);
    setFormTopRank(savedDraft.formTopRank);
    setHasRestoredDraft(true);
    setSavedDraft(null);
  };

  const handleDiscardDraft = () => {
    clearMediaDraft();
    setSavedDraft(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const castArray = formCast.split(',').map(c => c.trim()).filter(Boolean);

    onSave({
      title: formTitle,
      originalTitle: formOriginalTitle,
      type: formType,
      tagline: formTagline,
      overview: formOverview,
      posterUrl: formPosterUrl,
      backdropUrl: formBackdropUrl,
      releaseYear: formReleaseYear,
      country: formCountry,
      rating: formRating,
      matchScore: formMatchScore,
      ageRating: formAgeRating,
      duration: formType === 'movie' ? formDuration : undefined,
      totalSeasons: formType === 'tv' ? formTotalSeasons : undefined,
      quality: formQuality,
      audio: formAudio,
      director: formDirector,
      cast: castArray,
      actors: formActors.filter(a => a.name.trim()),
      genres: formSelectedGenres,
      videoUrl: formVideoUrl,
      trailerUrl: formTrailerUrl,
      isFeatured: formIsFeatured,
      isTrending: formIsTrending,
      topRank: formTopRank
    });

    // Clear draft on successful submit
    if (!editingItem) {
      clearMediaDraft();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl rounded-3xl bg-surface-900 border border-white/10 p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-black text-white">
            {editingItem ? `Edit Tayangan: ${editingItem.title}` : 'Tambah Tayangan Baru ke Katalog'}
          </h3>

          {/* Autosave Pill Indicator */}
          {!editingItem && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono pr-8">
              {draftSavedToast ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Draft tersimpan otomatis
                </span>
              ) : (
                <span className="text-slate-500 flex items-center gap-1">
                  <Save className="w-3 h-3" />
                  Autosave aktif
                </span>
              )}
            </div>
          )}
        </div>

        {/* Saved Draft Banner Alert */}
        {!editingItem && savedDraft && !hasRestoredDraft && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-brand-900/60 to-surface-800 border border-brand-500/40 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white">Ditemukan draft tersimpan otomatis</span>
                <span className="text-slate-300 ml-1">
                  (&ldquo;{savedDraft.formTitle}&rdquo; pada {savedDraft.savedAt})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyDraft}
                className="px-3 py-1 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Pulihkan Draft</span>
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
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

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
              <label className="font-semibold text-slate-300">Negara Asal</label>
              <select
                value={formCountry}
                onChange={e => setFormCountry(e.target.value)}
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {COUNTRIES.filter(c => c !== 'Semua Negara').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
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

          {/* Durasi & Resolusi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formType === 'movie' ? (
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Durasi Film (misal: 2j 10m)</label>
                <input
                  type="text"
                  value={formDuration}
                  onChange={e => setFormDuration(e.target.value)}
                  placeholder="Contoh: 2j 15m"
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Jumlah Musim</label>
                <input
                  type="number"
                  min="1"
                  value={formTotalSeasons}
                  onChange={e => setFormTotalSeasons(Number(e.target.value))}
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Resolusi</label>
                <select
                  value={formQuality}
                  onChange={e => setFormQuality(e.target.value as any)}
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="4K UHD">4K UHD</option>
                  <option value="Dolby Vision">Dolby Vision</option>
                  <option value="HD">HD</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Format Audio</label>
                <select
                  value={formAudio}
                  onChange={e => setFormAudio(e.target.value as any)}
                  className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Dolby Atmos">Dolby Atmos</option>
                  <option value="5.1 Surround">5.1 Surround</option>
                  <option value="Stereo">Stereo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Genre Multi-Select Chips */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-surface-800/60 border border-white/5">
            <label className="font-semibold text-slate-300 block">Pilihan Genre (Klik untuk memilih multi-genre) *</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.filter(g => g !== 'Semua Genre').map(genre => {
                const isSelected = formSelectedGenres.includes(genre);
                return (
                  <button
                    type="button"
                    key={genre}
                    onClick={() => {
                      if (isSelected) {
                        if (formSelectedGenres.length > 1) {
                          setFormSelectedGenres(formSelectedGenres.filter(g => g !== genre));
                        }
                      } else {
                        setFormSelectedGenres([...formSelectedGenres, genre]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-surface-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {isSelected ? `✓ ${genre}` : genre}
                  </button>
                );
              })}
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

          {/* Video Stream & Trailer URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">URL Stream Video (MP4 / HLS) *</label>
                <button
                  type="button"
                  disabled={isTestingStream || !formVideoUrl.trim()}
                  onClick={() => runStreamHealthCheck(formVideoUrl)}
                  className="text-[11px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Uji kelayakan link video sebelum disimpan"
                >
                  <Activity className={`w-3.5 h-3.5 ${isTestingStream ? 'animate-spin text-brand-400' : ''}`} />
                  <span>{isTestingStream ? 'Menguji Stream...' : '⚡ Uji Kelayakan Stream'}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={formVideoUrl}
                onChange={e => {
                  setFormVideoUrl(e.target.value);
                  setStreamHealthResult(null);
                }}
                placeholder="https://...mp4 atau .m3u8"
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-brand-500"
              />

              {/* Stream Health Inspector Result Card */}
              {streamHealthResult && (
                <div className={`p-2.5 rounded-xl border text-xs space-y-2 transition-all ${
                  streamHealthResult.status === 'healthy'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : streamHealthResult.status === 'cors_warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {streamHealthResult.status === 'healthy' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : streamHealthResult.status === 'cors_warning' ? (
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                      <span className="font-bold text-[11px]">
                        {streamHealthResult.status === 'healthy'
                          ? 'Stream Aktif & Siap Tayang'
                          : streamHealthResult.status === 'cors_warning'
                          ? 'Stream Terdeteksi (CORS Server)'
                          : 'Stream Gagal / Tidak Aktif'}
                      </span>
                    </div>
                    {streamHealthResult.latency > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/40 border border-white/10 text-slate-300">
                        ⚡ {streamHealthResult.latency}ms
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {streamHealthResult.details}
                  </p>
                  
                  <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsPreviewPlayerOpen(prev => !prev)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>{isPreviewPlayerOpen ? 'Tutup Pratinjau' : 'Buka Mini Player Uji'}</span>
                    </button>
                    <a
                      href={sanitizeUrl(formVideoUrl) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka URL Langsung</span>
                    </a>
                  </div>

                  {/* Mini Video Player Inspector */}
                  {isPreviewPlayerOpen && (
                    <div className="rounded-xl overflow-hidden bg-black border border-white/20 pt-1">
                      <video
                        controls
                        autoPlay
                        playsInline
                        className="w-full max-h-40 bg-black object-contain"
                        src={formVideoUrl}
                      />
                      <div className="px-2 py-1 bg-surface-900 text-[10px] text-slate-400 flex justify-between items-center">
                        <span>Pratinjau Sinkronisasi Video & Audio</span>
                        <span className="text-emerald-400 font-mono">Live Tester</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">URL Trailer Cuplikan (Opsional)</label>
              <input
                type="text"
                value={formTrailerUrl}
                onChange={e => setFormTrailerUrl(e.target.value)}
                placeholder="https://...mp4"
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Live Media & Backdrop Preview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-surface-800/60 border border-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
                <img
                  src={formPosterUrl}
                  alt="Poster Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Poster Preview (2:3)</span>
                <span className="text-xs font-bold text-white truncate block">{formTitle || 'Judul Tayangan'}</span>
                <span className="text-[10px] text-brand-400 font-mono truncate block">
                  {formReleaseYear} • {formQuality} • {formAgeRating}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-white/5 pt-2 sm:pt-0 sm:pl-3 min-w-0">
              <div className="w-24 aspect-video rounded-lg overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
                <img
                  src={formBackdropUrl || formPosterUrl}
                  alt="Backdrop Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Backdrop 16:9 Widescreen</span>
                <span className="text-xs font-medium text-slate-300 truncate block">{formTagline || formTitle || 'Pratinjau Layar Lebar'}</span>
                <span className="text-[10px] text-emerald-400 font-mono">16:9 Aspect Ratio</span>
              </div>
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
              <label className="font-semibold text-slate-300">Pemeran (Ringkasan Pisahkan Koma)</label>
              <input
                type="text"
                value={formCast}
                onChange={e => setFormCast(e.target.value)}
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                placeholder="Contoh: Simon Baker, Robin Tunney"
              />
            </div>
          </div>

          {/* Rich Cast & Characters Section Editor */}
          <div className="space-y-3 p-4 rounded-2xl bg-surface-800/60 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                <span className="font-semibold text-white text-sm">Daftar Aktor, Aktris & Karakter (Cast)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {formActors.length} Aktor
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newActor: CastMember = {
                    name: '',
                    character: '',
                    profileUrl: ''
                  };
                  setFormActors(prev => [...prev, newActor]);
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Aktor</span>
              </button>
            </div>

            {formActors.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                Belum ada data detail aktor. Tambahkan aktor baru di atas.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {formActors.map((actor, aIdx) => (
                  <div key={aIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 rounded-xl bg-surface-900/80 border border-white/5">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* Circular Avatar Preview */}
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-800 border border-white/10 flex-shrink-0 flex items-center justify-center">
                        {actor.profileUrl ? (
                          <img src={actor.profileUrl} alt={actor.name || 'Actor'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            {actor.name ? actor.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        )}
                      </div>

                      {/* Name Input */}
                      <input
                        type="text"
                        placeholder="Nama Aktor (cth: Simon Baker)"
                        value={actor.name}
                        onChange={e => {
                          const updated = [...formActors];
                          updated[aIdx] = { ...updated[aIdx], name: e.target.value };
                          setFormActors(updated);
                          setFormCast(updated.map(a => a.name).filter(Boolean).join(', '));
                        }}
                        className="flex-1 sm:w-40 bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    {/* Character Input */}
                    <input
                      type="text"
                      placeholder="Nama Karakter (cth: Patrick Jane)"
                      value={actor.character}
                      onChange={e => {
                        const updated = [...formActors];
                        updated[aIdx] = { ...updated[aIdx], character: e.target.value };
                        setFormActors(updated);
                      }}
                      className="flex-1 w-full bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />

                    {/* Profile Image URL Input */}
                    <input
                      type="text"
                      placeholder="URL Foto Avatar (https://...)"
                      value={actor.profileUrl || ''}
                      onChange={e => {
                        const updated = [...formActors];
                        updated[aIdx] = { ...updated[aIdx], profileUrl: e.target.value };
                        setFormActors(updated);
                      }}
                      className="flex-1 w-full sm:w-44 bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formActors.filter((_, idx) => idx !== aIdx);
                        setFormActors(updated);
                        setFormCast(updated.map(a => a.name).filter(Boolean).join(', '));
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors self-end sm:self-auto cursor-pointer"
                      title="Hapus Aktor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
            >
              Simpan Tayangan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
