
const CACHE_NAME = 'vision-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com?plugins=forms,container-queries',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // attempt to cache all assets but don't fail the whole installation if one fails
      return Promise.allSettled(
        [...ASSETS_TO_CACHE, ...EXTERNAL_ASSETS].map(url => cache.add(url))
      ).then(() => {
        console.log('Vision ServiceWorker: Caching complete');
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Return original response
        return response;
      }).catch(() => {
        // If fetch fails (offline) and it's a navigation request, return index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
