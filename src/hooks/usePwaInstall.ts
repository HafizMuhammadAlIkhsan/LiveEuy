import { useState, useEffect, useCallback } from 'react';
import { BeforeInstallPromptEvent, isStandaloneMode, isIosDevice } from '../utils/pwa';

export interface PwaInstallState {
  isInstallable: boolean;
  isStandalone: boolean;
  isIos: boolean;
  promptInstall: () => Promise<boolean>;
}

export function usePwaInstall(): PwaInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => isStandaloneMode());
  const [isIos] = useState<boolean>(() => isIosDevice());

  useEffect(() => {
    // Check standalone state on mount and resize
    const checkStandalone = () => {
      setIsStandalone(isStandaloneMode());
    };

    window.addEventListener('resize', checkStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar on mobile Chrome
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('resize', checkStandalone);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error prompting PWA installation:', err);
      return false;
    }
  }, [deferredPrompt]);

  return {
    isInstallable: Boolean(deferredPrompt),
    isStandalone,
    isIos,
    promptInstall
  };
}
