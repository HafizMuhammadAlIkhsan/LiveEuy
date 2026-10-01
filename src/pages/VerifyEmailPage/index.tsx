import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useWatch } from '../../context/WatchContext';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, openAuthModal } = useWatch();

  const emailFromUrl = searchParams.get('email') || '';
  const pinFromUrl = searchParams.get('pin') || searchParams.get('code') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [pinDigits, setPinDigits] = useState<string[]>(() => {
    if (pinFromUrl) {
      const clean = pinFromUrl.replace(/\D/g, '').slice(0, 6);
      const arr = ['', '', '', '', '', ''];
      for (let i = 0; i < clean.length; i++) {
        arr[i] = clean[i];
      }
      return arr;
    }
    return ['', '', '', '', '', ''];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update jika query parameters berubah
  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
    if (pinFromUrl) {
      const clean = pinFromUrl.replace(/\D/g, '').slice(0, 6);
      const arr = ['', '', '', '', '', ''];
      for (let i = 0; i < clean.length; i++) {
        arr[i] = clean[i];
      }
      setPinDigits(arr);
    }
  }, [emailFromUrl, pinFromUrl]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...pinDigits];
    newDigits[index] = clean ? clean[clean.length - 1] : '';
    setPinDigits(newDigits);
    setError('');

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...pinDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setPinDigits(newDigits);
    setError('');
    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Mohon masukkan alamat email yang didaftarkan.');
      return;
    }
    const fullPin = pinDigits.join('');
    if (fullPin.length < 4) {
      setError('Mohon lengkapi 6 digit PIN verifikasi.');
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

      setSuccess(true);
      setSuccessMessage(res.message || 'Email Anda berhasil diverifikasi! Selamat datang di LiveEuy.');

      // Login user if profile returned
      const verifiedUser = res?.user || {
        name: email.split('@')[0],
        email: email.trim(),
        tier: 'VIP Standard',
        role: 'user'
      };
      login(verifiedUser);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Gagal memverifikasi PIN. Silakan coba sesaat lagi.');
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
      setSuccessMessage(res.message || 'Kode PIN baru telah dikirimkan ke email Anda.');
    } catch {
      setIsSubmitting(false);
      setResendCooldown(60);
      setSuccessMessage('Kode PIN baru telah dikirimkan ke email Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Cinematic Ambient Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[200px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-brand-400 transition-colors">
              LIVE<span className="text-brand-500">EUY</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-white/10 text-slate-300 uppercase border border-white/15">
              SECURITY
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-slate-400">
            Aktivasi Akun & Verifikasi Email Penonton
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#0f131c]/90 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl rounded-3xl p-6 sm:p-8">
          {success ? (
            /* Success Feedback View */
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Email Berhasil Diverifikasi!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                  {successMessage || 'Akun Anda sekarang telah aktif sepenuhnya. Nikmati streaming film dan serial kualitas 4K UHD di LiveEuy.'}
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-brand-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Mulai Menonton Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* PIN Verification Form */
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-slate-300 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    <span>Verifikasi Registrasi Baru</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight">
                  Masukkan PIN Verifikasi
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ketik 6 digit PIN verifikasi yang telah dikirimkan ke kotak masuk email Anda.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 leading-relaxed">{error}</span>
                </div>
              )}

              {/* Success Alert / Info */}
              {successMessage && !success && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                    <span>Alamat Email Terdaftar</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* 6-Digit PIN Boxes */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-semibold text-slate-300 block text-center">
                    6 Digit Kode PIN
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {pinDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleDigitChange(idx, e.target.value)}
                        onKeyDown={e => handleKeyDown(idx, e)}
                        onPaste={handlePaste}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold bg-white/[0.04] border border-white/[0.15] focus:border-brand-500 focus:bg-brand-500/10 rounded-xl text-white outline-none transition-all shadow-inner"
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
                  disabled={isSubmitting || pinDigits.join('').length < 4 || !email}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-brand-600/20 cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi PIN...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verifikasi & Aktifkan Akun</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer Back & Alternatives */}
          <div className="text-center mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                navigate('/');
                setTimeout(() => openAuthModal('login'), 150);
              }}
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors cursor-pointer"
            >
              Masuk ke Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
