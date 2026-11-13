const CACHE = "hs-singing-v1";
self.addEventListener("install", (event) => {
  event.waitUntil(
    fetch("assets.json")
      .then((r) => r.json())
      .then((j) => caches.open(CACHE).then((c) => c.addAll(j.files)))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((hit) => hit || fetch(event.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(event.request, copy));
      return res;
    }).catch(() => event.request.mode === "navigate"
      ? caches.match("./index.html", { ignoreSearch: true })
      : caches.match(event.request, { ignoreSearch: true })))
  );
});
