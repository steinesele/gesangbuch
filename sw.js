const CACHE = 'jkl-202607170837';
const ASSETS = [
  '/gesangbuch/',
  '/gesangbuch/index.html',
  '/gesangbuch/manifest.json',
  '/gesangbuch/icon-192.png',
  '/gesangbuch/icon-512.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // CDN requests (Supabase, Tailwind, xlsx) immer vom Netz
  if (e.request.url.includes('cdn.') ||
      e.request.url.includes('supabase.co') ||
      e.request.url.includes('jsdelivr') ||
      e.request.url.includes('unpkg')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
