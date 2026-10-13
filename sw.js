/* Azat service worker: offline app shell + notification display.
   Bump CACHE on every release so phones pick up new files. */
const CACHE = 'azat-v5';
const ASSETS = [
  './', './index.html',
  './css/style.css',
  './js/i18n.js', './js/data.js', './js/notify.js', './js/app.js', './js/eggs.js',
  './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) =>
      hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});

// Show a locally-scheduled notification (from notify.js via postMessage,
// or TimestampTrigger where supported).
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'azat-notify' && d.title) {
    self.registration.showNotification(d.title, {
      body: d.body || '',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: d.tag || 'azat',
      renotify: true,
      data: { url: './index.html#/home' }
    });
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './index.html#/home';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) { if ('focus' in w) return w.focus(); }
      return clients.openWindow(url);
    })
  );
});

// Periodic Background Sync (Chrome/Android): daily motivation ping.
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'azat-daily') {
    e.waitUntil(
      (async () => {
        const all = await clients.matchAll();
        // Ask the open page for a localized message; fall back silently.
        if (all.length) {
          all[0].postMessage({ type: 'azat-daily-wanted' });
        } else {
          self.registration.showNotification('Azat Ազատ', {
            body: 'Մի փոքր քայլ այսօր։ / A small step today.',
            icon: './icons/icon-192.png', tag: 'azat-daily'
          });
        }
      })()
    );
  }
});
