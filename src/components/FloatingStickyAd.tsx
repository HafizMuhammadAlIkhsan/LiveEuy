import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { useWatch } from '../context/WatchContext';
import { AdCampaign } from '../types';
import { sanitizeUrl } from '../utils/security';

export const FloatingStickyAd: React.FC = () => {
  const { ads, recordAdImpression, recordAdClick, user } = useWatch();
  const location = useLocation();

  // Hide in admin view or for VIP users
  const isAdminView = location.pathname.startsWith('/admin');
  const isVip = user?.tier === 'VIP Cinema Ultra' || user?.tier === 'VIP Standard';

  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('liveeuy_dismiss_sticky_ad') === 'true';
    } catch {
      return false;
    }
  });

  const [hasRecordedImpression, setHasRecordedImpression] = useState(false);

  // Find active floating bottom ad
  const activeAd: AdCampaign | undefined = ads.find(
    a => a.isActive && a.layer === 'floating_bottom'
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
      sessionStorage.setItem('liveeuy_dismiss_sticky_ad', 'true');
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickAd = () => {
    if (activeAd?.id) {
      recordAdClick(activeAd.id);
    }
    const safeUrl = sanitizeUrl(activeAd?.targetUrl);
    if (safeUrl) {
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed bottom-16 md:bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-40 max-w-4xl mx-auto pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        onClick={handleClickAd}
        className="group relative rounded-2xl bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 hover:border-brand-500/40 shadow-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.005] active:scale-[0.995]"
        role="button"
        tabIndex={0}
        aria-label={activeAd.title}
        onKeyDown={(e) => e.key === 'Enter' && handleClickAd()}
      >
        {/* Left Side: Thumbnail & Text */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Small Banner Thumbnail */}
          <div className="relative w-16 sm:w-24 h-9 sm:h-11 rounded-lg overflow-hidden bg-black/60 border border-white/10 flex-shrink-0 flex items-center justify-center">
            <img
              src={activeAd.bannerUrl}
              alt={activeAd.title}
              className="w-full h-full object-cover block"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/ads/banner-liveeuy-vip.svg';
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                {activeAd.badge || 'PROMO'}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                {activeAd.title}
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 truncate mt-0.5 hidden xs:block">
              {activeAd.headline || activeAd.description}
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button + Dismiss (X) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleClickAd}
            className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30 flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>{activeAd.ctaText || 'Klaim Sekarang'}</span>
            <ExternalLink className="w-3 h-3 hidden sm:inline" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Tutup Iklan"
            aria-label="Tutup Iklan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
