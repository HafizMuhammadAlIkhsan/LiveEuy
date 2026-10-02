/**
 * LiveEuy Sinema PWA Service Worker (v2)
 * Caches local app shell and static assets for offline resilience.
 * NEVER intercepts cross-origin media or external CDNs (Unsplash, mux, cloudflare)
 * to ensure all external posters and streaming video load reliably through native browser channels.
 */

const CACHE_NAME = 'liveeuy-shell-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('liveeuy-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Bypass non-GET requests (POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // 2. CRITICAL: Bypass all cross-origin requests completely.
  // External images (Unsplash, placeholders), external streams (Mux, Akamai, Cloudflare),
  // and third-party APIs must be fetched directly by the browser's native networking stack.
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. Bypass media streaming extensions on same-origin (if any)
  if (/\.(m3u8|ts|mp4|webm|m4s|mpd)(\?.*)?$/i.test(url.pathname)) {
    return;
  }

  // 4. Navigation requests: Network-first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html').then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // 5. Local API calls: Network-first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 6. Local static assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails, cachedResponse will be returned
        });

      return cachedResponse || fetchPromise;
    })
  );
});
