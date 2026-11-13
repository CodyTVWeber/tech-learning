var CACHE = "hs-geography-v3";
var ASSETS = [
  "./",
  "./index.html",
  "./css/balloon.css",
  "./js/audio.js",
  "./js/progress.js",
  "./js/geo-data.js",
  "./js/geo-quizzes.js",
  "./js/map.js",
  "./js/app.js",
  "./assets.json",
  "./images.json",
  "./images/hero-balloon.jpg",
  "./images/basket-map.jpg",
  "./images/aerial-usa.jpg",
  "./images/river-aerial.jpg",
  "./images/mountains-aerial.jpg",
  "./images/desert-aerial.jpg",
  "./images/lakes-aerial.jpg",
  "./images/us-chart.svg",
  "./assets/svg/us-chart.svg"
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
