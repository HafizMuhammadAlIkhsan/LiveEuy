import React from 'react';
import { Link } from 'react-router-dom';
import { useWatch } from '../context/WatchContext';
import { ShieldAlert, Lock, LogIn, Home, ArrowLeft, UserX, Crown } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, isLoggedIn, openAuthModal } = useWatch();

  // 1. Unauthenticated Guest: Not Logged In
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="relative max-w-md w-full bg-[#0d0f17] border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Ambient Amber Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Lock Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-900/20">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 tracking-wider">
            Zona Terproteksi
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-3 mb-2">
            Autentikasi Admin Diperlukan
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Halaman Studio Admin Console LiveEuy hanya dapat diakses oleh staf atau administrator terotorisasi. Silakan masuk terlebih dahulu untuk melanjutkan.
          </p>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-brand-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk dengan Akun Admin</span>
            </button>

            <Link
              to="/"
              className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda Penonton</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Unauthorized: Regular Member (user.role !== 'admin')
  if (user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="relative max-w-lg w-full bg-[#0d0f17] border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Ambient Rose Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Shield Alert Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-lg shadow-rose-900/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30 tracking-wider">
            403 • Akses Terlarang (Forbidden)
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-3 mb-2">
            Hak Akses Administrator Dibutuhkan
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
            Halo <strong className="text-white">{user.name}</strong>, akun Anda terdaftar sebagai <span className="text-amber-400 font-semibold">{user.tier} (Member)</span>. Anda tidak memiliki izin untuk mengelola katalog, analitik, dan server studio LiveEuy.
          </p>

          {/* User Profile Pill Preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 text-left">
            <img 
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'} 
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover border border-white/10" 
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300">
              Role: Member
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Ganti Akun Admin</span>
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali Menonton</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin: user.role === 'admin'
  return <>{children}</>;
};
