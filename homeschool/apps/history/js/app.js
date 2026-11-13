(function () {
  "use strict";

  var root = document.getElementById("app");
  var state = {
    band: null,
    screen: "hub",
    stationId: null,
    activity: "fact",
    quizIndex: 0,
    quizLock: false,
    timelinePick: [],
    babyFound: {},
    quizCard: null,
    presQ: null,
    presQueue: null,
    presCursor: 0,
    presRoster: false,
    presPeeked: false,
    presLive: "",
    presSolved: false,
    preambleIndex: 0,
    preambleCard: null,
    preambleLock: false,
    babyOrder: [],
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

  function stationsForBand() {
    return HS_HISTORY_STATIONS.filter(function (s) {
      return hsBandAtLeast(state.band, s.min);
    });
  }

  function stationById(id) {
    for (var i = 0; i < HS_HISTORY_STATIONS.length; i++) {
      if (HS_HISTORY_STATIONS[i].id === id) return HS_HISTORY_STATIONS[i];
    }
    return null;
  }

  function factFor(st) {
    var b = state.band;
    return (st.fact && (st.fact[b] || st.fact.early || st.fact.preschool || st.fact.toddler || st.fact.baby)) || "";
  }

  function isLittle() {
    return state.band === "baby" || state.band === "toddler";
  }

  function pictureBand() {
    return state.band === "toddler" || state.band === "preschool";
  }

  function hidesLede() {
    return state.band === "baby" || pictureBand();
  }

  function inRunner() {
    return document.documentElement.dataset.runner === "1";
  }

  function shuffleInPlace(arr) {
    var n = arr.length;
    while (n > 1) {
      var j = Math.floor(Math.random() * n);
      n -= 1;
      var tmp = arr[n];
      arr[n] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function quizzesFor(st) {
    if (!st) return [];
    var pack = HS_HISTORY_QUIZZES[st.id] || {};
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

  function firstGesture() {
    HSAudio.unlock();
    document.removeEventListener("pointerdown", firstGesture);
  }
  document.addEventListener("pointerdown", firstGesture);

  function header() {
    if (inRunner()) return "";
    var p = HSProgress.load();
    var mute = HSAudio.isMuted();
    return (
      '<header class="topbar">' +
        '<div class="brand enamel">Time-Travel Train<small>Tickets &amp; stamps</small></div>' +
        '<div class="topbar-tools">' +
          '<div class="stats" aria-live="polite">' +
            '<span>' + p.tickets.length + ' tix</span>' +
            '<span>' + Object.keys(p.stamps).length + ' stamps</span>' +
            '<span>' + p.stars + ' ★</span>' +
          "</div>" +
          '<button type="button" class="icon-btn touch" data-act="stamps">Stamps</button>' +
          '<button type="button" class="icon-btn touch" data-act="mute" aria-pressed="' + mute + '">' + (mute ? "Off" : "Sound") + "</button>" +
          '<button type="button" class="icon-btn touch" data-act="band">Band</button>' +
        "</div>" +
      "</header>"
    );
  }

  function picker() {
    var cards = HS_BANDS.map(function (b) {
      return (
        '<button type="button" class="band-card touch" data-band="' + b.id + '">' +
          "<strong>" + b.label + "</strong>" + b.blurb +
        "</button>"
      );
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' +
        header() +
        '<main id="main" class="main picker">' +
          "<h1>Choose a riding band</h1>" +
          '<p class="lede">No grades. Pick the ride that fits. You can change it any time.</p>' +
          '<div class="band-grid">' + cards + "</div>" +
        "</main>" +
      "</div>";
  }

  function engineSvg() {
    return (
      '<svg class="engine" viewBox="0 0 160 80" aria-hidden="true">' +
        '<rect x="8" y="40" width="110" height="28" fill="#6d2c28" stroke="#c4a056" stroke-width="2"/>' +
        '<rect x="70" y="18" width="40" height="24" fill="#1d2a38" stroke="#c4a056"/>' +
        '<circle cx="36" cy="70" r="12" fill="#1a140f" stroke="#c4a056"/>' +
        '<circle cx="88" cy="70" r="12" fill="#1a140f" stroke="#c4a056"/>' +
        '<rect x="118" y="48" width="28" height="16" fill="#c4a056"/>' +
        '<rect x="20" y="10" width="10" height="30" fill="#8c4a30"/>' +
        '<path d="M24 10 q16 -18 28 0" fill="#e6e0d4" opacity="0.8"/>' +
      "</svg>"
    );
  }

  function hub() {
    var list = stationsForBand();
    var p = HSProgress.load();
    var week = qs().get("week");
    var stops = list.map(function (s) {
      var stamped = p.stamps[s.id] ? " stamped" : "";
      var rec = String(s.week) === String(week) ? " aria-current=\"true\"" : "";
      return (
        '<button type="button" class="station-stop touch' + stamped + '" data-station="' + s.id + '"' + rec + ">" +
          '<span class="sign">' + s.sign + '<span class="year">' + s.year + "</span></span>" +
          '<span class="post"></span>' +
        "</button>"
      );
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main hub">' +
          '<figure class="hero">' +
            '<img src="' + assetUrl("images/hero-station.jpg") + '" alt="Steam locomotive at a brick railway station in evening light">' +
            "<figcaption>All aboard. Each stop is an era. Collect tickets and brass stamps.</figcaption>" +
          "</figure>" +
          '<h1 class="board-title">Railway of American eras</h1>' +
          (hidesLede() ? "" : '<p class="lede">Original station quizzes aligned to Cycle 3 U.S. history <em>topics</em>. Public-domain documents are quoted; memory-work sentences are not.</p>') +
          '<div class="photo-row">' +
            '<img src="' + assetUrl("images/tickets.jpg") + '" alt="Antique railway tickets and a brass punch on a wooden counter">' +
            '<img src="' + assetUrl("images/stamp-album.jpg") + '" alt="Open leather stamp album with wax seals">' +
          "</div>" +
          '<div class="track-wrap"><div class="track">' + engineSvg() + stops + "</div></div>" +
          '<div class="actions">' +
            (state.band === "baby" ? '<button type="button" class="brass-btn touch" data-act="baby">Play car</button>' : "") +
            (pictureBand() ? '<button type="button" class="brass-btn touch" data-act="pictures">Picture tickets</button>' : "") +
            (state.band !== "baby" ? '<button type="button" class="brass-btn touch" data-act="timeline">Timeline car</button>' : "") +
            (hsBandAtLeast(state.band, "early") ? '<button type="button" class="brass-btn secondary touch" data-act="preamble">Preamble fill-in</button>' : "") +
            (hsBandAtLeast(state.band, "primary") ? '<button type="button" class="brass-btn secondary touch" data-act="presidents">Presidents car</button>' : "") +
            '<button type="button" class="brass-btn secondary touch" data-act="songs">Song car</button>' +
          "</div>" +
        "</main></div>";
    HSAudio.chuff();
  }

  function stationView() {
    var st = stationById(state.stationId);
    if (!st) { state.screen = "hub"; hub(); return; }
    HSProgress.addTicket(st.id);
    var fact = factFor(st);
    var extra = "";
    if (st.id === "preamble" && hsBandAtLeast(state.band, "early")) {
      extra = '<blockquote class="source-block">' + HS_PREAMBLE + "</blockquote>";
    }
    if (st.id === "bill" && hsBandAtLeast(state.band, "early")) {
      extra = "<ol class=\"source-block\">" + HS_BILL.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>";
    }
    var img = st.img ? '<img src="' + assetUrl("images/" + st.img) + '" alt="">' : "";
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main station">' +
          '<p class="muted"><button type="button" class="brass-btn secondary touch" data-act="hub">Back to the railway</button> · Week ' + st.week + " · " + st.topic + "</p>" +
          "<h1>" + st.sign + "</h1>" +
          img +
          '<section class="fact-card">' +
            "<h2>Conductor’s note</h2>" +
            "<p>" + fact + "</p>" + extra +
            '<div class="actions">' +
              '<button type="button" class="brass-btn touch" data-act="talk" data-text="' + encodeURIComponent(fact) + '">Read aloud</button>' +
              (state.band === "baby" || !quizzesFor(st).length ? "" : '<button type="button" class="brass-btn touch" data-act="quiz">Ticket quiz</button>') +
              (state.band === "baby" ? "" : '<button type="button" class="brass-btn secondary touch" data-act="timeline">Timeline</button>') +
              (hsBandAtLeast(state.band, "early") ? '<button type="button" class="brass-btn secondary touch" data-act="preamble">Preamble fill-in</button>' : "") +
              '<button type="button" class="brass-btn secondary touch" data-act="songs">Song</button>' +
            "</div>" +
          "</section>" +
        "</main></div>";
  }

  function quizView() {
    var st = stationById(state.stationId);
    var items = quizzesFor(st);
    if (!items.length) {
      state.screen = "station";
      stationView();
      return;
    }
    if (state.quizIndex >= items.length) {
      celebrateStamp(st);
      state.activity = "fact";
      stationView();
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
          '<p class="muted"><button type="button" class="brass-btn secondary touch" data-act="station">Back</button></p>' +
          '<section class="quiz-card">' +
            "<h2>Ticket " + (state.quizIndex + 1) + " of " + items.length + "</h2>" +
            "<p>" + item.q + "</p>" +
            choices +
            '<p class="live" id="live" aria-live="polite"></p>' +
            '<button type="button" class="brass-btn touch" data-act="talk" data-text="' + encodeURIComponent(item.q) + '">Read the question</button>' +
          "</section>" +
        "</main></div>";
    HSAudio.talk(item.q);
  }

  function celebrateStamp(st) {
    var fresh = HSProgress.addStamp(st.id);
    HSProgress.mark(st.id, "quiz");
    HSAudio.punch();
    HSAudio.celebrate();
    if (fresh) HSAudio.bell();
  }

  function timelineView() {
    var pool = HS_HISTORY_TIMELINE.filter(function (t) {
      var st = stationById(t.id);
      return st && hsBandAtLeast(state.band, st.min);
    });
    var n = state.band === "early" ? 3 : state.band === "primary" ? 4 : 5;
    if (!hsBandAtLeast(state.band, "early")) n = 3;
    var pick = pool.slice().sort(function () { return Math.random() - 0.5; }).slice(0, n);
    pick.sort(function (a, b) { return a.year - b.year; });
    state.timelineAnswer = pick.map(function (x) { return x.id; });
    var shuffled = pick.slice().sort(function () { return Math.random() - 0.5; });
    state.timelinePick = [];
    var cards = shuffled.map(function (t) {
      return '<button type="button" class="tl-card touch" data-tl="' + t.id + '">' + t.label + "</button>";
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p class="muted"><button type="button" class="brass-btn secondary touch" data-act="hub">Back</button></p>' +
          '<section class="quiz-card">' +
            "<h2>Line the cars in time order</h2>" +
            "<p>Tap the earliest event first, then the next, down the track.</p>" +
            '<div class="timeline-row" id="tl-source">' + cards + "</div>" +
            '<p>Your train:</p>' +
            '<div class="timeline-row" id="tl-dest"></div>' +
            '<p class="live" id="live" aria-live="polite"></p>' +
            '<button type="button" class="brass-btn touch" data-act="tl-check">Punch the order</button>' +
          "</section>" +
        "</main></div>";
  }

  function songView(id) {
    var songs = HS_HISTORY_SONGS.filter(function (s) { return hsBandAtLeast(state.band, s.min); });
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
          '<p class="muted"><button type="button" class="brass-btn secondary touch" data-act="hub">Back</button></p>' +
          '<section class="song-card">' +
            "<h2>" + song.title + "</h2>" +
            '<p class="lyrics">' + song.lyrics + "</p>" +
            '<div class="actions">' +
              '<button type="button" class="brass-btn touch" data-act="melody" data-song="' + song.id + '">Play the tune</button>' +
              '<button type="button" class="brass-btn touch" data-act="talk" data-text="' + encodeURIComponent(song.lyrics) + '">Read the words</button>' +
            "</div>" +
            '<p class="muted">Original words and tune — not a recitation song from any curriculum.</p>' +
            '<div class="actions">' + tabs + "</div>" +
          "</section>" +
        "</main></div>";
  }

  function babyView() {
    var spots = HS_BABY_HOTS.map(function (h) {
      var found = state.babyFound[h.id] ? " found" : "";
      return '<button type="button" class="hot touch' + found + '" data-hot="' + h.id + '">' + h.label + "</button>";
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p class="muted"><button type="button" class="brass-btn secondary touch" data-act="hub">Back</button></p>' +
          "<h1>Play car</h1>" +
          '<p class="lede">Tap each part of the train. Hear the whistle. Collect a first-ride stamp when every part sings.</p>' +
          '<div class="photo-row">' +
            '<img src="' + assetUrl("images/wheels-steam.jpg") + '" alt="Steam locomotive wheels and coupling rods">' +
            '<img src="' + assetUrl("images/lantern.jpg") + '" alt="Brass railroad lantern glowing on a platform">' +
          "</div>" +
          '<div class="hotspots">' + spots + "</div>" +
          "<h2>Which comes first?</h2>" +
          "<p>Tap the ship, then the lantern.</p>" +
          '<div class="actions">' +
            '<button type="button" class="choice touch" data-order="ship">Ship</button>' +
            '<button type="button" class="choice touch" data-order="lantern">Lantern</button>' +
          "</div>" +
          '<p class="live" id="live" aria-live="polite"></p>' +
        "</main></div>";
  }

  function picturesView() {
    var tickets = stationsForBand().filter(function (s) { return s.img; }).map(function (s) {
      return '<button type="button" class="picture-ticket touch" data-pic="' + s.id + '">' +
        '<img src="' + assetUrl("images/" + s.img) + '" alt="">' +
        "<span>" + esc(s.sign) + "</span></button>";
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          "<h1>Picture tickets</h1>" +
          "<p>Tap a picture. The station signs are a later stop.</p>" +
          '<div class="picture-grid">' + tickets + "</div>" +
          '<p class="live" id="live" aria-live="polite"></p>' +
          '<div class="actions">' +
            '<button type="button" class="brass-btn touch" data-act="timeline">Line up three cars</button>' +
            '<button type="button" class="brass-btn secondary touch" data-act="hub">All the station signs</button>' +
          "</div>" +
        "</main></div>";
  }

  var PREAMBLE_SETS = {
    early: [
      { q: "We the ___ of the United States", choices: ["People", "States", "Citizens"], a: 0 },
      { q: "in Order to form a more perfect ___", choices: ["Union", "Nation", "Congress"], a: 0 }
    ],
    primary: [
      { q: "establish ___", choices: ["Justice", "Commerce", "Union"], a: 0 },
      { q: "insure domestic ___", choices: ["Tranquility", "Welfare", "Liberty"], a: 0 }
    ],
    upper: [
      { q: "provide for the common ___", choices: ["defence", "welfare", "liberty"], a: 0 },
      { q: "secure the Blessings of ___ to ourselves and our Posterity", choices: ["Liberty", "Union", "Justice"], a: 0 }
    ]
  };

  function preambleItems() {
    if (state.band === "upper") return PREAMBLE_SETS.upper;
    if (state.band === "primary") return PREAMBLE_SETS.primary;
    return PREAMBLE_SETS.early;
  }

  function preambleView() {
    var items = preambleItems();
    if (state.preambleIndex >= items.length) {
      state.screen = "hub";
      hub();
      return;
    }
    var raw = items[state.preambleIndex];
    if (!state.preambleCard || state.preambleCard.index !== state.preambleIndex) {
      state.preambleCard = { index: state.preambleIndex, item: shuffledChoices(raw) };
    }
    var item = state.preambleCard.item;
    var choices = item.choices.map(function (c, i) {
      return '<button type="button" class="choice touch" data-preamble="' + i + '">' + esc(c) + "</button>";
    }).join("");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p class="muted"><button type="button" class="brass-btn secondary touch" data-act="hub">Back</button></p>' +
          '<section class="quiz-card">' +
            "<h2>Preamble fill-in</h2>" +
            "<p>Blank " + (state.preambleIndex + 1) + " of " + items.length + ". The words are from the Preamble.</p>" +
            "<p><strong>" + esc(item.q) + "</strong></p>" +
            choices +
            '<p class="live" id="live" aria-live="polite"></p>' +
          "</section>" +
        "</main></div>";
  }

  function stampBook() {
    var p = HSProgress.load();
    var seals = HS_HISTORY_STATIONS.map(function (s) {
      var got = p.stamps[s.id] ? " got" : "";
      return '<div class="seal' + got + '" title="' + s.topic + '">' + s.stamp + "<br>" + s.year + "</div>";
    }).join("");
    var tix = p.tickets.map(function (id) {
      var s = stationById(id);
      return s ? s.sign : id;
    }).join(" · ");
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p class="muted"><button type="button" class="brass-btn secondary touch" data-act="hub">Back</button></p>' +
          '<section class="stamp-book">' +
            "<h2>Stamp book</h2>" +
            '<p>Stars collected: ' + p.stars + '. Tickets: ' + (tix || "none yet") + ".</p>" +
            '<img src="' + assetUrl("images/stamp-album.jpg") + '" alt="Leather stamp album">' +
            '<div class="stamp-grid">' + seals + "</div>" +
          "</section>" +
        "</main></div>";
  }

  function nearbyPresidents(index) {
    var out = [];
    var step = 1;
    while (out.length < 2 && step < HS_PRESIDENTS.length) {
      [index - step, index + step].forEach(function (i) {
        if (out.length >= 2) return;
        if (i < 0 || i >= HS_PRESIDENTS.length) return;
        if (HS_PRESIDENTS[i][1] === HS_PRESIDENTS[index][1]) return;
        out.push(HS_PRESIDENTS[i]);
      });
      step += 1;
    }
    return out;
  }

  function buildPresQuestion() {
    var index = state.presQueue[state.presCursor];
    var row = HS_PRESIDENTS[index];
    var decoys = nearbyPresidents(index);
    var numberToName = state.presCursor % 2 === 0;
    var q;
    var answer;
    var choices;
    if (numberToName) {
      q = "Who was president number " + row[0] + " (" + row[2] + ")?";
      answer = row[1];
      choices = shuffleInPlace([row[1]].concat(decoys.map(function (r) { return r[1]; })));
    } else {
      q = "What number was " + row[1] + " (" + row[2] + ")?";
      answer = String(row[0]);
      choices = shuffleInPlace([String(row[0])].concat(decoys.map(function (r) { return String(r[0]); })));
    }
    state.presQ = { q: q, a: answer, choices: choices };
    state.presSolved = false;
    state.presPeeked = false;
  }

  function presidentsView() {
    if (!state.presQueue) {
      state.presQueue = shuffleInPlace(HS_PRESIDENTS.map(function (_, i) { return i; }));
      state.presCursor = 0;
    }
    var done = state.presCursor >= state.presQueue.length;
    if (!done && !state.presQ) buildPresQuestion();
    var rows = HS_PRESIDENTS.map(function (r) {
      return "<tr><td>" + r[0] + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>";
    }).join("");
    var ask = "";
    if (!done && state.presQ) {
      var guesses = state.presQ.choices.map(function (n) {
        return '<button type="button" class="choice touch" data-pres-guess="' + esc(n) + '">' + esc(n) + "</button>";
      }).join("");
      ask = "<p>Name " + (state.presCursor + 1) + " of " + state.presQueue.length + ".</p>" +
        "<p><strong>" + esc(state.presQ.q) + "</strong></p>" +
        guesses +
        '<button type="button" class="brass-btn secondary touch" data-act="pres-reveal">Show the name</button>';
    } else {
      ask = "<p>You worked the whole 1–47 line, number to name and name to number.</p>";
    }
    root.innerHTML =
      '<div class="app-shell">' + header() +
        '<main id="main" class="main">' +
          '<p class="muted"><button type="button" class="brass-btn secondary touch" data-act="hub">Back</button></p>' +
          '<section class="fact-card">' +
            "<h2>Presidents car</h2>" +
            "<p>Nearby numbers only. The full roster stays covered until you peek or finish the line.</p>" +
            ask +
            '<p class="live" id="live" aria-live="polite">' + esc(state.presLive || "") + "</p>" +
            (state.presRoster || done
              ? '<div class="pres-table-wrap"><table class="source-block">' +
                "<thead><tr><th>#</th><th>Name</th><th>Years</th></tr></thead><tbody>" + rows + "</tbody></table></div>"
              : "") +
          "</section>" +
        "</main></div>";
  }

  function render() {
    if (!state.band) { picker(); return; }
    document.body.className = "band-" + state.band;
    if (state.screen === "picker") { picker(); return; }
    if (state.screen === "stamps") { stampBook(); return; }
    if (state.screen === "baby") { babyView(); return; }
    if (state.screen === "pictures") { picturesView(); return; }
    if (state.screen === "songs") { songView(state.songId); return; }
    if (state.screen === "timeline") { timelineView(); return; }
    if (state.screen === "preamble") { preambleView(); return; }
    if (state.screen === "presidents") { presidentsView(); return; }
    if (state.screen === "quiz") { quizView(); return; }
    if (state.screen === "station") { stationView(); return; }
    hub();
  }

  root.addEventListener("click", function (ev) {
    var t = ev.target.closest("button");
    if (!t) return;
    HSAudio.unlock();

    if (t.dataset.band) {
      setBand(t.dataset.band);
      state.screen = t.dataset.band === "baby" ? "baby" : (t.dataset.band === "toddler" || t.dataset.band === "preschool" ? "pictures" : "hub");
      HSAudio.whistle();
      render();
      return;
    }
    var act = t.dataset.act;
    if (act === "mute") {
      HSAudio.setMuted(!HSAudio.isMuted());
      render();
      return;
    }
    if (act === "band") { state.band = null; state.screen = "picker"; render(); return; }
    if (act === "stamps") { state.screen = "stamps"; render(); return; }
    if (act === "hub") { state.screen = "hub"; HSAudio.stopTalk(); render(); return; }
    if (act === "baby") { state.screen = "baby"; state.babyOrder = []; render(); return; }
    if (act === "pictures") { state.screen = "pictures"; render(); return; }
    if (act === "songs") { state.screen = "songs"; render(); return; }
    if (act === "timeline") { state.screen = "timeline"; render(); return; }
    if (act === "preamble") {
      state.screen = "preamble";
      state.preambleIndex = 0;
      state.preambleCard = null;
      state.preambleLock = false;
      render();
      return;
    }
    if (act === "presidents") {
      state.screen = "presidents";
      state.presQ = null;
      state.presQueue = null;
      state.presCursor = 0;
      state.presRoster = false;
      state.presPeeked = false;
      state.presLive = "";
      state.presSolved = false;
      render();
      return;
    }
    if (act === "station") { state.screen = "station"; render(); return; }
    if (act === "quiz") {
      state.screen = "quiz";
      state.quizIndex = 0;
      state.quizLock = false;
      state.quizCard = null;
      render();
      return;
    }
    if (act === "talk") {
      HSAudio.talk(decodeURIComponent(t.dataset.text || ""));
      return;
    }
    if (act === "melody") {
      var songs = HS_HISTORY_SONGS;
      var song = songs[0];
      for (var i = 0; i < songs.length; i++) if (songs[i].id === t.dataset.song) song = songs[i];
      HSAudio.playMelody(song.melody);
      return;
    }
    if (t.dataset.song) { state.songId = t.dataset.song; state.screen = "songs"; render(); return; }
    if (t.dataset.station) {
      state.stationId = t.dataset.station;
      state.screen = "station";
      HSAudio.bell();
      render();
      return;
    }
    if (t.dataset.choice !== undefined) {
      if (state.quizLock) return;
      var st = stationById(state.stationId);
      var items = quizzesFor(st);
      var raw = items[state.quizIndex];
      var item = (state.quizCard && state.quizCard.item) || shuffledChoices(raw);
      var pick = Number(t.dataset.choice);
      var live = document.getElementById("live");
      if (pick === item.a) {
        t.classList.add("correct");
        if (live) live.textContent = "Ticket punched. On to the next car.";
        HSAudio.punch();
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
        if (live) live.textContent = "Wrong track. Try another ticket.";
        HSAudio.wrong();
      }
      return;
    }
    if (t.dataset.pic) {
      var pic = stationById(t.dataset.pic);
      if (!pic) return;
      var livePic = document.getElementById("live");
      if (livePic) livePic.textContent = pic.sign;
      HSAudio.talk(pic.sign);
      return;
    }
    if (t.dataset.order) {
      state.babyOrder.push(t.dataset.order);
      var liveOrder = document.getElementById("live");
      if (state.babyOrder.join(",") === "ship,lantern") {
        if (liveOrder) liveOrder.textContent = "Ship, then lantern. That order is set.";
        HSAudio.celebrate();
        if (!state.babyOrderStar) {
          state.babyOrderStar = true;
          HSProgress.addStar();
        }
        state.babyOrder = [];
      } else if (state.babyOrder[0] !== "ship") {
        if (liveOrder) liveOrder.textContent = "Start with the ship.";
        HSAudio.wrong();
        state.babyOrder = [];
      } else if (liveOrder) {
        liveOrder.textContent = "Ship is first. Now the lantern.";
      }
      return;
    }
    if (t.dataset.preamble !== undefined) {
      if (state.preambleLock || !state.preambleCard) return;
      var pItem = state.preambleCard.item;
      var pPick = Number(t.dataset.preamble);
      var livePre = document.getElementById("live");
      if (pPick === pItem.a) {
        if (livePre) livePre.textContent = "That word belongs in the Preamble.";
        HSAudio.punch();
        HSProgress.addStar();
        state.preambleLock = true;
        setTimeout(function () {
          state.preambleIndex += 1;
          state.preambleCard = null;
          state.preambleLock = false;
          if (state.preambleIndex >= preambleItems().length) {
            HSProgress.addStamp("preamble");
            HSAudio.celebrate();
            state.screen = "hub";
          }
          render();
        }, 500);
      } else {
        if (livePre) livePre.textContent = "Try another word from the Preamble.";
        HSAudio.wrong();
      }
      return;
    }
    if (t.dataset.hot) {
      var hot;
      for (var h = 0; h < HS_BABY_HOTS.length; h++) if (HS_BABY_HOTS[h].id === t.dataset.hot) hot = HS_BABY_HOTS[h];
      if (!hot) return;
      state.babyFound[hot.id] = true;
      if (HSAudio[hot.sound]) HSAudio[hot.sound]();
      HSAudio.talk(hot.talk);
      var all = HS_BABY_HOTS.every(function (x) { return state.babyFound[x.id]; });
      if (all) {
        HSProgress.addStamp("columbus");
        HSProgress.addTicket("columbus");
        HSAudio.celebrate();
        var live2 = document.getElementById("live");
        if (live2) live2.textContent = "First-ride stamp earned!";
      }
      t.classList.add("found");
      return;
    }
    if (t.dataset.tl) {
      state.timelinePick.push(t.dataset.tl);
      t.disabled = true;
      var dest = document.getElementById("tl-dest");
      if (dest) dest.appendChild(t.cloneNode(true));
      return;
    }
    if (act === "tl-check") {
      var live3 = document.getElementById("live");
      var ok = state.timelinePick.join(",") === (state.timelineAnswer || []).join(",");
      if (ok) {
        if (live3) live3.textContent = "The cars are in time order. Stamp earned.";
        HSAudio.celebrate();
        HSProgress.addStamp("timeline");
        HSProgress.addStar();
      } else {
        if (live3) live3.textContent = "Not yet. Reset your eyes and try the order again.";
        HSAudio.wrong();
        state.screen = "timeline";
        setTimeout(render, 700);
      }
      return;
    }
    if (t.dataset.presGuess) {
      if (!state.presQ) return;
      if (t.dataset.presGuess === state.presQ.a) {
        if (!state.presPeeked && !state.presSolved) {
          state.presSolved = true;
          HSAudio.celebrate();
          HSProgress.addStar();
        }
        state.presLive = "Correct. Next president.";
        state.presCursor += 1;
        state.presQ = null;
        state.presPeeked = false;
      } else {
        state.presLive = "Not that one. Try a nearby name or number.";
        HSAudio.wrong();
      }
      render();
      return;
    }
    if (act === "pres-reveal") {
      if (!state.presQ) return;
      state.presPeeked = true;
      state.presRoster = true;
      state.presLive = state.presQ.a;
      HSAudio.talk(state.presQ.a);
      render();
      return;
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
  } else if (pictureBand()) {
    state.screen = "pictures";
  } else if (state.band && week) {
    var match = HS_HISTORY_STATIONS.filter(function (s) { return String(s.week) === String(week); })[0];
    if (match && hsBandAtLeast(state.band, match.min)) {
      state.stationId = match.id;
      state.screen = "station";
    }
  }
  document.body.className = state.band ? "band-" + state.band : "";
  render();
})();
