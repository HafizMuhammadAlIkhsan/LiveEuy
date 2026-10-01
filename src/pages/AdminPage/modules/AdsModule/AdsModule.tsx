import React from 'react';
import { 
  Megaphone, 
  RotateCcw, 
  Plus, 
  Layers, 
  Eye, 
  ExternalLink, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  X 
} from 'lucide-react';
import { AdCampaign } from '../../../../types';
import { sanitizeUrl } from '../../../../utils/security';

interface AdsModuleProps {
  ads: AdCampaign[];
  activeBillboardFeedAds: AdCampaign[];
  activeStickyAds: AdCampaign[];
  activeMarqueeAds: AdCampaign[];
  activePopunderAds: AdCampaign[];
  filteredAds: AdCampaign[];
  adFilterLayer: 'all' | 'billboard_feed' | 'floating_bottom' | 'top_marquee' | 'popunder_interstitial' | 'video_preroll' | 'hero_spotlight';
  setAdFilterLayer: (layer: 'all' | 'billboard_feed' | 'floating_bottom' | 'top_marquee' | 'popunder_interstitial' | 'video_preroll' | 'hero_spotlight') => void;
  adPreviewTab: 'billboard_feed' | 'floating_bottom' | 'top_marquee' | 'popunder_interstitial';
  setAdPreviewTab: (tab: 'billboard_feed' | 'floating_bottom' | 'top_marquee' | 'popunder_interstitial') => void;
  isAdModalOpen: boolean;
  setIsAdModalOpen: (open: boolean) => void;
  editingAdId: string | null;
  adFormData: Partial<AdCampaign>;
  setAdFormData: React.Dispatch<React.SetStateAction<Partial<AdCampaign>>>;
  handleOpenAddAd: () => void;
  handleOpenEditAd: (ad: AdCampaign) => void;
  handleSaveAd: (e: React.FormEvent) => void;
  toggleAdCampaign: (id: string) => void;
  deleteAdCampaign: (id: string) => void;
  resetAdsToDefault: () => void;
  showToast: (msg: string) => void;
}

