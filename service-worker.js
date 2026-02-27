/* Qualitet PWA Service Worker (GitHub Pages friendly) */
const CACHE = "qualitet-pwa-v1";

const CORE = [
  "/",               // start
  "/index.html",
  "/styles.css",
  "/manifest.webmanifest",

  "/dashboard.html",
  "/cennik.html",
  "/qualitetmarket.html",
  "/intelligence.html",
  "/blueprints.html",
  "/hurtownie.html",
  "/login.html",
  "/aktywuj-pro.html",

  // JS (zostawiamy oba warianty, bo u Ciebie bywa różnie)
  "/assets/app.js",
  "/app.js",
  "/js/planGuard.js",
  "/planGuard.js",
  "/js/hurtownie.js",
  "/hurtownie.js",
  "/assets/auth.js",
  "/auth.js",

  // ikony
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

/**
 * Strategia:
 * - HTML: network-first (zawsze świeże, ale offline też działa)
 * - reszta: cache-first (szybko na telefonie)
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // tylko nasz origin
  if (url.origin !== self.location.origin) return;

  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/index.html")))
    );
    return;
  }

  // cache-first dla assetów
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
