(function (global) {
  "use strict";

  function assetUrl(path) {
    if (global.HS && typeof global.HS.url === "function") return global.HS.url(path);
    var base = document.documentElement.dataset.appBase || new URL("./", location.href).href;
    return new URL(path, base).href;
  }

  function loadChart(host) {
    return fetch(assetUrl("images/us-chart.svg")).then(function (r) {
      if (!r.ok) throw new Error("chart missing");
      return r.text();
    }).then(function (svg) {
      host.innerHTML = svg;
      var el = host.querySelector("svg");
      if (el) {
        el.id = "chart";
        el.setAttribute("aria-label", "United States expedition chart");
      }
      return el;
    });
  }

  function highlight(host, abbrs) {
    host.querySelectorAll(".state").forEach(function (g) {
      var hit = g.querySelector(".state-hit");
      if (!hit) return;
      var on = abbrs.indexOf(g.getAttribute("data-abbr")) !== -1;
      if (on) hit.classList.add("glow");
      else hit.classList.remove("glow");
    });
  }

  function bindPins(tray, host, expectedAbbr, onResult) {
    var pins = tray.querySelectorAll(".pin");
    pins.forEach(function (pin) {
      pin.addEventListener("pointerdown", function (ev) {
        ev.preventDefault();
        pin.classList.add("dragging");
        pin.setPointerCapture(ev.pointerId);
        var startX = ev.clientX;
        var startY = ev.clientY;
        var orig = pin.getBoundingClientRect();
        function move(e) {
          var dx = e.clientX - startX;
          var dy = e.clientY - startY;
          pin.style.transform = "translate(" + dx + "px," + dy + "px)";
        }
        function up(e) {
          pin.releasePointerCapture(e.pointerId);
          pin.classList.remove("dragging");
          pin.style.transform = "";
          pin.removeEventListener("pointermove", move);
          pin.removeEventListener("pointerup", up);
          pin.removeEventListener("pointercancel", up);
          var under = document.elementFromPoint(e.clientX, e.clientY);
          var state = under && under.closest ? under.closest(".state") : null;
          var abbr = state ? state.getAttribute("data-abbr") : "";
          var want = pin.getAttribute("data-abbr") || expectedAbbr;
          if (abbr && want && abbr === want) {
            if (global.HSAudio) HSAudio.pinDrop();
            onResult(true, abbr, pin);
          } else {
            if (global.HSAudio) HSAudio.wrong();
            onResult(false, abbr, pin);
          }
        }
        pin.addEventListener("pointermove", move);
        pin.addEventListener("pointerup", up);
        pin.addEventListener("pointercancel", up);
        void orig;
      });
    });
  }

  global.HSMap = {
    assetUrl: assetUrl,
    loadChart: loadChart,
    highlight: highlight,
    bindPins: bindPins,
  };
})(window);
