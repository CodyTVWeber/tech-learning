const CACHE = "hs-reading-v3";
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
    caches.match(event.request).then(function (hit) {
      return hit || fetch(event.request);
    })
  );
});
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "skip-waiting") self.skipWaiting();
  if (event.data && event.data.type === "ensure-apps" && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ ok: true });
  }
});
