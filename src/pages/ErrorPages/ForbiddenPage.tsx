import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, LogIn, Home, ArrowLeft, UserX, Crown, Film, Sparkles } from 'lucide-react';
import { useWatch } from '../../context/WatchContext';

export const ForbiddenPage: React.FC = () => {
  const { user, isLoggedIn, openAuthModal } = useWatch();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 my-auto animate-fade-in">
      <div className="relative max-w-lg w-full bg-[#0d0f17]/95 border border-amber-500/25 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Ambient Amber & Rose Glows */}
        <div className="absolute -top-28 -left-28 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-56 h-56 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Shield / Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-xl shadow-amber-950/30">
          {isLoggedIn ? <ShieldAlert className="w-8 h-8 text-rose-400" /> : <Lock className="w-8 h-8 text-amber-400" />}
        </div>

        {/* Top Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 tracking-wider mb-3">
          403 • Akses Terlarang (Forbidden)
        </span>

        {/* Main Headline */}
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          {isLoggedIn ? 'Hak Akses Administrator Dibutuhkan' : 'Autentikasi Admin Diperlukan'}
        </h1>

        {/* Contextual Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5 max-w-md mx-auto">
          {isLoggedIn ? (
            <>
              Halo <strong className="text-white">{user?.name}</strong>, akun Anda berstatus{' '}
              <span className="text-amber-400 font-semibold">{user?.tier || 'Member'}</span>. Anda tidak memiliki izin untuk mengelola konfigurasi server, katalog master, atau data audiens LiveEuy.
            </>
          ) : (
            'Halaman pusat kontrol studio LiveEuy terproteksi dan membutuhkan kredensial administrator resmi untuk dapat diakses.'
          )}
        </p>

        {/* User Profile Pill Preview (if logged in) */}
        {isLoggedIn && user && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-6 text-left">
            <img 
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'} 
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
              Role: Member
            </span>
          </div>
        )}

        {/* Action CTAs */}
        <div className="space-y-2.5 mb-6">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoggedIn ? 'Ganti dengan Akun Administrator' : 'Masuk dengan Akun Admin'}</span>
          </button>

          <Link
            to="/"
            className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Penonton</span>
          </Link>
        </div>

        {/* Safe Cinema Exploration */}
        <div className="border-t border-white/5 pt-4 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
            Tetap nikmati hiburan bioskop:
          </span>
          <div className="flex items-center justify-center gap-2">
            <Link
              to="/movies"
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] transition-colors flex items-center gap-1"
            >
              <Film className="w-3 h-3 text-brand-400" />
              <span>Film 4K</span>
            </Link>
            <Link
              to="/trending"
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span>Sedang Tren</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
