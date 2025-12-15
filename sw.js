// Service Worker para PWA HERCOM

const CACHE_NAME = 'tech-repair-v3'; // Incrementa la versión para forzar la actualización
const urlsToCache = [
    '/',
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'icon-192.png',
    'icon-512.png',
    'img/placeholder-component.jpg',
    'https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Instalar el service worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache abierto, añadiendo URLs al caché');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar el service worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker activado. Limpiando cachés antiguos.');
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

// Interceptar solicitudes
// Estrategia: Network first, falling back to cache.
self.addEventListener('fetch', (event) => {
    // No interceptar las solicitudes a la API. Dejarlas pasar directamente a la red.
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(event.request).then((networkResponse) => {
            // Si la respuesta de la red es exitosa, la clonamos y la guardamos en caché
            return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                // Y retornamos la respuesta de la red
                return networkResponse;
            });
        }).catch((error) => {
            console.log('Fetch falló; devolviendo desde caché:', error);
            // Si la red falla (sin conexión), intentamos obtenerla del caché
            return caches.match(event.request);
        })
    );
});