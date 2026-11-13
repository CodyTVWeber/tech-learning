const CACHE = "hs-math-v4";
const BASE = new URL("./", self.location);

self.addEventListener("install", function (event) {
  event.waitUntil(
    (async function () {
      const assets = await (await fetch(new URL("./assets.json", BASE), { cache: "reload" })).json();
      const cache = await caches.open(CACHE);
      const files = (assets.files || []).map(function (f) {
        return new URL(f, BASE).href;
      });
      files.push(new URL("./", BASE).href);
      files.push(new URL("./index.html", BASE).href);
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
      return Promise.all(
        keys
          .filter(function (k) {
            return k !== CACHE;
          })
          .map(function (k) {
            return caches.delete(k);
          })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    (async function () {
      const cache = await caches.open(CACHE);
      let hit = await cache.match(event.request);
      if (hit) return hit;
      hit = await cache.match(event.request, { ignoreSearch: true });
      if (hit) return hit;
      if (event.request.mode === "navigate") {
        hit = await cache.match(new URL("./index.html", BASE).href);
        if (hit) return hit;
        hit = await cache.match(new URL("./", BASE).href);
        if (hit) return hit;
      }
      try {
        return await fetch(event.request);
      } catch (e) {
        if (event.request.mode === "navigate") {
          const fallback = await cache.match(new URL("./index.html", BASE).href);
          if (fallback) return fallback;
        }
        throw e;
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
