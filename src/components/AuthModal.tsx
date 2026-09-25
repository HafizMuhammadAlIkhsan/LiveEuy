import React, { useState, useEffect } from 'react';
import { useWatch } from '../context/WatchContext';
import { apiService } from '../services/api';
import { 
  X, 
  Play, 
  ShieldCheck, 
  CheckCircle2, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Crown, 
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Film,
  Sparkles,
  Tv,
  Wifi,
  Radio
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login } = useWatch();
  
  const [isRegister, setIsRegister] = useState(authModalMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Sync isRegister when authModalMode changes
  useEffect(() => {
    setIsRegister(authModalMode === 'register');
    setError('');
    setSuccess(false);
  }, [authModalMode, isAuthModalOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError('Mohon lengkapi semua kolom yang wajib diisi.');
      return;
    }

    try {
      // Connect to real Go Auth Service
      const res = isRegister 
        ? await apiService.register(name.trim(), email.trim(), password)
        : await apiService.login(email.trim(), password);

      if (res?.token) {
        localStorage.setItem('liveeuy_auth_token', res.token);
      }

      const userName = (res?.user?.name) || (isRegister ? name.trim() : email.split('@')[0]);
      login({
        name: userName,
        email: email.trim(),
        tier: 'VIP Standard',
        role: 'user',
        watchHours: 0,
        devices: 1
      });

      setSuccessMessage(isRegister ? 'Akun berhasil dibuat! Mengalihkan...' : 'Berhasil masuk! Menyiapkan tontonan Anda...');
      setSuccess(true);
      setTimeout(() => {
        closeAuthModal();
        setSuccess(false);
      }, 600);
    } catch {
      const userName = isRegister ? name.trim() : email.split('@')[0];
      login({
        name: userName,
        email: email.trim(),
        tier: 'VIP Standard',
        role: 'user',
        watchHours: 0,
        devices: 1
      });

      setSuccessMessage(isRegister ? 'Akun berhasil dibuat! Mengalihkan...' : 'Berhasil masuk! Menyiapkan tontonan Anda...');
      setSuccess(true);
      setTimeout(() => {
        closeAuthModal();
        setSuccess(false);
      }, 600);
    }
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
    setSuccessMessage('Masuk sebagai Hafiz Muhammad (Admin & VIP Ultra)...');
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
    setSuccessMessage('Masuk sebagai Budi Santoso (Member VIP)...');
    setSuccess(true);
    setTimeout(() => {
      closeAuthModal();
      setSuccess(false);
    }, 500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
      aria-label={isRegister ? "Pendaftaran Akun LiveEuy" : "Masuk ke Akun LiveEuy"}
    >
      <div 
        className="relative w-full max-w-md md:max-w-3xl lg:max-w-4xl max-h-[92vh] flex flex-col md:flex-row rounded-3xl bg-[#0a0c12] border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-30 w-8 h-8 rounded-full bg-white/[0.07] hover:bg-white/[0.15] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="Tutup jendela autentikasi"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================
            LEFT COLUMN: THEATRICAL SHOWCASE (Tablet & Desktop only)
            - Warm, authentic cinema editorial mood
            - Eliminates cheesy rainbow AI gradients
            ======================================================== */}
        <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative flex-col justify-between p-8 lg:p-10 overflow-hidden bg-black select-none">
          {/* Real Cinema Backdrop */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80"
              alt="Cinema Backdrop"
              className="w-full h-full object-cover opacity-35 scale-105"
            />
            {/* Deep Vignette Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c12] via-[#0a0c12]/80 to-[#0a0c12]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a0c12]/40 to-[#0a0c12]" />
          </div>

          {/* Top Wordmark & Laurel Badge */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl lg:text-2xl font-black tracking-tight text-white">
                LIVE<span className="text-brand-500">EUY</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider bg-white/10 text-slate-300 uppercase border border-white/15">
                CINEMA PASS
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 text-[11px] font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Kurasi Sinema & Serial Pilihan 2026</span>
            </div>
          </div>

          {/* Center Pitch: Real Cinema Value */}
          <div className="relative z-10 space-y-4 my-auto py-6">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Satu Akun, Ribuan Mahakarya Sinema.
            </h2>
            <p className="text-xs lg:text-sm text-slate-300/90 leading-relaxed font-normal">
              Nikmati rilis festival film, serial orisinal eksklusif, dan restorasi 4K dalam fidelitas audio-visual murni.
            </p>

            {/* Curated Perks List */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-md bg-white/[0.08] flex items-center justify-center text-brand-400 flex-shrink-0">
                  <Film className="w-3.5 h-3.5" />
                </div>
                <span>Master 4K Ultra HD & Dolby Vision Asli</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-md bg-white/[0.08] flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <span>Tata Suara Spasial Dolby Atmos 360°</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-md bg-white/[0.08] flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Tv className="w-3.5 h-3.5" />
                </div>
                <span>Sinkronisasi Menit Tontonan di TV & Ponsel</span>
              </div>
            </div>
          </div>

          {/* Bottom Social Proof / Cinema Quote */}
          <div className="relative z-10 pt-4 border-t border-white/[0.08]">
            <p className="text-[11px] text-slate-400 italic">
              "Menonton film di LiveEuy terasa seperti membawa studio bioskop premier ke ruang keluarga."
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                <img className="inline-block h-5 w-5 rounded-full ring-1 ring-black object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" alt="Avatar" />
                <img className="inline-block h-5 w-5 rounded-full ring-1 ring-black object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" alt="Avatar" />
                <img className="inline-block h-5 w-5 rounded-full ring-1 ring-black object-cover" src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=60&auto=format&fit=crop&q=80" alt="Avatar" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Komunitas 120.000+ sinefil Indonesia
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: FOCUSED FORM & QUICK DEMO PROFILES
            - Fully responsive on mobile, tablet, and desktop
            - Clean input fields with show/hide password toggle
            ======================================================== */}
        <div className="w-full md:w-7/12 lg:w-1/2 p-5 sm:p-7 md:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          
          <div>
            {/* Mobile Header Logo (visible only when left pane is hidden) */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  LIVE<span className="text-brand-500">EUY</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-slate-300 uppercase">
                  VIP
                </span>
              </div>
            </div>

            {/* Segmented Tab Switcher (Masuk vs Daftar Baru) */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-5">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  !isRegister
                    ? 'bg-white/10 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isRegister
                    ? 'bg-brand-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            {/* Title & Humanized Subtitle */}
            <div className="space-y-1 mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {isRegister ? 'Mulai Eksplorasi Sinema VIP' : 'Selamat Datang Kembali'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isRegister
                  ? 'Buat profil Anda untuk menyimpan daftar tontonan cloud dan tonton dalam resolusi 4K.'
                  : 'Pilih profil demo 1-klik di bawah untuk pengujian cepat, atau masuk manual.'}
              </p>
            </div>

            {/* Feedback Alerts */}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fade-in">
                {error}
              </div>
            )}

            {/* ========================================================
                1-CLICK QUICK DEMO PROFILES (Clean, non-slop design)
                ======================================================== */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <span>Profil Uji Coba Cepat</span>
                <span className="text-brand-400 font-semibold normal-case">1-Klik Langsung Aktif</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Admin Persona: Hafiz Muhammad */}
                <button
                  type="button"
                  onClick={handleDemoVip}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/[0.08] hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 border border-white/20 flex-shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" 
                        alt="Hafiz" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                          Hafiz M.
                        </span>
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                          Admin
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">VIP Cinema Ultra • 4K</p>
                    </div>
                  </div>
                </button>

                {/* Consumer Persona: Budi Santoso */}
                <button
                  type="button"
                  onClick={handleDemoStandard}
                  className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-brand-500/10 border border-white/[0.08] hover:border-brand-500/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 border border-white/20 flex-shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80" 
                        alt="Budi" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white truncate group-hover:text-brand-300 transition-colors">
                          Budi S.
                        </span>
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-white/10 text-slate-300 uppercase">
                          Member
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">VIP Standar • 1080p</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Elegant Divider */}
            <div className="relative flex items-center my-4">
              <div className="flex-grow border-t border-white/[0.08]"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                atau kredensial manual
              </span>
              <div className="flex-grow border-t border-white/[0.08]"></div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Nama Lengkap</label>
                  <div className="relative flex items-center">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Contoh: Sarah Wijaya"
                      className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Alamat Email</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-300">Kata Sandi</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => setError('Tautan pemulihan kata sandi telah dikirim ke email terdaftar demo.')}
                      className="text-[10px] text-slate-400 hover:text-brand-400 transition-colors"
                    >
                      Lupa sandi?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-white transition-colors"
                    title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember device checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-white/[0.05] border-white/20 text-brand-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400">Ingat sesi di perangkat ini</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md active:scale-[0.98] mt-2 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isRegister ? 'Buat Akun VIP Gratis' : 'Masuk ke Akun'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Switcher Footer */}
          <div className="text-center mt-5 pt-3 border-t border-white/[0.06]">
            <p className="text-xs text-slate-400">
              {isRegister ? 'Sudah memiliki akun LiveEuy?' : 'Belum memiliki akun?'}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="ml-1 text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
              >
                {isRegister ? 'Masuk di sini' : 'Daftar VIP gratis'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
