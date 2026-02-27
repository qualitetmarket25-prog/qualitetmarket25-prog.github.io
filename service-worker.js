const CACHE_NAME = "qualitet-cache-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",

  // strony
  "./cennik.html",
  "./qualitetmarket.html",
  "./intelligence.html",
  "./blueprints.html",
  "./hurtownie.html",
  "./dashboard.html",
  "./login.html",
  "./aktywuj-pro.html",

  // manifest + ikony
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512-maskable.png",

  // skrypty (root i fallback)
  "./planGuard.js",
  "./app.js",
  "./auth.js",
  "./intelligence.js",
  "./blueprints.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // tylko GET
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resp) => {
        // cache dynamiczny dla plików statycznych
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return resp;
      }).catch(() => cached);
    })
  );
});
