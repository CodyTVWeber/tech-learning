(function (global) {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var CHART_W = 1100;
  var CHART_H = 720;

  function assetUrl(path) {
    if (global.HS && typeof global.HS.url === "function") return global.HS.url(path);
    var base = document.documentElement.dataset.appBase || new URL("./", location.href).href;
    return new URL(path, base).href;
  }

  function enlargeHits() {
    /* Overlapping rx=84 ellipses made the topmost state steal the pin.
       Drop targets are separate seats, so geographic marks stay at chart size. */
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
        el.setAttribute("viewBox", "0 0 " + CHART_W + " " + CHART_H);
      }
      return el;
    });
  }

  function featureLabel(svg, id) {
    var nodes = svg.querySelectorAll("[data-feature]");
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].closest("#drop-seats")) continue;
      if (nodes[i].getAttribute("data-feature") === id) {
        return nodes[i].getAttribute("data-label") || id.replace(/-/g, " ");
      }
    }
    return id.replace(/-/g, " ");
  }

  function layoutSeats(svg, abbrs, featureIds) {
    var old = svg.querySelector("#drop-seats");
    if (old) old.remove();
    svg.setAttribute("viewBox", "0 0 " + CHART_W + " " + CHART_H);
    var marks = [];
    (abbrs || []).forEach(function (ab) {
      marks.push({ abbr: ab, label: ab });
    });
    (featureIds || []).forEach(function (id) {
      marks.push({ id: id, label: featureLabel(svg, id) });
    });
    if (!marks.length) return;

    svg.querySelectorAll(".state, [data-feature]").forEach(function (n) {
      n.style.pointerEvents = "none";
    });

    var rect = svg.getBoundingClientRect();
    var scale = rect.width ? rect.width / CHART_W : 0.33;
    if (scale < 0.2) scale = 0.2;
    var minPx = 64;
    var rx = (minPx * 0.62) / scale;
    var ry = (minPx * 0.5) / scale;
    var gapX = rx * 2 + (12 / scale);
    var gapY = ry * 2 + (14 / scale);
    var cols = Math.max(1, Math.floor((CHART_W - 48) / gapX));
    var layer = document.createElementNS(SVG_NS, "g");
    layer.setAttribute("id", "drop-seats");
    marks.forEach(function (m, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cx = 24 + rx + col * gapX;
      var cy = CHART_H + 28 + ry + row * gapY;
      var g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "drop-seat glow");
      if (m.abbr) g.setAttribute("data-abbr", m.abbr);
      if (m.id) g.setAttribute("data-feature", m.id);
      g.setAttribute("aria-label", m.label);
      var ell = document.createElementNS(SVG_NS, "ellipse");
      ell.setAttribute("cx", String(cx));
      ell.setAttribute("cy", String(cy));
      ell.setAttribute("rx", String(rx));
      ell.setAttribute("ry", String(ry));
      g.appendChild(ell);
      var text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("x", String(cx));
      text.setAttribute("y", String(cy + ry * 0.18));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", String(Math.max(18, ry * 0.42)));
      text.setAttribute("fill", "#3d2914");
      text.setAttribute("pointer-events", "none");
      text.textContent = String(m.label).slice(0, 16);
      g.appendChild(text);
      layer.appendChild(g);
    });
    svg.appendChild(layer);
    var rows = Math.ceil(marks.length / cols);
    var height = CHART_H + 28 + rows * gapY + ry + 20;
    svg.setAttribute("viewBox", "0 0 " + CHART_W + " " + Math.ceil(height));
  }

  function highlight(host, abbrs, featureIds) {
    abbrs = abbrs || [];
    featureIds = featureIds || [];
    host.querySelectorAll(".glow").forEach(function (n) { n.classList.remove("glow"); });
    host.querySelectorAll(".locate").forEach(function (n) { n.classList.remove("locate"); });
    host.querySelectorAll(".state").forEach(function (g) {
      var hit = g.querySelector(".state-hit");
      if (!hit) return;
      if (abbrs.indexOf(g.getAttribute("data-abbr")) !== -1) hit.classList.add("locate");
    });
    host.querySelectorAll("[data-feature]").forEach(function (el) {
      if (el.closest && el.closest("#drop-seats")) return;
      if (featureIds.indexOf(el.getAttribute("data-feature")) !== -1) el.classList.add("locate");
    });
    var svg = host.querySelector("svg");
    if (svg && (abbrs.length || featureIds.length)) layoutSeats(svg, abbrs, featureIds);
  }

  function scrollToGlow(host) {
    var wrap = host.classList && host.classList.contains("map-wrap") ? host : (host.closest && host.closest(".map-wrap")) || host;
    var nodes = host.querySelectorAll("#drop-seats .drop-seat");
    if (!nodes.length) nodes = host.querySelectorAll(".glow, .locate");
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

  function seatAt(svg, x, y) {
    var seats = svg.querySelectorAll("#drop-seats .drop-seat");
    var inside = null;
    seats.forEach(function (seat) {
      var ell = seat.querySelector("ellipse");
      var box = (ell || seat).getBoundingClientRect();
      if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) inside = seat;
    });
    if (inside) return inside;
    var best = null;
    var bestD = 40;
    seats.forEach(function (seat) {
      var ell = seat.querySelector("ellipse");
      var box = (ell || seat).getBoundingClientRect();
      var cx = box.left + box.width / 2;
      var cy = box.top + box.height / 2;
      var d = Math.hypot(x - cx, y - cy);
      if (d < bestD) { bestD = d; best = seat; }
    });
    return best;
  }

  function bindPins(tray, host, expectedAbbr, onResult) {
    var svg = host.querySelector("svg");
    var pins = tray.querySelectorAll(".pin");
    pins.forEach(function (pin) {
      pin.addEventListener("pointerdown", function (ev) {
        if (pin.disabled) return;
        ev.preventDefault();
        pin.classList.add("dragging");
        try { pin.setPointerCapture(ev.pointerId); } catch (e) {}
        var startX = ev.clientX;
        var startY = ev.clientY;
        function move(e) {
          pin.style.transform = "translate(" + (e.clientX - startX) + "px," + (e.clientY - startY) + "px)";
        }
        function up(e) {
          try { pin.releasePointerCapture(e.pointerId); } catch (err) {}
          pin.classList.remove("dragging");
          pin.style.transform = "";
          pin.removeEventListener("pointermove", move);
          pin.removeEventListener("pointerup", up);
          pin.removeEventListener("pointercancel", up);
          var target = svg ? seatAt(svg, e.clientX, e.clientY) : null;
          var wantFeat = pin.getAttribute("data-feature");
          var wantAbbr = pin.getAttribute("data-abbr") || expectedAbbr;
          var got = "";
          var ok = false;
          if (wantFeat) {
            got = target ? target.getAttribute("data-feature") || "" : "";
            ok = !!(got && got === wantFeat);
          } else {
            got = target ? target.getAttribute("data-abbr") || "" : "";
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
      });
    });
  }

  global.HSMap = {
    assetUrl: assetUrl,
    loadChart: loadChart,
    enlargeHits: enlargeHits,
    highlight: highlight,
    scrollToGlow: scrollToGlow,
    bindPins: bindPins,
  };
})(window);
