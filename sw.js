const CACHE_NAME = 'loopy-fupan-v3.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './loopy_app_icon_1775255773227.png',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // If it's a cross-origin request for fonts, cache it
        if (event.request.url.includes('fonts.gstatic.com')) {
           return caches.open(CACHE_NAME).then((cache) => {
             cache.put(event.request, fetchResponse.clone());
             return fetchResponse;
           });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Offline fallback can go here
    })
  );
});
