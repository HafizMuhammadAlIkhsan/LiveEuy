import React from 'react';
import { 
  Search, 
  Download, 
  Upload, 
  Flame, 
  Trash2, 
  Star, 
  Play, 
  Edit3 
} from 'lucide-react';
import { MediaItem } from '../../../../types';

interface MediaModuleProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: 'all' | 'movie' | 'tv';
  setFilterType: (type: 'all' | 'movie' | 'tv') => void;
  selectedMediaIds: string[];
  handleExportCatalog: () => void;
  jsonFileInputRef: React.RefObject<HTMLInputElement | null> | React.RefObject<HTMLInputElement>;
  handleFileSelectForRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBatchSetTrending: () => void;
  handleExportSelected: () => void;
  handleBatchDelete: () => void;
  handleClearSelection: () => void;
  filteredAdminMedia: MediaItem[];
  isAllVisibleMediaSelected: boolean;
  isPartiallySelected: boolean;
  handleToggleSelectAll: () => void;
  handleToggleSelectOne: (id: string) => void;
  updateMedia: (id: string, updates: Partial<MediaItem>) => void;
  deleteMedia: (id: string) => void;
  openDetail: (item: MediaItem) => void;
  openEditModal: (item: MediaItem) => void;
  showToast: (msg: string) => void;
}

export const MediaModule: React.FC<MediaModuleProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  selectedMediaIds,
  handleExportCatalog,
  jsonFileInputRef,
  handleFileSelectForRestore,
  handleBatchSetTrending,
  handleExportSelected,
  handleBatchDelete,
  handleClearSelection,
  filteredAdminMedia,
  isAllVisibleMediaSelected,
  isPartiallySelected,
  handleToggleSelectAll,
  handleToggleSelectOne,
  updateMedia,
  deleteMedia,
  openDetail,
  openEditModal,
  showToast
}) => {
  return (
    <section className="space-y-4">
      {/* Filter & Action Toolbar */}
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

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5 text-xs">
            {[
              { id: 'all', label: 'Semua Format' },
              { id: 'movie', label: 'Film Saja' },
              { id: 'tv', label: 'Serial TV' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setFilterType(opt.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                  filterType === opt.id ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Backup & Restore Action Buttons */}
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-2">
            <button
              type="button"
              onClick={handleExportCatalog}
              className="px-3 py-1.5 rounded-xl bg-surface-900/90 hover:bg-surface-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
              title="Unduh cadangan seluruh katalog ke format file JSON"
            >
              <Download className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">Cadangkan JSON</span>
            </button>

            <button
              type="button"
              onClick={() => jsonFileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-surface-900/90 hover:bg-surface-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
              title="Pulihkan katalog dari file cadangan JSON"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Pulihkan JSON</span>
            </button>
            <input
              ref={jsonFileInputRef as any}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelectForRestore}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Toolbar */}
      {selectedMediaIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-brand-950/90 via-surface-900 to-brand-950/90 border border-brand-500/40 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-white">
              <span className="text-brand-300 font-mono font-black">{selectedMediaIds.length}</span> tayangan dipilih dari katalog
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={handleBatchSetTrending}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Tandai seluruh tayangan terpilih sebagai trending"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Set Trending</span>
            </button>
            <button
              type="button"
              onClick={handleExportSelected}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Ekspor hanya tayangan terpilih ke JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Pilihan</span>
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white font-bold border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Hapus permanen tayangan terpilih secara massal"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedMediaIds.length})</span>
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Media Table */}
      <div className="rounded-3xl bg-surface-800/40 border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-surface-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10">
            <tr>
              <th className="py-3.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllVisibleMediaSelected}
                  ref={el => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onChange={handleToggleSelectAll}
                  className="rounded bg-surface-900 border-white/20 text-brand-600 focus:ring-0 cursor-pointer"
                  title="Pilih / Batalkan semua tayangan"
                />
              </th>
              <th className="py-3.5 px-4">Tayangan</th>
              <th className="py-3.5 px-3">Tipe</th>
              <th className="py-3.5 px-3">Rating</th>
              <th className="py-3.5 px-3">Status Sorotan</th>
              <th className="py-3.5 px-3">Kualitas</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAdminMedia.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Search className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="font-bold text-white text-sm">Tidak ada tayangan ditemukan</p>
                    <p className="text-xs">Coba ubah kata kunci pencarian atau ganti filter format.</p>
                    <button
                      type="button"
                      onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md mt-2 cursor-pointer"
                    >
                      Reset Pencarian
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAdminMedia.map(item => (
                <tr key={item.id} className={`transition-colors ${
                  selectedMediaIds.includes(item.id) ? 'bg-brand-900/25 hover:bg-brand-900/35' : 'hover:bg-white/5'
                }`}>
                  {/* Select Checkbox */}
                  <td className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedMediaIds.includes(item.id)}
                      onChange={() => handleToggleSelectOne(item.id)}
                      className="rounded bg-surface-900 border-white/20 text-brand-600 focus:ring-0 cursor-pointer"
                    />
                  </td>
                  {/* Media item info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-10 h-14 object-cover rounded-lg flex-shrink-0 shadow"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-white truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">{item.title}</h4>
                        <span className="text-[11px] text-slate-400 block">
                          {item.releaseYear} • {item.country ? `${item.country} • ` : ''}{item.director}
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
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
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
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
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
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Pratinjau Detail"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white transition-colors cursor-pointer"
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
                        className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors cursor-pointer"
                        title="Hapus Tayangan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
