/* Learner-folder service worker. Discovers apps via stages.json + assets.json. */
const SW_URL = new URL(self.location.href);
const KID_BASE = new URL("./", SW_URL);
const ROOT = new URL("../", SW_URL);
const FOLDER = KID_BASE.pathname.split("/").filter(Boolean).pop();
const CACHE_PREFIX = "hs-learner-" + FOLDER + "-";

function cacheName(extra) {
  return CACHE_PREFIX + (extra || "v1");
}

async function put(cache, url) {
  try {
    const res = await fetch(url, { cache: "reload" });
    if (res.ok) await cache.put(url, res.clone());
  } catch (e) {
    /* skip missing */
  }
}

async function kitFiles() {
  const names = [
    "a11y.css",
    "nav.css",
    "nav.js",
    "audio.js",
    "tts.js",
    "progress.js",
    "pwa.js",
    "runner.js",
    "home.js",
  ];
  return names.map(function (n) {
    return new URL("../kit/" + n, SW_URL).href;
  });
}

async function localFiles() {
  return [
    new URL("./", SW_URL).href,
    new URL("./index.html", SW_URL).href,
    new URL("./play.html", SW_URL).href,
    new URL("./manifest.webmanifest", SW_URL).href,
    new URL("./sw.js", SW_URL).href,
    new URL("./icons/icon-192.png", SW_URL).href,
    new URL("./icons/icon-512.png", SW_URL).href,
    new URL("./icons/maskable-192.png", SW_URL).href,
    new URL("./icons/maskable-512.png", SW_URL).href,
    new URL("../stages.json", SW_URL).href,
    new URL("../apps-index.json", SW_URL).href,
  ];
}

async function appFilesFromAssets() {
  const out = [];
  try {
    const stages = await (await fetch(new URL("../stages.json", SW_URL), { cache: "reload" })).json();
    const me = (stages.stages || []).find(function (s) {
      return s.folder === FOLDER;
    });
    if (!me) return out;
    let present = [];
    try {
      present = (await (await fetch(new URL("../apps-index.json", SW_URL), { cache: "reload" })).json()).apps || [];
    } catch (e) {}
    const ids = Object.keys(me.subjects || {});
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (!me.subjects[id] || me.subjects[id] === "none") continue;
      if (present.indexOf(id) === -1) continue;
      const assetsUrl = new URL("../apps/" + id + "/assets.json", SW_URL);
      try {
        const res = await fetch(assetsUrl, { cache: "reload" });
        if (!res.ok) continue;
        const assets = await res.json();
        out.push(assetsUrl.href);
        (assets.files || []).forEach(function (f) {
          out.push(new URL("../apps/" + id + "/" + f, SW_URL).href);
        });
      } catch (e) {
        /* app not in this build yet */
      }
    }
  } catch (e) {
    /* stages missing */
  }
  return out;
}

async function fillCache() {
  const cache = await caches.open(cacheName("runtime"));
  const lists = await Promise.all([localFiles(), kitFiles(), appFilesFromAssets()]);
  const urls = Array.from(new Set([].concat.apply([], lists)));
  for (let i = 0; i < urls.length; i++) await put(cache, urls[i]);
  return urls.length;
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    fillCache().then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return k.indexOf(CACHE_PREFIX) === 0 && k !== cacheName("runtime");
            })
            .map(function (k) {
              return caches.delete(k);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    (async function () {
      const hit = await caches.match(req);
      if (hit) return hit;
      const stripped = new URL(req.url);
      stripped.search = "";
      const hit2 = await caches.match(stripped.href);
      if (hit2) return hit2;
      try {
        return await fetch(req);
      } catch (e) {
        if (req.mode === "navigate") return caches.match(new URL("./index.html", SW_URL));
        return Response.error();
      }
    })()
  );
});

self.addEventListener("message", function (event) {
  const data = event.data || {};
  if (data.type === "skip-waiting") {
    self.skipWaiting();
    return;
  }
  if (data.type === "ensure-apps") {
    event.waitUntil(
      fillCache().then(function (n) {
        if (event.ports && event.ports[0]) event.ports[0].postMessage({ ok: true, count: n });
      })
    );
  }
});
