// Offline support for the Koine Greek Workbook.
// The page itself is fetched network-first so updates appear when online;
// everything else (icons, fonts) is served from the cache once stored.
const CACHE = "kgw-v1";
const CORE = [
  "/greek/index.html",
  "/greek/manifest.webmanifest",
  "/greek/icon-192.png",
  "/greek/icon-512.png",
  "/greek/icon-maskable-512.png",
  "/greek/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  const isOurs = url.origin === self.location.origin && url.pathname.startsWith("/greek/");
  if (!isFont && !isOurs) return;

  if (req.mode === "navigate" || url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put("/greek/index.html", res.clone()));
          return res;
        })
        .catch(() => caches.match("/greek/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok || res.type === "opaque") {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
