self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                console.log('REMOVING OLD CACHE:', key);
                return caches.delete(key);
            }));
        })
            .then(() => {
                return self.clients.claim();
            })
    );
});
