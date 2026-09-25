import React, { useState } from 'react';
import { useWatch } from '../context/WatchContext';
import { 
  X, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Crown, 
  ArrowRight,
  Tv,
  Check
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login } = useWatch();
  
  const [isRegister, setIsRegister] = useState(authModalMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync isRegister when authModalMode changes
  React.useEffect(() => {
    setIsRegister(authModalMode === 'register');
    setError('');
    setSuccess(false);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError('Mohon lengkapi semua kolom yang wajib diisi.');
      return;
    }

    login({
      name: isRegister ? name : email.split('@')[0],
      email: email,
      tier: 'VIP Standard'
    });

    setSuccess(true);
    setTimeout(() => {
      closeAuthModal();
      setSuccess(false);
    }, 600);
  };

  const handleDemoVip = () => {
    login({
      name: 'Hafiz Muhammad',
      email: 'hafiz@liveeuy.id',
      tier: 'VIP Cinema Ultra',
      role: 'admin',
      watchHours: 48.5,
      devices: 3
    });
    setSuccess(true);
    setTimeout(() => {
      closeAuthModal();
      setSuccess(false);
    }, 500);
  };

  const handleDemoStandard = () => {
    login({
      name: 'Budi Santoso',
      email: 'budi@liveeuy.id',
      tier: 'VIP Standard',
      role: 'user',
      watchHours: 12.0,
      devices: 1
    });
    setSuccess(true);
    setTimeout(() => {
      closeAuthModal();
      setSuccess(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-surface-900 border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Logo */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-secondary-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Live<span className="text-brand-500">Euy</span>
            </span>
          </div>

          <h3 className="text-xl font-black text-white">
            {isRegister ? 'Buat Akun LiveEuy' : 'Masuk ke Akun Anda'}
          </h3>
          <p className="text-xs text-slate-400">
            {isRegister
              ? 'Daftar sekarang untuk membuka akses penuh tayangan 4K & simpan daftar tontonan cloud.'
              : 'Lanjutkan tontonan film & serial bioskop favorit Anda.'}
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Berhasil masuk! Mengalihkan ke akun Anda...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* One-Click Quick Demo Login Shortcuts */}
        <div className="space-y-2 mb-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Pilihan Masuk Demo Instan
          </span>

          {/* Admin Demo Button */}
          <button
            onClick={handleDemoVip}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-brand-600/20 to-teal-500/20 hover:from-emerald-500/30 hover:via-brand-600/30 hover:to-teal-500/30 border border-emerald-500/40 hover:border-emerald-400 text-white text-xs font-bold flex items-center justify-between transition-all group shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                <ShieldCheck className="w-4 h-4 text-slate-950" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold group-hover:text-emerald-300 transition-colors">
                    Hafiz Muhammad
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wide bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                    Admin
                  </span>
                </div>
                <div className="text-[10px] text-emerald-200/80 font-normal">
                  Akses Penuh CMS Admin • 4K UHD • VIP Ultra
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Regular User Demo Button */}
          <button
            onClick={handleDemoStandard}
            className="w-full p-3 rounded-2xl bg-surface-800/90 hover:bg-surface-700/90 border border-white/10 hover:border-brand-500/40 text-white text-xs font-medium flex items-center justify-between transition-all group shadow"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-slate-300" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-semibold group-hover:text-brand-300 transition-colors">
                    Budi Santoso
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-white/10 text-slate-300">
                    Pengguna Biasa
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Tampilan Penonton Bersih • Tanpa Akses Admin
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500">atau dengan email</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Regular Login / Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Nama Lengkap</label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full bg-surface-800 border border-white/10 focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Alamat Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-surface-800 border border-white/10 focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Kata Sandi</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-surface-800 border border-white/10 focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/25 active:scale-95 mt-2"
          >
            {isRegister ? 'Daftar Akun Baru' : 'Masuk Sekarang'}
          </button>
        </form>

        {/* Switch Login / Register link */}
        <div className="text-center mt-4 pt-3 border-t border-white/5">
          <p className="text-xs text-slate-400">
            {isRegister ? 'Sudah memiliki akun LiveEuy?' : 'Belum memiliki akun?'}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="ml-1 text-brand-400 hover:text-brand-300 font-bold"
            >
              {isRegister ? 'Masuk di sini' : 'Daftar gratis'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
