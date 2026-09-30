/**
 * PWA Service Worker Registration & Installation Helpers
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function unregisterAllServiceWorkers(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const p1 = 'serviceWorker' in navigator
    ? navigator.serviceWorker.getRegistrations().then(async (registrations) => {
        const hadController = Boolean(navigator.serviceWorker.controller);
        for (const registration of registrations) {
          await registration.unregister();
        }
        if (hadController && import.meta.env.DEV) {
          window.location.reload();
        }
      })
    : Promise.resolve();

  const p2 = 'caches' in window
    ? caches.keys().then((keys) => {
        return Promise.all(keys.map((k) => caches.delete(k)));
      })
    : Promise.resolve();

  return Promise.all([p1, p2]).then(() => {});
}

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  // Only run in production builds; unregister during development/test so local dev is unaffected
  if (import.meta.env.DEV || process.env.NODE_ENV === 'test') {
    unregisterAllServiceWorkers();
    return Promise.resolve(null);
  }

  return navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      // Check for updates periodically
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available; post message to skip waiting if appropriate
              installingWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });
      return registration;
    })
    .catch((error) => {
      console.warn('Service worker registration failed:', error);
      return null;
    });
}

export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const isMatchMediaStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  const isNavigatorStandalone =
    typeof window.navigator !== 'undefined' &&
    Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
  return Boolean(isMatchMediaStandalone || isNavigatorStandalone);
}

export function isIosDevice(): boolean {
  if (typeof window === 'undefined' || typeof window.navigator === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}
