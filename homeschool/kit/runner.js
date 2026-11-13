(function (global) {
  const HS = (global.HS = global.HS || {});
  const APP_ID = /^[a-z0-9-]+$/;

  function rewriteIn(el, base) {
    ["src", "href", "poster"].forEach(function (attr) {
      const v = el.getAttribute(attr);
      if (!v) return;
      if (/^(data:|blob:|https?:|javascript:|mailto:|#)/i.test(v)) return;
      el.setAttribute(attr, new URL(v, base).href);
    });
  }

  function rewriteTree(root, base) {
    root.querySelectorAll("[src],[href],[poster]").forEach(function (n) {
      rewriteIn(n, base);
    });
  }

  HS.url = function url(path) {
    const base = document.documentElement.dataset.appBase || "./";
    return new URL(path, base).href;
  };

  HS.runApp = async function runApp() {
    const params = new URLSearchParams(global.location.search);
    const id = params.get("app") || "";
    const root = document.getElementById("app-root");
    if (!APP_ID.test(id)) {
      root.innerHTML = "<p>Pick a lesson from Home.</p>";
      return;
    }
    const appBase = new URL("../apps/" + id + "/", global.location.href).href;
    const assetsRes = await fetch(appBase + "assets.json");
    if (!assetsRes.ok) {
      root.innerHTML =
        "<p>That lesson is not on this device yet. Try again after it has been added.</p>";
      return;
    }
    const assets = await assetsRes.json();
    const band = HS.getBand();
    HS.setBand(band);
    HS.subject = assets.id || id;
    HS.appBase = appBase;
    HS.band = band;
    document.documentElement.dataset.runner = "1";
    document.documentElement.dataset.appBase = appBase;
    document.documentElement.dataset.subject = HS.subject;
    document.documentElement.dataset.band = band;

    HS.mountChrome({
      title: assets.title || assets.shortTitle || id,
      sub: "Band: " + band,
      homeHref: "./",
    });

    const html = await (await fetch(appBase + "index.html")).text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const appTitle = doc.querySelector("title");
    if (appTitle) document.title = appTitle.textContent + " · Home";

    doc.querySelectorAll("link[rel='stylesheet']").forEach(function (link) {
      const href = link.getAttribute("href");
      if (!href) return;
      const el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = new URL(href, appBase).href;
      document.head.appendChild(el);
    });

    const dest = document.createElement("div");
    dest.innerHTML = doc.body ? doc.body.innerHTML : "";
    rewriteTree(dest, appBase);
    dest.querySelectorAll("script").forEach(function (s) {
      s.remove();
    });
    root.replaceChildren.apply(root, dest.childNodes);

    const scripts = Array.from(doc.querySelectorAll("script"));
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].getAttribute("src");
      await new Promise(function (resolve, reject) {
        const el = document.createElement("script");
        if (scripts[i].type) el.type = scripts[i].type;
        if (src) {
          el.src = new URL(src, appBase).href;
          el.onload = resolve;
          el.onerror = function () {
            reject(new Error("Failed to load " + el.src));
          };
          document.body.appendChild(el);
        } else {
          el.textContent = scripts[i].textContent;
          document.body.appendChild(el);
          resolve();
        }
      });
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.body.classList.contains("hs-play")) return;
    HS.registerPWA({ swUrl: "./sw.js", scope: "./" });
    HS.runApp().catch(function (err) {
      console.error(err);
      const root = document.getElementById("app-root");
      if (root) root.innerHTML = "<p>Could not open that lesson.</p>";
    });
  });
})(window);
