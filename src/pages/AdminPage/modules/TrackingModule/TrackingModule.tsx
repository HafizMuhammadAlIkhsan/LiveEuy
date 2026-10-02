import React from 'react';
import { 
  Cookie, 
  Download, 
  RefreshCw, 
  RotateCcw, 
  Smartphone, 
  Tablet as TabletIcon, 
  Monitor, 
  Globe, 
  Copy, 
  Search 
} from 'lucide-react';
import { VisitorSession } from '../../../../types';
import { getOSBadge } from '../../utils';

interface TrackingModuleProps {
  exportTrackingCSV: () => void;
  refreshTracking: () => void;
  resetTracking: () => void;
  showToast: (msg: string) => void;
  currentSession: VisitorSession | null;
  copyCookieToken: (token: string) => void;
  trackingSearch: string;
  setTrackingSearch: (val: string) => void;
  trackingFilterOS: 'all' | 'macOS' | 'Windows' | 'iOS' | 'Android';
  setTrackingFilterOS: (val: 'all' | 'macOS' | 'Windows' | 'iOS' | 'Android') => void;
  filteredTracking: VisitorSession[];
}

export const TrackingModule: React.FC<TrackingModuleProps> = ({
  exportTrackingCSV,
  refreshTracking,
  resetTracking,
  showToast,
  currentSession,
  copyCookieToken,
  trackingSearch,
  setTrackingSearch,
  trackingFilterOS,
  setTrackingFilterOS,
  filteredTracking
}) => {
  return (
    <section className="space-y-6 animate-fade-in">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-500/20 text-secondary-300 border border-secondary-500/30 text-xs font-bold mb-1">
            <Cookie className="w-3.5 h-3.5" />
            <span>Pelacak Cookie Sesi & Perangkat Real-Time</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Pelacakan Cookie, Alamat IP & Perangkat Pengunjung
          </h3>
          <p className="text-xs text-slate-400">
            Memantau cookie sesi pengunjung (365 hari), alamat IP publik, jenis perangkat (Desktop/HP/Tablet), dan sistem operasi (OS).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportTrackingCSV}
            className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-2 transition-all shadow hover:scale-105 active:scale-95 cursor-pointer"
            title="Ekspor seluruh daftar sesi cookie dan alamat IP pengunjung ke file CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Log CSV</span>
          </button>

          <button
            onClick={() => {
              refreshTracking();
              showToast('Data pelacakan perangkat dan IP berhasil diperbarui!');
            }}
            className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Perbarui Data (Refresh)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Yakin ingin mereset cookie pelacak perangkat ini? Token cookie baru akan dibuat secara otomatis.')) {
                resetTracking();
                showToast('Cookie pelacak berhasil direset dan dibuat ulang!');
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-2 border border-rose-500/30 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Cookie Saya</span>
          </button>
        </div>
      </div>

      {/* Current Device Live Card */}
      {currentSession && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-brand-950 via-surface-900 to-secondary-950/40 border border-brand-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Perangkat Anda Saat Ini (Live Sesi Terlacak)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 flex-shrink-0">
                  {currentSession.deviceType === 'Mobile' ? (
                    <Smartphone className="w-6 h-6" />
                  ) : currentSession.deviceType === 'Tablet' ? (
                    <TabletIcon className="w-6 h-6" />
                  ) : (
                    <Monitor className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    {currentSession.os} • {currentSession.browser}
                  </h4>
                  <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                    <span>Tipe: <strong className="text-white">{currentSession.deviceType}</strong></span>
                    <span>•</span>
                    <span>Resolusi: <strong className="text-white font-mono">{currentSession.screenResolution}</strong></span>
                    <span>•</span>
                    <span>Bahasa: <strong className="text-white font-mono">{currentSession.language}</strong></span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right side live details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-1/2">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Alamat IP Terlacak</span>
                <span className="text-sm font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  {currentSession.ipAddress}
                </span>
                <span className="text-[10px] text-slate-400 block">{currentSession.city}, {currentSession.country}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Cookie Token Sesi</span>
                  <button
                    onClick={() => copyCookieToken(currentSession.cookieToken)}
                    className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 font-bold cursor-pointer"
                    title="Salin Cookie Token"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </button>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 block truncate" title={currentSession.cookieToken}>
                  {currentSession.cookieToken}
                </span>
                <span className="text-[10px] text-slate-400 block">Masa Aktif: 365 Hari (SameSite=Lax)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-800/60 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={trackingSearch}
            onChange={e => setTrackingSearch(e.target.value)}
            placeholder="Cari IP, Cookie Token, OS, atau Browser..."
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-surface-900/90 p-1 rounded-xl border border-white/5 text-xs">
          {[
            { id: 'all', label: 'Semua OS' },
            { id: 'macOS', label: 'macOS' },
            { id: 'Windows', label: 'Windows' },
            { id: 'iOS', label: 'iOS' },
            { id: 'Android', label: 'Android' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setTrackingFilterOS(opt.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                trackingFilterOS === opt.id ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visitor Sessions Table */}
      <div className="rounded-3xl bg-surface-800/40 border border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-surface-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Pengunjung / Sesi Cookie</th>
              <th className="py-3.5 px-3">Alamat IP & Lokasi</th>
              <th className="py-3.5 px-3">Sistem Operasi (OS)</th>
              <th className="py-3.5 px-3">Tipe Device</th>
              <th className="py-3.5 px-3">Browser & Resolusi</th>
              <th className="py-3.5 px-3">Halaman Terakhir</th>
              <th className="py-3.5 px-4 text-right">Aktivitas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTracking.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Monitor className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="font-bold text-white text-sm">Tidak ada sesi ditemukan</p>
                    <p className="text-xs">Coba ubah filter OS atau kata kunci pencarian.</p>
                    <button
                      type="button"
                      onClick={() => { setTrackingSearch(''); setTrackingFilterOS('all'); }}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md mt-2 cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTracking.map(sess => {
                const osBadge = getOSBadge(sess.os);
                return (
                  <tr
                    key={sess.sessionId}
                    className={`transition-colors ${
                      sess.isCurrentDevice ? 'bg-brand-600/10 hover:bg-brand-600/15' : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Cookie & User */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-white truncate max-w-[150px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-[320px] xl:max-w-[400px] block" title={sess.cookieToken}>
                            {sess.cookieToken}
                          </span>
                          <button
                            onClick={() => copyCookieToken(sess.cookieToken)}
                            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                            title="Salin Cookie Token"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {sess.isCurrentDevice && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Perangkat Ini
                            </span>
                          )}
                          {sess.userEmail ? (
                            <span className="text-[10px] text-brand-400 font-semibold">{sess.userEmail}</span>
                          ) : (
                            <span className="text-[10px] text-slate-500">Tamu (Guest)</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-cyan-300 block">{sess.ipAddress}</span>
                        <span className="text-[10px] text-slate-400 block">{sess.city || 'Indonesia'}</span>
                      </div>
                    </td>

                    {/* OS */}
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border inline-flex items-center gap-1.5 ${osBadge.bg}`}>
                        {sess.os}
                      </span>
                    </td>

                    {/* Device Type */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-200">
                        {sess.deviceType === 'Mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                        ) : sess.deviceType === 'Tablet' ? (
                          <TabletIcon className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        <span>{sess.deviceType}</span>
                      </span>
                    </td>

                    {/* Browser & Resolution */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="text-xs text-white block">{sess.browser}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{sess.screenResolution}</span>
                      </div>
                    </td>

                    {/* Active Page */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 uppercase">
                        {sess.currentPage}
                      </span>
                    </td>

                    {/* Last Active */}
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs text-slate-400 block">{sess.lastActive}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
