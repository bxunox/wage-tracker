const CACHE_NAME = "wage-tracker-v2"; // increment this whenever you update files

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        "./",
        "index.html",
        "style.css",
        "script.js",
        "manifest.json",
        "icon-192.png",
        "icon-512.png"
      ])
    )
  );
  self.skipWaiting(); // activate new SW immediately
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // take control of pages immediately
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});