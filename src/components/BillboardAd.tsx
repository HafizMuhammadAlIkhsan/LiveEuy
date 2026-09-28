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

  return (
    <div className={`${fluid ? 'w-full' : 'cinema-layout-container'} my-2 sm:my-3 lg:my-3.5 ${className}`}>
      {/* Dual Horizontal Banners Side-by-Side: Slim rectangular height matching IDLIX */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 items-center w-full">
        {/* Left Banner */}
        <div
          onClick={() => handleAdClick(leftAd)}
          className="group relative w-full aspect-[866/78] rounded-lg sm:rounded-xl overflow-hidden cursor-pointer shadow-md transition-all duration-200 hover:scale-[1.008] hover:brightness-105 active:scale-[0.99] border border-white/5 hover:border-cyan-500/30 bg-black/40 flex items-center justify-center"
          style={{ aspectRatio: '866 / 78' }}
          role="button"
          tabIndex={0}
          aria-label={leftAd.title}
          onKeyDown={(e) => e.key === 'Enter' && handleAdClick(leftAd)}
        >
          <img
            src={leftAd.bannerUrl}
            alt={leftAd.title}
            className="w-full h-full object-contain object-center block select-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/ads/banner-liveeuy-vip.svg';
            }}
          />
        </div>

        {/* Right Banner */}
        <div
          onClick={() => handleAdClick(rightAd)}
          className="group relative w-full aspect-[866/78] rounded-lg sm:rounded-xl overflow-hidden cursor-pointer shadow-md transition-all duration-200 hover:scale-[1.008] hover:brightness-105 active:scale-[0.99] border border-white/5 hover:border-blue-500/30 bg-black/40 flex items-center justify-center"
          style={{ aspectRatio: '866 / 78' }}
          role="button"
          tabIndex={0}
          aria-label={rightAd.title}
          onKeyDown={(e) => e.key === 'Enter' && handleAdClick(rightAd)}
        >
          <img
            src={rightAd.bannerUrl}
            alt={rightAd.title}
            className="w-full h-full object-contain object-center block select-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/ads/banner-liveeuy-mobile.svg';
            }}
          />
        </div>
      </div>
    </div>
  );
};
