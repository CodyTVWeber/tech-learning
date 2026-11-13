const CACHE = "hs-art-v1";

self.addEventListener("install", function (event) {
  event.waitUntil((async function () {
    const res = await fetch("assets.json");
    const data = await res.json();
    const cache = await caches.open(CACHE);
    await cache.addAll(data.files);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", function (event) {
  event.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith((async function () {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      const cache = await caches.open(CACHE);
      cache.put(event.request, res.clone());
      return res;
    } catch (err) {
      const fallback = await caches.match("index.html");
      if (fallback) return fallback;
      throw err;
    }
  })());
});
