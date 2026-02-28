const CACHE = "qualitet-pwa-v2";

// Minimalny zestaw (musi istnieć na 100%)
const CORE = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512-maskable.png"
];

// Reszta – opcjonalna (jak nie ma, nie wywali SW)
const OPTIONAL = [
  // strony
  "/cennik.html",
  "/qualitetmarket.html",
  "/intelligence.html",
  "/blueprints.html",
  "/hurtownie.html",
  "/dashboard.html",
  "/login.html",
  "/aktywuj-pro.html",

  // js (root) – jeśli realnie masz te pliki
  "/app.js",
  "/auth.js",
  "/planGuard.js",
  "/intelligence.js",
  "/blueprints.js",

  // folder js (u Ciebie był 404, więc traktujemy jako opcjonalne)
  "/js/planGuard.js",

  // favicon (opcjonalnie; jak go nie masz, nie szkodzi)
  "/favicon.ico"
];

async function cacheAddSafe(cache, url) {
  try {
    const resp = await fetch(url, { cache: "no-cache" });
    if (resp.ok) await cache.put(url, resp);
  } catch (e) {
    // ignorujemy brak/404/błąd
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    // CORE: tu chcemy twardo (ale też bez wywalenia całej instalacji)
    for (const url of CORE) {
      await cacheAddSafe(cache, url);
    }

    // OPTIONAL: zawsze bezpiecznie
    for (const url of OPTIONAL) {
      await cacheAddSafe(cache, url);
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const resp = await fetch(event.request);
      // cache dynamiczny tylko dla plików z tej domeny
      if (resp && resp.ok && event.request.url.startsWith(self.location.origin)) {
        const copy = resp.clone();
        const cache = await caches.open(CACHE);
        cache.put(event.request, copy);
      }
      return resp;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});
