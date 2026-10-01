import React from 'react';
import { 
  Megaphone, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  Film, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Search, 
  Plus, 
  History 
} from 'lucide-react';
import { MediaItem, BroadcastAnnouncement, AnnouncementType, ViewTab } from '../../../../types';

interface BannerModuleProps {
  broadcastAnnouncement: BroadcastAnnouncement;
  toggleBroadcastAnnouncement: () => void;
  announcementForm: {
    badge: string;
    title: string;
    description: string;
    actionText: string;
    type: AnnouncementType;
    targetTab: ViewTab;
  };
  setAnnouncementForm: React.Dispatch<React.SetStateAction<{
    badge: string;
    title: string;
    description: string;
    actionText: string;
    type: AnnouncementType;
    targetTab: ViewTab;
  }>>;
  handleSaveAnnouncement: () => void;
  isAnnouncementSaved: boolean;
  heroCarouselItems: MediaItem[];
  moveFeaturedItem: (id: string, direction: 'up' | 'down') => void;
  toggleFeaturedItem: (id: string) => void;
  bannerSearchTerm: string;
  setBannerSearchTerm: (val: string) => void;
  candidateForHero: MediaItem[];
  auditLogFilter: 'all' | 'media' | 'banner' | 'user' | 'tracking' | 'system';
  setAuditLogFilter: (filter: 'all' | 'media' | 'banner' | 'user' | 'tracking' | 'system') => void;
  clearAuditLogs: () => void;
  filteredAuditLogs: any[];
}

