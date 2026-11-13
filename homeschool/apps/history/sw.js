var CACHE = "hs-history-v4";
var ASSETS = [
  "./",
  "./index.html",
  "./css/train.css",
  "./js/audio.js",
  "./js/progress.js",
  "./js/content-stations.js",
  "./js/content-quizzes.js",
  "./js/content-extra.js",
  "./js/app.js",
  "./assets.json",
  "./images.json",
  "./images/hero-station.jpg",
  "./images/tickets.jpg",
  "./images/stamp-album.jpg",
  "./images/wheels-steam.jpg",
  "./images/lantern.jpg",
  "./images/sailing-ship.jpg",
  "./images/civic-hall.jpg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function (hit) {
      return hit || fetch(event.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        return res;
      }).catch(function () {
        return caches.match("./index.html");
      });
    })
  );
});
