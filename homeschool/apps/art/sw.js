const CACHE = "hs-art-v3";
const BASE = new URL("./", self.location);

self.addEventListener("install", function (event) {
  event.waitUntil(
    (async function () {
      const assets = await (await fetch(new URL("./assets.json", BASE), { cache: "reload" })).json();
      const cache = await caches.open(CACHE);
      const files = (assets.files || []).map(function (f) {
        return new URL(f, BASE).href;
      });
      for (let i = 0; i < files.length; i++) {
        try {
          const res = await fetch(files[i], { cache: "reload" });
          if (res.ok) await cache.put(files[i], res.clone());
        } catch (e) {}
      }
      await self.skipWaiting();
    })()
  );
});
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    (async function () {
      const hit = await caches.match(event.request, { ignoreSearch: true });
      if (hit) return hit;
      try {
        const res = await fetch(event.request);
        return res;
      } catch (err) {
        if (event.request.mode === "navigate") {
          const fallback = await caches.match(new URL("./index.html", BASE).href, { ignoreSearch: true });
          if (fallback) return fallback;
        }
        const again = await caches.match(event.request, { ignoreSearch: true });
        if (again) return again;
        throw err;
      }
    })()
  );
});
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "skip-waiting") self.skipWaiting();
  if (event.data && event.data.type === "ensure-apps" && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ ok: true });
  }
});
