const CACHE_NAME = 'mkma-cache-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/portal.html',
  '/css/variables.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/portal.css',
  '/css/public.css',
  '/js/i18n.js?v=2.3.0',
  '/js/theme.js?v=2.3.0',
  '/js/api.js?v=2.3.0',
  '/js/components.js?v=2.3.0',
  '/js/public.js?v=2.3.0',
  '/js/portal.js?v=2.3.0',
  '/assets/logo.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/')) {
    return; // Don't cache dynamic API requests
  }

  // Network-first for JavaScript, HTML, and CSS documents so changes take effect immediately
  const isCodeAsset = e.request.destination === 'document' ||
                      e.request.destination === 'script' ||
                      e.request.destination === 'style' ||
                      e.request.url.includes('.js') ||
                      e.request.url.includes('.html') ||
                      e.request.url.includes('.css');

  if (isCodeAsset) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for images, fonts, and other static assets
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
