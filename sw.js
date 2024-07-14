self.addEventListener('install', (event) => {
    console.log('Service Worker installiert');
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/script.js',
                '/manifest.json',
                '/images/clear.png', // Fügen Sie hier alle benötigten Dateien hinzu
                '/images/cloudy.png',
                '/images/light_rain.png',
                '/images/partly_cloudy.png',
                '/images/rain.png',
                '/images/snow.png',
                '/images/thunderstorm.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
