const CACHE_NAME = 'roncedo-pwa-v5';

const STATIC_ASSETS = [
  '/',
  '/home',
  '/carnet',
  '/mi-biblioteca',
  '/libros',
  '/biblioteca-digital',
  '/instalar',
  '/manifest.json',
  '/images/escudo-roncedo.jpg',
  '/images/emblema-biblioteca.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purgando cache antiguo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NUNCA cachear peticiones POST/PUT/DELETE ni rutas de API
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Estrategia NETWORK-FIRST para navegaciones y páginas HTML
  // Garantiza que en Android siempre se vea la versión más reciente publicada
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(() => {
          // Si no hay red, servir desde cache
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return caches.match('/mi-biblioteca') || caches.match('/home');
          });
        })
    );
    return;
  }

  // 3. Estrategia STALE-WHILE-REVALIDATE para recursos estáticos (CSS, JS, imágenes, fuentes)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
