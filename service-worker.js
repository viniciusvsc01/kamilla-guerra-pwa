const CACHE_VERSION = 'v1.0.5';  // ← MUDE ISSO A CADA ATUALIZAÇÃO
const CACHE_NAME = `kamilla-guerra-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install - Instala nova versão
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando versão:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Força ativação imediata
  );
});

// Activate - Remove versões antigas
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando versão:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume controle imediato
  );
});

// Fetch - Estratégia: Network First (sempre tenta buscar versão nova)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se conseguiu buscar da rede, salva no cache e retorna
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Se falhou (offline), tenta buscar do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se não tem no cache, retorna erro





