const CACHE = "hs-science-v1";
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
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(event.request).then(function (res) {
        const copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        return res;
      }).catch(function () {
        if (event.request.mode === "navigate") {
          return caches.match(new URL("./index.html", BASE).href, { ignoreSearch: true });
        }
        return caches.match(event.request, { ignoreSearch: true });
      });
    })
  );
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "skip-waiting") self.skipWaiting();
  if (event.data && event.data.type === "ensure-apps" && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ ok: true });
  }
});
