import React from 'react';
import { X } from 'lucide-react';
import { MediaItem } from '../../../../types';

interface EpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSeries: MediaItem | undefined;
  epSeasonNumber: number;
  setEpSeasonNumber: (num: number) => void;
  epNumber: number;
  setEpNumber: (num: number) => void;
  epTitle: string;
  setEpTitle: (title: string) => void;
  epDuration: string;
  setEpDuration: (dur: string) => void;
  epOverview: string;
  setEpOverview: (overview: string) => void;
  epThumbnail: string;
  setEpThumbnail: (url: string) => void;
  epVideoUrl: string;
  setEpVideoUrl: (url: string) => void;
  onAddEpisode: (e: React.FormEvent) => void;
}

export const EpisodeModal: React.FC<EpisodeModalProps> = ({
  isOpen,
  onClose,
  activeSeries,
  epSeasonNumber,
  setEpSeasonNumber,
  epNumber,
  setEpNumber,
  epTitle,
  setEpTitle,
  epDuration,
  setEpDuration,
  epOverview,
  setEpOverview,
  epThumbnail,
  setEpThumbnail,
  onAddEpisode
}) => {
  if (!isOpen || !activeSeries) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg lg:max-w-2xl xl:max-w-3xl rounded-3xl bg-surface-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-black text-white">
          Tambah Episode Baru: {activeSeries.title}
        </h3>

        <form onSubmit={onAddEpisode} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Nomor Musim</label>
              <input
                type="number"
                min="1"
                value={epSeasonNumber}
                onChange={e => setEpSeasonNumber(Number(e.target.value))}
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Nomor Episode</label>
              <input
                type="number"
                min="1"
                value={epNumber}
                onChange={e => setEpNumber(Number(e.target.value))}
                className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
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
              className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Durasi (misal: 48m)</label>
            <input
              type="text"
              value={epDuration}
              onChange={e => setEpDuration(e.target.value)}
              className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Sinopsis Episode</label>
            <textarea
              rows={2}
              value={epOverview}
              onChange={e => setEpOverview(e.target.value)}
              className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">URL Thumbnail Episode (16:9)</label>
            <input
              type="text"
              value={epThumbnail}
              onChange={e => setEpThumbnail(e.target.value)}
              className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          {/* Live 16:9 Thumbnail Preview */}
          {epThumbnail && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-800/60 border border-white/5">
              <div className="w-24 aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
                <img
                  src={epThumbnail}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'; }}
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Preview Thumbnail 16:9</span>
                <span className="text-xs font-bold text-white truncate block">{epTitle || 'Judul Episode'}</span>
                <span className="text-[10px] text-brand-400 font-mono">Musim {epSeasonNumber} • Ep {epNumber} • {epDuration || '45m'}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold cursor-pointer transition-colors"
            >
              Simpan Episode
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
