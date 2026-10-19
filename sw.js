// Offline support for My Day. Change VERSION after editing index.html so phones pick up the update.
const VERSION = "myday-v1";
const CORE = ["./", "./index.html", "./manifest.json", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Serve from cache first, refresh in the background when online (works for the page and the fonts).
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      const network = fetch(e.request)
        .then(res => { if (res && (res.ok || res.type === "opaque")) cache.put(e.request, res.clone()); return res; })
        .catch(() => cached || (e.request.mode === "navigate" ? cache.match("./index.html") : undefined));
      return cached || network;
    })
  );
});
