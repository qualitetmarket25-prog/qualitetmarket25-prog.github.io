// ===== QualitetMarket PWA SW v3 =====
// Strategia:
// - HTML & JS: network-first (zawsze świeże)
// - CSS / icons / manifest: cache-first
// - pełne czyszczenie starego cache przy zmianie wersji

const VERSION = "v3-20260228";
const CACHE_STATIC = `qualitet-static-${VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512-maskable.png"
];

// ===== INSTALL =====
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// ===== ACTIVATE =====
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_STATIC)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ===== FETCH =====
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Tylko ta domena
  if (url.origin !== self.location.origin) return;

  // JS i HTML zawsze z sieci (network-first)
  if (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".html")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // CSS / icons / manifest cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_STATIC).then((cache) => {
            cache.put(event.request, copy);
          });
        }
        return resp;
      });
    })
  );
});
