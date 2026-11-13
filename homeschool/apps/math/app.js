(function () {
  const SUBJECT = "math";
  const BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"];
  const BAND_LABEL = {
    baby: "Care time",
    toddler: "Toddler",
    preschool: "Early learner",
    early: "Early elementary",
    primary: "Early-middle elementary",
    upper: "Upper elementary",
  };
  const CREW = {
    pip: { name: "Pip", role: "lookout", hat: "#c49a3c", scarf: "#f3e2c4" },
    reed: { name: "Reed", role: "bosun", hat: "#3d6b4f", scarf: "#d7eef2" },
    moss: { name: "Moss", role: "cook", hat: "#8a4a2b", scarf: "#e8c56a" },
    cal: { name: "Cal", role: "chart-keeper", hat: "#1a4a6b", scarf: "#f3e2c4" },
    nell: { name: "Nell", role: "purse", hat: "#7a3a4a", scarf: "#f3e2c4" },
    kit: { name: "Kit", role: "cabin hand", hat: "#4a5a2a", scarf: "#e8c56a" },
    bram: { name: "Bram", role: "rigger", hat: "#3a3a5a", scarf: "#d7eef2" },
    oat: { name: "Oat", role: "carpenter", hat: "#6b3a1f", scarf: "#ecd6b0" },
    wren: { name: "Wren", role: "helms", hat: "#0e4a57", scarf: "#f3e2c4" },
    sol: { name: "Sol", role: "navigator", hat: "#c49a3c", scarf: "#1a4a6b" },
    pike: { name: "Pike", role: "quartermaster", hat: "#4a2414", scarf: "#c49a3c" },
  };
  const CUES = {
    ok: [
      { f: 880, t: 0, d: 0.07, type: "square", g: 0.05 },
      { f: 1174, t: 0.07, d: 0.11, type: "square", g: 0.05 },
    ],
    tryAgain: [{ f: 160, t: 0, d: 0.14, type: "triangle", g: 0.07 }],
    reward: [
      { f: 523, t: 0, d: 0.12, type: "square", g: 0.05 },
      { f: 659, t: 0.12, d: 0.12, type: "square", g: 0.05 },
      { f: 784, t: 0.24, d: 0.22, type: "square", g: 0.06 },
    ],
  };
  const TECH_KINDS = {
    array: 1,
    tenframe: 1,
    bundle: 1,
    decimal: 1,
    longdiv: 1,
    longmul: 1,
    counton: 1,
    fraction: 1,
  };
  const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const ISLE_EXTRAS = {
    "island-count": '<span class="isle-crate"></span><span class="isle-crate is-2"></span>',
    "island-add": '<span class="isle-pier"></span><span class="isle-pier is-2"></span>',
    "island-place": '<span class="isle-stack"></span>',
    "island-facts": '<span class="isle-bags"></span>',
    "island-share": '<span class="isle-split"></span>',
    "island-skip": '<span class="isle-buoy"></span><span class="isle-buoy is-2"></span><span class="isle-buoy is-3"></span>',
    "island-money": '<span class="isle-purse"></span>',
    "island-time": '<span class="isle-clock"></span>',
    "island-measure": '<span class="isle-rope"></span>',
    "island-shape": '<span class="isle-tri"></span>',
    "island-story": '<span class="isle-book"></span>',
    "island-long": '<span class="isle-desk"></span>',
    "island-sense": '<span class="isle-spit"></span><span class="isle-spit is-2"></span>',
  };

  function hs() {
    return window.HS || {};
  }
  function inRunner() {
    return document.documentElement.dataset.runner === "1";
  }
  function url(path) {
    if (hs().url) return hs().url(path);
    const base = document.documentElement.dataset.appBase || "./";
    return new URL(path, base).href;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function cue(name) {
    if (hs().playCue && CUES[name]) hs().playCue(CUES[name]);
  }
  function speak(text, opts) {
    if (!text) return;
    if (hs().speak) hs().speak(text, opts || { rate: 0.9 });
    else if (window.Ship) Ship.speak(text);
  }
  function muted() {
    try {
      if (hs().muted) return hs().muted();
      return localStorage.getItem("hs.mute") === "1";
    } catch (e) {
      return false;
    }
  }
  function setMuted(on) {
    if (hs().setMuted) hs().setMuted(on);
    else {
      try {
        localStorage.setItem("hs.mute", on ? "1" : "0");
      } catch (e) {}
    }
  }
  function learnerId() {
    const parts = location.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("homeschool");
    if (idx >= 0) {
      const next = parts[idx + 1];
      if (next && ["apps", "kit", "decks"].indexOf(next) === -1) return next;
    }
    return "standalone";
  }
  function installPlayCue(HS) {
    let ctx = null;
    HS.playCue = function playCue(recipe) {
      if (HS.muted && HS.muted()) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || !recipe || !recipe.length) return;
      if (!ctx) ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();
      const t0 = ctx.currentTime;
      recipe.forEach(function (n) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = n.type || "sine";
        o.frequency.setValueAtTime(n.f, t0 + (n.t || 0));
        g.gain.setValueAtTime(0.0001, t0 + (n.t || 0));
        g.gain.exponentialRampToValueAtTime(n.g || 0.08, t0 + (n.t || 0) + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + (n.t || 0) + (n.d || 0.18));
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t0 + (n.t || 0));
        o.stop(t0 + (n.t || 0) + (n.d || 0.18) + 0.02);
      });
    };
  }
  function ensureStandalone() {
    if (inRunner()) return;
    const HS = (window.HS = window.HS || {});
    HS.appBase = HS.appBase || new URL("./", location.href).href;
    HS.subject = SUBJECT;
    document.documentElement.dataset.appBase = HS.appBase;
    if (!HS.getBand) {
      HS.getBand = function getBand() {
        const q = new URLSearchParams(location.search).get("band");
        if (q && BANDS.indexOf(q) !== -1) return q;
        try {
          const stored = localStorage.getItem("hs.band");
          if (stored && BANDS.indexOf(stored) !== -1) return stored;
        } catch (e) {}
        return null;
      };
    }
    if (!HS.setBand) {
      HS.setBand = function setBand(band) {
        if (BANDS.indexOf(band) === -1) return;
        try {
          localStorage.setItem("hs.band", band);
        } catch (e) {}
      };
    }
    if (!HS.muted) {
      HS.muted = function () {
        try {
          return localStorage.getItem("hs.mute") === "1";
        } catch (e) {
          return false;
        }
      };
    }
    if (!HS.setMuted) {
      HS.setMuted = function (on) {
        try {
          localStorage.setItem("hs.mute", on ? "1" : "0");
        } catch (e) {}
      };
    }
    if (!HS.speak) {
      HS.speak = function speakText(text, opts) {
        opts = opts || {};
        if (!text || (HS.muted && HS.muted())) return;
        const synth = window.speechSynthesis;
        if (!synth) return;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        u.rate = opts.rate || 0.9;
        u.pitch = opts.pitch || 1;
        u.lang = opts.lang || "en-US";
        synth.speak(u);
      };
    }
    if (!HS.silence) {
      HS.silence = function () {
        try {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        } catch (e) {}
      };
    }
    if (!HS.playCue) installPlayCue(HS);
    if (!HS.readProgress) {
      HS.readProgress = function (subject) {
        try {
          return JSON.parse(localStorage.getItem("hs.progress." + subject) || "{}");
        } catch (e) {
          return {};
        }
      };
    }
    if (!HS.writeProgress) {
      HS.writeProgress = function (subject, data) {
        data = data || {};
        data.updatedAt = new Date().toISOString();
        try {
          localStorage.setItem("hs.progress." + subject, JSON.stringify(data));
        } catch (e) {}
      };
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js", { scope: "./" });
    }
  }
  function readBand() {
    const b = hs().getBand && hs().getBand();
    if (b && BANDS.indexOf(b) !== -1) return b;
    return null;
  }
  function writeBand(b) {
    if (BANDS.indexOf(b) === -1) return;
    if (hs().setBand) hs().setBand(b);
    else {
      try {
        localStorage.setItem("hs.band", b);
      } catch (e) {}
    }
    const next = new URL(location.href);
    next.searchParams.set("band", b);
    history.replaceState({}, "", next);
    document.documentElement.dataset.mathBand = b;
  }

  function coinSvg() {
    return (
      '<svg class="voyage-coin-svg" viewBox="0 0 64 64" aria-hidden="true">' +
      '<circle class="c-rim" cx="32" cy="32" r="30"/>' +
      '<circle class="c-inner" cx="32" cy="32" r="24"/>' +
      '<path class="c-hull" d="M18 40h28l-6 8H24z"/>' +
      '<path class="c-mast" d="M32 16v24"/>' +
      '<path class="c-sail" d="M32 16l14 18H32z"/>' +
      "</svg>"
    );
  }
  function artShip(cls) {
    return (
      '<div class="' +
      esc(cls || "voyage-hero-art") +
      '" aria-hidden="true"><svg viewBox="0 0 320 132">' +
      '<rect width="320" height="50" fill="#7ec8d4"/>' +
      '<rect y="50" width="320" height="82" fill="#165566"/>' +
      '<ellipse cx="160" cy="108" rx="140" ry="14" fill="#0e4a57"/>' +
      '<path d="M48 92h224l-28 16H76z" fill="#6b3a1f" stroke="#1a120c" stroke-width="2"/>' +
      '<rect x="154" y="28" width="6" height="64" fill="#1a120c"/>' +
      '<path d="M160 28l52 44H160z" fill="#f3e2c4" stroke="#1a120c"/>' +
      '<path d="M160 40l-40 32h40z" fill="#ecd6b0" stroke="#1a120c"/>' +
      '<circle cx="268" cy="36" r="14" fill="#f3e2c4"/><circle cx="268" cy="36" r="8" fill="#c49a3c"/>' +
      "</svg></div>"
    );
  }
  function artChest(open, cls) {
    return (
      '<div class="' +
      esc(cls || "") +
      '"><div class="voyage-chest-box' +
      (open ? " is-open" : "") +
      '" aria-hidden="true"></div></div>'
    );
  }
  function artCrew(id, cls) {
    const c = CREW[id] || CREW.pip;
    return (
      '<div class="' +
      esc(cls || "voyage-porthole") +
      '" aria-hidden="true"><svg class="voyage-crew-svg" viewBox="0 0 64 64">' +
      '<circle cx="32" cy="36" r="16" fill="#f3d2a8" stroke="#1a120c" stroke-width="2"/>' +
      '<circle cx="26" cy="34" r="2.4" fill="#1a120c"/>' +
      '<circle cx="38" cy="34" r="2.4" fill="#1a120c"/>' +
      '<path d="M26 42c2.4 2.6 9.6 2.6 12 0" fill="none" stroke="#1a120c" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M14 28h36l-5-14H19z" fill="' +
      c.hat +
      '" stroke="#1a120c" stroke-width="2"/>' +
      '<rect x="18" y="48" width="28" height="10" rx="3" fill="' +
      c.scarf +
      '" stroke="#1a120c" stroke-width="2"/>' +
      "</svg></div>"
    );
  }
  function isleScene(id) {
    const scenes = {
      count: '<rect x="36" y="28" width="248" height="62" rx="8" fill="#f7f1dc" stroke="#1a120c" stroke-width="3"/>' + dots(48, 40, 5, 2, 46, 28),
      tide: '<path d="M20 78c30-16 50 16 80 0s50 16 80 0 50 16 80 0 40 8 60 0" fill="none" stroke="#f3e2c4" stroke-width="6"/>' + coin(150, 48),
      facts: '<rect x="24" y="70" width="272" height="14" fill="#6b3a1f" stroke="#1a120c"/>' + coin(70, 40) + coin(118, 40) + '<path d="M170 36h70" stroke="#8a2a2a" stroke-width="8"/>' + coin(250, 40),
      regroup: '<rect x="36" y="34" width="70" height="54" fill="#6b3a1f" stroke="#1a120c" stroke-width="3"/>' + '<path d="M48 40l46 42M94 40L48 82" stroke="#e8c56a" stroke-width="4"/>' + coin(150, 48) + coin(198, 56) + coin(246, 44),
      place: crate(40, 30) + crate(120, 30) + crate(200, 30),
      match: coin(40, 48) + coin(88, 48) + coin(136, 48) + '<rect x="190" y="30" width="90" height="58" rx="6" fill="#f7f1dc" stroke="#1a120c" stroke-width="3"/>' + dots(204, 42, 3, 2, 22, 20),
      skip: buoy(70, 70, 18) + buoy(150, 52, 26) + buoy(240, 34, 34),
      money: '<ellipse cx="160" cy="64" rx="70" ry="36" fill="#7a3a4a" stroke="#1a120c" stroke-width="3"/>' + '<rect x="118" y="40" width="84" height="16" rx="6" fill="#c49a3c" stroke="#1a120c"/>' + coin(160, 72),
      time: '<circle cx="160" cy="58" r="40" fill="#f7f1dc" stroke="#1a120c" stroke-width="4"/>' + '<path d="M160 58V30M160 58l22 10" stroke="#1a120c" stroke-width="4" stroke-linecap="round"/>',
      measure: '<path d="M24 70h272" stroke="#c49a3c" stroke-width="8"/>' + '<path d="M24 58v24M96 62v16M168 58v24M240 62v16M296 58v24" stroke="#1a120c" stroke-width="3"/>',
      shape: '<polygon points="70,90 120,28 170,90" fill="#3d6b4f" stroke="#1a120c" stroke-width="3"/>' + '<rect x="200" y="40" width="70" height="50" fill="#1a4a6b" stroke="#1a120c" stroke-width="3"/>',
      story: '<path d="M70 28h80v64H70z" fill="#f3e2c4" stroke="#1a120c" stroke-width="3"/>' + '<path d="M150 28h80v64h-80z" fill="#ecd6b0" stroke="#1a120c" stroke-width="3"/>' + '<path d="M86 44h48M86 58h48M166 44h48M166 58h40" stroke="#6b3a1f" stroke-width="3"/>',
      rows: dots(50, 36, 4, 3, 56, 24),
      times: '<rect x="70" y="22" width="180" height="78" fill="#0e4a57" stroke="#f3e2c4" stroke-width="3"/>' + dots(86, 32, 3, 3, 52, 22),
      share: hull(40) + hull(180),
      frac: '<rect x="40" y="40" width="240" height="40" fill="#ecd6b0" stroke="#1a120c" stroke-width="3"/>' + '<rect x="40" y="40" width="120" height="40" fill="#c49a3c" stroke="#1a120c" stroke-width="3"/>',
      dec: '<text x="70" y="78" font-size="48" font-family="Trebuchet MS,sans-serif" fill="#f7f1dc" stroke="#1a120c" stroke-width="2">0</text>' + '<circle cx="160" cy="70" r="8" fill="#c49a3c" stroke="#1a120c"/>' + '<text x="190" y="78" font-size="48" font-family="Trebuchet MS,sans-serif" fill="#e8c56a" stroke="#1a120c" stroke-width="2">3</text>',
      long: '<path d="M90 24h160M90 24v70" fill="none" stroke="#f3e2c4" stroke-width="6"/>' + '<text x="110" y="72" font-size="28" font-family="Trebuchet MS,sans-serif" fill="#f7f1dc">145</text>',
      mix: '<rect x="48" y="22" width="100" height="70" fill="#f7f1dc" stroke="#1a120c" stroke-width="3"/>' + '<rect x="172" y="22" width="100" height="70" fill="#e8c56a" stroke="#1a120c" stroke-width="3"/>',
      laws: '<rect x="36" y="30" width="100" height="60" fill="#3d6b4f" stroke="#1a120c"/>' + dots(48, 38, 3, 2, 28, 24) + '<rect x="180" y="24" width="70" height="78" fill="#1a4a6b" stroke="#1a120c"/>' + dots(192, 32, 2, 3, 28, 22),
      bond: '<rect x="50" y="28" width="220" height="64" rx="6" fill="#f7f1dc" stroke="#6b3a1f" stroke-width="4"/>' + dots(66, 38, 5, 2, 40, 28),
      sense: coin(70, 62) + coin(108, 50) + coin(146, 66) + coin(250, 58),
      next: coin(90, 56) + '<path d="M160 40v36M142 58h36" stroke="#f3e2c4" stroke-width="8"/>' + coin(230, 56),
      peek: '<rect x="90" y="40" width="140" height="52" fill="#6b3a1f" stroke="#1a120c" stroke-width="3"/>' + '<path d="M90 40h140l-16-16H106z" fill="#c49a3c" stroke="#1a120c"/>',
      rock: '<path d="M40 80h240l-30 16H70z" fill="#6b3a1f" stroke="#1a120c"/>' + '<path d="M160 20l50 48h-50z" fill="#f3e2c4" stroke="#1a120c"/>',
    };
    return scenes[id] || scenes.count;
    function coin(x, y) {
      return '<circle cx="' + x + '" cy="' + y + '" r="16" fill="#e8c56a" stroke="#1a120c" stroke-width="3"/>';
    }
    function dots(x, y, cols, rows, dx, dy) {
      let s = "";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) s += coin(x + c * dx, y + r * dy);
      }
      return s;
    }
    function crate(x, y) {
      return '<rect x="' + x + '" y="' + y + '" width="64" height="52" fill="#8a5a2b" stroke="#1a120c" stroke-width="3"/>' + '<path d="M' + x + " " + (y + 26) + "h64M" + (x + 32) + " " + y + "v52\" stroke=\"#e8c56a\" stroke-width=\"3\"/>";
    }
    function buoy(x, y, r) {
      return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#c4493c" stroke="#1a120c" stroke-width="3"/>' + '<rect x="' + (x - 3) + '" y="' + (y + r) + '" width="6" height="16" fill="#1a120c"/>';
    }
    function hull(x) {
      return '<path d="M' + x + " 78h120l-16 16H" + (x + 16) + 'z" fill="#6b3a1f" stroke="#1a120c"/>' + '<path d="M' + (x + 50) + " 30l28 40h-28z\" fill=\"#f3e2c4\" stroke=\"#1a120c\"/>";
    }
  }
  function artIsland(slot, cls, opts) {
    opts = opts || {};
    if (slot === "hero" || slot === "cabin" || slot === "paper") return artShip(cls);
    if (slot === "chest") return artChest(false, cls);
    if (slot === "chest-open") return artChest(true, cls);
    if (slot && slot.indexOf("crew-") === 0) return artCrew(slot.slice(5), cls);
    const id = opts.id || "";
    const stowed = !!opts.stowed;
    const crew = opts.crew || "pip";
    const flag = stowed
      ? '<polygon points="236,10 236,52 292,30" fill="#c49a3c" stroke="#1a120c" stroke-width="2"/>' +
        '<rect x="232" y="8" width="5" height="78" fill="#1a120c"/>' +
        '<rect x="168" y="72" width="40" height="26" rx="2" fill="#6b3a1f" stroke="#f3e2c4" stroke-width="2"/>' +
        '<path d="M168 72h40l-6-10h-28z" fill="#e8c56a" stroke="#1a120c"/>' +
        '<circle cx="28" cy="28" r="16" fill="#f3d2a8" stroke="#1a120c" stroke-width="2"/>' +
        '<circle cx="23" cy="26" r="2" fill="#1a120c"/><circle cx="33" cy="26" r="2" fill="#1a120c"/>' +
        '<path d="M22 33c2 2 8 2 10 0" fill="none" stroke="#1a120c" stroke-width="2"/>'
      : "";
    return (
      '<div class="voyage-isle ' +
      esc(cls || "") +
      '" data-isle="' +
      esc(id || slot || "") +
      '" aria-hidden="true"><svg viewBox="0 0 320 112" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="320" height="112" fill="#165566"/>' +
      '<path d="M0 78c40-18 70 10 110 0s70 12 110 0 60 8 100 0v34H0z" fill="#0e4a57"/>' +
      '<ellipse cx="160" cy="86" rx="120" ry="22" fill="#e2c48a" stroke="#c49a3c" stroke-width="3"/>' +
      isleScene(id || slot || "") +
      flag +
      "</svg></div>"
    );
  }
  function coinsHtml(n, tap, selected, gone) {
    n = Math.max(0, Math.min(24, Number(n) || 0));
    if (!n) return "";
    let h = '<div class="voyage-coins' + (tap ? " is-tap" : "") + '">';
    for (let i = 0; i < n; i++) {
      if (tap) {
        h +=
          '<button type="button" class="voyage-coin-btn' +
          (selected && selected[i] ? (gone ? " is-gone" : " is-tapped") : "") +
          '" data-coin="' +
          i +
          '" aria-label="Coin ' +
          (i + 1) +
          '">' +
          coinSvg() +
          "</button>";
      } else {
        h += '<div class="voyage-coin-wrap">' + coinSvg() + "</div>";
      }
    }
    h += "</div>";
    return h;
  }
  function moneyHtml(item) {
    const kinds = [
      ["quarters", "quarter", "25¢"],
      ["dimes", "dime", "10¢"],
      ["nickels", "nickel", "5¢"],
      ["pennies", "penny", "1¢"],
    ];
    let h = '<div class="voyage-money-row">';
    let any = false;
    kinds.forEach(function (row) {
      const n = Number(item[row[0]]) || 0;
      for (let i = 0; i < n; i++) {
        any = true;
        h +=
          '<span class="voyage-money-coin is-' +
          row[1] +
          '">' +
          coinSvg() +
          "<small>" +
          row[2] +
          "</small></span>";
      }
    });
    h += "</div>";
    return any ? h : coinsHtml(item.count || 0, false);
  }
  function tenthsBar(filled) {
    let h = '<div class="voyage-tenths" aria-hidden="true">';
    for (let i = 0; i < 10; i++) h += "<i class='" + (i < filled ? "is-on" : "") + "'></i>";
    return h + "</div>";
  }
  function fracHtml(parts, filled, tap) {
    parts = Number(parts) || 2;
    filled = Number(filled) || 0;
    let bars = "";
    for (let k = 0; k < parts; k++) {
      const on = k < filled ? " is-filled" : "";
      if (tap) {
        bars += '<button type="button" class="' + on.trim() + '" data-part="' + k + '"></button>';
      } else {
        bars += '<span class="' + on.trim() + '"></span>';
      }
    }
    return '<div class="voyage-frac" style="grid-template-columns:repeat(' + parts + ',1fr)">' + bars + "</div>";
  }
  function answersMatch(entry, expect) {
    const e = String(entry == null ? "" : entry).trim();
    if (!e) return false;
    const x = String(expect == null ? "" : expect)
      .replace(/\$/g, "")
      .replace(/%/g, "")
      .trim();
    if (e === x) return true;
    const en = Number(e);
    const xn = Number(x);
    return x !== "" && !isNaN(en) && !isNaN(xn) && en === xn;
  }
  function padHtml(entry, expect) {
    const exp = String(expect == null ? "" : expect);
    const dot = exp.indexOf(".") !== -1 || exp.indexOf("$") !== -1;
    const keys = dot
      ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫", "OK"]
      : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"];
    return (
      '<div class="voyage-entry" id="math-entry">' +
      esc(entry || " ") +
      '</div><div class="voyage-pad" id="math-pad">' +
      keys
        .map(function (k) {
          return '<button type="button" data-key="' + esc(k) + '">' + esc(k) + "</button>";
        })
        .join("") +
      "</div>"
    );
  }

  function decimalSteps(addends) {
    function split(s) {
      const p = String(s);
      const i = p.indexOf(".");
      if (i === -1) return { w: p, f: "" };
      return { w: p.slice(0, i) || "0", f: p.slice(i + 1) };
    }
    const parts = (addends || []).map(split);
    if (!parts.length) return { steps: [], parts: [], maxF: 0, maxW: 0 };
    const maxF = Math.max.apply(
      null,
      parts.map(function (p) {
        return p.f.length;
      })
    );
    const maxW = Math.max.apply(
      null,
      parts.map(function (p) {
        return p.w.length;
      })
    );
    parts.forEach(function (p) {
      while (p.f.length < maxF) p.f += "0";
      while (p.w.length < maxW) p.w = "0" + p.w;
    });
    const steps = [];
    let carry = 0;
    const namesF = ["tenths", "hundredths", "thousandths"];
    for (let i = maxF - 1; i >= 0; i--) {
      let sum = carry;
      const cols = [];
      parts.forEach(function (p) {
        const d = Number(p.f[i] || 0);
        cols.push(d);
        sum += d;
      });
      const digit = sum % 10;
      const next = Math.floor(sum / 10);
      const place = namesF[i] || "tenths";
      steps.push({
        prompt: cols.join(" + ") + (carry ? " + carry " + carry : "") + " in the " + place + ". Write the digit.",
        expect: digit,
        carry: next,
        place: "f" + i,
      });
      carry = next;
    }
    for (let i = maxW - 1; i >= 0; i--) {
      let sum = carry;
      const cols = [];
      parts.forEach(function (p) {
        const d = Number(p.w[i] || 0);
        cols.push(d);
        sum += d;
      });
      const digit = sum % 10;
      const next = Math.floor(sum / 10);
      steps.push({
        prompt: cols.join(" + ") + (carry ? " + carry " + carry : "") + " left of the point. Write the digit.",
        expect: digit,
        carry: next,
        place: "w" + i,
      });
      carry = next;
    }
    if (carry) steps.push({ prompt: "Write the leftover carry.", expect: carry, place: "c" });
    return { steps: steps, parts: parts, maxF: maxF, maxW: maxW };
  }
  function longDivSteps(dividend, divisor) {
    const digits = String(dividend).split("").map(Number);
    const steps = [];
    let remainder = 0;
    let quotient = "";
    let started = false;
    for (let i = 0; i < digits.length; i++) {
      const current = remainder * 10 + digits[i];
      if (!started && current < divisor && i < digits.length - 1) {
        remainder = current;
        continue;
      }
      started = true;
      const q = Math.floor(current / divisor);
      quotient += String(q);
      steps.push({
        type: "divide",
        prompt: "Divide: how many " + divisor + "s in " + current + "?",
        expect: q,
      });
      const prod = q * divisor;
      steps.push({ type: "multiply", prompt: "Multiply: " + q + " × " + divisor + " =", expect: prod });
      const sub = current - prod;
      steps.push({ type: "subtract", prompt: "Subtract: " + current + " − " + prod + " =", expect: sub });
      remainder = sub;
      if (i < digits.length - 1) {
        steps.push({
          type: "bring",
          prompt: "Bring down " + digits[i + 1] + ". The new number is",
          expect: remainder * 10 + digits[i + 1],
        });
      }
    }
    steps.push({ type: "quot", prompt: "The quotient is", expect: Number(quotient) });
    return steps;
  }
  function longMulSteps(a, b) {
    const steps = [];
    const bs = String(b);
    if (bs.length === 1) {
      const as = String(a);
      let carry = 0;
      for (let i = as.length - 1; i >= 0; i--) {
        const d = Number(as[i]);
        const prod = d * b + carry;
        const next = Math.floor(prod / 10);
        steps.push({
          type: "mul",
          prompt: d + " × " + b + (carry ? ", plus carry " + carry : "") + " =",
          expect: prod,
          carry: next,
        });
        carry = next;
      }
      steps.push({ type: "prod", prompt: "The product is", expect: a * b });
      return steps;
    }
    const ones = b % 10;
    const tens = Math.floor(b / 10) % 10;
    const row1 = a * ones;
    const row2 = a * tens;
    steps.push({ type: "row", prompt: "Ones row: " + a + " × " + ones + " =", expect: row1 });
    steps.push({
      type: "row",
      prompt: "Tens row: " + a + " × " + tens + " (then shift one place). Unshifted value?",
      expect: row2,
    });
    steps.push({ type: "add", prompt: "Add " + row1 + " + " + row2 * 10 + " =", expect: a * b });
    return steps;
  }
  function longMulBoard(a, b, step) {
    const ones = b % 10;
    const tens = Math.floor(b / 10) % 10;
    const row1 = a * ones;
    const row2 = a * tens;
    if (String(b).length === 1) {
      const shown = step >= 2 ? String(a * b) : step >= 1 ? " ?" : "";
      return (
        "   " +
        a +
        "\n ×  " +
        b +
        "\n ----\n  " +
        (shown || "  ")
      );
    }
    let body = "    " + a + "\n  ×  " + b + "\n  ----\n";
    if (step >= 1) body += "    " + row1 + "\n";
    else body += "     ?\n";
    if (step >= 2) body += "   " + row2 + "0\n";
    else body += "     ?\n";
    body += "  ----\n";
    if (step >= 3) body += "    " + a * b;
    else body += "     ?";
    return body;
  }
  function longDivBoard(dividend, divisor, stepI, steps) {
    let qmarks = "";
    let divides = 0;
    for (let i = 0; i < Math.min(stepI, steps.length); i++) {
      if (steps[i].type === "divide") {
        qmarks += String(steps[i].expect);
        divides += 1;
      }
    }
    const top = (qmarks || "?").padStart(String(dividend).length, " ");
    let board = "   " + top + "\n  " + divisor + " ) " + dividend;
    return board;
  }
  function decimalBoard(meta, done) {
    const parts = meta.parts;
    const maxF = meta.maxF;
    const maxW = meta.maxW;
    const cols = maxW + 1 + maxF;
    let html = '<div class="voyage-dec" style="--dcols:' + (cols + 1) + '">';
    function cells(label, p, hot) {
      html += "<span>" + esc(label) + "</span>";
      for (let i = 0; i < maxW; i++) html += "<span" + (hot === "w" + i ? ' class="is-hot"' : "") + ">" + p.w[i] + "</span>";
      html += '<span class="pt">.</span>';
      for (let i = 0; i < maxF; i++) html += "<span" + (hot === "f" + i ? ' class="is-hot"' : "") + ">" + p.f[i] + "</span>";
    }
    parts.forEach(function (p, idx) {
      cells(idx ? "+" : " ", p, done && done.place);
    });
    html += '<span class="sum-line"></span>';
    for (let i = 0; i < cols; i++) html += '<span class="sum-line"></span>';
    html += "</div>";
    return html;
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }
  function expandItems(pool) {
    const extra = [];
    pool.forEach(function (it) {
      if (it.kind === "skip" && it.seq && it.seq.length >= 2) {
        const step = Number(it.seq[1]) - Number(it.seq[0]);
        const last = Number(it.answer);
        extra.push({
          id: it.id + "-x",
          island: it.island,
          kind: "skip",
          seq: it.seq.concat([last]),
          prompt: it.seq.concat([last]).join(", ") + ". Next?",
          answer: String(last + step),
          choices: window.VoyageFacts
            ? VoyageFacts.choices(last + step, [last + step - 1, last + 2 * step], it.id + "-x")
            : [String(last + step), String(last + step - 1), String(last + 2 * step)],
          audioText: "What comes next?",
          teach: "The jump is " + step + ". " + last + " plus " + step + " is " + (last + step) + ".",
        });
      }
      if (it.kind === "array" && it.rows && it.cols && it.rows !== it.cols) {
        extra.push({
          id: it.id + "-t",
          island: it.island,
          kind: "array",
          rows: it.cols,
          cols: it.rows,
          prompt: it.cols + " rows of " + it.rows + " coins. How many?",
          answer: String(it.rows * it.cols),
          choices: it.choices,
          audioText: it.cols + " rows of " + it.rows + ".",
          teach: it.cols + " rows of " + it.rows + " is the same product: " + it.rows * it.cols + ".",
        });
      }
    });
    return pool.concat(extra);
  }
  function teachOf(item, island) {
    if (item.teach) return item.teach;
    if (item.kind === "tenframe") {
      const fill = Number(item.fill || item.count || 0);
      return "A ten-frame holds 10. " + fill + " coins leave " + (10 - fill) + " empty.";
    }
    if (item.kind === "fraction") {
      return (
        (item.filled || 0) +
        " of " +
        (item.parts || 2) +
        " equal parts is " +
        item.answer +
        (String(item.answer) === "0.5" || String(item.prompt).indexOf("1/2") !== -1
          ? ". 1/2 is 5 tenths, written 0.5."
          : ".")
      );
    }
    if (item.kind === "array" && item.rows && item.cols) {
      return item.rows + " rows of " + item.cols + " is " + item.rows * item.cols + ".";
    }
    if (item.kind === "decimal") {
      return "Line the decimal points. Tenths under tenths. The sum is " + item.answer + ".";
    }
    if (item.kind === "longdiv") {
      return "Divide, multiply, subtract, bring down. The quotient is " + item.answer + ".";
    }
    if (item.kind === "longmul") {
      return "Ones first, then tens (shifted if needed), then add. The product is " + item.answer + ".";
    }
    if (item.kind === "bundle") {
      return "Ten ones make a crate. The number is " + item.answer + ".";
    }
    if (item.kind === "counton") {
      return "Hold " + (item.hold || item.left) + ". Count on. The sum is " + item.answer + ".";
    }
    return "The heading is " + item.answer + "." + (island && island.technique ? " " + island.technique.title + "." : "");
  }

  async function boot() {
    ensureStandalone();
    const host = document.querySelector(".voyage") || document.getElementById("math-root");
    if (!host) return;

    let band = readBand();
    if (!band) {
      renderPicker(host);
      return;
    }
    if (band === "baby") {
      document.documentElement.dataset.mathBand = band;
      host.innerHTML =
        '<div class="voyage-cabin voyage-note"><h1>Treasure Voyage</h1>' +
        "<p>Care time is not a lesson track. A home that leaves math off does not keep this chart on the device. Count coins together, with a grown-up, when you want. There is no voyage to sail here.</p>" +
        '<button type="button" id="math-reband">Choose another band</button></div>';
      const re = document.getElementById("math-reband");
      if (re) {
        re.onclick = function () {
          try {
            localStorage.removeItem("hs.band");
          } catch (e) {}
          const next = new URL(location.href);
          next.searchParams.delete("band");
          location.href = next.href;
        };
      }
      return;
    }
    writeBand(band);
    document.documentElement.dataset.mathBand = band;

    const [data] = await Promise.all([
      fetch(url("data/" + band + ".json")).then(function (r) {
        if (!r.ok) throw new Error("no data");
        return r.json();
      }),
    ]);

    const lid = learnerId();
    const store = (hs().readProgress && hs().readProgress(SUBJECT)) || {};
    store.by = store.by || {};
    if (!store.by[lid]) {
      store.by[lid] = {
        chests: store.chests && !store.by.standalone ? store.chests : {},
        crew: Array.isArray(store.crew) && !store.by.standalone ? store.crew.slice() : [],
        tablesMul: store.tablesMul && !store.by.standalone ? store.tablesMul : {},
        tablesDiv: store.tablesDiv && !store.by.standalone ? store.tablesDiv : {},
        lastItem: store.lastItem,
      };
    }
    const progress = store.by[lid];
    progress.chests = progress.chests || {};
    progress.crew = progress.crew || [];
    progress.tablesMul = progress.tablesMul || {};
    progress.tablesDiv = progress.tablesDiv || {};
    progress.band = band;
    let visitDoubloons = 0;
    let difficulty = "steady";
    try {
      difficulty = sessionStorage.getItem("hs.math.diff") || "steady";
    } catch (e) {}
    if (["easier", "steady", "harder"].indexOf(difficulty) === -1) difficulty = "steady";

    function saveProgress() {
      store.by = store.by || {};
      store.by[lid] = progress;
      store.updatedAt = new Date().toISOString();
      store.band = band;
      if (hs().writeProgress) hs().writeProgress(SUBJECT, store);
    }
    saveProgress();

    const art = function (slot, cls, opts) {
      return artIsland(slot, cls, opts);
    };

    let screen = "map";
    let justStowed = null;
    let island = null;
    let items = [];
    let i = 0;
    let tableN = null;
    let tapped = {};
    let rocks = 0;
    let peeked = false;
    let advancing = false;
    let workItemId = null;
    let work = {};
    let missTeach = "";

    function chestKey(id) {
      return band + ":" + id;
    }
    function islandItems(isl) {
      return (data.items || []).filter(function (it) {
        return it.island === isl.id;
      });
    }
    function preludeItems(isl) {
      const all = islandItems(isl);
      if (!isl.drill) return all;
      return all.filter(function (it) {
        return TECH_KINDS[it.kind];
      });
    }
    function nowIslandId() {
      for (let n = 0; n < data.islands.length; n++) {
        if (!progress.chests[chestKey(data.islands[n].id)]) return data.islands[n].id;
      }
      return null;
    }
    function resetItemState() {
      tapped = {};
      rocks = 0;
      peeked = false;
      advancing = false;
      workItemId = null;
      work = {};
      missTeach = "";
    }
    function ensureWork(item) {
      if (workItemId === item.id) return;
      workItemId = item.id;
      tapped = {};
      rocks = 0;
      peeked = false;
      missTeach = "";
      work = {
        tens: Number(item.tens) || 0,
        ones: Number(item.ones) || 0,
        selected: {},
        step: 0,
        entry: "",
        steps: [],
        meta: null,
        partsOn: {},
        added: 0,
        extra: 0,
        gone: 0,
        brought: 0,
        given: 0,
        zeroed: false,
        cols: [],
        sidesOn: {},
      };
      if (item.kind === "longdiv") work.steps = longDivSteps(item.dividend, item.divisor);
      if (item.kind === "longmul") work.steps = longMulSteps(item.a, item.b);
      if (item.kind === "decimal") {
        work.meta = decimalSteps(item.addends || []);
        work.steps = work.meta.steps;
      }
      if (item.kind === "stepskey") work.steps = item.steps || [];
      if (item.kind === "product" || item.kind === "skip" || item.kind === "place" || item.kind === "money" || item.kind === "clock") {
        work.steps = [{ prompt: item.kind === "skip" ? "Type the next number." : "Type it. The last digit stows the crate.", expect: item.answer }];
      }
      if (item.kind === "deal") {
        const d = Number(item.divisor) || 0;
        work.cols = [];
        for (let c = 0; c < d; c++) work.cols.push(0);
      }
      if (item.kind === "fraction" || item.kind === "wholes") work.partsOn = {};
    }
    function marks(map) {
      return Object.keys(map || {}).filter(function (k) {
        return map[k];
      }).length;
    }
    function workReady(item) {
      return gestureDone(item);
    }
    function gestureDone(item) {
      const kind = item.kind || "choice";
      if (kind === "tenframe" && item.ask === "empty") {
        const empties = 10 - Number(item.fill || 0);
        return empties > 0 && marks(tapped) === empties;
      }
      if (kind === "tenframe" || kind === "tenths") {
        return marks(tapped) === Number(item.fill || item.count || 0) && Number(item.fill || item.count || 0) > 0;
      }
      if (kind === "array") {
        const need = (Number(item.rows) || 0) * (Number(item.cols) || 0);
        return need > 0 && marks(tapped) === need;
      }
      if (kind === "arraypair") {
        const n = (Number(item.rows) || 0) * (Number(item.cols) || 0);
        let left = 0;
        let right = 0;
        Object.keys(tapped).forEach(function (k) {
          if (!tapped[k]) return;
          if (k.charAt(0) === "L") left += 1;
          if (k.charAt(0) === "R") right += 1;
        });
        return n > 0 && left === n && right === n;
      }
      if (kind === "bundle") return work.ones < 10 && work.tens * 10 + work.ones === Number(item.answer);
      if (kind === "counton") return marks(tapped) === Number(item.add || item.right || 0) && Number(item.add || item.right || 0) > 0;
      if (kind === "fraction" || kind === "wholes") return marks(work.partsOn) === Number(item.filled || 0) && Number(item.filled || 0) > 0;
      if (kind === "selectn") return marks(tapped) === Number(item.need || 0) && Number(item.need || 0) > 0;
      if (kind === "tap") return marks(tapped) >= (Number(item.count) || 1);
      if (kind === "takeaway") return marks(tapped) === Number(item.take || 0) && Number(item.take || 0) > 0;
      if (kind === "maketen") return (work.added || 0) === Number(item.add || 0) && Number(item.add || 0) > 0;
      if (kind === "moreone") return !!work.extra;
      if (kind === "lessone") return !!work.gone;
      if (kind === "peek") return peeked;
      if (kind === "rock") return rocks >= (Number(item.count) || 3);
      if (kind === "deal") {
        if (Number(item.dividend) === 0) return !!work.zeroed;
        const div = Number(item.divisor) || 1;
        const cols = work.cols || [];
        if (cols.length !== div) return false;
        const sum = cols.reduce(function (s, n) {
          return s + n;
        }, 0);
        if (sum !== Number(item.dividend)) return false;
        const each = Number(item.answer);
        return cols.every(function (n) {
          return n === each;
        });
      }
      if (kind === "regroup") {
        const add = Number(item.add) || 0;
        const take = Number(item.take) || 0;
        return (
          work.ones < 10 &&
          (work.brought || 0) === add &&
          (work.given || 0) === take &&
          work.tens * 10 + work.ones === Number(item.answer)
        );
      }
      if (kind === "perimeter") return (item.sides || []).length > 0 && marks(work.sidesOn) === item.sides.length;
      if (
        kind === "decimal" ||
        kind === "longdiv" ||
        kind === "longmul" ||
        kind === "product" ||
        kind === "stepskey" ||
        kind === "skip" ||
        kind === "place" ||
        kind === "money" ||
        kind === "clock"
      ) {
        return (work.steps || []).length > 0 && work.step >= work.steps.length;
      }
      return false;
    }
    function gatherItems() {
      if (island.drill && tableN != null) {
        let facts =
          island.drill.kind === "div" ? VoyageFacts.divTable(tableN) : VoyageFacts.mulTable(tableN);
        if (difficulty === "easier") return facts.slice(0, 7);
        if (difficulty === "harder") facts = expandItems(facts);
        return shuffle(facts);
      }
      let pool = preludeItems(island);
      if (difficulty === "easier") return pool.slice(0, Math.min(4, pool.length));
      if (difficulty === "harder") pool = expandItems(pool);
      return shuffle(pool);
    }

    function chrome(inner) {
      const muteOn = muted();
      const tools = inRunner()
        ? ""
        : '<div class="voyage-tools">' +
          '<button type="button" class="voyage-mute" id="math-mute">' +
          (muteOn ? "Sound off" : "Sound on") +
          "</button>" +
          '<button type="button" class="voyage-band-btn" id="math-reband">Band: ' +
          esc(BAND_LABEL[band] || band) +
          "</button></div>";
      return tools + inner;
    }
    function bindTools() {
      const mute = document.getElementById("math-mute");
      if (mute) {
        mute.onclick = function () {
          setMuted(!muted());
          if (muted() && window.Ship) Ship.hush();
          if (muted() && hs().silence) hs().silence();
          render();
        };
      }
      const re = document.getElementById("math-reband");
      if (re) {
        re.onclick = function () {
          try {
            localStorage.removeItem("hs.band");
          } catch (e) {}
          const next = new URL(location.href);
          next.searchParams.delete("band");
          location.href = next.href;
        };
      }
    }

    function renderMap() {
      const done = data.islands.filter(function (isl) {
        return progress.chests[chestKey(isl.id)];
      }).length;
      const sailing = nowIslandId();
      const crewHtml = data.islands
        .map(function (isl) {
          const member = CREW[isl.crew];
          if (!member) return "";
          const here = progress.crew.indexOf(isl.crew) !== -1;
          return (
            '<div class="voyage-crew' +
            (here ? " is-aboard" : "") +
            '">' +
            art("crew-" + isl.crew, "voyage-porthole") +
            "<span>" +
            (here ? esc(member.name) : "—") +
            "</span><small>" +
            esc(member.role) +
            "</small></div>"
          );
        })
        .join("");
      host.innerHTML = chrome(
        art("hero", "voyage-hero-art") +
          '<div class="voyage-map">' +
          "<h1>Treasure Voyage</h1>" +
          "<p>" +
          esc(data.title) +
          " · " +
          esc(BAND_LABEL[band]) +
          ' · <span class="voyage-doubloons">This visit: ' +
          visitDoubloons +
          " doubloons</span> · " +
          done +
          "/" +
          data.islands.length +
          " chests</p>" +
          '<div class="voyage-crew-row" aria-label="Crew">' +
          crewHtml +
          "</div>" +
          (justStowed
            ? (function () {
                const hailed = data.islands.find(function (x) {
                  return x.id === justStowed;
                });
                const member = hailed && CREW[hailed.crew];
                return member
                  ? '<p class="voyage-hail">' + esc(member.name) + " is aboard. The chest is on the chart.</p>"
                  : "";
              })()
            : "") +
          '<div class="voyage-diff" role="group" aria-label="Difficulty">' +
          ["easier", "steady", "harder"]
            .map(function (d) {
              return (
                '<button type="button" data-diff="' +
                d +
                '" class="' +
                (difficulty === d ? "is-on" : "") +
                '">' +
                (d === "easier" ? "Easier" : d === "harder" ? "Harder" : "Steady") +
                "</button>"
              );
            })
            .join("") +
          "</div>" +
          '<button type="button" class="voyage-hear" id="math-hear-map">Hear the chart</button>' +
          '<ol class="voyage-chart">' +
          data.islands
            .map(function (isl, idx) {
              const stowed = progress.chests[chestKey(isl.id)];
              const now = sailing === isl.id;
              return (
                '<li><button type="button" class="voyage-island-btn' +
                (stowed ? " is-stowed" : "") +
                (now ? " is-now" : "") +
                '" data-island="' +
                esc(isl.id) +
                '">' +
                art(isl.slot, "voyage-island-pic", { id: isl.id, stowed: !!stowed, crew: isl.crew }) +
                '<span class="voyage-island-label">' +
                (idx + 1) +
                ". " +
                esc(isl.label) +
                (stowed ? " · chest stowed" : "") +
                (now ? '<span class="voyage-now-tag">Now sailing</span>' : "") +
                "</span></button></li>"
              );
            })
            .join("") +
          "</ol></div>"
      );
      bindTools();
      document.getElementById("math-hear-map").onclick = function () {
        if (window.Ship) Ship.wind();
        speak(data.intro.audioText);
      };
      host.querySelectorAll("[data-diff]").forEach(function (btn) {
        btn.onclick = function () {
          difficulty = btn.getAttribute("data-diff");
          try {
            sessionStorage.setItem("hs.math.diff", difficulty);
          } catch (e) {}
          render();
        };
      });
      host.querySelectorAll("[data-island]").forEach(function (btn) {
        btn.onclick = function () {
          openIsland(btn.getAttribute("data-island"));
        };
      });
      if (window.Ship) Ship.creak();
      speak(data.intro.audioText);
    }

    function openIsland(id) {
      island = data.islands.find(function (x) {
        return x.id === id;
      });
      if (!island) return;
      tableN = null;
      i = 0;
      resetItemState();
      screen = "lesson";
      if (window.Ship) Ship.splash();
      render();
    }

    function startPlay() {
      if (island.drill && tableN == null) {
        screen = "tables";
        render();
        return;
      }
      items = gatherItems();
      i = 0;
      resetItemState();
      screen = "play";
      cue("reward");
      if (window.Ship) Ship.fanfare();
      render();
      if (items[0] && items[0].audioText) speak(items[0].audioText);
    }

    function finishPlay() {
      if (island.drill && tableN == null) {
        screen = "tables";
        render();
        return;
      }
      screen = "paper";
      if (window.Ship) Ship.bell();
      render();
    }

    function renderTables() {
      const kind = island.drill.kind;
      const from = island.drill.from;
      const to = island.drill.to;
      const doneMap = kind === "div" ? progress.tablesDiv : progress.tablesMul;
      let btns = "";
      for (let n = from; n <= to; n++) {
        btns +=
          '<button type="button" data-table="' +
          n +
          '" class="' +
          (doneMap[String(n)] ? "is-stowed" : "") +
          '">' +
          n +
          (doneMap[String(n)] ? " ✓" : "") +
          "</button>";
      }
      host.innerHTML = chrome(
        art("hero", "voyage-hero-art") +
          '<div class="voyage-cabin">' +
          "<h2>" +
          esc(island.technique.title) +
          "</h2><p>" +
          esc(island.technique.body) +
          "</p>" +
          '<div class="voyage-actions"><button type="button" class="voyage-hear" id="math-hear">Hear the technique</button></div>' +
          "<p>Pick a crate. Every fact in that table, then paper.</p>" +
          '<div class="voyage-tables">' +
          btns +
          "</div>" +
          '<button type="button" class="voyage-back" id="math-back">Back to the chart</button></div>'
      );
      bindTools();
      document.getElementById("math-hear").onclick = function () {
        speak(island.technique.audioText);
      };
      document.getElementById("math-back").onclick = function () {
        screen = "map";
        render();
      };
      host.querySelectorAll("[data-table]").forEach(function (btn) {
        btn.onclick = function () {
          tableN = Number(btn.getAttribute("data-table"));
          startPlay();
        };
      });
      speak(island.technique.audioText);
    }

    function renderLesson() {
      host.innerHTML = chrome(
        art(island.slot, "voyage-hero-art", { id: island.id, crew: island.crew }) +
          '<div class="voyage-cabin">' +
          '<p class="voyage-kicker">' +
          esc(island.label) +
          "</p>" +
          '<div class="voyage-technique"><h2>' +
          esc(island.technique.title) +
          "</h2><p>" +
          esc(island.technique.body) +
          "</p></div>" +
          '<div class="voyage-actions">' +
          '<button type="button" class="voyage-hear" id="math-hear">Hear the technique</button>' +
          '<button type="button" id="math-start">Cast off</button></div>' +
          '<button type="button" class="voyage-back" id="math-back">Back to the chart</button></div>'
      );
      bindTools();
      document.getElementById("math-hear").onclick = function () {
        speak(island.technique.audioText);
      };
      document.getElementById("math-start").onclick = startPlay;
      document.getElementById("math-back").onclick = function () {
        screen = "map";
        render();
      };
      speak(island.technique.audioText);
    }

    function arrayHtml(item, fill, prefix, rows, cols) {
      rows = rows || Number(item.rows) || 0;
      cols = cols || Number(item.cols) || 0;
      prefix = prefix || "";
      const total = Math.min(48, rows * cols);
      let grid = '<div class="voyage-array" style="--cols:' + cols + '">';
      for (let k = 0; k < total; k++) {
        const key = prefix + k;
        if (fill) {
          grid +=
            '<button type="button" class="voyage-cell' +
            (tapped[key] ? " is-on" : "") +
            '" data-cell="' +
            key +
            '" aria-label="Cell ' +
            (k + 1) +
            '">' +
            (tapped[key] ? coinSvg() : "") +
            "</button>";
        } else {
          grid += '<div class="voyage-cell is-on">' + coinSvg() + "</div>";
        }
      }
      return grid + "</div>";
    }
    function tenframeHtml(item) {
      const ask = item && item.ask;
      const preset = ask === "empty" ? Number(item.fill || item.count || 0) : 0;
      let h = '<div class="voyage-tenframe">';
      for (let k = 0; k < 10; k++) {
        if (preset && k < preset) {
          h += '<button type="button" class="is-on is-lock" disabled aria-label="Filled cell">' + coinSvg() + "</button>";
          continue;
        }
        h +=
          '<button type="button" class="' +
          (tapped[k] ? "is-on" : "") +
          '" data-cell="' +
          k +
          '" aria-label="Frame ' +
          (k + 1) +
          '">' +
          (tapped[k] ? coinSvg() : "") +
          "</button>";
      }
      return h + "</div>";
    }
    function bundleHtml() {
      let crates = "";
      for (let t = 0; t < work.tens; t++) {
        crates += '<div class="voyage-crate-box" aria-label="Ten crate">10</div>';
      }
      let ones = '<div class="voyage-ones">';
      for (let o = 0; o < work.ones; o++) {
        ones +=
          '<button type="button" class="' +
          (work.selected[o] ? "is-sel" : "") +
          '" data-one="' +
          o +
          '" aria-label="One ' +
          (o + 1) +
          '">' +
          coinSvg() +
          "</button>";
      }
      ones += "</div>";
      const sel = Object.keys(work.selected).length;
      return (
        '<div class="voyage-place"><div class="voyage-bundle-row">' +
        crates +
        "</div>" +
        ones +
        '<button type="button" id="math-bundle"' +
        (sel < 10 ? " disabled" : "") +
        ">Bundle 10 ones into a crate</button><p>" +
        work.tens +
        " ten-crates, " +
        work.ones +
        " ones</p></div>"
      );
    }
    function countOnHtml(item) {
      const hold = Number(item.hold || item.left || 0);
      const add = Number(item.add || item.right || 0);
      return (
        '<p class="voyage-hold">Hold <strong>' +
        hold +
        "</strong>. Count on for each extra coin.</p>" +
        coinsHtml(add, true, tapped)
      );
    }
    function stepPad() {
      const step = (work.steps || [])[work.step];
      if (!step) return "";
      return "<p>" + esc(step.prompt) + "</p>" + padHtml(work.entry, step.expect);
    }
    function shapeSvg(name) {
      if (name === "circle")
        return '<svg viewBox="0 0 80 64" aria-hidden="true"><circle cx="40" cy="32" r="22" fill="#7ec8d4" stroke="#1a120c" stroke-width="3"/></svg>';
      if (name === "square")
        return '<svg viewBox="0 0 80 64" aria-hidden="true"><rect x="16" y="10" width="48" height="44" fill="#e8c56a" stroke="#1a120c" stroke-width="3"/></svg>';
      if (name === "rectangle")
        return '<svg viewBox="0 0 80 64" aria-hidden="true"><rect x="8" y="16" width="64" height="32" fill="#c49a3c" stroke="#1a120c" stroke-width="3"/></svg>';
      if (name === "triangle")
        return '<svg viewBox="0 0 80 64" aria-hidden="true"><polygon points="40,8 72,56 8,56" fill="#3d6b4f" stroke="#1a120c" stroke-width="3"/></svg>';
      if (name === "foot")
        return '<svg viewBox="0 0 80 64" aria-hidden="true"><rect x="10" y="28" width="60" height="10" fill="#6b3a1f" stroke="#1a120c"/></svg>';
      if (name === "yard")
        return '<svg viewBox="0 0 80 64" aria-hidden="true"><rect x="4" y="26" width="72" height="12" fill="#1a4a6b" stroke="#1a120c"/><path d="M8 26v12M28 26v12M48 26v12M68 26v12" stroke="#f3e2c4"/></svg>';
      if (name === "mile")
        return '<svg viewBox="0 0 80 64" aria-hidden="true"><path d="M4 50h72" stroke="#c49a3c" stroke-width="4"/><path d="M6 50l10-22 10 22 10-30 10 30 10-16 12 16" fill="none" stroke="#3d6b4f" stroke-width="3"/></svg>';
      return '<svg viewBox="0 0 80 64" aria-hidden="true"><circle cx="40" cy="32" r="16" fill="#e8c56a" stroke="#1a120c" stroke-width="3"/></svg>';
    }
    function partsHtml(parts) {
      let bars = "";
      for (let k = 0; k < parts; k++) {
        bars +=
          '<button type="button" class="' +
          (work.partsOn[k] ? "is-filled" : "") +
          '" data-part="' +
          k +
          '"></button>';
      }
      return '<div class="voyage-frac" style="grid-template-columns:repeat(' + parts + ',1fr)">' + bars + "</div>";
    }
    function wholesHtml(item) {
      const parts = Number(item.parts) || 2;
      const need = Number(item.filled) || 0;
      const bars = Math.max(1, Math.ceil(need / parts));
      let html = "";
      for (let b = 0; b < bars; b++) {
        html += '<div class="voyage-frac" style="grid-template-columns:repeat(' + parts + ',1fr)">';
        for (let k = 0; k < parts; k++) {
          const idx = b * parts + k;
          html +=
            '<button type="button" class="' +
            (work.partsOn[idx] ? "is-filled" : "") +
            '" data-part="' +
            idx +
            '"></button>';
        }
        html += "</div>";
      }
      return html;
    }
    function tenthStrip(n) {
      return (
        '<div class="voyage-dec voyage-tenth-strip" style="--dcols:2"><span>0</span><span class="pt">.</span><span class="is-hot">' +
        n +
        "</span></div>"
      );
    }
    function maketenHtml(item) {
      const hold = Number(item.hold) || 0;
      const add = Number(item.add) || 0;
      const added = work.added || 0;
      const room = Math.max(0, 10 - hold);
      let h = '<div class="voyage-tenframe">';
      for (let k = 0; k < 10; k++) {
        if (k < hold) h += '<button type="button" class="is-on is-lock" disabled aria-label="Held coin">' + coinSvg() + "</button>";
        else if (k < hold + Math.min(added, room)) h += '<button type="button" class="is-on" disabled aria-label="Added coin">' + coinSvg() + "</button>";
        else if (added < add && k < 10) h += '<button type="button" data-make="1" aria-label="Add a coin"></button>';
        else h += '<button type="button" disabled aria-hidden="true"></button>';
      }
      h += "</div>";
      const overflow = Math.max(0, add - room);
      if (overflow) {
        h += '<div class="voyage-ones">';
        for (let i = 0; i < overflow; i++) {
          if (i < Math.max(0, added - room)) h += '<span class="voyage-coin-btn is-on">' + coinSvg() + "</span>";
          else h += '<button type="button" class="voyage-coin-btn" data-make="1" aria-label="Add a coin"></button>';
        }
        h += "</div>";
      }
      return h;
    }
    function regroupHtml(item) {
      let crates = "";
      for (let t = 0; t < work.tens; t++) crates += '<div class="voyage-crate-box" aria-label="Ten crate">10</div>';
      const take = Number(item.take) || 0;
      let ones = '<div class="voyage-ones">';
      for (let o = 0; o < work.ones; o++) {
        if (take) ones += '<button type="button" data-give="' + o + '" aria-label="Give away a one">' + coinSvg() + "</button>";
        else ones += '<span class="voyage-coin-btn is-on">' + coinSvg() + "</span>";
      }
      ones += "</div>";
      const add = Number(item.add) || 0;
      const left = add - (work.brought || 0);
      let bring = "";
      if (add) {
        bring = '<div class="voyage-ones" aria-label="Coins to bring in">';
        for (let i = 0; i < left; i++) bring += '<button type="button" data-bring="1" aria-label="Bring in a coin">' + coinSvg() + "</button>";
        bring += "</div>";
      }
      return (
        '<div class="voyage-place"><div class="voyage-bundle-row">' +
        crates +
        "</div>" +
        ones +
        bring +
        '<button type="button" id="math-bundle"' +
        (work.ones < 10 ? " disabled" : "") +
        ">Bundle 10 ones into a crate</button>" +
        '<button type="button" id="math-unbundle"' +
        (work.tens < 1 ? " disabled" : "") +
        ">Unbundle a crate</button><p>" +
        work.tens +
        " tens, " +
        work.ones +
        " ones</p></div>"
      );
    }
    function dealHtml(item) {
      if (Number(item.dividend) === 0) {
        return '<p>The coin pile is empty.</p><button type="button" id="math-zero">Each crew gets 0</button>';
      }
      const div = Number(item.divisor) || 1;
      const placed = (work.cols || []).reduce(function (s, n) {
        return s + n;
      }, 0);
      const bank = Math.max(0, Number(item.dividend) - placed);
      let cols = '<div class="voyage-deal">';
      for (let c = 0; c < div; c++) {
        cols += '<button type="button" data-crew="' + c + '" aria-label="Crew ' + (c + 1) + '">';
        const n = (work.cols && work.cols[c]) || 0;
        for (let k = 0; k < n; k++) cols += coinSvg();
        cols += "</button>";
      }
      cols += "</div>";
      return coinsHtml(Math.min(bank, 12), false) + cols;
    }
    function visual(item) {
      const kind = item.kind || "choice";
      if (kind === "clock") {
        const h = Number(item.hour) || 0;
        const m = Number(item.minute) || 0;
        const hd = 30 * (h % 12) + 0.5 * m;
        const md = 6 * m;
        return (
          '<div class="voyage-clock" aria-hidden="true"><span class="voyage-clock-hour" style="transform:rotate(' +
          hd +
          'deg)"></span><span class="voyage-clock-min" style="transform:rotate(' +
          md +
          'deg)"></span></div>' +
          stepPad()
        );
      }
      if (kind === "fraction") return partsHtml(Number(item.parts) || 2);
      if (kind === "wholes") return wholesHtml(item);
      if (kind === "tenths") return tenframeHtml(item) + tenthStrip(marks(tapped));
      if (kind === "tenframe") return tenframeHtml(item);
      if (kind === "maketen") return maketenHtml(item);
      if (kind === "bundle") return bundleHtml();
      if (kind === "regroup") return regroupHtml(item);
      if (kind === "counton") return countOnHtml(item);
      if (kind === "array" && item.rows && item.cols) return arrayHtml(item, true);
      if (kind === "arraypair") return arrayHtml(item, true, "L", item.rows, item.cols) + arrayHtml(item, true, "R", item.cols, item.rows);
      if (kind === "takeaway") return coinsHtml(item.start || item.count || 0, true, tapped, true);
      if (kind === "selectn") return coinsHtml(item.count || 0, true, tapped);
      if (kind === "moreone") {
        return (
          coinsHtml(item.count || 0, false) +
          '<button type="button" class="voyage-coin-btn voyage-more" data-more="1" aria-label="One more coin">' +
          (work.extra ? coinSvg() : "") +
          "</button>"
        );
      }
      if (kind === "lessone") {
        const n = Number(item.count) || 0;
        let h = '<div class="voyage-coins is-tap">';
        for (let i = 0; i < n; i++) {
          h +=
            '<button type="button" class="voyage-coin-btn' +
            (work.gone ? " is-gone" : "") +
            '" data-less="1" aria-label="Take one away">' +
            coinSvg() +
            "</button>";
        }
        return h + "</div>";
      }
      if (kind === "deal") return dealHtml(item);
      if (kind === "compare") {
        const L = Number(item.leftLen) || 1;
        const R = Number(item.rightLen) || 1;
        return (
          '<div class="voyage-ropes"><button type="button" data-rope="left" aria-label="First rope"><i style="width:' +
          Math.max(36, L * 28) +
          'px"></i></button><button type="button" data-rope="right" aria-label="Second rope"><i style="width:' +
          Math.max(36, R * 28) +
          'px"></i></button></div>'
        );
      }
      if (kind === "shapepick") {
        return (
          '<div class="voyage-shapes">' +
          (item.options || [])
            .map(function (name) {
              return (
                '<button type="button" data-shape="' +
                esc(name) +
                '" aria-label="' +
                esc(name) +
                '">' +
                shapeSvg(name) +
                "</button>"
              );
            })
            .join("") +
          "</div>"
        );
      }
      if (kind === "perimeter") {
        return (
          '<div class="voyage-sides">' +
          (item.sides || [])
            .map(function (len, idx) {
              return (
                '<button type="button" data-side="' +
                idx +
                '" class="' +
                (work.sidesOn[idx] ? "is-on" : "") +
                '" aria-label="Side ' +
                (idx + 1) +
                '"><i style="width:' +
                (36 + Number(len) * 12) +
                'px"></i></button>'
              );
            })
            .join("") +
          "</div>"
        );
      }
      if (kind === "decimal") {
        const step = work.steps[work.step];
        return decimalBoard(work.meta, step) + stepPad();
      }
      if (kind === "longdiv") {
        return (
          '<pre class="voyage-longboard">' +
          esc(longDivBoard(item.dividend, item.divisor, work.step, work.steps)) +
          "</pre>" +
          stepPad()
        );
      }
      if (kind === "longmul") {
        return '<pre class="voyage-longboard">' + esc(longMulBoard(item.a, item.b, work.step)) + "</pre>" + stepPad();
      }
      if (kind === "product" || kind === "stepskey" || kind === "choice") return stepPad();
      if (kind === "place") {
        const hun = Number(item.hundreds) || 0;
        const tens = Number(item.tens) || 0;
        const ones = Number(item.ones) || 0;
        return (
          '<div class="voyage-place">' +
          (hun ? '<div class="voyage-crate hun">' + hun + " hundred crate" + (hun === 1 ? "" : "s") + "</div>" : "") +
          '<div class="voyage-crate">' +
          tens +
          " ten-crate" +
          (tens === 1 ? "" : "s") +
          "</div>" +
          coinsHtml(Math.min(ones, 20), false) +
          "</div>" +
          stepPad()
        );
      }
      if (kind === "money") return moneyHtml(item) + stepPad();
      if (kind === "piles") {
        return (
          '<div class="voyage-piles"><button type="button" data-pile="left" aria-label="First pile">' +
          coinsHtml(item.left, false) +
          '</button><button type="button" data-pile="right" aria-label="Second pile">' +
          coinsHtml(item.right, false) +
          "</button></div>"
        );
      }
      if (kind === "skip" && item.seq) {
        return (
          '<p class="voyage-seq">' +
          item.seq
            .map(function (n) {
              return "<span>" + esc(n) + "</span>";
            })
            .join("<i></i>") +
          '<span class="is-ask">?</span></p>' +
          stepPad()
        );
      }
      if (kind === "steps" && item.board) {
        return '<pre class="voyage-board">' + esc(item.board) + "</pre>";
      }
      if (item.shape) {
        return '<div class="voyage-shape is-' + esc(item.shape) + '" aria-hidden="true"></div>';
      }
      if (kind === "peek") {
        return (
          '<button type="button" class="voyage-peek" id="math-peek">' +
          art(peeked ? "chest-open" : "chest", "voyage-chest-art") +
          "<span>" +
          (peeked ? "Chest open" : "Tap to open") +
          "</span></button>" +
          (peeked ? coinsHtml(item.count, false) : "")
        );
      }
      if (kind === "rock") {
        return (
          '<button type="button" class="voyage-rock' +
          (rocks ? " is-tilt" : "") +
          '" id="math-rock">' +
          art("hero", "voyage-ship-tilt") +
          "<span>Tap to rock · " +
          rocks +
          "/" +
          (item.count || 3) +
          "</span></button>"
        );
      }
      if (kind === "tap") return coinsHtml(item.count, true, tapped);
      if (item.count) return coinsHtml(item.count, false);
      if (item.left || item.right) return coinsHtml((item.left || 0) + (item.right || 0), false);
      return "";
    }

    function babyAuto(item) {
      if (!item) return false;
      if (item.kind === "tap") return Object.keys(tapped).length >= (Number(item.count) || 1);
      if (item.kind === "peek") return peeked;
      if (item.kind === "rock") return rocks >= (Number(item.count) || 3);
      return false;
    }

    function succeed() {
      if (advancing) return;
      advancing = true;
      const item = items[i];
      cue("ok");
      if (window.Ship) Ship.clink();
      visitDoubloons += 1;
      progress.lastItem = item.id;
      saveProgress();
      const status = document.getElementById("math-status");
      if (status) status.textContent = band === "toddler" || band === "preschool" || band === "baby" ? "Stowed." : "Stowed. On to the next crate.";
      if (band === "toddler" || band === "preschool" || band === "baby") {
        const n = Number(item.answer);
        if (!isNaN(n) && WORDS[n]) speak(WORDS[n]);
      }
      setTimeout(function () {
        i += 1;
        resetItemState();
        advancing = false;
        if (i >= items.length) {
          finishPlay();
          return;
        }
        render();
        if (screen === "play" && items[i] && items[i].audioText) speak(items[i].audioText);
      }, 550);
    }

    function afterGesture(item) {
      if (advancing) return;
      if (gestureDone(item)) {
        render();
        succeed();
      } else render();
    }

    function showMiss(item) {
      cue("tryAgain");
      if (window.Ship) Ship.knock();
      missTeach = teachOf(item, island);
      const status = document.getElementById("math-status");
      if (status) {
        status.innerHTML = '<div class="voyage-teach"><strong>Look:</strong> ' + esc(missTeach) + "</div>";
      }
      speak(missTeach);
    }

    function renderPlay() {
      const item = items[i];
      if (!item) {
        finishPlay();
        return;
      }
      ensureWork(item);
      const young = band === "baby" || band === "toddler" || band === "preschool";
      const tapHint = { tap: 1, tenframe: 1, peek: 1, rock: 1, moreone: 1, lessone: 1, piles: 1, selectn: 1, takeaway: 1 };
      const choiceBox = young && tapHint[item.kind] ? '<p class="voyage-hint">Tap the picture.</p>' : "";
      host.innerHTML = chrome(
        art("cabin", "voyage-hero-art") +
          '<div class="voyage-cabin">' +
          '<p class="voyage-kicker">' +
          esc(island.label) +
          " · crate " +
          (i + 1) +
          " of " +
          items.length +
          "</p>" +
          "<h2>" +
          esc(item.prompt) +
          "</h2>" +
          '<div class="voyage-actions"><button type="button" class="voyage-hear" id="math-hear">Hear it</button></div>' +
          visual(item) +
          choiceBox +
          '<p class="voyage-status" id="math-status">' +
          (missTeach ? '<span class="voyage-teach"><strong>Look:</strong> ' + esc(missTeach) + "</span>" : "") +
          "</p>" +
          '<button type="button" class="voyage-back" id="math-back">Back to the chart</button></div>'
      );
      bindTools();
      document.getElementById("math-hear").onclick = function () {
        speak(item.audioText);
      };
      document.getElementById("math-back").onclick = function () {
        screen = "map";
        render();
      };
      function advanceStep() {
        work.step += 1;
        work.entry = "";
        missTeach = "";
        cue("ok");
        if (window.Ship) Ship.clink();
        if (work.step >= work.steps.length) succeed();
        else {
          render();
          speak(work.steps[work.step].prompt);
        }
      }
      function missPad() {
        work.entry = "";
        missTeach = teachOf(item, island);
        cue("tryAgain");
        if (window.Ship) Ship.knock();
        render();
        speak(missTeach);
      }
      const peek = document.getElementById("math-peek");
      if (peek) {
        peek.onclick = function () {
          if (peeked) return;
          peeked = true;
          if (window.Ship) Ship.latch();
          const n = Number(item.count) || 1;
          speak(WORDS[n] || String(n));
          afterGesture(item);
        };
      }
      const rock = document.getElementById("math-rock");
      if (rock) {
        rock.onclick = function () {
          rocks += 1;
          if (window.Ship) {
            Ship.creak();
            Ship.splash();
          }
          afterGesture(item);
        };
      }
      host.querySelectorAll("[data-coin]").forEach(function (btn) {
        btn.onclick = function () {
          const idx = btn.getAttribute("data-coin");
          if (item.kind === "takeaway" || item.kind === "selectn") {
            if (tapped[idx]) delete tapped[idx];
            else tapped[idx] = 1;
            cue("ok");
            afterGesture(item);
            return;
          }
          if (tapped[idx]) return;
          tapped[idx] = 1;
          const n = Object.keys(tapped).length;
          cue("ok");
          if (window.Ship) Ship.clink();
          const hold = Number(item.hold || item.left || 0);
          if (item.kind === "counton") speak(String(hold + n));
          else if (band === "baby" || band === "toddler" || band === "preschool") speak(WORDS[n] || String(n));
          afterGesture(item);
        };
      });
      host.querySelectorAll("[data-cell]").forEach(function (btn) {
        btn.onclick = function () {
          const idx = btn.getAttribute("data-cell");
          if (tapped[idx]) delete tapped[idx];
          else {
            tapped[idx] = 1;
            cue("ok");
            if (window.Ship) Ship.clink();
          }
          afterGesture(item);
        };
      });
      host.querySelectorAll("[data-make]").forEach(function (btn) {
        btn.onclick = function () {
          if ((work.added || 0) >= Number(item.add || 0)) return;
          work.added = (work.added || 0) + 1;
          cue("ok");
          if (window.Ship) Ship.clink();
          afterGesture(item);
        };
      });
      host.querySelectorAll("[data-more]").forEach(function (btn) {
        btn.onclick = function () {
          work.extra = 1;
          cue("ok");
          afterGesture(item);
        };
      });
      host.querySelectorAll("[data-less]").forEach(function (btn) {
        btn.onclick = function () {
          work.gone = 1;
          cue("ok");
          afterGesture(item);
        };
      });
      host.querySelectorAll("[data-one]").forEach(function (btn) {
        btn.onclick = function () {
          const idx = btn.getAttribute("data-one");
          if (work.selected[idx]) delete work.selected[idx];
          else work.selected[idx] = 1;
          render();
        };
      });
      host.querySelectorAll("[data-part]").forEach(function (btn) {
        btn.onclick = function () {
          const idx = btn.getAttribute("data-part");
          if (work.partsOn[idx]) delete work.partsOn[idx];
          else work.partsOn[idx] = 1;
          cue("ok");
          afterGesture(item);
        };
      });
      host.querySelectorAll("[data-side]").forEach(function (btn) {
        btn.onclick = function () {
          work.sidesOn[btn.getAttribute("data-side")] = 1;
          cue("ok");
          afterGesture(item);
        };
      });
      host.querySelectorAll("[data-shape]").forEach(function (btn) {
        btn.onclick = function () {
          if (btn.getAttribute("data-shape") === String(item.answer)) succeed();
          else showMiss(item);
        };
      });
      host.querySelectorAll("[data-rope]").forEach(function (btn) {
        btn.onclick = function () {
          const L = Number(item.leftLen) || 0;
          const R = Number(item.rightLen) || 0;
          const win = L === R ? "same" : L > R ? "left" : "right";
          if (btn.getAttribute("data-rope") === win) succeed();
          else showMiss(item);
        };
      });
      host.querySelectorAll("[data-pile]").forEach(function (btn) {
        btn.onclick = function () {
          const L = Number(item.left) || 0;
          const R = Number(item.right) || 0;
          let win = L === R ? "same" : L > R ? "left" : "right";
          if (item.ask === "fewer") win = L === R ? "same" : L < R ? "left" : "right";
          if (item.ask === "same") win = L === R ? "same" : "";
          if (btn.getAttribute("data-pile") === win) succeed();
          else showMiss(item);
        };
      });
      host.querySelectorAll("[data-give]").forEach(function (btn) {
        btn.onclick = function () {
          const take = Number(item.take) || 0;
          if ((work.given || 0) >= take) return;
          if (work.ones < 1) return;
          work.ones -= 1;
          work.given = (work.given || 0) + 1;
          cue("ok");
          afterGesture(item);
        };
      });
      host.querySelectorAll("[data-bring]").forEach(function (btn) {
        btn.onclick = function () {
          if ((work.brought || 0) >= (Number(item.add) || 0)) return;
          work.ones += 1;
          work.brought = (work.brought || 0) + 1;
          cue("ok");
          afterGesture(item);
        };
      });
      host.querySelectorAll("[data-crew]").forEach(function (btn) {
        btn.onclick = function () {
          const div = Number(item.divisor) || 1;
          const dividend = Number(item.dividend) || 0;
          const placed = (work.cols || []).reduce(function (s, n) {
            return s + n;
          }, 0);
          if (placed >= dividend) return;
          const c = Number(btn.getAttribute("data-crew"));
          work.cols[c] = (work.cols[c] || 0) + 1;
          const sum = work.cols.reduce(function (s, n) {
            return s + n;
          }, 0);
          cue("ok");
          if (sum < dividend) {
            render();
            return;
          }
          if (gestureDone(item)) afterGesture(item);
          else {
            showMiss(item);
            for (let k = 0; k < div; k++) work.cols[k] = 0;
            render();
          }
        };
      });
      const zeroBtn = document.getElementById("math-zero");
      if (zeroBtn) {
        zeroBtn.onclick = function () {
          work.zeroed = true;
          afterGesture(item);
        };
      }
      const bund = document.getElementById("math-bundle");
      if (bund) {
        bund.onclick = function () {
          if (item.kind === "regroup") {
            if (work.ones < 10) return;
            work.tens += 1;
            work.ones -= 10;
            cue("ok");
            if (window.Ship) Ship.latch();
            afterGesture(item);
            return;
          }
          if (Object.keys(work.selected).length < 10) return;
          work.tens += 1;
          work.ones -= 10;
          work.selected = {};
          cue("ok");
          if (window.Ship) Ship.latch();
          afterGesture(item);
        };
      }
      const unbundle = document.getElementById("math-unbundle");
      if (unbundle) {
        unbundle.onclick = function () {
          if (work.tens < 1) return;
          work.tens -= 1;
          work.ones += 10;
          cue("ok");
          if (window.Ship) Ship.latch();
          afterGesture(item);
        };
      }
      const pad = document.getElementById("math-pad");
      if (pad) {
        pad.addEventListener("click", function (ev) {
          const btn = ev.target.closest("button[data-key]");
          if (!btn) return;
          const key = btn.getAttribute("data-key");
          const step = work.steps[work.step];
          if (!step) return;
          if (key === "⌫") {
            work.entry = String(work.entry || "").slice(0, -1);
            render();
            return;
          }
          if (key === "OK") {
            if (answersMatch(work.entry, step.expect)) advanceStep();
            else missPad();
            return;
          }
          if (key === "." && String(work.entry || "").indexOf(".") !== -1) return;
          work.entry = String(work.entry || "") + key;
          if (answersMatch(work.entry, step.expect)) {
            const entry = document.getElementById("math-entry");
            if (entry) entry.textContent = work.entry;
            advanceStep();
            return;
          }
          const expect = String(step.expect == null ? "" : step.expect)
            .replace(/\$/g, "")
            .replace(/%/g, "")
            .trim();
          if (String(work.entry).length > expect.length) {
            missPad();
            return;
          }
          const entry = document.getElementById("math-entry");
          if (entry) entry.textContent = work.entry;
        });
      }
    }

    function paperList() {
      let list = island.paper || [];
      if (tableN != null) {
        list = list.map(function (p) {
          return { prompt: String(p.prompt || p).replace(/\bn\b/g, String(tableN)) };
        });
      }
      return list;
    }

    function renderPaper() {
      const member = CREW[island.crew];
      host.innerHTML = chrome(
        art("paper", "voyage-hero-art") +
          '<div class="voyage-cabin voyage-paper">' +
          "<h2>Drop anchor. Now do this on paper.</h2>" +
          "<p>The voyage showed the technique. Finish these at the desk. Do not tap answers here — write them.</p>" +
          "<ol>" +
          paperList()
            .map(function (p) {
              return "<li>" + esc(p.prompt || p) + "</li>";
            })
            .join("") +
          "</ol>" +
          '<p class="voyage-doubloons">This visit: ' +
          visitDoubloons +
          " doubloons</p>" +
          '<div class="voyage-actions"><button type="button" id="math-stow">Stow the chest</button>' +
          '<button type="button" class="voyage-back" id="math-again">Sail this island again</button></div></div>'
      );
      bindTools();
      document.getElementById("math-stow").onclick = function () {
        progress.chests[chestKey(island.id)] = true;
        if (island.crew && progress.crew.indexOf(island.crew) === -1) progress.crew.push(island.crew);
        if (island.drill && tableN != null) {
          const map = island.drill.kind === "div" ? progress.tablesDiv : progress.tablesMul;
          map[String(tableN)] = true;
        }
        saveProgress();
        screen = "chest";
        if (window.Ship) {
          Ship.latch();
          Ship.bell();
        }
        cue("reward");
        render();
      };
      document.getElementById("math-again").onclick = function () {
        i = 0;
        tableN = null;
        screen = "lesson";
        render();
      };
      speak("Drop anchor. Now do this on paper.");
      if (member) {
        /* first-name only */
      }
    }

    function renderChest() {
      const member = CREW[island.crew];
      host.innerHTML = chrome(
        art("chest-open", "voyage-hero-art") +
          '<div class="voyage-cabin voyage-reward">' +
          "<h2>Chest stowed</h2>" +
          "<p>" +
          esc(island.chest || "A brass latch clicks shut.") +
          "</p>" +
          (member
            ? "<p>" +
              esc(member.name) +
              " the " +
              esc(member.role) +
              " is aboard.</p>"
            : "") +
          art("crew-" + (island.crew || "pip"), "voyage-porthole-lg") +
          '<div class="voyage-actions"><button type="button" id="math-chart">Back to the chart</button></div></div>'
      );
      bindTools();
      document.getElementById("math-chart").onclick = function () {
        justStowed = island.id;
        screen = "map";
        if (window.Ship) Ship.gull();
        render();
      };
      speak((island.chest || "Chest stowed.") + (member ? " " + member.name + " is aboard." : ""));
    }

    function render() {
      if (screen === "map") renderMap();
      else if (screen === "tables") renderTables();
      else if (screen === "lesson") renderLesson();
      else if (screen === "play") renderPlay();
      else if (screen === "paper") renderPaper();
      else if (screen === "chest") renderChest();
    }

    render();
  }

  function renderPicker(host) {
    host.innerHTML =
      '<div class="voyage-picker">' +
      "<h1>Treasure Voyage</h1>" +
      "<p>Pick a band. Names and ages stay off this page.</p>" +
      '<div class="voyage-pick-grid">' +
      BANDS.filter(function (b) {
        return b !== "baby";
      }).map(function (b) {
        return (
          '<button type="button" data-band="' +
          b +
          '">' +
          esc(BAND_LABEL[b]) +
          "<small>" +
          esc(b) +
          "</small></button>"
        );
      }).join("") +
      "</div></div>";
    host.querySelectorAll("[data-band]").forEach(function (btn) {
      btn.onclick = function () {
        writeBand(btn.getAttribute("data-band"));
        boot().catch(function (e) {
          console.error(e);
        });
      };
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      boot().catch(function (e) {
        console.error(e);
      });
    });
  } else {
    boot().catch(function (e) {
      console.error(e);
    });
  }
})();
