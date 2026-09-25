import React, { useEffect, useState } from 'react';
import { ExternalLink, Sparkles, Megaphone, ShieldCheck, ChevronRight } from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { AdCampaign } from '../types';

interface BillboardAdProps {
  placementIndex?: number;
  className?: string;
}

export const BillboardAd: React.FC<BillboardAdProps> = ({ placementIndex = 0, className = '' }) => {
  const { ads, recordAdImpression, recordAdClick, openPartnershipModal } = useWatch();

  // Find active billboard feed ads
  const billboardAds = ads.filter(a => a.isActive && a.layer === 'billboard_feed');
  
  // Pick ad based on index or fallback
  const ad: AdCampaign | undefined = billboardAds[placementIndex % Math.max(1, billboardAds.length)];

  const [hasRecordedImpression, setHasRecordedImpression] = useState(false);

  useEffect(() => {
    if (ad && !hasRecordedImpression) {
      recordAdImpression(ad.id);
      setHasRecordedImpression(true);
    }
  }, [ad, hasRecordedImpression, recordAdImpression]);

  if (!ad) {
    // If no active billboard ad, show an inviting "Pasang Iklan di Sini" placeholder card
    return (
      <div className={`cinema-layout-container my-8 ${className}`}>
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-surface-900 via-surface-800 to-brand-950/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Ruang Kemitraan Sinematik</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Jangkau 150.000+ Penonton Aktif di LiveEuy
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Promosikan brand, produk, atau layanan Anda dengan format iklan 16:9 sinematik berdaya pikat tinggi di seluruh layer tayangan.
            </p>
          </div>

          <button
            onClick={openPartnershipModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-secondary-500 hover:from-brand-500 hover:to-secondary-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-brand-500/30 transition-all hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Pasang Iklan Sekarang</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleAdClick = () => {
    recordAdClick(ad.id);
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`cinema-layout-container my-8 ${className}`}>
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-surface-900 shadow-2xl group transition-all duration-300 hover:border-white/20">
        
        {/* Backdrop Ambient Image */}
        <div className="absolute inset-0">
          <img
            src={ad.bannerUrl}
            alt={ad.title}
            className="w-full h-full object-cover opacity-25 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700"
            onError={(e) => {
              (e.target as any).src = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-950 via-surface-900/90 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Header Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>{ad.badge || 'MITRA RESMI'}</span>
              </span>
              <span className="text-xs font-bold text-slate-300">
                {ad.partnerName}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {ad.category}
              </span>
            </div>

            {/* Headline & Title */}
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                {ad.headline || ad.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {ad.description}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap flex-shrink-0">
            <button
              onClick={handleAdClick}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{ad.ctaText || 'Kunjungi Mitra'}</span>
              <ExternalLink className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={openPartnershipModal}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
              title="Informasi Pemasangan Iklan & Paket Kemitraan"
            >
              <Megaphone className="w-3.5 h-3.5 text-brand-400" />
              <span>Bermitra</span>
            </button>
          </div>
        </div>

        {/* Small Bottom Disclaimer Tag */}
        <div className="relative z-10 px-6 sm:px-8 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
          <span>Tayangan promosi resmi terverifikasi LiveEuy Cinema Network</span>
          <span className="font-mono">Ad ID: #{ad.id}</span>
        </div>

      </div>
    </div>
  );
};
