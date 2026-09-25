import React, { useState } from 'react';
import { useWatch } from '../context/WatchContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Monitor, 
  Tv, 
  LogOut, 
  X, 
  MapPin, 
  Globe, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Lock,
  Layers
} from 'lucide-react';
import { VisitorSession } from '../types';

export const DeviceSecurityModal: React.FC = () => {
  const { 
    isDeviceSecurityOpen, 
    closeDeviceSecurityModal, 
    user, 
    visitorSessions, 
    currentSession, 
    logoutDevice, 
    logoutAllDevices,
    logout
  } = useWatch();

  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const [includeCurrentDevice, setIncludeCurrentDevice] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isDeviceSecurityOpen) return null;

  // Filter sessions that belong to this user or are tracked in the browser
  const userSessions = visitorSessions.length > 0 
    ? visitorSessions 
    : (currentSession ? [currentSession] : []);

  // Separate current device vs other devices
  const thisDevice = currentSession || userSessions.find(s => s.isCurrentDevice) || userSessions[0];
  const otherDevices = userSessions.filter(s => s.sessionId !== thisDevice?.sessionId);

  // Helper icon by device type
  const renderDeviceIcon = (type: string, className = 'w-5 h-5') => {
    switch (type?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className={className} />;
      case 'tablet':
        return <Tablet className={className} />;
      case 'tv':
        return <Tv className={className} />;
      case 'desktop':
      default:
        return <Laptop className={className} />;
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusNotification({ message, type });
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  };

  const handleRevokeSingle = async (session: VisitorSession) => {
    if (session.isCurrentDevice || session.sessionId === thisDevice?.sessionId) {
      if (window.confirm('Keluar dari sesi perangkat ini sekarang?')) {
        logout();
        closeDeviceSecurityModal();
      }
      return;
    }

    setIsProcessing(true);
    try {
      const res = await logoutDevice(session.sessionId);
      showNotification(res.message, 'success');
    } catch {
      showNotification('Gagal mengeluarkan perangkat. Silakan coba lagi.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmLogoutAll = async () => {
    setIsProcessing(true);
    try {
      const res = await logoutAllDevices(includeCurrentDevice);
      showNotification(res.message, 'success');
      setConfirmAllOpen(false);
      if (includeCurrentDevice) {
        setTimeout(() => {
          closeDeviceSecurityModal();
        }, 1200);
      }
    } catch {
      showNotification('Gagal memproses logout semua perangkat. Silakan coba lagi.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const maxDevices = user?.tier === 'VIP Cinema Ultra' ? 4 : user?.tier === 'VIP Standard' ? 2 : 1;
  const currentCount = Math.max(1, userSessions.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-surface-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-surface-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Kelola Perangkat & Keamanan</span>
              </h2>
              <p className="text-xs text-slate-400">
                Pantau seluruh sesi aktif dan kendalikan akses login akun LiveEuy Anda.
              </p>
            </div>
          </div>
          <button
            onClick={closeDeviceSecurityModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Notification Banner */}
          {statusNotification && (
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm animate-fade-in ${
              statusNotification.type === 'success' 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}>
              {statusNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              )}
              <span className="font-medium">{statusNotification.message}</span>
            </div>
          )}

          {/* Account & Device Quota Overview Card */}
          <div className="bg-gradient-to-br from-surface-800/80 via-surface-800/50 to-surface-900 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'User'}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/20 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm sm:text-base">{user?.name || 'Pengguna LiveEuy'}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {user?.tier || 'VIP Standard'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{user?.email || 'user@liveeuy.id'}</p>
                </div>
              </div>

              {/* Device Quota Progress */}
              <div className="bg-surface-950/70 p-3 rounded-xl border border-white/5 space-y-1.5 min-w-[180px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Kuota Perangkat</span>
                  </span>
                  <span className="font-bold text-white font-mono">
                    {currentCount} / {maxDevices}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentCount >= maxDevices ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, (currentCount / maxDevices) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {currentCount >= maxDevices 
                    ? 'Batas maksimal perangkat paket VIP tercapai' 
                    : `Sisa ${maxDevices - currentCount} slot perangkat tersedia`}
                </p>
              </div>
            </div>

            {/* Security Tip */}
            <div className="mt-4 pt-3.5 border-t border-white/5 flex items-start gap-2.5 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p>
                Akun LiveEuy dilindungi arsitektur <strong>Dual-Token JWT & Refresh Token Rotation</strong>. Sesi disimpan dengan aman dan token lama langsung dibatalkan otomatis saat rotasi untuk mencegah duplikasi sesi.
              </p>
            </div>
          </div>

          {/* Action Callout: Logout dari Semua Device */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h4 className="font-bold text-white text-sm">Amankan Akun Anda</h4>
              </div>
              <p className="text-xs text-rose-200/80 leading-relaxed">
                Melihat aktivitas mencurigakan atau baru saja login di perangkat umum? Logout seketika dari seluruh perangkat lain untuk mencabut semua sesi aktif.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIncludeCurrentDevice(false);
                  setConfirmAllOpen(true);
                }}
                disabled={isProcessing || otherDevices.length === 0}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Keluarkan Perangkat Lain
              </button>

              <button
                type="button"
                onClick={() => {
                  setIncludeCurrentDevice(true);
                  setConfirmAllOpen(true);
                }}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout Semua Device</span>
              </button>
            </div>
          </div>

          {/* Device List Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Perangkat yang Sedang Aktif ({userSessions.length})</span>
              <span className="text-[10px] lowercase text-slate-500">diperbarui realtime</span>
            </h4>

            {/* 1. CURRENT DEVICE CARD */}
            {thisDevice && (
              <div className="p-4 rounded-2xl bg-surface-800/80 border-2 border-emerald-500/40 relative shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      {renderDeviceIcon(thisDevice.deviceType)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-bold text-white text-sm">
                          {thisDevice.browser} di {thisDevice.os}
                        </h5>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Perangkat Ini (Aktif Sekarang)</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-cyan-300">
                          <Globe className="w-3 h-3 text-slate-500" />
                          {thisDevice.ipAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {thisDevice.city || 'Jakarta'}, {thisDevice.country || 'Indonesia'}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-500">
                          <Monitor className="w-3 h-3 text-slate-500" />
                          {thisDevice.screenResolution}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevokeSingle(thisDevice)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Keluar dari sesi ini"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. OTHER DEVICES CARDS */}
            {otherDevices.length === 0 ? (
              <div className="p-6 rounded-2xl bg-surface-800/30 border border-white/5 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400/60 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Tidak ada perangkat lain yang terhubung</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Akun Anda saat ini hanya aktif di browser/perangkat ini. Tidak ada sesi lain yang terdeteksi.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {otherDevices.map(device => (
                  <div 
                    key={device.sessionId}
                    className="p-3.5 sm:p-4 rounded-2xl bg-surface-800/50 hover:bg-surface-800/80 border border-white/5 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/5 text-slate-300 border border-white/10 flex items-center justify-center flex-shrink-0">
                        {renderDeviceIcon(device.deviceType)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-white text-xs sm:text-sm truncate">
                            {device.browser} • {device.os}
                          </h5>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-slate-400 font-mono">
                            {device.deviceType}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                          <span className="font-mono text-cyan-300/80">{device.ipAddress}</span>
                          <span>•</span>
                          <span>{device.city || 'Indonesia'}, {device.country || 'ID'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{device.lastActive}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeSingle(device)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all flex items-center gap-1 flex-shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Keluarkan</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-surface-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-brand-400" />
            <span>Riwayat sesi diperbarui saat berpindah halaman atau login baru.</span>
          </span>
          <button
            onClick={closeDeviceSecurityModal}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
          >
            Selesai
          </button>
        </div>

        {/* CONFIRMATION MODAL OVERLAY */}
        {confirmAllOpen && (
          <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface-900 border border-rose-500/30 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {includeCurrentDevice 
                    ? 'Logout dari SEMUA Perangkat?' 
                    : 'Keluarkan Semua Perangkat Lain?'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {includeCurrentDevice ? (
                    'Tindakan ini akan mengakhiri seluruh sesi login di smartphone, tablet, laptop, smart TV, dan browser ini. Semua token autentikasi akan dicabut di backend. Anda harus login kembali.'
                  ) : (
                    'Seluruh sesi perangkat lain (smartphone, tablet, laptop lain) akan dicabut seketika. Sesi pada perangkat dan browser yang Anda gunakan saat ini akan tetap aktif.'
                  )}
                </p>
              </div>

              {/* Toggle option */}
              <div className="bg-surface-950/60 p-3 rounded-2xl border border-white/5 space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCurrentDevice}
                    onChange={e => setIncludeCurrentDevice(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-surface-800 text-rose-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Keluarkan juga dari perangkat & browser ini sekarang</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmAllOpen(false)}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLogoutAll}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-xs font-bold text-white shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Ya, Logout Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
