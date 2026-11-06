const CACHE_NAME = 'alghafari-soft-pro-v4-offline-ready';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/intro.mp4',
  '/assets/aistudio/1787182612810_5ba9faf5.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Precache critical resources
      return Promise.all(
        PRECACHE_URLS.map((url) => {
          return fetch(url)
            .then((res) => {
              if (res.ok) {
                return cache.put(url, res);
              }
            })
            .catch((err) => {
              console.warn('Precache partial fallback for:', url, err);
            });
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Navigation requests (Opening the app, entering URL, refreshing, or opening from home screen)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then((cachedIndex) => {
          if (cachedIndex) return cachedIndex;
          return caches.match('/');
        })
        .then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put('/index.html', clone);
                  cache.put('/', networkResponse.clone());
                });
              }
              return networkResponse;
            })
            .catch(() => null);

          // If offline and we have cached HTML, return it instantly
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetchPromise;
        })
    );
    return;
  }

  // 2. Video Range requests (For smooth offline video playback on Android/iOS)
  if (url.pathname.endsWith('.mp4') || request.destination === 'video') {
    event.respondWith(
      caches.match(request.url).then((cachedResponse) => {
        if (cachedResponse) {
          // If the browser asked for a Range request and we have the full file in cache:
          if (request.headers.get('range')) {
            return cachedResponse.arrayBuffer().then((buffer) => {
              const range = request.headers.get('range');
              const bytes = range.replace(/bytes=/, '').split('-');
              const start = parseInt(bytes[0], 10) || 0;
              const end = bytes[1] ? parseInt(bytes[1], 10) : buffer.byteLength - 1;
              const slicedBuffer = buffer.slice(start, end + 1);

              return new Response(slicedBuffer, {
                status: 206,
                statusText: 'Partial Content',
                headers: {
                  'Content-Type': 'video/mp4',
                  'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
                  'Content-Length': `${slicedBuffer.byteLength}`,
                  'Accept-Ranges': 'bytes'
                }
              });
            });
          }
          return cachedResponse;
        }

        // If not in cache yet, fetch from network and cache
        return fetch(request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 206)) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request.url, clone);
              cache.put('/intro.mp4', networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch(() => {
          return caches.match('/intro.mp4');
        });
      })
    );
    return;
  }

  // 3. Static Assets: JS bundles, CSS stylesheets, images, icons, and fonts
  // Cache-First with automatic background revalidation for 100% offline speed
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // In background, fetch and update cache if online
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => null);

      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, wait for network or fallback
      return fetchPromise.then((networkResponse) => {
        if (networkResponse) return networkResponse;

        // Fallback for missing scripts or navigation
        if (request.destination === 'script' || url.pathname.endsWith('.js')) {
          // Look for any cached JS bundle
          return caches.open(CACHE_NAME).then((cache) => {
            return cache.keys().then((keys) => {
              const jsKey = keys.find(k => k.url.includes('.js'));
              if (jsKey) return cache.match(jsKey);
              return new Response('', { headers: { 'Content-Type': 'application/javascript' } });
            });
          });
        }

        if (request.destination === 'image' || url.pathname.endsWith('.png')) {
          return caches.match('/logo.png');
        }

        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
