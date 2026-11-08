/* 伴读书房 service worker
   App shell: cache first (bump VERSION to ship a new shell).
   data/*: network first, falling back to cache, so new guides show up when online
   and everything already opened still works offline. */
const VERSION = 'bandu-v7';
const SHELL = ['./', 'index.html', 'app.js', 'manifest.webmanifest', 'vendor/jszip.min.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'data/books.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'prefetch' && Array.isArray(e.data.urls)) {
    e.waitUntil(caches.open(VERSION).then(c => Promise.all(e.data.urls.map(u => fetch(u, {cache: 'no-cache'}).then(r => r.ok && c.put(u, r)).catch(() => {})))));
  }
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    // fonts: cache after first use
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
      return r;
    }).catch(() => hit)));
    return;
  }
  if (url.pathname.includes('/data/')) {
    e.respondWith(fetch(req, {cache: 'no-cache'}).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
      return r;
    }).catch(() => caches.match(req, {ignoreSearch: true})));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
    return r;
  }).catch(() => req.mode === 'navigate' ? caches.match('index.html') : undefined)));
});