export const AdsModule: React.FC<AdsModuleProps> = ({
  ads,
  activeBillboardFeedAds,
  activeStickyAds,
  activeMarqueeAds,
  activePopunderAds,
  filteredAds,
  adFilterLayer,
  setAdFilterLayer,
  adPreviewTab,
  setAdPreviewTab,
  isAdModalOpen,
  setIsAdModalOpen,
  editingAdId,
  adFormData,
  setAdFormData,
  handleOpenAddAd,
  handleOpenEditAd,
  handleSaveAd,
  toggleAdCampaign,
  deleteAdCampaign,
  resetAdsToDefault,
  showToast
}) => {
  return (
    <section className="space-y-6 animate-fade-in">
      
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-1">
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Pusat Kendali Sponsor & Dual Billboard IDLIX</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Manajemen Iklan & Billboard Sponsor</h2>
          <p className="text-xs text-slate-400">
            Atur pasangan iklan banner horizontal di bawah setiap layer film beranda, tautan tujuan, dan status aktif tayangan secara real-time.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              resetAdsToDefault();
              showToast('Konfigurasi iklan dikembalikan ke standar IDLIX!');
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Kembalikan banner ke default LiveEuy VIP dan LiveEuy Mobile"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset ke Default IDLIX</span>
          </button>

          <button
            onClick={handleOpenAddAd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Tambah Iklan Baru</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface-800/60 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Billboard Feed Aktif</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {activeBillboardFeedAds.filter(a => a.isActive).length} <span className="text-xs font-normal text-slate-400">/ {activeBillboardFeedAds.length}</span>
          </p>
          <p className="text-[10px] text-slate-500">Muncul di setiap baris film beranda</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-800/60 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Impresi (Tayang)</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {ads.reduce((acc, a) => acc + (a.impressions || 0), 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-emerald-400 font-medium">Tercatat di peramban pengguna</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-800/60 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Klik Pengunjung</span>
            <ExternalLink className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {ads.reduce((acc, a) => acc + (a.clicks || 0), 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-500">Pengalihan ke tautan sponsor</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-800/60 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Rata-rata CTR</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {(() => {
              const totalImp = ads.reduce((acc, a) => acc + (a.impressions || 0), 0);
              const totalClk = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);
              return totalImp > 0 ? `${((totalClk / totalImp) * 100).toFixed(2)}%` : '0.00%';
            })()}
          </p>
          <p className="text-[10px] text-slate-500">Rasio interaksi penonton</p>
        </div>
      </div>

      {/* LIVE PREVIEW BOX: Pratinjau Nyata Format Iklan */}
      <div className="bg-surface-800/60 p-5 rounded-3xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Pratinjau Live Format Iklan</h3>
          </div>

          {/* Preview Format Switcher */}
          <div className="flex items-center gap-1 bg-surface-900 p-1 rounded-xl border border-white/10 text-xs overflow-x-auto scrollbar-none">
            {[
              { id: 'billboard_feed', label: 'IDLIX Dual Billboard' },
              { id: 'floating_bottom', label: 'Sticky Bawah' },
              { id: 'top_marquee', label: 'Marquee Atas' },
              { id: 'popunder_interstitial', label: 'Popunder Tab' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAdPreviewTab(tab.id as any)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  adPreviewTab === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: IDLIX Dual Billboard */}
        {adPreviewTab === 'billboard_feed' && (
          <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
            <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
              <span>[ Layer Film Atas ]</span>
              <span className="text-amber-400 font-mono">Status: {activeBillboardFeedAds.filter(a => a.isActive).length > 0 ? 'Tayang Aktif' : 'Iklan Dinonaktifkan'}</span>
            </div>

            {activeBillboardFeedAds.filter(a => a.isActive).length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 items-center w-full">
                {/* Left */}
                <div
                  className="w-full aspect-[866/78] rounded-xl overflow-hidden border border-white/10 shadow-md bg-black/40 flex items-center justify-center"
                  style={{ aspectRatio: '866 / 78' }}
                >
                  <img
                    src={activeBillboardFeedAds.filter(a => a.isActive)[0]?.bannerUrl || '/ads/banner-liveeuy-vip.svg'}
                    alt="Banner Kiri"
                    className="w-full h-full object-cover block"
                  />
                </div>
                {/* Right */}
                <div
                  className="w-full aspect-[866/78] rounded-xl overflow-hidden border border-white/10 shadow-md bg-black/40 flex items-center justify-center"
                  style={{ aspectRatio: '866 / 78' }}
                >
                  <img
                    src={activeBillboardFeedAds.filter(a => a.isActive)[1]?.bannerUrl || activeBillboardFeedAds.filter(a => a.isActive)[0]?.bannerUrl || '/ads/banner-liveeuy-mobile.svg'}
                    alt="Banner Kanan"
                    className="w-full h-full object-cover block"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs bg-surface-900/50 rounded-xl border border-dashed border-white/10">
                Semua iklan billboard feed sedang nonaktif. Tidak ada iklan yang ditampilkan di beranda.
              </div>
            )}

            <div className="text-[10px] text-slate-400 px-1 pt-1">
              <span>[ Layer Film Bawah (Trending / Aksi / Drama) ]</span>
            </div>
          </div>
        )}

        {/* TAB 2: Floating Sticky Bottom */}
        {adPreviewTab === 'floating_bottom' && (
          <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
            <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
              <span>Simulasi Tampilan Mengambang di Bagian Bawah Layar Desktop & HP</span>
              <span className="text-amber-400 font-mono">
                Status: {activeStickyAds.length > 0 ? 'Tayang Aktif' : 'Iklan Dinonaktifkan'}
              </span>
            </div>

            {activeStickyAds.length > 0 ? (
              <div className="p-2 sm:p-3 rounded-2xl bg-surface-900/90 border border-amber-500/30 backdrop-blur-md shadow-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black/40">
                    <img
                      src={activeStickyAds[0].bannerUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {activeStickyAds[0].badge || 'SPONSOR'}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {activeStickyAds[0].headline || activeStickyAds[0].title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate hidden sm:block">
                      {activeStickyAds[0].description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
                    {activeStickyAds[0].ctaText || 'Lihat Sekarang'}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-surface-800 text-slate-400 flex items-center justify-center text-xs">
                    ✕
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs bg-surface-900/50 rounded-xl border border-dashed border-white/10">
                Tidak ada kampanye floating bottom aktif. Tambahkan atau aktifkan kampanye di layer ini.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Top Marquee Ticker */}
        {adPreviewTab === 'top_marquee' && (
          <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
            <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
              <span>Simulasi Ticker Pengumuman Atas (Tepat di Atas Navbar LiveEuy)</span>
              <span className="text-amber-400 font-mono">
                Status: {activeMarqueeAds.length > 0 ? 'Tayang Aktif' : 'Iklan Dinonaktifkan'}
              </span>
            </div>

            {activeMarqueeAds.length > 0 ? (
              <div className="w-full bg-gradient-to-r from-amber-600/90 via-amber-500/95 to-amber-600/90 text-slate-950 px-3 py-2 rounded-xl flex items-center justify-between gap-3 text-xs shadow-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-950 text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                    {activeMarqueeAds[0].badge || 'PROMO'}
                  </span>
                  <span className="font-bold truncate text-[11px] sm:text-xs">
                    {activeMarqueeAds[0].tickerText || activeMarqueeAds[0].headline}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-extrabold underline text-[11px] sm:text-xs">
                    {activeMarqueeAds[0].ctaText || 'Klaim Sekarang →'}
                  </span>
                  <div className="w-4 h-4 rounded-full bg-slate-950/20 flex items-center justify-center text-[10px] font-bold">
                    ✕
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs bg-surface-900/50 rounded-xl border border-dashed border-white/10">
                Tidak ada kampanye marquee ticker aktif. Tambahkan atau aktifkan kampanye di layer ini.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Popunder Interstitial */}
        {adPreviewTab === 'popunder_interstitial' && (
          <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
            <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
              <span>Simulasi Interseptor Popunder (Buka Tab Sponsor di Klik Interaksi Pertama)</span>
              <span className="text-amber-400 font-mono">
                Status: {activePopunderAds.length > 0 ? 'Aktif Menunggu Klik' : 'Dinonaktifkan'}
              </span>
            </div>

            {activePopunderAds.length > 0 ? (
              <div className="p-4 rounded-2xl bg-surface-900 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    POPUNDER TAB SPONSOR
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Cooldown: {activePopunderAds[0].frequencyCapMinutes || 15} Menit
                  </span>
                </div>
                <h4 className="text-white text-sm font-bold">{activePopunderAds[0].title}</h4>
                <p className="text-xs text-slate-300">{activePopunderAds[0].description}</p>
                <div className="text-[11px] text-brand-400 font-mono flex items-center gap-1.5 pt-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>URL Target: {activePopunderAds[0].targetUrl}</span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1 border-t border-white/5">
                  Catatan: Popunder otomatis diabaikan untuk admin dan member VIP, serta memiliki cooldown berbasis localStorage agar penonton tidak terganggu.
                </p>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs bg-surface-900/50 rounded-xl border border-dashed border-white/10">
                Tidak ada kampanye popunder aktif.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ad Campaigns List */}
      <div className="bg-surface-800/60 p-5 rounded-3xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-brand-400" />
              <span>Daftar Kampanye Iklan & Sponsor</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Klik tombol switch untuk mengaktifkan atau menonaktifkan iklan secara langsung di beranda.
            </p>
          </div>

          {/* Layer Filter Tabs */}
          <div className="flex items-center gap-1 bg-surface-900 p-1 rounded-xl border border-white/10 text-xs overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'Semua Layer' },
              { id: 'billboard_feed', label: 'Billboard Feed' },
              { id: 'floating_bottom', label: 'Sticky Bawah' },
              { id: 'top_marquee', label: 'Marquee Atas' },
              { id: 'popunder_interstitial', label: 'Popunder' },
              { id: 'video_preroll', label: 'Video Pre-roll' },
              { id: 'hero_spotlight', label: 'Hero Spotlight' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAdFilterLayer(tab.id as any)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  adFilterLayer === tab.id
                    ? 'bg-brand-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ads Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAds.map(ad => (
            <div
              key={ad.id}
              className={`p-4 rounded-2xl bg-surface-900 border transition-all space-y-3 ${
                ad.isActive ? 'border-white/10 hover:border-amber-500/40' : 'border-white/5 opacity-60'
              }`}
            >
              {/* Banner Preview */}
              <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 aspect-[11/1] flex items-center justify-center">
                <img
                  src={ad.bannerUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/ads/banner-liveeuy-vip.svg';
                  }}
                />
                <div className="absolute top-1.5 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-black/70 text-white border border-white/20">
                  {ad.layer}
                </div>
              </div>

              {/* Header & Status Switch */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {ad.badge || 'SPONSOR'}
                    </span>
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                      {ad.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    Mitra: <span className="text-slate-300 font-semibold">{ad.partnerName}</span> • {ad.category}
                  </p>
                  <a
                    href={sanitizeUrl(ad.targetUrl) || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-brand-400 hover:underline flex items-center gap-1 mt-1 truncate"
                  >
                    <ExternalLink className="w-3 h-3 flex-none" />
                    <span className="truncate">{ad.targetUrl}</span>
                  </a>
                </div>

                {/* Toggle Switch */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      toggleAdCampaign(ad.id);
                      showToast(`Status iklan "${ad.title}" diubah.`);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      ad.isActive ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                    title={ad.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        ad.isActive ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                  <span className={`text-[10px] font-bold ${ad.isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                    {ad.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {/* Footer Stats & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <div className="flex items-center gap-3 text-slate-400 font-mono">
                  <span>👁️ {ad.impressions || 0} tayang</span>
                  <span>🖱️ {ad.clicks || 0} klik</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditAd(ad)}
                    className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Iklan"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus kampanye iklan "${ad.title}"?`)) {
                        deleteAdCampaign(ad.id);
                        showToast(`Iklan "${ad.title}" telah dihapus.`);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title="Hapus Iklan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tambah / Edit Iklan */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-surface-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  {editingAdId ? 'Edit Iklan Sponsor' : 'Tambah Iklan Sponsor Baru'}
                </h3>
                <p className="text-xs text-slate-400">
                  Konfigurasikan gambar banner dan tautan pengalihan saat diklik penonton.
                </p>
              </div>
              <button
                onClick={() => setIsAdModalOpen(false)}
                className="p-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Judul Iklan *</label>
                <input
                  type="text"
                  required
                  value={adFormData.title || ''}
                  onChange={e => setAdFormData({ ...adFormData, title: e.target.value })}
                  placeholder="Contoh: MEMBER BARU LIVEEUY VIP"
                  className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Nama Sponsor / Brand</label>
                  <input
                    type="text"
                    value={adFormData.partnerName || ''}
                    onChange={e => setAdFormData({ ...adFormData, partnerName: e.target.value })}
                    placeholder="Contoh: LiveEuy Cinema Premiere"
                    className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Teks Badge</label>
                  <input
                    type="text"
                    value={adFormData.badge || ''}
                    onChange={e => setAdFormData({ ...adFormData, badge: e.target.value })}
                    placeholder="Contoh: SPONSOR UTAMA"
                    className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Layer Penempatan</label>
                <select
                  value={adFormData.layer || 'billboard_feed'}
                  onChange={e => setAdFormData({ ...adFormData, layer: e.target.value as any })}
                  className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                >
                  <option value="billboard_feed">Billboard Feed (Bawah Baris Film - IDLIX Dual Banner)</option>
                  <option value="floating_bottom">Floating Sticky Bottom (Bawah Layar Mengambang)</option>
                  <option value="top_marquee">Top Marquee Ticker (Pengumuman Berjalan Atas Navbar)</option>
                  <option value="popunder_interstitial">Popunder Interstitial (Tab Sponsor saat Klik Pertama)</option>
                  <option value="video_preroll">Video Pre-roll (Sebelum Film Diputar)</option>
                  <option value="hero_spotlight">Hero Spotlight</option>
                </select>
              </div>

              {/* Marquee Ticker Text input if layer === 'top_marquee' */}
              {adFormData.layer === 'top_marquee' && (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Teks Marquee / Ticker Berjalan *</label>
                  <input
                    type="text"
                    value={adFormData.tickerText || ''}
                    onChange={e => setAdFormData({ ...adFormData, tickerText: e.target.value })}
                    placeholder="Contoh: 🔥 PROMO LIVEEUY VIP: Diskon 50% langganan tahunan! Akses 4K tanpa jeda."
                    className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              )}

              {/* Popunder Frequency Cap input if layer === 'popunder_interstitial' */}
              {adFormData.layer === 'popunder_interstitial' && (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Batas Frekuensi Popunder (Menit)</label>
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={adFormData.frequencyCapMinutes || 15}
                    onChange={e => setAdFormData({ ...adFormData, frequencyCapMinutes: Number(e.target.value) })}
                    placeholder="15"
                    className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Popunder hanya akan muncul 1 kali per interval menit ini untuk setiap penonton.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Headline Singkat</label>
                  <input
                    type="text"
                    value={adFormData.headline || ''}
                    onChange={e => setAdFormData({ ...adFormData, headline: e.target.value })}
                    placeholder="Contoh: Akses Streaming 4K Ultra VIP"
                    className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Teks Tombol CTA</label>
                  <input
                    type="text"
                    value={adFormData.ctaText || ''}
                    onChange={e => setAdFormData({ ...adFormData, ctaText: e.target.value })}
                    placeholder="Contoh: Klaim Promo →"
                    className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={adFormData.description || ''}
                  onChange={e => setAdFormData({ ...adFormData, description: e.target.value })}
                  placeholder="Contoh: Langganan bulanan tanpa buffering dengan resolusi tajam."
                  className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              {/* Preset Banner Quick Selection */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Pilihan Cepat Banner Bawaan</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdFormData({ ...adFormData, bannerUrl: '/ads/banner-liveeuy-vip.svg', title: adFormData.title || 'MEMBER BARU LIVEEUY VIP', partnerName: adFormData.partnerName || 'LiveEuy Cinema Premiere' })}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-800 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold cursor-pointer"
                  >
                    LiveEuy VIP (Hijau/Cyan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdFormData({ ...adFormData, bannerUrl: '/ads/banner-liveeuy-mobile.svg', title: adFormData.title || 'LIVEEUY MOBILE - Berani Nonton?', partnerName: adFormData.partnerName || 'LiveEuy Mobile App' })}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-800 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold cursor-pointer"
                  >
                    LiveEuy Mobile (Biru/Emas)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">URL Gambar Banner *</label>
                <input
                  type="text"
                  required
                  value={adFormData.bannerUrl || ''}
                  onChange={e => setAdFormData({ ...adFormData, bannerUrl: e.target.value })}
                  placeholder="/ads/banner-liveeuy-vip.svg atau URL eksternal https://..."
                  className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              {/* Banner Image Live Preview */}
              {adFormData.bannerUrl && (
                <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-1">Pratinjau Banner:</span>
                  <img
                    src={adFormData.bannerUrl}
                    alt="Preview"
                    className="w-full h-12 object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/ads/banner-liveeuy-vip.svg';
                    }}
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-300 block mb-1">URL Target (Link saat diklik)</label>
                <input
                  type="text"
                  value={adFormData.targetUrl || ''}
                  onChange={e => setAdFormData({ ...adFormData, targetUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-surface-800 border border-white/10 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={adFormData.isActive ?? true}
                    onChange={e => setAdFormData({ ...adFormData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Aktifkan Langsung di Tayangan</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                  >
                    {editingAdId ? 'Simpan Perubahan' : 'Terbitkan Iklan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
