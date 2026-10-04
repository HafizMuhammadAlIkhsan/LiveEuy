import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2, RefreshCw } from 'lucide-react';

export const NetworkStatusToast: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        const timer = setTimeout(() => {
          setShowReconnected(false);
          setWasOffline(false);
        }, 3500);
        return () => clearTimeout(timer);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Don't render anything if user is stably online
  if (isOnline && !showReconnected) return null;

  return (
    <div 
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {!isOnline ? (
        /* OFFLINE WARNING TOAST */
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#140b0e] border border-rose-500/40 text-rose-200 shadow-2xl shadow-black/80 backdrop-blur-xl">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 animate-pulse">
            <WifiOff className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-white">Koneksi Internet Terputus</p>
            <p className="text-rose-300/80 text-[11px]">
              Tontonan beralih ke cache lokal. Pemutaran video live mungkin terjeda.
            </p>
          </div>
        </div>
      ) : (
        /* BACK ONLINE RESTORED TOAST */
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0b1612] border border-emerald-500/40 text-emerald-200 shadow-2xl shadow-black/80 backdrop-blur-xl animate-fade-in">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white">Koneksi Pulih Kembali</span>
            <span className="text-emerald-300/80 text-[11px] ml-1.5">• Sinkronisasi cloud aktif</span>
          </div>
        </div>
      )}
    </div>
  );
};
