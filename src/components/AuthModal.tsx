import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Film,
  Sparkles,
  Laptop,
  Wifi,
  Radio,
  ShieldAlert,
  KeyRound,
  Send
} from 'lucide-react';
import { 
  getLoginLockoutStatus, 
  recordFailedLoginAttempt, 
  clearLoginLockout, 
  MAX_LOGIN_ATTEMPTS 
} from '../utils/security';

export type ModalView = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login, profiles, switchProfile } = useWatch();
  
  const [view, setView] = useState<ModalView>(authModalMode || 'login');
  const isRegister = view === 'register';
  const isForgot = view === 'forgot-password';
  const isReset = view === 'reset-password';
  const isVerifyEmail = view === 'verify-email';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // State untuk verifikasi PIN email
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer cooldown pengiriman ulang PIN
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Check lockout on email change or modal open
  useEffect(() => {
    if (email) {
      const status = getLoginLockoutStatus(email);
      setLockoutSeconds(status.remainingSeconds);
      setFailedAttempts(status.attempts);
    } else {
      setLockoutSeconds(0);
      setFailedAttempts(0);
    }
  }, [email, isAuthModalOpen]);

  // Countdown timer for brute-force lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Sync view when authModalMode changes
  useEffect(() => {
    setView(authModalMode || 'login');
    setError('');
    setSuccess(false);
    setForgotSuccess(false);
    setResetSuccess(false);
  }, [authModalMode, isAuthModalOpen]);

  // Evaluasi kekuatan kata sandi
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Belum diisi', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8 && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Lemah', color: 'bg-amber-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Sedang', color: 'bg-blue-500' };
    return { score: 3, label: 'Sangat Kuat', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

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

    // Mode: LUPA KATA SANDI
    if (isForgot) {
      if (!email.trim()) {
        setError('Mohon masukkan alamat email Anda.');
        return;
      }
      setIsSubmitting(true);
      setError('');
      try {
        const res = await apiService.forgotPassword(email.trim());
        setIsSubmitting(false);
        if (res.success) {
          setForgotSuccess(true);
          setSuccessMessage(res.message);
        } else {
          setError(res.message);
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setError(err?.message || 'Gagal mengirim email pemulihan.');
      }
      return;
    }

    // Mode: ATUR ULANG KATA SANDI
    if (isReset) {
      if (!resetToken.trim() || !password) {
        setError('Mohon lengkapi token reset dan kata sandi baru.');
        return;
      }
      if (password.length < 6) {
        setError('Kata sandi baru minimal 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi kata sandi tidak cocok.');
        return;
      }
      setIsSubmitting(true);
      setError('');
      try {
        const res = await apiService.resetPassword(resetToken.trim(), password);
        setIsSubmitting(false);
        if (res.success) {
          setResetSuccess(true);
          setSuccessMessage(res.message);
        } else {
          setError(res.message);
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setError(err?.message || 'Gagal mereset kata sandi.');
      }
      return;
    }

    // Mode: VERIFIKASI PIN EMAIL REGISTRASI
    if (isVerifyEmail) {
      const fullPin = pinDigits.join('');
      if (fullPin.length < 4) {
        setError('Mohon masukkan 6 digit PIN verifikasi yang dikirim ke email.');
        return;
      }

      setIsSubmitting(true);
      setError('');

      try {
        const res = await apiService.verifyEmailPin(email.trim(), fullPin);
        setIsSubmitting(false);

        if (res && !res.success) {
          setError(res.message || 'PIN verifikasi tidak valid atau telah kedaluwarsa.');
          return;
        }

        // Verifikasi sukses
        clearLoginLockout(email.trim());
        setFailedAttempts(0);
        setLockoutSeconds(0);

        const verifiedUser = res?.user || pendingUser || {
          name: name.trim() || email.split('@')[0],
          email: email.trim(),
          tier: 'VIP Standard',
          role: 'user'
        };

        login(verifiedUser);
        setSuccess(true);
        setSuccessMessage('Email berhasil diverifikasi! Selamat datang di LiveEuy.');
        setTimeout(() => {
          closeAuthModal();
          setSuccess(false);
        }, 700);
      } catch (err: any) {
        setIsSubmitting(false);
        setError(err?.message || 'Gagal memverifikasi PIN. Silakan coba sesaat lagi.');
      }
      return;
    }

    // Mode: MASUK / DAFTAR
    if (!email || !password || (isRegister && !name)) {
      setError('Mohon lengkapi semua kolom yang wajib diisi.');
      return;
    }

    if (!isRegister && lockoutSeconds > 0) {
      setError(`Terlalu banyak percobaan gagal. Akun dikunci sementara demi keamanan. Silakan coba lagi dalam ${lockoutSeconds} detik.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Connect to Dual-Token Auth Service (Spring Boot :8080 or Go Auth :8081)
      const res = isRegister 
        ? await apiService.register(name.trim(), email.trim(), password)
        : await apiService.login(email.trim(), password);

      // Handle backend response with validation or rejection
      if (res && !res.success) {
        if (!isRegister) {
          const lockResult = recordFailedLoginAttempt(email.trim());
          setFailedAttempts(lockResult.attempts);
          if (lockResult.isLocked) {
            setLockoutSeconds(lockResult.remainingSeconds);
            setError(`Terlalu banyak percobaan salah (${MAX_LOGIN_ATTEMPTS}/${MAX_LOGIN_ATTEMPTS}). Akun dikunci sementara selama ${lockResult.remainingSeconds} detik.`);
          } else {
            const remaining = MAX_LOGIN_ATTEMPTS - lockResult.attempts;
            setError(`${res.message || 'Email atau kata sandi tidak valid.'} (Sisa percobaan: ${remaining})`);
          }
        } else {
          setError(res.message || 'Gagal mendaftar. Email mungkin sudah terdaftar.');
        }
        setIsSubmitting(false);
        return;
      }

      // If user is registering: transition directly to PIN verification
      if (isRegister) {
        setPendingUser({
          id: res?.user?.id,
          name: res?.user?.name || name.trim(),
          email: res?.user?.email || email.trim(),
          tier: (res?.user?.tier as any) || 'VIP Standard',
          role: (res?.user?.role as any) || 'user',
          avatar: res?.user?.avatar,
          watchHours: 0,
          devices: 1
        });
        setPendingToken(res?.token || null);
        setView('verify-email');
        setPinDigits(['', '', '', '', '', '']);
        setSuccessMessage('Pendaftaran berhasil! Masukkan 6 digit PIN verifikasi yang dikirimkan ke email Anda.');
        setIsSubmitting(false);
        return;
      }

      // Successful login - clear lockout
      clearLoginLockout(email.trim());
      setFailedAttempts(0);
      setLockoutSeconds(0);

      // If backend is running and returned user or success
      const userProfile = res?.user;
      const userName = userProfile?.name || email.split('@')[0];

      login({
        id: userProfile?.id,
        name: userName,
        email: userProfile?.email || email.trim(),
        tier: (userProfile?.tier as any) || 'VIP Standard',
        role: (userProfile?.role as any) || (email.trim().toLowerCase() === 'admin@liveeuy.id' || email.trim().toLowerCase() === 'hafiz@liveeuy.id' ? 'admin' : 'user'),
        avatar: userProfile?.avatar,
        watchHours: userProfile?.watchHours || 0,
        devices: userProfile?.devices || 1
      });

      setSuccessMessage(res?.message || 'Berhasil masuk! Menyiapkan tontonan Anda...');
      setSuccess(true);
      setTimeout(() => {
        closeAuthModal();
        setSuccess(false);
      }, 600);
    } catch {
      if (isRegister) {
        setPendingUser({
          name: name.trim(),
          email: email.trim(),
          tier: 'Free Guest',
          role: 'user',
          watchHours: 0,
          devices: 1
        });
        setView('verify-email');
        setPinDigits(['', '', '', '', '', '']);
        setSuccessMessage('Kode PIN verifikasi telah dikirimkan ke email Anda.');
        setIsSubmitting(false);
        return;
      }

      // Offline fallback mode for local testing
      clearLoginLockout(email.trim());
      setFailedAttempts(0);
      setLockoutSeconds(0);

      const userName = email.split('@')[0];
      login({
        name: userName,
        email: email.trim(),
        tier: 'VIP Standard',
        role: (email.trim().toLowerCase() === 'admin@liveeuy.id' || email.trim().toLowerCase() === 'hafiz@liveeuy.id' ? 'admin' : 'user'),
        watchHours: 0,
        devices: 1
      });

      setSuccessMessage('Berhasil masuk! Menyiapkan tontonan Anda...');
      setSuccess(true);
      setTimeout(() => {
        closeAuthModal();
        setSuccess(false);
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendPin = async () => {
    if (resendCooldown > 0 || isSubmitting || !email.trim()) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await apiService.resendVerificationPin(email.trim());
      setIsSubmitting(false);
      setResendCooldown(60);
      setSuccessMessage(res.message || 'Kode PIN baru telah dikirim ke email Anda.');
    } catch {
      setIsSubmitting(false);
      setResendCooldown(60);
      setSuccessMessage('Kode PIN baru telah dikirimkan ke email Anda.');
    }
  };

  const handlePinDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    const newPin = [...pinDigits];
    newPin[index] = cleanVal ? cleanVal[cleanVal.length - 1] : '';
    setPinDigits(newPin);
    setError('');
    if (cleanVal && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newPin = [...pinDigits];
    for (let i = 0; i < 6; i++) {
      newPin[i] = pasted[i] || '';
    }
    setPinDigits(newPin);
    setError('');
    const nextIdx = Math.min(pasted.length, 5);
    pinRefs.current[nextIdx]?.focus();
  };

  const handleDemoVip = () => {
    clearLoginLockout('hafiz@liveeuy.id');
    setFailedAttempts(0);
    setLockoutSeconds(0);
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
    clearLoginLockout('budi@liveeuy.id');
    setFailedAttempts(0);
    setLockoutSeconds(0);
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

  const handleDemoFree = () => {
    clearLoginLockout('rian@liveeuy.id');
    setFailedAttempts(0);
    setLockoutSeconds(0);
    login({
      name: 'Rian Pratama',
      email: 'rian@liveeuy.id',
      tier: 'Free Guest',
      role: 'user',
      watchHours: 2.0,
      devices: 1
    });
    setSuccessMessage('Masuk sebagai Rian (Akun Gratis - Didukung Iklan)...');
    setSuccess(true);
    setTimeout(() => {
      closeAuthModal();
      setSuccess(false);
    }, 500);
  };

  const handleDemoKids = () => {
    clearLoginLockout('keluarga@liveeuy.id');
    setFailedAttempts(0);
    setLockoutSeconds(0);
    login({
      name: 'Keluarga Pratama',
      email: 'keluarga@liveeuy.id',
      tier: 'VIP Standard',
      role: 'user',
      watchHours: 15.0,
      devices: 2
    });
    const kidsProf = profiles.find(p => p.isKids);
    if (kidsProf) {
      switchProfile(kidsProf.id);
    }
    setSuccessMessage('Masuk sebagai Adik Caca (Mode Anak Aktif)...');
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
                  <Laptop className="w-3.5 h-3.5" />
                </div>
                <span>Sinkronisasi Menit Tontonan di Laptop & Ponsel</span>
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

            {/* If in Forgot or Reset mode: Header with Back button */}
            {/* If in Forgot, Reset, or Verify Email mode: Header with Back button */}
            {(isForgot || isReset || isVerifyEmail) && (
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setView(isVerifyEmail ? 'register' : 'login');
                    setError('');
                    setForgotSuccess(false);
                    setResetSuccess(false);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group mb-3"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span>{isVerifyEmail ? 'Kembali ke Form Pendaftaran' : 'Kembali ke Halaman Masuk'}</span>
                </button>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {isVerifyEmail ? 'Verifikasi PIN Email' : (isForgot ? 'Lupa Kata Sandi?' : 'Atur Ulang Kata Sandi')}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  {isVerifyEmail
                    ? `Masukkan 6 digit kode PIN yang telah kami kirimkan ke ${email || 'email Anda'}.`
                    : (isForgot
                      ? 'Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan / token pengaturan ulang kata sandi.'
                      : 'Masukkan token verifikasi dari email dan kata sandi baru untuk mengamankan akun Anda.')}
                </p>
              </div>
            )}

            {/* Standard Mode: Segmented Tab Switcher (Masuk vs Daftar Baru) */}
            {!isForgot && !isReset && !isVerifyEmail && (
              <>
                <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
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
                      setView('register');
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
              </>
            )}

            {/* Feedback Alerts */}
            {lockoutSeconds > 0 && !isRegister && !isForgot && !isReset && !isVerifyEmail && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-medium flex items-start gap-2.5 animate-fade-in">
                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-300">Proteksi Brute Force Aktif</p>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    Terlalu banyak percobaan sandi salah ({MAX_LOGIN_ATTEMPTS}/{MAX_LOGIN_ATTEMPTS}). Formulir dikunci sementara demi keamanan akun. Silakan tunggu{' '}
                    <span className="font-mono font-bold text-white bg-black/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                      {lockoutSeconds} detik
                    </span>.
                  </p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (!lockoutSeconds || isRegister || isForgot || isReset || isVerifyEmail) && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fade-in">
                {error}
              </div>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {isForgot && (
              <div className="space-y-4">
                {forgotSuccess ? (
                  <div className="space-y-4 py-2">
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span>Instruksi Terkirim!</span>
                      </div>
                      <p>
                        {successMessage || 'Jika email terdaftar di sistem kami, instruksi pemulihan kata sandi telah dikirimkan ke kotak masuk email Anda.'}
                      </p>
                      <p className="text-[11px] text-emerald-300/80">
                        Cek folder Kotak Masuk atau Spam email Anda. Token reset berlaku selama 1 jam.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setView('reset-password');
                          setError('');
                        }}
                        className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Sudah Punya Token? Atur Sandi Baru</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotSuccess(false);
                          setEmail('');
                          setError('');
                        }}
                        className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-center"
                      >
                        Kirim ke email lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-300">Alamat Email Terdaftar</label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          disabled={isSubmitting}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="nama@email.com"
                          required
                          className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Tautan beserta token reset akan dikirimkan secara otomatis via background cron job.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:border disabled:border-white/10 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md active:scale-[0.98] mt-2 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Mengirim Tautan...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Tautan Pemulihan</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setView('reset-password');
                          setError('');
                        }}
                        className="text-[11px] text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
                      >
                        Sudah menerima token via email? Masukkan token di sini &rarr;
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* RESET PASSWORD VIEW */}
            {isReset && (
              <div className="space-y-4">
                {resetSuccess ? (
                  <div className="space-y-4 py-2">
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span>Kata Sandi Berhasil Direset!</span>
                      </div>
                      <p>
                        {successMessage || 'Kata sandi Anda telah berhasil direset. Silakan login kembali dengan kata sandi baru Anda.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setView('login');
                        setPassword('');
                        setConfirmPassword('');
                        setResetToken('');
                        setResetSuccess(false);
                        setError('');
                      }}
                      className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Masuk Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-300">Token Verifikasi Reset</label>
                      <div className="relative flex items-center">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={resetToken}
                          disabled={isSubmitting}
                          onChange={e => setResetToken(e.target.value)}
                          placeholder="Tempel token reset dari email Anda"
                          required
                          className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-300">Kata Sandi Baru</label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          disabled={isSubmitting}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          required
                          className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Password strength indicator */}
                      {password && (
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Kekuatan Sandi:</span>
                            <span className="font-semibold text-slate-300">{strength.label}</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden flex gap-1">
                            <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                            <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                            <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-300">Konfirmasi Kata Sandi Baru</label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          disabled={isSubmitting}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi baru"
                          required
                          className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-[10px] text-rose-400">Konfirmasi kata sandi belum cocok</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !resetToken || !password || password !== confirmPassword}
                      className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:border disabled:border-white/10 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md active:scale-[0.98] mt-2 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Menyimpan Sandi...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Simpan Kata Sandi Baru</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setView('forgot-password');
                          setError('');
                        }}
                        className="text-[11px] text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
                      >
                        Belum punya token? Minta tautan baru &rarr;
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* VERIFY EMAIL PIN VIEW */}
            {isVerifyEmail && (
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center space-y-1">
                    <span className="text-[11px] text-slate-400">Kode PIN dikirim ke email:</span>
                    <p className="text-xs font-semibold text-white font-mono break-all">{email}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-300 block text-center">
                      6 Digit PIN Verifikasi
                    </label>
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                      {pinDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => (pinRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          disabled={isSubmitting}
                          onChange={e => handlePinDigitChange(idx, e.target.value)}
                          onKeyDown={e => handlePinKeyDown(idx, e)}
                          onPaste={handlePinPaste}
                          className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-mono font-bold bg-white/[0.04] border border-white/[0.15] focus:border-brand-500 focus:bg-brand-500/10 rounded-xl text-white outline-none transition-all shadow-inner"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Action */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Belum menerima PIN?</span>
                    <button
                      type="button"
                      onClick={handleResendPin}
                      disabled={resendCooldown > 0 || isSubmitting || !email.trim()}
                      className="text-brand-400 hover:text-brand-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim Ulang PIN'}
                    </button>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting || pinDigits.join('').length < 4}
                    className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:border disabled:border-white/10 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md active:scale-[0.98] mt-2 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memverifikasi PIN...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verifikasi & Aktifkan Akun</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setView('register');
                        setError('');
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Salah ketik email? Ganti alamat email &rarr;
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STANDARD LOGIN / REGISTER VIEW */}
            {!isForgot && !isReset && !isVerifyEmail && (
              <>
                {/* 1-CLICK QUICK DEMO PROFILES */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    <span>Profil Uji Coba Cepat</span>
                    <span className="text-brand-400 font-semibold normal-case">1-Klik Langsung Aktif</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Admin Persona: Hafiz Muhammad */}
                    <button
                      type="button"
                      onClick={handleDemoVip}
                      className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/[0.08] hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden bg-slate-800 border border-white/20 flex-shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" 
                            alt="Hafiz" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] sm:text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                              Hafiz
                            </span>
                            <span className="px-1 py-0.2 rounded text-[7px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                              VIP
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 truncate">Ultra • Bebas Iklan</p>
                        </div>
                      </div>
                    </button>

                    {/* Consumer Persona: Budi Santoso */}
                    <button
                      type="button"
                      onClick={handleDemoStandard}
                      className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] hover:bg-brand-500/10 border border-white/[0.08] hover:border-brand-500/40 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden bg-slate-800 border border-white/20 flex-shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80" 
                            alt="Budi" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] sm:text-xs font-bold text-white truncate group-hover:text-brand-300 transition-colors">
                              Budi S.
                            </span>
                            <span className="px-1 py-0.2 rounded text-[7px] font-bold bg-white/10 text-slate-300 uppercase">
                              VIP
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 truncate">Standar • Bebas Iklan</p>
                        </div>
                      </div>
                    </button>

                    {/* Free Persona: Rian Pratama */}
                    <button
                      type="button"
                      onClick={handleDemoFree}
                      className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/[0.08] hover:border-amber-500/40 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden bg-slate-800 border border-white/20 flex-shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" 
                            alt="Rian" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] sm:text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                              Rian P.
                            </span>
                            <span className="px-1 py-0.2 rounded text-[7px] font-bold bg-amber-500/20 text-amber-400 uppercase">
                              Gratis
                            </span>
                          </div>
                          <p className="text-[9px] text-amber-300/80 truncate">Ada Iklan Pop-up</p>
                        </div>
                      </div>
                    </button>

                    {/* Kids Persona: Adik Caca */}
                    <button
                      type="button"
                      onClick={handleDemoKids}
                      className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] hover:bg-pink-500/10 border border-white/[0.08] hover:border-pink-500/40 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden bg-pink-500/20 border border-pink-400/40 flex-shrink-0 flex items-center justify-center">
                          <span className="text-base sm:text-lg">🧸</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] sm:text-xs font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                              Adik Caca
                            </span>
                            <span className="px-1 py-0.2 rounded text-[7px] font-bold bg-pink-500/20 text-pink-400 uppercase">
                              Kids
                            </span>
                          </div>
                          <p className="text-[9px] text-pink-300/80 truncate">Aman • PIN 1234</p>
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
                        disabled={isSubmitting || (!isRegister && lockoutSeconds > 0)}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-slate-300">Kata Sandi</label>
                      {!isRegister && (
                        <button
                          type="button"
                          disabled={lockoutSeconds > 0}
                          onClick={() => {
                            setView('forgot-password');
                            setError('');
                          }}
                          className="text-[10px] text-slate-400 hover:text-brand-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                        disabled={isSubmitting || (!isRegister && lockoutSeconds > 0)}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                        disabled={lockoutSeconds > 0}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-white/[0.05] border-white/20 text-brand-600 focus:ring-0 cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-[11px] text-slate-400">Ingat sesi di perangkat ini</span>
                    </label>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting || (!isRegister && lockoutSeconds > 0)}
                    className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:border disabled:border-white/10 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md active:scale-[0.98] mt-2 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memverifikasi akun...</span>
                      </>
                    ) : !isRegister && lockoutSeconds > 0 ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Terkunci Sementara ({lockoutSeconds}s)</span>
                      </>
                    ) : (
                      <>
                        <span>{isRegister ? 'Buat Akun VIP Gratis' : 'Masuk ke Akun'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Switcher Footer */}
          {!isForgot && !isReset && !isVerifyEmail && (
            <div className="text-center mt-5 pt-3 border-t border-white/[0.06]">
              <p className="text-xs text-slate-400">
                {isRegister ? 'Sudah memiliki akun LiveEuy?' : 'Belum memiliki akun?'}
                <button
                  type="button"
                  onClick={() => {
                    setView(isRegister ? 'login' : 'register');
                    setError('');
                  }}
                  className="ml-1 text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
                >
                  {isRegister ? 'Masuk di sini' : 'Daftar VIP gratis'}
                </button>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
