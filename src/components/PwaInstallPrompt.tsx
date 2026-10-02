import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Share2, PlusSquare } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

export const PwaInstallPrompt: React.FC = () => {
  const { isInstallable, isStandalone, isIos, promptInstall } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const dismissedUntil = localStorage.getItem('liveeuy_pwa_dismissed_until');
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return true;
      }
    } catch {}
    return false;
  });

  const [showIosGuide, setShowIosGuide] = useState(false);

  // If already installed/standalone or dismissed, don't show prompt
  if (isStandalone || isDismissed) {
    return null;
  }

  // Only show if installable (Chromium/Android/Desktop) or on iOS Safari
  if (!isInstallable && !isIos) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      // Dismiss for 3 days
      const expireTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
      localStorage.setItem('liveeuy_pwa_dismissed_until', String(expireTime));
    } catch {}
  };

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    const installed = await promptInstall();
    if (installed) {
      setIsDismissed(true);
    }
  };

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <div 
        role="region"
        aria-label="Pemberitahuan Pasang Aplikasi"
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-[94%] sm:w-auto animate-fade-in"
      >
        <div className="flex items-center justify-between gap-3.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-surface-900/95 via-surface-900/98 to-brand-950/95 border border-brand-500/30 shadow-2xl shadow-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 flex-shrink-0">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white tracking-wide">Pasang Aplikasi LiveEuy</p>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 font-semibold">PWA</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Akses instan di layar utama tanpa batas peramban
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors shadow-md shadow-brand-600/30 whitespace-nowrap active:scale-95"
            >
              Pasang
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Tutup notifikasi pemasangan aplikasi"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Instruction Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-surface-900 border border-white/10 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Smartphone className="w-5 h-5 text-brand-400" />
                <span>Pasang di iOS / Safari</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>Untuk memasang LiveEuy di iPhone atau iPad Anda:</p>
              <ol className="space-y-2.5 bg-black/40 p-3 rounded-xl border border-white/5">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>Tekan tombol <strong>Bagikan</strong> (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />) pada bilah bawah Safari.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>Gulir ke bawah lalu pilih <strong>Tambah ke Layar Utama</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-200" />).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>Tekan <strong>Tambah</strong> di sudut kanan atas layar.</span>
                </li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
