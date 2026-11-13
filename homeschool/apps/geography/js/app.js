(function () {
  "use strict";

  var root = document.getElementById("app");
  var state = {
    band: null,
    screen: "hub",
    flightId: null,
    quizIndex: 0,
    quizLock: false,
    babyFound: {},
    pinDone: {},
    quizCard: null,
  };

  function assetUrl(path) {
    if (window.HS && typeof window.HS.url === "function") return window.HS.url(path);
    var base = document.documentElement.dataset.appBase || new URL("./", location.href).href;
    return new URL(path, base).href;
  }

  function qs() {
    return new URLSearchParams(location.search);
  }

  function readBand() {
    var q = qs().get("band");
    if (q && HS_BANDS.some(function (b) { return b.id === q; })) return q;
    try {
      var stored = localStorage.getItem("hs.band");
      if (stored && HS_BANDS.some(function (b) { return b.id === stored; })) return stored;
    } catch (e) {}
    return null;
  }

  function setBand(id) {
    state.band = id;
    try { localStorage.setItem("hs.band", id); } catch (e) {}
    var u = new URL(location.href);
    u.searchParams.set("band", id);
    history.replaceState({}, "", u);
    document.body.className = "band-" + id;
  }

  function isLittle() {
    return state.band === "baby" || state.band === "toddler";
  }

  function flightsForBand() {
    return HS_FLIGHTS.filter(function (f) {
      return hsBandAtLeast(state.band, f.min);
    });
  }

  function flightById(id) {
    for (var i = 0; i < HS_FLIGHTS.length; i++) {
      if (HS_FLIGHTS[i].id === id) return HS_FLIGHTS[i];
    }
    return null;
  }

  function quizzesFor(fl) {
    if (!fl) return [];
    var pack = HS_GEO_QUIZZES[fl.id] || {};
    var b = state.band;
    if (b === "baby" || b === "toddler") return (pack[b] || []).slice();
    return (pack[b] || pack.early || pack.preschool || pack.toddler || []).slice();
  }

  function shuffledChoices(item) {
    var pairs = item.choices.map(function (c, i) { return { c: c, i: i }; });
    var n = pairs.length;
    while (n > 1) {
      var j = Math.floor(Math.random() * n);
      n -= 1;
      var tmp = pairs[n];
      pairs[n] = pairs[j];
      pairs[j] = tmp;
    }
    var a = 0;
    pairs.forEach(function (p, idx) { if (p.i === item.a) a = idx; });
    return { q: item.q, choices: pairs.map(function (p) { return p.c; }), a: a };
  }

  function flightMarks(fl) {
    if (!fl) return [];
    if (fl.states && fl.states.length) {
      return fl.states.map(function (ab) {
        var st = HS_STATES.filter(function (s) { return s.abbr === ab; })[0];
        return { kind: "state", id: ab, label: ab, sub: st ? st.capital : "" };
      });
    }
    var list = fl.features || fl.rivers || [];
    return list.map(function (x) {
      return { kind: "feature", id: x.id, label: x.name, sub: x.hint || "" };
    });
  }

  function flightBlurb(f) {
    if (f.states && f.states.length) return f.states.join(" · ");
    if (f.features && f.features.length) return f.features.map(function (x) { return x.name; }).join(" · ");
    if (f.rivers && f.rivers.length) return f.rivers.map(function (x) { return x.name; }).join(" · ");
    if (f.trails && f.trails.length) return f.trails.join(" · ");
    if (f.canals && f.canals.length) return f.canals.join(" · ");
    if (f.regions && f.regions.length) return f.regions.join(" · ");
    return "";
  }

  document.addEventListener("pointerdown", function first() {
    HSAudio.unlock();
    document.removeEventListener("pointerdown", first);
  });

  function header() {
    var p = HSProgress.load();
    var mute = HSAudio.isMuted();
    return (
      '<header class="topbar"><div class="topbar-inner">' +
        '<div class="brand"><strong>Hot-Air Balloon Expedition</strong><small>US maps · pins · stamps</small></div>' +
        '<div class="topbar-tools">' +
          '<div class="stats"><span>' + (p.pins.length) + " pins</span><span>" + Object.keys(p.stamps).length + " stamps</span><span>" + p.stars + " ★</span></div>" +
          '<button type="button" class="icon-btn touch" data-act="stamps">Log</button>' +
          '<button type="button" class="icon-btn touch" data-act="mute" aria-pressed="' + mute + '">' + (mute ? "Off" : "Sound") + "</button>" +
          '<button type="button" class="icon-btn touch" data-act="band">Band</button>' +
        "</div>" +
      "</div></header>"
    );
  }

  function picker() {
    var cards = HS_BANDS.map(function (b) {
      return '<button type="button" class="band-card touch" data-band="' + b.id + '"><strong>' + b.label + "</strong><br>" + b.blurb + "</button>";
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          "<h1>Choose an altitude band</h1>" +
          '<p class="lede">No grades. Pick the flight that fits.</p>' +
          '<div class="band-grid">' + cards + "</div>" +
        "</main></div>";
  }

  function hub() {
    var p = HSProgress.load();
    var week = qs().get("week");
    var list = flightsForBand().map(function (f) {
      var stamped = p.stamps[f.id] ? " stamped" : "";
      var rec = String(f.week) === String(week) ? " aria-current=\"true\"" : "";
      var blurb = flightBlurb(f);
      return (
        '<button type="button" class="flight-btn touch' + stamped + '" data-flight="' + f.id + '"' + rec + ">" +
          '<span class="week">W' + f.week + "</span>" +
          "<span><strong>" + f.title + "</strong>" + (blurb ? "<br>" + blurb : "") + "</span>" +
        "</button>"
      );
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<figure class="hero">' +
            '<img src="' + assetUrl("images/hero-balloon.jpg") + '" alt="Hot-air balloon with terracotta, cream, and forest-green stripes over prairie">' +
            "<figcaption>Basket and burner. Each flight is a map topic. Drop pins; collect stamps.</figcaption>" +
          "</figure>" +
          "<h1>Expedition board</h1>" +
          (state.band === "baby" ? '<div class="actions"><button type="button" class="brass-btn touch" data-act="baby">Sky play</button></div>' : "") +
          (isLittle() ? "" : '<p class="lede">Original flights aligned to Cycle 3 U.S. geography <em>topics</em>. Public names of states, capitals, and features. No recitation sentences.</p>') +
          '<div class="photo-row">' +
            '<img src="' + assetUrl("images/basket-map.jpg") + '" alt="Wicker balloon basket rim with a brass compass and folded map">' +
            '<img src="' + assetUrl("images/aerial-usa.jpg") + '" alt="High-altitude aerial of North American land and water">' +
          "</div>" +
          '<div class="basket-panel"><div class="flight-list">' + list + "</div>" +
            '<div class="actions">' +
              (state.band === "baby" ? "" : '<button type="button" class="brass-btn touch" data-act="map">Open the chart</button>') +
              '<button type="button" class="brass-btn secondary touch" data-act="songs">Song</button>' +
              (window.HS && HS.inRunner ? '<button type="button" class="brass-btn secondary touch" data-act="stamps">Log</button>' : "") +
            "</div></div>" +
        "</main></div>";
    HSAudio.wind();
  }

  function flightView() {
    var fl = flightById(state.flightId);
    if (!fl) { state.screen = "hub"; hub(); return; }
    HSProgress.addPin(fl.id);
    var photo = "images/aerial-usa.jpg";
    if (fl.type === "rivers" || fl.id === "rivers-east" || fl.id === "rivers-west") photo = "images/river-aerial.jpg";
    if (fl.type === "features" && /mtn|west-mtns|nw-mtns|appalach/.test(fl.id)) photo = "images/mountains-aerial.jpg";
    if (fl.id === "deserts" || fl.id === "features-a") photo = "images/desert-aerial.jpg";
    if (fl.id === "great-lakes") photo = "images/lakes-aerial.jpg";
    var marks = flightMarks(fl);
    var canDrop = marks.length && !isLittle() && hsBandAtLeast(state.band, "early");
    var canQuiz = state.band !== "baby" && quizzesFor(fl).length;
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p><button type="button" class="brass-btn secondary touch" data-act="hub">Back to the board</button> · Week ' + fl.week + "</p>" +
          "<h1>" + fl.title + "</h1>" +
          '<img src="' + assetUrl(photo) + '" alt="">' +
          '<section class="basket-panel">' +
            "<p>" + fl.fact + "</p>" +
            '<div class="actions">' +
              '<button type="button" class="brass-btn touch" data-act="talk" data-text="' + encodeURIComponent(fl.fact) + '">Read aloud</button>' +
              (canQuiz ? '<button type="button" class="brass-btn touch" data-act="quiz">Pin quiz</button>' : "") +
              (canDrop ? '<button type="button" class="brass-btn secondary touch" data-act="drop">Drop pins</button>' : "") +
              '<button type="button" class="brass-btn secondary touch" data-act="map">Chart</button>' +
            "</div>" +
          "</section>" +
        "</main></div>";
  }

  function quizView() {
    var fl = flightById(state.flightId);
    var items = quizzesFor(fl);
    if (!items.length) {
      state.screen = "flight";
      flightView();
      return;
    }
    if (state.quizIndex >= items.length) {
      HSProgress.addStamp(fl.id);
      HSAudio.celebrate();
      state.screen = "flight";
      flightView();
      return;
    }
    var raw = items[state.quizIndex];
    if (!state.quizCard || state.quizCard.index !== state.quizIndex) {
      state.quizCard = { index: state.quizIndex, item: shuffledChoices(raw) };
    }
    var item = state.quizCard.item;
    var choices = item.choices.map(function (c, i) {
      return '<button type="button" class="choice touch" data-choice="' + i + '">' + c + "</button>";
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p><button type="button" class="brass-btn secondary touch" data-act="flight">Back</button></p>' +
          '<section class="basket-panel">' +
            "<h2>Pin " + (state.quizIndex + 1) + " of " + items.length + "</h2>" +
            "<p>" + item.q + "</p>" + choices +
            '<p class="live" id="live" aria-live="polite"></p>' +
            '<button type="button" class="brass-btn touch" data-act="talk" data-text="' + encodeURIComponent(item.q) + '">Hear the question</button>' +
          "</section>" +
        "</main></div>";
    HSAudio.talk(item.q);
  }

  function mapView(withPins) {
    var fl = withPins ? flightById(state.flightId) : null;
    var marks = fl ? flightMarks(fl) : [];
    var pinHtml = "";
    if (fl && marks.length) {
      pinHtml = '<div class="pin-tray" id="pin-tray">' + marks.map(function (m) {
        var extra = m.kind === "feature" ? ' data-feature="' + m.id + '"' : ' data-abbr="' + m.id + '"';
        return '<button type="button" class="pin touch"' + extra + ">" + m.label + (m.sub ? "<br>" + m.sub : "") + "</button>";
      }).join("") + "</div><p>Drag a pin onto its glowing mark on the chart.</p>";
    }
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p><button type="button" class="brass-btn secondary touch" data-act="hub">Back</button></p>' +
          "<h1>Expedition chart</h1>" +
          '<p class="lede">Original schematic navigator chart — not a survey plat. Drop pins on glowing states and features.</p>' +
          pinHtml +
          '<div class="map-wrap" id="map-host"></div>' +
          '<p class="live" id="live" aria-live="polite"></p>' +
        "</main></div>";
    var host = document.getElementById("map-host");
    HSMap.loadChart(host).then(function () {
      if (fl && marks.length) {
        var abbrs = marks.filter(function (m) { return m.kind === "state"; }).map(function (m) { return m.id; });
        var feats = marks.filter(function (m) { return m.kind === "feature"; }).map(function (m) { return m.id; });
        HSMap.highlight(host, abbrs, feats);
        HSMap.scrollToGlow(host);
        var tray = document.getElementById("pin-tray");
        HSMap.bindPins(tray, host, null, function (ok, id, pin) {
          var live = document.getElementById("live");
          if (ok) {
            pin.disabled = true;
            state.pinDone[id] = true;
            HSProgress.addStar();
            if (live) live.textContent = (pin.textContent || id) + " is home. Stamp that pin.";
            var all = marks.every(function (m) { return state.pinDone[m.id]; });
            if (all) {
              HSProgress.addStamp(fl.id);
              HSAudio.celebrate();
              if (live) live.textContent = "Every pin is home. Expedition stamp earned.";
            }
          } else if (live) {
            live.textContent = "That pin belongs on a different mark. Try again.";
          }
        });
      }
    }).catch(function () {
      var live = document.getElementById("live");
      if (live) live.textContent = "Chart file is missing offline. Reload once on the network, then try airplane mode.";
    });
  }

  function songView(id) {
    var songs = HS_GEO_SONGS.filter(function (s) { return hsBandAtLeast(state.band, s.min); });
    var song = songs[0];
    if (id) {
      for (var i = 0; i < songs.length; i++) if (songs[i].id === id) song = songs[i];
    }
    var tabs = songs.map(function (s) {
      return '<button type="button" class="brass-btn secondary touch" data-song="' + s.id + '">' + s.title + "</button>";
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p><button type="button" class="brass-btn secondary touch" data-act="hub">Back</button></p>' +
          '<section class="basket-panel">' +
            "<h2>" + song.title + "</h2>" +
            '<p class="lyrics">' + song.lyrics + "</p>" +
            '<div class="actions">' +
              '<button type="button" class="brass-btn touch" data-act="melody" data-song="' + song.id + '">Play the tune</button>' +
              '<button type="button" class="brass-btn touch" data-act="talk" data-text="' + encodeURIComponent(song.lyrics) + '">Read the words</button>' +
            "</div>" +
            '<p>Original words and tune — not a curriculum song.</p>' +
            '<div class="actions">' + tabs + "</div>" +
          "</section>" +
        "</main></div>";
  }

  function babyView() {
    var spots = HS_BABY_GEO.map(function (h) {
      var found = state.babyFound[h.id] ? " found" : "";
      return '<button type="button" class="hot touch' + found + '" data-hot="' + h.id + '">' + h.label + "</button>";
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p><button type="button" class="brass-btn secondary touch" data-act="hub">Back</button></p>' +
          "<h1>Sky play</h1>" +
          '<p class="lede">Tap balloon, cloud, land, and water. A first-flight stamp waits when every part sings.</p>' +
          '<img src="' + assetUrl("images/hero-balloon.jpg") + '" alt="Hot-air balloon over prairie">' +
          '<div class="hotspots">' + spots + "</div>" +
          '<p class="live" id="live" aria-live="polite"></p>' +
        "</main></div>";
  }

  function stampBook() {
    var p = HSProgress.load();
    var seals = HS_FLIGHTS.map(function (f) {
      var got = p.stamps[f.id] ? " got" : "";
      return '<div class="seal' + got + '">W' + f.week + "<br>" + f.title + "</div>";
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p><button type="button" class="brass-btn secondary touch" data-act="hub">Back</button></p>' +
          '<section class="basket-panel">' +
            "<h2>Expedition log</h2>" +
            "<p>Stars: " + p.stars + ". Pins collected: " + p.pins.length + ".</p>" +
            '<div class="stamp-grid">' + seals + "</div>" +
          "</section>" +
        "</main></div>";
  }

  function render() {
    if (!state.band) { picker(); return; }
    document.body.className = "band-" + state.band;
    if (state.screen === "stamps") { stampBook(); return; }
    if (state.screen === "baby") { babyView(); return; }
    if (state.screen === "songs") { songView(state.songId); return; }
    if (state.screen === "map") { mapView(false); return; }
    if (state.screen === "drop") { mapView(true); return; }
    if (state.screen === "quiz") { quizView(); return; }
    if (state.screen === "flight") { flightView(); return; }
    hub();
  }

  root.addEventListener("click", function (ev) {
    var t = ev.target.closest("button");
    if (!t) return;
    HSAudio.unlock();
    if (t.classList.contains("pin")) return;
    if (t.dataset.band) {
      setBand(t.dataset.band);
      state.screen = t.dataset.band === "baby" ? "baby" : "hub";
      HSAudio.burner();
      render();
      return;
    }
    var act = t.dataset.act;
    if (act === "mute") { HSAudio.setMuted(!HSAudio.isMuted()); render(); return; }
    if (act === "band") { state.band = null; render(); return; }
    if (act === "stamps") { state.screen = "stamps"; render(); return; }
    if (act === "hub") { state.screen = "hub"; HSAudio.stopTalk(); render(); return; }
    if (act === "baby") { state.screen = "baby"; render(); return; }
    if (act === "songs") { state.screen = "songs"; render(); return; }
    if (act === "map") { state.screen = "map"; render(); return; }
    if (act === "drop") { state.pinDone = {}; state.screen = "drop"; render(); return; }
    if (act === "flight") { state.screen = "flight"; render(); return; }
    if (act === "quiz") { state.screen = "quiz"; state.quizIndex = 0; state.quizLock = false; state.quizCard = null; render(); return; }
    if (act === "talk") { HSAudio.talk(decodeURIComponent(t.dataset.text || "")); return; }
    if (act === "melody") {
      var song = HS_GEO_SONGS[0];
      for (var i = 0; i < HS_GEO_SONGS.length; i++) if (HS_GEO_SONGS[i].id === t.dataset.song) song = HS_GEO_SONGS[i];
      HSAudio.playMelody(song.melody);
      return;
    }
    if (t.dataset.song) { state.songId = t.dataset.song; state.screen = "songs"; render(); return; }
    if (t.dataset.flight) {
      state.flightId = t.dataset.flight;
      state.screen = "flight";
      HSAudio.whoosh();
      render();
      return;
    }
    if (t.dataset.choice !== undefined) {
      if (state.quizLock) return;
      var fl = flightById(state.flightId);
      var items = quizzesFor(fl);
      var raw = items[state.quizIndex];
      var item = (state.quizCard && state.quizCard.item) || shuffledChoices(raw);
      var pick = Number(t.dataset.choice);
      var live = document.getElementById("live");
      if (pick === item.a) {
        t.classList.add("correct");
        if (live) live.textContent = "Pin planted. Next landmark.";
        HSAudio.pinDrop();
        HSProgress.addStar();
        state.quizLock = true;
        setTimeout(function () {
          state.quizIndex += 1;
          state.quizLock = false;
          state.quizCard = null;
          render();
        }, 550);
      } else {
        t.classList.add("miss");
        if (live) live.textContent = "Wrong valley. Try another pin.";
        HSAudio.wrong();
      }
      return;
    }
    if (t.dataset.hot) {
      var hot;
      for (var h = 0; h < HS_BABY_GEO.length; h++) if (HS_BABY_GEO[h].id === t.dataset.hot) hot = HS_BABY_GEO[h];
      if (!hot) return;
      state.babyFound[hot.id] = true;
      if (HSAudio[hot.sound]) HSAudio[hot.sound]();
      HSAudio.talk(hot.talk);
      t.classList.add("found");
      if (HS_BABY_GEO.every(function (x) { return state.babyFound[x.id]; })) {
        HSProgress.addStamp("new-england");
        HSProgress.addPin("new-england");
        HSAudio.celebrate();
        var live2 = document.getElementById("live");
        if (live2) live2.textContent = "First-flight stamp earned!";
      }
    }
  });

  if (document.documentElement.dataset.runner !== "1") {
    var standaloneBase = new URL("./", location.href).href;
    document.documentElement.dataset.appBase = document.documentElement.dataset.appBase || standaloneBase;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(function () {});
    }
  }

  state.band = readBand();
  var week = qs().get("week");
  if (state.band === "baby" && !week) {
    state.screen = "baby";
  }
  if (state.band && week && state.band !== "baby") {
    var match = HS_FLIGHTS.filter(function (f) { return String(f.week) === String(week); })[0];
    if (match && hsBandAtLeast(state.band, match.min)) {
      state.flightId = match.id;
      state.screen = "flight";
    }
  }
  document.body.className = state.band ? "band-" + state.band : "";
  render();
})();
