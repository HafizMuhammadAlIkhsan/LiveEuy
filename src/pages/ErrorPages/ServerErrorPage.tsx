import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Server, RefreshCw, Home, AlertTriangle, ShieldCheck, Activity, Film } from 'lucide-react';

export const ServerErrorPage: React.FC = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<string | null>(null);

  const handleTestConnection = () => {
    setIsRetrying(true);
    setRetryResult(null);

    setTimeout(() => {
      setIsRetrying(false);
      setRetryResult('Mencoba menyambungkan kembali ke backend... Silakan refresh halaman.');
    }, 1200);
  };

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 my-auto animate-fade-in">
      <div className="relative max-w-lg w-full bg-[#0d0f17]/95 border border-rose-500/25 rounded-3xl p-6 sm:p-10 text-center shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Ambient Red & Orange Neon Glows */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30 tracking-widest shadow-lg shadow-rose-950/40 mb-3">
          <Server className="w-3.5 h-3.5 text-rose-400" />
          <span>500 • Gangguan Server Internal</span>
        </div>

        {/* Big 500 Numbers */}
        <div className="relative my-2 select-none">
          <span className="text-7xl sm:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-rose-100 to-rose-950 drop-shadow-2xl">
            500
          </span>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
            <AlertTriangle className="w-32 h-32 text-rose-500 animate-pulse" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 mb-3">
          Transmisi Sinyal Studio Terganggu
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
          Terjadi kendala teknis pada server backend atau pemrosesan data sinema kami. Tim teknisi LiveEuy sedang memulihkan jaringan transmisi. Data tontonan Anda tetap tersimpan aman.
        </p>

        {retryResult && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-amber-300 mb-6 animate-fade-in flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>{retryResult}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={handleReload}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Ulang Halaman</span>
          </button>

          <button
            type="button"
            disabled={isRetrying}
            onClick={handleTestConnection}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Activity className={`w-4 h-4 text-emerald-400 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Menguji...' : 'Uji Koneksi Server'}</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
        </div>

        {/* Status indicator */}
        <div className="border-t border-white/5 pt-4 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>LiveEuy Incident Response Team</span>
          </div>
          <span className="font-mono text-slate-400">Error ID: ERR-500-{Date.now().toString(36).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
