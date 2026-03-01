const VERSION = "qm-sw-v4";
const STATIC_CACHE = `qm-static-${VERSION}`;
const RUNTIME_CACHE = `qm-runtime-${VERSION}`;

// Tylko realnie istniejące i stałe pliki.
// NIE dodawaj tu stron typu /intelligence.html itd. (bo często zmieniasz i SW potem miesza).
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/js/planGuard.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);

    // Precache “best effort” – tylko OK odpowiedzi
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "no-cache" });
        if (res && res.ok) await cache.put(url, res.clone());
      } catch (_) {}
    }));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k.startsWith("qm-") && k !== STATIC_CACHE && k !== RUNTIME_CACHE)
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

const isHTML = (req) =>
  req.mode === "navigate" ||
  (req.headers.get("accept") || "").includes("text/html");

const isAssetPath = (pathname) =>
  /\.(js|css|png|jpg|jpeg|webp|svg|ico|json)$/i.test(pathname);

// Helper: normalizuj "/" -> "/index.html" w cache match
async function matchStatic(urlOrReq) {
  const req = (urlOrReq instanceof Request) ? urlOrReq : new Request(urlOrReq);
  let cached = await caches.match(req);
  if (cached) return cached;

  // "/": czasem przeglądarka pyta o "/" – a my mamy też "/index.html"
  const u = new URL(req.url);
  if (u.origin === self.location.origin && u.pathname === "/") {
    cached = await caches.match("/index.html");
    if (cached) return cached;
  }
  return null;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 1) NAV / HTML — network-first, ale nie zapisujemy HTML do runtime cache
  if (isHTML(req)) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) return fresh;
        // jeśli serwer zwrócił nie-ok, spróbuj cache
        return (await matchStatic(req)) || Response.error();
      } catch (_) {
        // offline: index jako fallback
        return (await matchStatic(req)) || Response.error();
      }
    })());
    return;
  }

  // 2) Assets — stale-while-revalidate
  if (isAssetPath(url.pathname)) {
    event.respondWith((async () => {
      // Najpierw STATIC (precache), potem runtime
      const staticHit = await matchStatic(req);
      if (staticHit) {
        // w tle odśwież runtime
        event.waitUntil((async () => {
          try {
            const res = await fetch(req);
            if (res && res.ok) {
              const cache = await caches.open(RUNTIME_CACHE);
              await cache.put(req, res.clone());
            }
          } catch (_) {}
        })());
        return staticHit;
      }

      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);

      const refresh = (async () => {
        try {
          const res = await fetch(req);
          if (res && res.ok) await cache.put(req, res.clone());
          return res;
        } catch (_) {
          return null;
        }
      })();

      return cached || (await refresh) || Response.error();
    })());
    return;
  }

  // 3) Reszta: passthrough (bez cache) – minimalizuje “dziwne” przypadki
});
