(function (global) {
  const HS = (global.HS = global.HS || {});

  function showUpdate(reg) {
    const bar = document.getElementById("hs-update");
    if (!bar) return;
    bar.classList.add("is-on");
    const btn = bar.querySelector("button");
    if (btn) {
      btn.onclick = function () {
        if (reg.waiting) reg.waiting.postMessage({ type: "skip-waiting" });
        global.location.reload();
      };
    }
  }

  HS.whenPrecacheReady = function whenPrecacheReady() {
    return HS._precacheReady || Promise.resolve();
  };

  HS.registerPWA = function registerPWA(opts) {
    opts = opts || {};
    const swUrl = opts.swUrl || "./sw.js";
    if (!("serviceWorker" in navigator)) {
      HS._precacheReady = Promise.resolve();
      global.__HS_PRECACHE_READY = true;
      return Promise.resolve(null);
    }
    HS._precacheReady = navigator.serviceWorker
      .register(swUrl, { scope: opts.scope || "./" })
      .then(function (reg) {
        if (reg.waiting) showUpdate(reg);
        reg.addEventListener("updatefound", function () {
          const w = reg.installing;
          if (!w) return;
          w.addEventListener("statechange", function () {
            if (w.state === "installed" && navigator.serviceWorker.controller) showUpdate(reg);
          });
        });
        return navigator.serviceWorker.ready.then(function () {
          const ctl = navigator.serviceWorker.controller;
          // Play pages must not kick off another full cache:reload of every
          // linked app; that work races HS.runApp() and, once several large
          // apps exist, leaves empty shells (singing) unrendered for the
          // offline smoke. Home/hub still pass ensureApps (default true).
          if (!ctl || opts.ensureApps === false) {
            global.__HS_PRECACHE_READY = true;
            return reg;
          }
          return new Promise(function (resolve) {
            const ch = new MessageChannel();
            const t = setTimeout(function () {
              global.__HS_PRECACHE_READY = true;
              resolve(reg);
            }, 8000);
            ch.port1.onmessage = function () {
              clearTimeout(t);
              global.__HS_PRECACHE_READY = true;
              resolve(reg);
            };
            ctl.postMessage({ type: "ensure-apps" }, [ch.port2]);
          });
        });
      })
      .catch(function (err) {
        console.warn("SW register failed", err);
        global.__HS_PRECACHE_READY = true;
      });

    return HS._precacheReady;
  };
})(window);
