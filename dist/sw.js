const CACHE='sundar-v4';
const ASSETS=['./','index.html','styles.css','gallery.css','config.js','demo-data.js','app.js','manifest.webmanifest','favicon.svg','assets/emerald-saree.png','assets/saree-gallery.webp','assets/blouse-gallery.webp','assets/bridal-gallery.webp','assets/tshirt-gallery.webp','assets/uniform-gallery.webp','assets/cap-gallery.webp','assets/bag-gallery.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>event.respondWith(caches.match(event.request).then(response=>response||fetch(event.request))));
