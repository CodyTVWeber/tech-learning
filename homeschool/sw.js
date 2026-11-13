/* Hub service worker: this folder + kit + learner index pages. Apps cache in each learner SW. */
const SW_URL = new URL(self.location.href);
const CACHE = "hs-hub-v1";

async function put(cache, url) {
  try {
    const res = await fetch(url, { cache: "reload" });
    if (res.ok) await cache.put(url, res.clone());
  } catch (e) {}
}

async function fill() {
  const cache = await caches.open(CACHE);
  const base = [
    "./",
    "./index.html",
    "./hub.js",
    "./hub.css",
    "./stages.json",
    "./apps-index.json",
    "./manifest.webmanifest",
    "./sw.js",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/maskable-192.png",
    "./icons/maskable-512.png",
    "./decks/index.html",
    "./decks/catalog.json",
    "./kit/a11y.css",
    "./kit/nav.css",
    "./kit/nav.js",
    "./kit/audio.js",
    "./kit/tts.js",
    "./kit/progress.js",
    "./kit/pwa.js",
    "./kit/runner.js",
    "./kit/home.js",
  ].map(function (p) {
    return new URL(p, SW_URL).href;
  });
  for (let i = 0; i < base.length; i++) await put(cache, base[i]);
  try {
    const stages = await (await fetch(new URL("./stages.json", SW_URL), { cache: "reload" })).json();
    const list = stages.stages || [];
    for (let i = 0; i < list.length; i++) {
      const f = list[i].folder;
      await put(cache, new URL("./" + f + "/", SW_URL).href);
      await put(cache, new URL("./" + f + "/index.html", SW_URL).href);
    }
  } catch (e) {}
}

self.addEventListener("install", function (event) {
  event.waitUntil(fill().then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    (async function () {
      const hit = await caches.match(event.request);
      if (hit) return hit;
      const stripped = new URL(event.request.url);
      stripped.search = "";
      const hit2 = await caches.match(stripped.href);
      if (hit2) return hit2;
      try {
        return await fetch(event.request);
      } catch (e) {
        if (event.request.mode === "navigate") return caches.match(new URL("./index.html", SW_URL));
        return Response.error();
      }
    })()
  );
});
self.addEventListener("message", function (event) {
  const data = event.data || {};
  if (data.type === "skip-waiting") self.skipWaiting();
  if (data.type === "ensure-apps") {
    event.waitUntil(
      fill().then(function () {
        if (event.ports && event.ports[0]) event.ports[0].postMessage({ ok: true });
      })
    );
  }
});