export const BannerModule: React.FC<BannerModuleProps> = ({
  broadcastAnnouncement,
  toggleBroadcastAnnouncement,
  announcementForm,
  setAnnouncementForm,
  handleSaveAnnouncement,
  isAnnouncementSaved,
  heroCarouselItems,
  moveFeaturedItem,
  toggleFeaturedItem,
  bannerSearchTerm,
  setBannerSearchTerm,
  candidateForHero,
  auditLogFilter,
  setAuditLogFilter,
  clearAuditLogs,
  filteredAuditLogs
}) => {
  return (
    <section className="space-y-6 animate-fade-in">
      
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-1">
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Pusat Siaran Pengumuman & Hero Carousel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Manajemen Banner & Urutan Hero Carousel</h2>
          <p className="text-xs text-slate-400">
            Atur pengumuman promo/event siaran langsung yang tampil di atas website penonton serta urutan film di slider utama beranda.
          </p>
        </div>

        {/* Quick Status Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleBroadcastAnnouncement}
            className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
              broadcastAnnouncement.isActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-white/10 text-slate-300 border border-white/10 hover:bg-white/15'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${broadcastAnnouncement.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>Banner Siaran: {broadcastAnnouncement.isActive ? 'Sedang Tayang' : 'Dinonaktifkan'}</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMN 1: Broadcast Announcement Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-surface-800/60 p-5 sm:p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Siaran Pengumuman / Running Text</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Tampil di bagian paling atas navbar penonton.
                </p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                broadcastAnnouncement.isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/10 text-slate-400'
              }`}>
                {broadcastAnnouncement.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pratinjau Nyata (Live Preview):
              </span>
              <div className={`p-2.5 rounded-2xl border border-white/15 text-xs text-white shadow-xl ${
                announcementForm.type === 'promo'
                  ? 'bg-gradient-to-r from-amber-600 via-brand-600 to-indigo-700'
                  : announcementForm.type === 'event'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700'
                  : announcementForm.type === 'info'
                  ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-700'
                  : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-700'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-white/20 text-white border border-white/30 truncate flex-shrink-0">
                      {announcementForm.badge || 'BADGE'}
                    </span>
                    <span className="font-bold text-xs truncate">
                      {announcementForm.title || 'Judul Pengumuman'}
                    </span>
                  </div>
                  {announcementForm.actionText && (
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-bold flex-shrink-0">
                      {announcementForm.actionText}
                    </span>
                  )}
                </div>
                {announcementForm.description && (
                  <p className="text-[10px] text-white/80 mt-1 line-clamp-1">
                    {announcementForm.description}
                  </p>
                )}
              </div>
            </div>

            {/* Editor Form */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Gaya & Tema Warna Banner
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'promo', label: 'Promo VIP (Gold)', bg: 'bg-gradient-to-r from-amber-600 to-brand-600' },
                    { id: 'event', label: 'Event Rilis (Hijau)', bg: 'bg-gradient-to-r from-emerald-600 to-teal-600' },
                    { id: 'info', label: 'Info Sistem (Biru)', bg: 'bg-gradient-to-r from-brand-600 to-blue-600' },
                    { id: 'alert', label: 'Pemberitahuan (Merah)', bg: 'bg-gradient-to-r from-rose-600 to-pink-600' },
                  ].map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setAnnouncementForm(prev => ({ ...prev, type: theme.id as any }))}
                      className={`p-2 rounded-xl text-left text-xs font-semibold text-white border transition-all cursor-pointer ${
                        announcementForm.type === theme.id
                          ? 'border-white ring-2 ring-white/30 scale-[1.02] ' + theme.bg
                          : 'border-white/10 bg-surface-900/80 hover:border-white/20'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Teks Badge
                </label>
                <input
                  type="text"
                  value={announcementForm.badge}
                  onChange={e => setAnnouncementForm(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="Contoh: PROMO SPESIAL, RILIS EKSKLUSIF"
                  className="w-full bg-surface-900 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={e => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Diskon 50% Langganan VIP Ultra Akhir Pekan Ini"
                  className="w-full bg-surface-900 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Keterangan / Subtitle Lengkap
                </label>
                <textarea
                  rows={2}
                  value={announcementForm.description}
                  onChange={e => setAnnouncementForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Contoh: Buka tayangan 4K UHD, audio Dolby Atmos, dan tonton bebas iklan di 4 perangkat."
                  className="w-full bg-surface-900 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Teks Tombol Aksi
                  </label>
                  <input
                    type="text"
                    value={announcementForm.actionText}
                    onChange={e => setAnnouncementForm(prev => ({ ...prev, actionText: e.target.value }))}
                    placeholder="Contoh: Klaim Sekarang"
                    className="w-full bg-surface-900 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Halaman Tujuan
                  </label>
                  <select
                    value={announcementForm.targetTab}
                    onChange={e => setAnnouncementForm(prev => ({ ...prev, targetTab: e.target.value as any }))}
                    className="w-full bg-surface-900 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="home">Beranda</option>
                    <option value="movies">Katalog Film</option>
                    <option value="tv">Serial TV</option>
                    <option value="trending">Trending</option>
                    <option value="watchlist">Koleksi Saya</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveAnnouncement}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAnnouncementSaved ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Berhasil Disimpan & Diterbitkan!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Simpan & Terapkan Banner</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Hero Carousel Slider Manager (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-surface-800/60 p-5 sm:p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <Film className="w-4 h-4 text-brand-400" />
                  <span>Urutan Film di Hero Banner Beranda</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Film pada posisi #1 akan otomatis tampil pertama saat penonton membuka website.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {heroCarouselItems.length} Film Aktif
              </span>
            </div>

            {/* Ordered List of Carousel Items */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
              {heroCarouselItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-surface-900/90 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Position Badge */}
                    <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 ${
                      index === 0
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                        : 'bg-surface-800 text-slate-300 border border-white/10'
                    }`}>
                      #{index + 1}
                    </div>

                    {/* Thumbnail */}
                    <img
                      src={item.backdropUrl || item.posterUrl}
                      alt={item.title}
                      className="w-16 h-10 object-cover rounded-lg flex-shrink-0 shadow border border-white/10"
                    />

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-brand-400 transition-colors">
                          {item.title}
                        </h4>
                        {index === 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            UTAMA
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{item.releaseYear}</span>
                        <span>•</span>
                        <span className="capitalize">{item.type === 'movie' ? 'Film' : 'Serial'}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">★ {item.rating}</span>
                        <span>•</span>
                        <span className="truncate max-w-[120px]">{item.genres.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reorder and Remove Controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      disabled={index === 0}
                      onClick={() => moveFeaturedItem(item.id, 'up')}
                      className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 disabled:opacity-30 disabled:hover:bg-surface-800 text-slate-200 transition-colors cursor-pointer"
                      title="Geser Naik"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === heroCarouselItems.length - 1}
                      onClick={() => moveFeaturedItem(item.id, 'down')}
                      className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 disabled:opacity-30 disabled:hover:bg-surface-800 text-slate-200 transition-colors cursor-pointer"
                      title="Geser Turun"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleFeaturedItem(item.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors ml-1 cursor-pointer"
                      title="Keluarkan dari Hero Banner"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Media to Hero Banner Section */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-300">
                  Tambahkan Film Lain ke Hero Banner:
                </span>
                <div className="relative w-44">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={bannerSearchTerm}
                    onChange={e => setBannerSearchTerm(e.target.value)}
                    placeholder="Cari judul film..."
                    className="w-full bg-surface-900 border border-white/10 rounded-xl pl-7 pr-2.5 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {candidateForHero.slice(0, 6).map(cand => (
                  <div
                    key={cand.id}
                    className="p-2 rounded-xl bg-surface-900 border border-white/5 flex items-center justify-between gap-2 hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={cand.posterUrl}
                        alt={cand.title}
                        className="w-7 h-10 object-cover rounded flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{cand.title}</p>
                        <span className="text-[10px] text-slate-400">★ {cand.rating} • {cand.releaseYear}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeaturedItem(cand.id)}
                      className="px-2 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm flex-shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Pin</span>
                    </button>
                  </div>
                ))}
                {candidateForHero.length === 0 && (
                  <div className="col-span-2 text-center py-4 text-xs text-slate-500">
                    Semua film sudah ada di carousel atau tidak cocok dengan pencarian.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Section 3: Audit Trail Log Aktivitas Admin */}
      <div className="bg-surface-800/60 p-5 sm:p-6 rounded-3xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Log Rekam Jejak Aktivitas Administrator (Audit Trail)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Mencatat seluruh aksi admin (tambah konten, ubah banner, ekspor data, reset cookie) secara transparan demi keamanan sistem.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Category */}
            <div className="flex items-center gap-1 bg-surface-900 border border-white/10 p-1 rounded-xl text-xs">
              {(['all', 'banner', 'media', 'system'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setAuditLogFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg capitalize text-[10px] font-bold transition-colors cursor-pointer ${
                    auditLogFilter === cat ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'Semua' : cat}
                </button>
              ))}
            </div>

            <button
              onClick={clearAuditLogs}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 text-[10px] font-bold transition-colors cursor-pointer"
            >
              Bersihkan Log
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Aktor Administrator</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Tindakan / Aksi</th>
                <th className="py-2.5 px-3">Detail & Keterangan</th>
                <th className="py-2.5 px-3 text-right">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAuditLogs.slice(0, 10).map(log => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-white">{log.actor}</div>
                    <div className="text-[10px] text-slate-400">{log.actorEmail}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.category === 'banner'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : log.category === 'media'
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                        : log.category === 'tracking'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl truncate">
                    {log.detail}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
              {filteredAuditLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                    Belum ada aktivitas admin yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
};
