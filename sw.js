const CACHE = 'imperium-v1';
const ASSETS = [
  '/imperium/',
  '/imperium/index.html',
  'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
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
  // Para Firebase siempre ir a red (mensajes en tiempo real)
  if (e.request.url.includes('firebaseio.com') ||
      e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis.com/identitytoolkit')) {
    return e.respondWith(fetch(e.request));
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, clone));
      return res;
    }))
  );
});
