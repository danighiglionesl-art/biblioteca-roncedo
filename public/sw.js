const CACHE_NAME = 'roncedo-pwa-v8';

const STATIC_ASSETS = [
  '/',
  '/home',
  '/carnet',
  '/mi-biblioteca',
  '/libros',
  '/biblioteca-digital',
  '/socio-protector',
  '/roncedo',
  '/tienda',
  '/instalar',
  '/manifest.json',
  '/images/escudo-roncedo.png',
  '/images/logo-biblioteca.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  // Forzar activación inmediata del nuevo Service Worker sin esperar a que cierren la app
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
    if (event.data.type === 'CLEAR_ALL_CACHES') {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NUNCA cachear peticiones POST/PUT/DELETE ni rutas de API
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Estrategia NETWORK-FIRST ESTRICTA para:
  // - Navegaciones completas (modo 'navigate')
  // - Páginas HTML (Accept: text/html)
  // - Transiciones RSC de Next.js (headers 'rsc', accept 'text/x-component', query '?_rsc=')
  // - Peticiones de datos Next.js (/_next/data/)
  // Esto garantiza que en Android cualquier cambio publicado en Vercel se refleje AL INSTANTE.
  const acceptHeader = event.request.headers.get('accept') || '';
  const isRSCRequest =
    event.request.headers.get('rsc') === '1' ||
    url.searchParams.has('_rsc') ||
    acceptHeader.includes('text/x-component') ||
    url.pathname.startsWith('/_next/data/');

  const isHtmlPage =
    event.request.mode === 'navigate' ||
    acceptHeader.includes('text/html');

  if (isHtmlPage || isRSCRequest) {
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
          // Si no hay red, servir desde cache offline
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return caches.match('/mi-biblioteca') || caches.match('/home');
          });
        })
    );
    return;
  }

  // 3. Estrategia STALE-WHILE-REVALIDATE para chunks estáticos (JS con hash inmutable, CSS, fuentes)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
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
