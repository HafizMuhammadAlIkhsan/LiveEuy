import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useWatch } from '../../context/WatchContext';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openAuthModal } = useWatch();

  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [mode, setMode] = useState<'reset' | 'forgot'>(tokenFromUrl ? 'reset' : 'forgot');
  const [token, setToken] = useState(tokenFromUrl);
  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Update token jika URL parameter berubah
  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setMode('reset');
    }
  }, [tokenFromUrl]);

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

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Mohon masukkan token reset yang Anda terima via email.');
      return;
    }
    if (!password) {
      setError('Mohon masukkan kata sandi baru Anda.');
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
    try {
      const res = await apiService.resetPassword(token.trim(), password);
      setIsSubmitting(false);

      if (res.success) {
        setSuccess(true);
        setSuccessMessage(res.message);
      } else {
        setError(res.message || 'Token reset password tidak valid atau telah kedaluwarsa.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Terjadi kesalahan sistem saat mereset kata sandi.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Mohon masukkan alamat email Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.forgotPassword(email.trim());
      setIsSubmitting(false);

      if (res.success) {
        setSuccess(true);
        setSuccessMessage(res.message);
      } else {
        setError(res.message || 'Gagal mengirim email pemulihan.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Terjadi kesalahan jaringan.');
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Cinematic Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[200px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Container */}
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
            {mode === 'reset' ? 'Pengaturan Ulang Kata Sandi Akun' : 'Pemulihan Akses Akun LiveEuy'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#0f131c]/90 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl rounded-3xl p-6 sm:p-8">
          
          {/* Success State */}
          {success ? (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {mode === 'reset' ? 'Kata Sandi Berhasil Diperbarui!' : 'Tautan Pemulihan Dikirim!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                  {successMessage}
                </p>
              </div>

              {mode === 'reset' ? (
                <div className="pt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      openAuthModal('login');
                      navigate('/');
                    }}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-brand-600/30 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Masuk ke Akun Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    to="/"
                    className="block text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Kembali ke Halaman Utama
                  </Link>
                </div>
              ) : (
                <div className="pt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setMode('reset');
                    }}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Masukkan Token Reset</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Kirim ulang email
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Card Title & Instructions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-slate-300 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    <span>Autentikasi Aman</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'reset' ? 'forgot' : 'reset');
                      setError('');
                    }}
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-medium transition-colors cursor-pointer"
                  >
                    {mode === 'reset' ? 'Belum punya token?' : 'Sudah punya token?'}
                  </button>
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight">
                  {mode === 'reset' ? 'Atur Kata Sandi Baru' : 'Lupa Kata Sandi?'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {mode === 'reset'
                    ? 'Masukkan token verifikasi dari email beserta kata sandi baru akun Anda.'
                    : 'Ketik alamat email Anda untuk menerima tautan dan token pemulihan.'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 leading-relaxed">{error}</span>
                </div>
              )}

              {/* Form Mode: RESET PASSWORD */}
              {mode === 'reset' ? (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {/* Token Field */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                      <span>Token Pemulihan (Reset Token)</span>
                      {tokenFromUrl && (
                        <span className="text-[10px] text-emerald-400 font-normal">✓ Dari tautan email</span>
                      )}
                    </label>
                    <div className="relative flex items-center">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        placeholder="Tempel token verifikasi dari email"
                        className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">Kata Sandi Baru</label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="pt-1 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Kekuatan Sandi:</span>
                          <span className="font-semibold text-slate-200">{strength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'} w-1/3`} />
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'} w-1/3`} />
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'} w-1/3`} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">Konfirmasi Kata Sandi Baru</label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-brand-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-brand-600/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Menyimpan kata sandi...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Simpan Kata Sandi Baru</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Form Mode: FORGOT PASSWORD */
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">Alamat Email Terdaftar</label>
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-brand-600/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Mengirimkan tautan...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Kirim Tautan Pemulihan</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Bottom Navigation */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Beranda</span>
                </Link>

                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-brand-400 hover:text-brand-300 font-semibold transition-colors cursor-pointer"
                >
                  Masuk Akun
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
