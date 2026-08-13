const CACHE_NAME = 'lifeops-cache-v3';
const ASSETS = ['./index.html', './manifest.json', './icon-192-v2.png', './icon-512-v2.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

/* Network-first: always try to fetch the latest version first, so updates
   you push to GitHub show up right away. Falls back to the cached copy only
   when there's no network connection (offline support). */
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      return response;
    }).catch(() => caches.match(event.request))
  );
});
