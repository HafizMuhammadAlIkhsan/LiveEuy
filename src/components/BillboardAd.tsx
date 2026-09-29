import React, { useEffect, useState } from 'react';
import { useWatch } from '../context/WatchContext';
import { AdCampaign } from '../types';

interface BillboardAdProps {
  placementIndex?: number;
  className?: string;
  fluid?: boolean;
}

export const BillboardAd: React.FC<BillboardAdProps> = ({ placementIndex = 0, className = '', fluid = false }) => {
  const { ads, recordAdImpression, recordAdClick } = useWatch();

  // Find active billboard feed ads synchronized with Admin Page
  const billboardAds = ads.filter(a => a.isActive && a.layer === 'billboard_feed');

  // If all billboard ads are deactivated in Admin Page, do not render anything
  if (billboardAds.length === 0) {
    return null;
  }

  // Pair selection from active billboard ads
  const leftAd: AdCampaign = billboardAds[(placementIndex * 2) % billboardAds.length];
  const rightAd: AdCampaign = billboardAds.length > 1
    ? billboardAds[(placementIndex * 2 + 1) % billboardAds.length]
    : billboardAds[0];

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

  const renderBannerCard = (ad: AdCampaign, fallbackSvg: string, hoverBorderColor: string) => {
    const isSvgOrFormatted = ad.bannerUrl?.endsWith('.svg') || ad.bannerUrl?.includes('banner-') || ad.bannerUrl?.includes('billboard');

    return (
      <div
        onClick={() => handleAdClick(ad)}
        className={`group relative w-full aspect-[866/120] xs:aspect-[866/96] sm:aspect-[866/78] rounded-xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] border border-white/10 ${hoverBorderColor} bg-slate-900/80 flex items-center justify-center`}
        role="button"
        tabIndex={0}
        aria-label={ad.title}
        onKeyDown={(e) => e.key === 'Enter' && handleAdClick(ad)}
      >
        <img
          src={ad.bannerUrl}
          alt={ad.title}
          className={`w-full h-full ${isSvgOrFormatted ? 'object-cover sm:object-contain' : 'object-cover'} object-center block select-none`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackSvg;
          }}
        />

        {/* Dynamic Rich Overlay for Custom Non-SVG Photo Ads to prevent letterboxing */}
        {!isSvgOrFormatted && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 flex items-center justify-between px-3.5 sm:px-5">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
              {ad.partnerLogo && (
                <img
                  src={ad.partnerLogo}
                  alt={ad.partnerName}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg object-contain bg-white/10 p-1 border border-white/10 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate">{ad.title}</span>
                  {ad.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-bold bg-brand-600/40 text-brand-300 border border-brand-500/30 uppercase shrink-0">
                      {ad.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 truncate mt-0.5">{ad.headline || ad.description}</p>
              </div>
            </div>
            {ad.ctaText && (
              <span className="flex-shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-brand-600 text-white text-[10px] sm:text-xs font-bold shadow-md group-hover:bg-brand-500 transition-colors whitespace-nowrap">
                {ad.ctaText}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${fluid ? 'w-full' : 'cinema-layout-container'} my-2 sm:my-3 lg:my-3.5 ${className}`}>
      {/* Inner wrapper matching MediaRow carousel px-1 horizontal alignment */}
      <div className="px-0.5 sm:px-1">
        {/* Dual Horizontal Banners: Responsive 1 col on mobile, 2 cols on tablet/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 items-center w-full">
          {renderBannerCard(leftAd, '/ads/banner-liveeuy-vip.svg', 'hover:border-cyan-500/40')}
          {renderBannerCard(rightAd, '/ads/banner-liveeuy-mobile.svg', 'hover:border-blue-500/40')}
        </div>
      </div>
    </div>
  );
};
