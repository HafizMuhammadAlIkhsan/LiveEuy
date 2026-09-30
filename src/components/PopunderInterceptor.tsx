import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useWatch } from '../context/WatchContext';
import { AdCampaign } from '../types';
import { sanitizeUrl } from '../utils/security';

export const PopunderInterceptor: React.FC = () => {
  const { ads, recordAdImpression, recordAdClick, user } = useWatch();
  const location = useLocation();

  const isAdminView = location.pathname.startsWith('/admin');
  const isVip = user?.tier === 'VIP Cinema Ultra' || user?.tier === 'VIP Standard';

  const hasTriggeredInSessionRef = useRef(false);

  // Find active popunder campaign
  const popunderAd: AdCampaign | undefined = ads.find(
    a => a.isActive && a.layer === 'popunder_interstitial'
  );

  useEffect(() => {
    if (!popunderAd || isAdminView || isVip) return;

    const handleFirstInteraction = (e: MouseEvent) => {
      // Don't trigger if clicking inside admin panel, or if already triggered
      if (hasTriggeredInSessionRef.current) return;

      // Check frequency cap cooldown (e.g. 15 minutes)
      const capMinutes = popunderAd.frequencyCapMinutes || 15;
      const lastTriggerKey = 'liveeuy_popunder_last_trigger';
      const lastTrigger = localStorage.getItem(lastTriggerKey);

      if (lastTrigger) {
        const elapsed = (Date.now() - parseInt(lastTrigger, 10)) / (1000 * 60);
        if (elapsed < capMinutes) {
          // Still in cooldown
          return;
        }
      }

      // Check if clicking inside interactive modal closes or sensitive inputs
      const target = e.target as HTMLElement;
      if (target.closest('button[aria-label="Tutup"], button[title="Tutup"], input, textarea')) {
        return;
      }

      // Trigger popunder sponsor tab
      hasTriggeredInSessionRef.current = true;
      localStorage.setItem(lastTriggerKey, Date.now().toString());

      recordAdImpression(popunderAd.id);
      recordAdClick(popunderAd.id);

      const safeUrl = sanitizeUrl(popunderAd.targetUrl);
      if (safeUrl) {
        window.open(safeUrl, '_blank', 'noopener,noreferrer');
      }
    };

    window.addEventListener('click', handleFirstInteraction, { capture: true, once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
    };
  }, [popunderAd, isAdminView, isVip, recordAdImpression, recordAdClick]);

  return null;
};
