import React from 'react';
import { X, Database, AlertCircle } from 'lucide-react';
import { PendingRestoreData } from '../../types';

interface RestoreCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingRestoreData: PendingRestoreData | null;
  allMediaLength: number;
  restoreMode: 'merge' | 'replace';
  setRestoreMode: (mode: 'merge' | 'replace') => void;
  onConfirmRestore: () => void;
}

export const RestoreCatalogModal: React.FC<RestoreCatalogModalProps> = ({
  isOpen,
  onClose,
  pendingRestoreData,
  allMediaLength,
  restoreMode,
  setRestoreMode,
  onConfirmRestore
}) => {
  if (!isOpen || !pendingRestoreData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-surface-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Pulihkan Katalog Media</h3>
            <p className="text-xs text-slate-400">File: <span className="text-brand-300 font-mono font-medium">{pendingRestoreData.fileName}</span></p>
          </div>
        </div>

        {/* Stats preview */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface-800/60 border border-white/5 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Tayangan Terverifikasi</span>
            <span className="text-lg font-black text-emerald-400">{pendingRestoreData.items.length} Tayangan</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Katalog Aktif Saat Ini</span>
            <span className="text-lg font-black text-slate-300">{allMediaLength} Tayangan</span>
          </div>
        </div>

        {/* Security Filter Alert */}
        {Boolean(pendingRestoreData.rejectedCount && pendingRestoreData.rejectedCount > 0) && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="leading-relaxed">
              <strong>Filter Keamanan:</strong> <span className="font-bold underline">{pendingRestoreData.rejectedCount} item</span> ditolak dan disaring otomatis karena URL tidak aman (protokol berbahaya) atau data tidak lengkap.
            </span>
          </div>
        )}

        {/* Mode Selection */}
        <div className="space-y-2 text-xs">
          <label className="font-bold text-white block">Pilih Metode Pemulihan:</label>
          
          <label
            onClick={() => setRestoreMode('merge')}
            className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
              restoreMode === 'merge'
                ? 'bg-brand-500/10 border-brand-500/40 text-white'
                : 'bg-surface-800/40 border-white/5 text-slate-300 hover:bg-white/5'
            }`}
          >
            <input
              type="radio"
              name="restoreMode"
              checked={restoreMode === 'merge'}
              onChange={() => setRestoreMode('merge')}
              className="mt-0.5 text-brand-600 focus:ring-0"
            />
            <div>
              <span className="font-bold block text-sm">Gabungkan (Merge) - Direkomendasikan</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Menambahkan tayangan baru dan memperbarui data tayangan dengan ID serupa tanpa menghapus tayangan lain yang sudah ada.
              </p>
            </div>
          </label>

          <label
            onClick={() => setRestoreMode('replace')}
            className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
              restoreMode === 'replace'
                ? 'bg-rose-500/10 border-rose-500/40 text-white'
                : 'bg-surface-800/40 border-white/5 text-slate-300 hover:bg-white/5'
            }`}
          >
            <input
              type="radio"
              name="restoreMode"
              checked={restoreMode === 'replace'}
              onChange={() => setRestoreMode('replace')}
              className="mt-0.5 text-rose-600 focus:ring-0"
            />
            <div>
              <span className="font-bold block text-sm text-rose-300">Timpa Seluruhnya (Overwrite)</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Menghapus seluruh katalog aktif saat ini dan menggantikannya sepenuhnya dengan {pendingRestoreData.items.length} tayangan dari file cadangan ini.
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirmRestore}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
          >
            Konfirmasi Pulihkan Katalog
          </button>
        </div>
      </div>
    </div>
  );
};
