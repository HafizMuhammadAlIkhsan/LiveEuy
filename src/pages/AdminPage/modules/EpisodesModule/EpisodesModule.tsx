import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { MediaItem } from '../../../../types';

interface EpisodesModuleProps {
  seriesList: MediaItem[];
  selectedSeriesId: string;
  setSelectedSeriesId: (id: string) => void;
  activeSeries: MediaItem | undefined;
  setEpSeasonNumber: (num: number) => void;
  setEpNumber: (num: number) => void;
  setIsEpisodeModalOpen: (open: boolean) => void;
  handleDeleteEpisode: (epId: string, seasonNumber: number) => void;
}

export const EpisodesModule: React.FC<EpisodesModuleProps> = ({
  seriesList,
  selectedSeriesId,
  setSelectedSeriesId,
  activeSeries,
  setEpSeasonNumber,
  setEpNumber,
  setIsEpisodeModalOpen,
  handleDeleteEpisode
}) => {
  return (
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
                className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                      {season.episodes.map(ep => (
                        <div key={ep.id} className="p-3 rounded-xl bg-surface-800/80 border border-white/5 flex gap-3 items-center group relative hover:border-white/20 transition-all">
                          <img src={ep.thumbnail} alt={ep.title} className="w-20 aspect-video rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-white group-hover:text-brand-400 truncate">
                              Ep {ep.episodeNumber}: {ep.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 block">{ep.duration}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus episode "${ep.title}" dari musim ${season.seasonNumber}?`)) {
                                handleDeleteEpisode(ep.id, season.seasonNumber);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 cursor-pointer"
                            title="Hapus Episode"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
  );
};
