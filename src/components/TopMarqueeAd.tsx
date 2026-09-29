import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ChevronRight, Megaphone } from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { AdCampaign } from '../types';

export const TopMarqueeAd: React.FC = () => {
  const { ads, recordAdImpression, recordAdClick, user } = useWatch();
  const location = useLocation();

  const isAdminView = location.pathname.startsWith('/admin');
  const isVip = user?.tier === 'VIP Cinema Ultra';

  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('liveeuy_dismiss_top_marquee') === 'true';
    } catch {
      return false;
    }
  });

  const [hasRecordedImpression, setHasRecordedImpression] = useState(false);

  // Find active top marquee ad
  const activeAd: AdCampaign | undefined = ads.find(
    a => a.isActive && a.layer === 'top_marquee'
  );

  useEffect(() => {
    if (activeAd && !isDismissed && !isAdminView && !isVip && !hasRecordedImpression) {
      recordAdImpression(activeAd.id);
      setHasRecordedImpression(true);
    }
  }, [activeAd, isDismissed, isAdminView, isVip, hasRecordedImpression, recordAdImpression]);

  if (!activeAd || isDismissed || isAdminView || isVip) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('liveeuy_dismiss_top_marquee', 'true');
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickAd = () => {
    if (activeAd?.id) {
      recordAdClick(activeAd.id);
    }
    if (activeAd?.targetUrl) {
      window.open(activeAd.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const displayText = activeAd.tickerText || activeAd.headline || `${activeAd.title} - ${activeAd.description}`;

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/90 via-surface-950 to-brand-950/90 border-b border-amber-500/30 text-xs py-1.5 px-3 sm:px-4 z-50 sticky top-0 backdrop-blur-md">
      <div className="cinema-layout-container flex items-center justify-between gap-3 mx-auto">
        
        {/* Left Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
            <Megaphone className="w-2.5 h-2.5" />
            {activeAd.badge || 'PROMO'}
          </span>
          <span className="font-bold text-white text-[11px] hidden md:inline">
            {activeAd.partnerName}:
          </span>
        </div>

        {/* Center Scrolling Ticker / Text */}
        <div
          onClick={handleClickAd}
          className="flex-1 min-w-0 overflow-hidden cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleClickAd()}
        >
          <div className="flex items-center gap-2 text-slate-200 group-hover:text-amber-300 transition-colors truncate">
            <span className="truncate text-[11px] sm:text-xs">
              {displayText}
            </span>
            <span className="text-[10px] font-bold text-amber-400 group-hover:underline flex items-center gap-0.5 flex-shrink-0">
              {activeAd.ctaText || 'Lihat'}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* Right Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
          title="Tutup Pengumuman"
          aria-label="Tutup Pengumuman"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
