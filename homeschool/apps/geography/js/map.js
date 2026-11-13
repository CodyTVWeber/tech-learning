(function (global) {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  function assetUrl(path) {
    if (global.HS && typeof global.HS.url === "function") return global.HS.url(path);
    var base = document.documentElement.dataset.appBase || new URL("./", location.href).href;
    return new URL(path, base).href;
  }

  function enlargeHits(host) {
    host.querySelectorAll(".state-hit").forEach(function (hit) {
      var rx = Number(hit.getAttribute("rx") || 20);
      var ry = Number(hit.getAttribute("ry") || 14);
      hit.setAttribute("rx", String(Math.max(rx, 84)));
      hit.setAttribute("ry", String(Math.max(ry, 56)));
    });
  }

  function addHitCircle(parent, x, y, fid, r) {
    var hit = document.createElementNS(SVG_NS, "circle");
    hit.setAttribute("class", "feature-hit");
    hit.setAttribute("cx", String(x));
    hit.setAttribute("cy", String(y));
    hit.setAttribute("r", String(r || 56));
    hit.setAttribute("fill", "transparent");
    hit.setAttribute("pointer-events", "all");
    hit.setAttribute("data-feature", fid);
    parent.appendChild(hit);
    return hit;
  }

  function padFeatures(host, ids) {
    ids = ids || [];
    var allow = {};
    ids.forEach(function (id) { allow[id] = true; });
    host.querySelectorAll("[data-feature]").forEach(function (el) {
      if (el.classList && el.classList.contains("feature-hit")) return;
      var fid = el.getAttribute("data-feature");
      if (ids.length && !allow[fid]) return;
      var tag = el.tagName.toLowerCase();
      if (tag === "g") {
        addHitCircle(el, 0, 0, fid, 56);
        return;
      }
      if (tag === "ellipse") {
        var rx = Number(el.getAttribute("rx") || 16);
        var ry = Number(el.getAttribute("ry") || 12);
        el.setAttribute("rx", String(Math.max(rx, 70)));
        el.setAttribute("ry", String(Math.max(ry, 48)));
        return;
      }
      if (tag === "path") {
        try {
          var len = el.getTotalLength();
          var parent = el.parentNode;
          [0.25, 0.5, 0.75].forEach(function (frac) {
            var pt = el.getPointAtLength(len * frac);
            addHitCircle(parent, pt.x, pt.y, fid, 56);
          });
        } catch (e) {
          try {
            var b = el.getBBox();
            addHitCircle(el.parentNode, b.x + b.width / 2, b.y + b.height / 2, fid, 56);
          } catch (e2) {}
        }
      }
    });
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
        el.removeAttribute("width");
        el.removeAttribute("height");
        el.setAttribute("preserveAspectRatio", "xMidYMid meet");
      }
      enlargeHits(host);
      return el;
    });
  }

  function highlight(host, abbrs, featureIds) {
    abbrs = abbrs || [];
    featureIds = featureIds || [];
    host.querySelectorAll(".state").forEach(function (g) {
      var hit = g.querySelector(".state-hit");
      if (!hit) return;
      var on = abbrs.indexOf(g.getAttribute("data-abbr")) !== -1;
      if (on) hit.classList.add("glow");
      else hit.classList.remove("glow");
    });
    host.querySelectorAll("[data-feature]").forEach(function (el) {
      var on = featureIds.indexOf(el.getAttribute("data-feature")) !== -1;
      if (on) el.classList.add("glow");
      else el.classList.remove("glow");
    });
    if (featureIds.length) padFeatures(host, featureIds);
  }

  function scrollToGlow(host) {
    var wrap = host.classList && host.classList.contains("map-wrap") ? host : (host.closest && host.closest(".map-wrap")) || host;
    var nodes = host.querySelectorAll(".glow");
    if (!nodes.length) return;
    var wr = wrap.getBoundingClientRect();
    var minL = Infinity;
    var minT = Infinity;
    var maxR = -Infinity;
    var maxB = -Infinity;
    nodes.forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (!r.width && !r.height) return;
      if (r.left < minL) minL = r.left;
      if (r.top < minT) minT = r.top;
      if (r.right > maxR) maxR = r.right;
      if (r.bottom > maxB) maxB = r.bottom;
    });
    if (minL === Infinity) return;
    wrap.scrollLeft += (minL + maxR) / 2 - (wr.left + wr.right) / 2;
    wrap.scrollTop += (minT + maxB) / 2 - (wr.top + wr.bottom) / 2;
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
          pin.style.visibility = "hidden";
          var under = document.elementFromPoint(e.clientX, e.clientY);
          pin.style.visibility = "";
          var wantFeat = pin.getAttribute("data-feature");
          var wantAbbr = pin.getAttribute("data-abbr") || expectedAbbr;
          var ok = false;
          var got = "";
          if (wantFeat) {
            var feat = under && under.closest ? under.closest("[data-feature]") : null;
            got = feat ? feat.getAttribute("data-feature") : "";
            ok = !!(got && got === wantFeat);
          } else {
            var state = under && under.closest ? under.closest(".state") : null;
            got = state ? state.getAttribute("data-abbr") : "";
            ok = !!(got && wantAbbr && got === wantAbbr);
          }
          if (ok) {
            if (global.HSAudio) HSAudio.pinDrop();
            onResult(true, wantFeat || got, pin);
          } else {
            if (global.HSAudio) HSAudio.wrong();
            onResult(false, got, pin);
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
    enlargeHits: enlargeHits,
    padFeatures: padFeatures,
    highlight: highlight,
    scrollToGlow: scrollToGlow,
    bindPins: bindPins,
  };
})(window);
