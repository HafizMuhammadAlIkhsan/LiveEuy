import React, { useEffect, useState } from 'react';
import { useWatch } from '../context/WatchContext';
import { AdCampaign } from '../types';

interface BillboardAdProps {
  placementIndex?: number;
  className?: string;
}

const DEFAULT_LEFT_BANNER: AdCampaign = {
  id: 'ad-qq828',
  title: 'MEMBER BARU QQ828',
  partnerName: 'QQ828',
  partnerLogo: '/ads/banner-qq828.png',
  layer: 'billboard_feed',
  bannerUrl: '/ads/banner-qq828.png',
  targetUrl: 'https://qq828.com',
  ctaText: 'Daftar Sekarang',
  headline: 'MEMBER BARU QQ828',
  description: 'Bonus Member Baru QQ828',
  badge: 'SPONSOR UTAMA',
  category: 'Entertainment & Gaming',
  budget: 50000000,
  impressions: 345000,
  clicks: 42100,
  startDate: '2026-09-01',
  endDate: '2026-12-31',
  isActive: true,
};

const DEFAULT_RIGHT_BANNER: AdCampaign = {
  id: 'ad-qq888bet',
  title: 'QQ888BET Berani Coba?',
  partnerName: 'QQ888BET',
  partnerLogo: '/ads/banner-qq888bet.png',
  layer: 'billboard_feed',
  bannerUrl: '/ads/banner-qq888bet.png',
  targetUrl: 'https://qq888bet.com',
  ctaText: 'Berani Coba?',
  headline: 'QQ888BET Berani Coba?',
  description: 'Sensasi hiburan dan tantangan harian berhadiah.',
  badge: 'HOT SPONSOR',
  category: 'Entertainment & Gaming',
  budget: 45000000,
  impressions: 310000,
  clicks: 38900,
  startDate: '2026-09-01',
  endDate: '2026-12-31',
  isActive: true,
};

export const BillboardAd: React.FC<BillboardAdProps> = ({ placementIndex = 0, className = '' }) => {
  const { ads, recordAdImpression, recordAdClick, openPartnershipModal } = useWatch();

  // Find active billboard feed ads
  const billboardAds = ads.filter(a => a.isActive && a.layer === 'billboard_feed');

  // Pair selection with fallback to the authentic dual banners
  const leftAd: AdCampaign = billboardAds[placementIndex * 2] || DEFAULT_LEFT_BANNER;
  const rightAd: AdCampaign = billboardAds[placementIndex * 2 + 1] || DEFAULT_RIGHT_BANNER;

  const [hasRecordedImpressions, setHasRecordedImpressions] = useState(false);

  useEffect(() => {
    if (!hasRecordedImpressions) {
      if (leftAd?.id) recordAdImpression(leftAd.id);
      if (rightAd?.id && rightAd.id !== leftAd?.id) recordAdImpression(rightAd.id);
      setHasRecordedImpressions(true);
    }
  }, [leftAd, rightAd, hasRecordedImpressions, recordAdImpression]);

  const handleAdClick = (ad: AdCampaign) => {
    if (ad?.id) {
      recordAdClick(ad.id);
    }
    if (ad?.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`cinema-layout-container my-6 sm:my-8 ${className}`}>
      {/* Subtle (18+) label above banners, matching authentic pirate streaming site aesthetic */}
      <div className="flex items-center justify-center mb-2">
        <span className="text-[11px] font-mono tracking-wider text-slate-500/80 hover:text-slate-400 select-none transition-colors">
          (18+)
        </span>
      </div>

      {/* Dual Horizontal Banners Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-center">
        {/* Left Banner: MEMBER BARU QQ828 */}
        <div
          onClick={() => handleAdClick(leftAd)}
          className="group relative rounded-xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] border border-white/5 hover:border-cyan-500/30 bg-black/40"
          role="button"
          tabIndex={0}
          aria-label={leftAd.title}
          onKeyDown={(e) => e.key === 'Enter' && handleAdClick(leftAd)}
        >
          <img
            src={leftAd.bannerUrl}
            alt={leftAd.title}
            className="w-full h-auto object-cover block select-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/ads/banner-qq828.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Right Banner: QQ888BET Berani Coba? */}
        <div
          onClick={() => handleAdClick(rightAd)}
          className="group relative rounded-xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] border border-white/5 hover:border-blue-500/30 bg-black/40"
          role="button"
          tabIndex={0}
          aria-label={rightAd.title}
          onKeyDown={(e) => e.key === 'Enter' && handleAdClick(rightAd)}
        >
          <img
            src={rightAd.bannerUrl}
            alt={rightAd.title}
            className="w-full h-auto object-cover block select-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/ads/banner-qq888bet.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Discreet footer meta & partnership link */}
      <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500/70">
        <span className="font-mono">Sponsor LiveEuy Cinema Network</span>
        <button
          onClick={openPartnershipModal}
          className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Pasang Iklan di Sini</span>
        </button>
      </div>
    </div>
  );
};
