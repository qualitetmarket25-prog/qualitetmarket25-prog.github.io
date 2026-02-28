const CACHE = "qualitet-pwa-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.json",

  // ikony
  "/icons/icon-192.png",
  "/icons/icon-512-maskable.png",

  // strony
  "/cennik.html",
  "/qualitetmarket.html",
  "/intelligence.html",
  "/blueprints.html",
  "/hurtownie.html",
  "/dashboard.html",
  "/login.html",
  "/aktywuj-pro.html",

  // js (root)
  "/app.js",
  "/auth.js",
  "/planGuard.js",
  "/intelligence.js",
  "/blueprints.js",

  // js (folder js - jeśli istnieje)
  "/js/planGuard.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
          return resp;
        })
        .catch(() => cached);
    })
  );
});
