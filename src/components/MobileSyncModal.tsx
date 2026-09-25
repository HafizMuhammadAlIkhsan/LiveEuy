import React, { useState, useEffect } from 'react';
import { useWatch } from '../context/WatchContext';
import { apiService } from '../services/api';
import { 
  X, 
  Smartphone, 
  Laptop, 
  Wifi, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Activity, 
  Server, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Send, 
  Layers, 
  QrCode,
  Play,
  Clock
} from 'lucide-react';

export const MobileSyncModal: React.FC = () => {
  const { 
    isMobileSyncOpen, 
    closeMobileSync, 
    mobileSyncItem, 
    watchHistory, 
    updateWatchProgress,
    user 
  } = useWatch();

  const [activeTab, setActiveTab] = useState<'mobile' | 'backend' | 'guide'>('mobile');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  // Backend ping state
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [catalogStatus, setCatalogStatus] = useState<{ online: boolean; latency: number | null; message: string }>({
    online: false,
    latency: null,
    message: 'Belum diuji'
  });
  const [authStatus, setAuthStatus] = useState<{ online: boolean; latency: number | null; message: string }>({
    online: false,
    latency: null,
    message: 'Belum diuji'
  });

  // Watch progress push state
  const [isPushingProgress, setIsPushingProgress] = useState(false);
  const [progressPushSuccess, setProgressPushSuccess] = useState(false);

  const localIp = '10.10.40.9'; // Detected LAN Wi-Fi IP
  const currentMedia = mobileSyncItem || {
    id: 'cyberpunk-neo-nusantara',
    title: 'Cyberpunk: Neo Nusantara',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
    duration: '52m'
  };

  const progress = watchHistory[currentMedia.id] || {
    currentTime: 1420,
    duration: 3120,
    percentage: 45
  };

  const mobileWebUrl = `http://${localIp}:3000/#detail-${currentMedia.id}`;
  const deepLink = `liveeuy://watch/${currentMedia.id}?t=${Math.floor(progress.currentTime)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(mobileWebUrl)}&margin=10`;

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSyncOpen) {
        closeMobileSync();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSyncOpen, closeMobileSync]);

  // Initial backend health check when modal opens
  useEffect(() => {
    if (isMobileSyncOpen) {
      checkBackendServices();
    }
  }, [isMobileSyncOpen]);

  const checkBackendServices = async () => {
    setIsCheckingBackend(true);

    // 1. Check Catalog Service (Spring Boot 8081 / 8080)
    const t0 = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const res = await fetch('http://localhost:8081/api/v1/media/featured', {
        signal: controller.signal
      });
      clearTimeout(timeout);
      const latency = Math.round(performance.now() - t0);
      if (res.ok) {
        setCatalogStatus({ online: true, latency, message: 'Spring Boot Catalog Service aktif di port 8081' });
      } else {
        setCatalogStatus({ online: false, latency: null, message: 'Respon tidak standar' });
      }
    } catch {
      // Fallback check port 8080
      try {
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 1500);
        const res2 = await fetch('http://localhost:8080/api/v1/media/featured', {
          signal: controller2.signal
        });
        clearTimeout(timeout2);
        const latency = Math.round(performance.now() - t0);
        if (res2.ok) {
          setCatalogStatus({ online: true, latency, message: 'Spring Boot Backend aktif di port 8080' });
        } else {
          setCatalogStatus({ online: false, latency: null, message: 'Offline (Menggunakan Fallback Data Lokal)' });
        }
      } catch {
        setCatalogStatus({ online: false, latency: null, message: 'Offline (Data Lokal Aktif)' });
      }
    }

    // 2. Check Auth Service (Go 8080)
    const t1 = performance.now();
    try {
      const controller3 = new AbortController();
      const timeout3 = setTimeout(() => controller3.abort(), 1500);
      const res3 = await fetch('http://localhost:8080/api/health', {
        signal: controller3.signal
      });
      clearTimeout(timeout3);
      const latencyAuth = Math.round(performance.now() - t1);
      if (res3.ok) {
        setAuthStatus({ online: true, latency: latencyAuth, message: 'Golang Auth Service aktif di port 8080' });
      } else {
        setAuthStatus({ online: false, latency: null, message: 'Offline (Mode Demo Fallback)' });
      }
    } catch {
      setAuthStatus({ online: false, latency: null, message: 'Offline (Mode Demo Fallback)' });
    }

    setIsCheckingBackend(false);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handlePushProgress = async () => {
    setIsPushingProgress(true);
    // Push to backend via apiService
    await apiService.syncWatchProgress(
      currentMedia.id,
      progress.currentTime,
      progress.duration,
      (progress as any).episodeId
    );
    // Also save in local state
    updateWatchProgress(
      currentMedia.id,
      progress.currentTime,
      progress.duration,
      (progress as any).episodeId
    );
    setIsPushingProgress(false);
    setProgressPushSuccess(true);
    setTimeout(() => setProgressPushSuccess(false), 3500);
  };

  if (!isMobileSyncOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-[#0c0e14] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gradient Accent */}
        <div className="h-1 bg-gradient-to-r from-brand-600 via-secondary-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Hub Ekosistem: Web, Backend & Mobile
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Jembatan sinkronisasi data real-time antara Web React, Microservices, dan Aplikasi Mobile Flutter.
              </p>
            </div>
          </div>

          <button
            onClick={closeMobileSync}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Session & Progress Broadcast Strip */}
        <div className="px-4 sm:px-6 py-3 bg-white/[0.03] border-b border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={currentMedia.posterUrl} 
              alt={currentMedia.title}
              className="w-10 h-14 object-cover rounded-md border border-white/10 flex-shrink-0 shadow-sm"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Tayangan Aktif untuk Sinkronisasi
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                {currentMedia.title}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-brand-400" />
                  {Math.floor(progress.currentTime / 60)}m {Math.floor(progress.currentTime % 60)}s ({progress.percentage}%)
                </span>
                <span>•</span>
                <span>Akun: <strong className="text-slate-200">{user?.name || 'Tamu'}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePushProgress}
            disabled={isPushingProgress}
            className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer flex-shrink-0 ${
              progressPushSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-500 text-white active:scale-95'
            }`}
          >
            {isPushingProgress ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : progressPushSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Tersimpan di Cloud!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Progres ke Cloud</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-white/[0.08] text-xs font-medium">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mobile'
                ? 'border-brand-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Koneksi HP (Flutter Client)</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backend'
                ? 'border-brand-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Status Layanan Backend</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-brand-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Panduan Tim Pengembang</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">

          {/* ================= TAB 1: MOBILE CLIENT ================= */}
          {activeTab === 'mobile' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-white shadow-xl">
                    <img 
                      src={qrUrl} 
                      alt="Scan QR untuk membuka di HP"
                      className="w-40 h-40 object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan dari Kamera Smartphone</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                    Pastikan smartphone terhubung pada Wi-Fi yang sama (<strong>Cileunca</strong>).
                  </p>
                </div>

                {/* Direct URLs & Deep Links */}
                <div className="space-y-2.5">
                  <h5 className="font-semibold text-white text-xs flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-brand-400" />
                    Tautan Akses Cepat Perangkat:
                  </h5>

                  {/* Physical Device LAN URL */}
                  <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">HP Fisik (Wi-Fi LAN)</span>
                      <button 
                        onClick={() => handleCopy(mobileWebUrl, 'lan')}
                        className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedLink === 'lan' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLink === 'lan' ? 'Tersalin' : 'Salin URL'}</span>
                      </button>
                    </div>
                    <code className="text-[11px] text-slate-200 font-mono block truncate bg-black/40 px-2 py-1 rounded">
                      {mobileWebUrl}
                    </code>
                  </div>

                  {/* Android Emulator URL */}
                  <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Android Emulator (Flutter)</span>
                      <button 
                        onClick={() => handleCopy('http://10.0.2.2:3000', 'android')}
                        className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedLink === 'android' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLink === 'android' ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                    <code className="text-[11px] text-slate-200 font-mono block truncate bg-black/40 px-2 py-1 rounded">
                      http://10.0.2.2:3000
                    </code>
                  </div>

                  {/* App Deep Link Scheme */}
                  <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Deep Link Schema Aplikasi Flutter</span>
                      <button 
                        onClick={() => handleCopy(deepLink, 'deeplink')}
                        className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedLink === 'deeplink' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLink === 'deeplink' ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                    <code className="text-[11px] text-slate-200 font-mono block truncate bg-black/40 px-2 py-1 rounded">
                      {deepLink}
                    </code>
                  </div>
                </div>
              </div>

              {/* Seamless Handshake Note */}
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-slate-300 space-y-1">
                <span className="font-semibold text-brand-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Bagaimana Sinkronisasi Bekerja?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Saat Anda menekan tombol <strong>"Kirim Progres ke Cloud"</strong>, detik pemutaran tontonan terakhir dikirimkan ke backend PostgreSQL melalui endpoint <code>PUT /api/v1/user/progress</code>. Ketika aplikasi mobile Flutter dibuka, Riverpod provider memanggil <code>GET /api/v1/user/progress</code> untuk langsung menampilkan baris <em>"Lanjutkan Menonton"</em> dari detik yang sama persis.
                </p>
              </div>
            </div>
          )}

          {/* ================= TAB 2: BACKEND STATUS ================= */}
          {activeTab === 'backend' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">
                  Pemeriksaan Status Microservices Backend:
                </span>
                <button
                  onClick={checkBackendServices}
                  disabled={isCheckingBackend}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isCheckingBackend ? 'animate-spin' : ''}`} />
                  <span>Uji Ping Ulang</span>
                </button>
              </div>

              {/* Service 1: Spring Boot Catalog Service */}
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h5 className="font-bold text-white text-xs">Catalog Service (Spring Boot 3.3.4)</h5>
                      <span className="text-[10px] text-slate-400 font-mono">Port: 8081 (dan fallback 8080)</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                    catalogStatus.online 
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {catalogStatus.online ? `Online (${catalogStatus.latency}ms)` : 'Data Lokal (Offline)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {catalogStatus.message}
                </p>
                <div className="pt-1 flex items-center gap-2 text-[10px]">
                  <a
                    href="http://localhost:8081/api/v1/swagger-ui.html"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>Swagger UI Port 8081</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <span>•</span>
                  <a
                    href="http://localhost:8080/swagger-ui.html"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>Swagger UI Port 8080</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Service 2: Golang Auth Service */}
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-400" />
                    <div>
                      <h5 className="font-bold text-white text-xs">Auth Service (Golang Gin + GORM)</h5>
                      <span className="text-[10px] text-slate-400 font-mono">Port: 8080 (REST JWT & OAuth)</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                    authStatus.online 
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {authStatus.online ? `Online (${authStatus.latency}ms)` : 'Fallback Mode (Offline)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {authStatus.message}
                </p>
                <div className="pt-1 text-[10px] text-slate-400">
                  Endpoint aktif: <code>POST /login</code>, <code>POST /register</code>, <code>GET /api/me</code>
                </div>
              </div>

              {/* Fallback Architecture explanation */}
              <div className="p-3 rounded-xl bg-surface-900 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                💡 <strong>Catatan Ketahanan (Zero-Downtime Resilience):</strong> Frontend secara cerdas didesain agar tetap dapat berjalan 100% mulus sekalipun service backend lokal belum di-boot. Anda dapat mendemokan antarmuka web, modal detail, dan video player kapan saja tanpa terhalang dependensi backend.
              </div>
            </div>
          )}

          {/* ================= TAB 3: DEV GUIDE ================= */}
          {activeTab === 'guide' && (
            <div className="space-y-3 animate-fade-in text-[11px]">
              <p className="text-slate-300">
                Cara menjalankan ketiga komponen ekosistem secara bersamaan di terminal Anda:
              </p>

              {/* Step 1: Catalog Service */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>1. Menjalankan Catalog Service (Spring Boot)</span>
                  <span className="text-[10px] font-mono text-emerald-400">Port 8081</span>
                </div>
                <pre className="p-2 rounded bg-black/60 font-mono text-slate-200 overflow-x-auto text-[10px]">
cd catalog-service{'\n'}./mvnw spring-boot:run
                </pre>
              </div>

              {/* Step 2: Auth Service */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>2. Menjalankan Auth Service (Golang)</span>
                  <span className="text-[10px] font-mono text-brand-400">Port 8080</span>
                </div>
                <pre className="p-2 rounded bg-black/60 font-mono text-slate-200 overflow-x-auto text-[10px]">
cd auth-service{'\n'}go run cmd/server/main.go
                </pre>
              </div>

              {/* Step 3: Flutter Mobile */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>3. Menjalankan Klien Mobile (Flutter)</span>
                  <span className="text-[10px] font-mono text-sky-400">Android / iOS</span>
                </div>
                <pre className="p-2 rounded bg-black/60 font-mono text-slate-200 overflow-x-auto text-[10px]">
flutter pub get{'\n'}flutter run
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Laptop className="w-3.5 h-3.5 text-slate-300" />
            <span>IP Komputer: <strong className="text-white font-mono">{localIp}</strong></span>
          </div>

          <button
            onClick={closeMobileSync}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
