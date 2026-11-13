(function () {
  const C = window.HSMovement;
  function u(path) {
    if (window.HS && typeof window.HS.url === "function") return window.HS.url(path);
    return path;
  }
  const BAND_KEY = "hs.band";
  const QUIET_KEY = "hs.movement.quiet";
  const PROGRESS_KEY = "hs.progress.movement";
  const BAND_IDS = C.bands.map(function (b) { return b.id; });

  const icon = {
    home: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 10L8 30h6v24h16V38h4v16h16V30h6z"/></svg>',
    speaker: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 24h12l14-12v40L22 40H10zM44 24c4 4 6 8 6 8s-2 4-6 8M50 18c7 7 9 14 9 14s-2 7-9 14"/></svg>',
    mute: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 24h12l14-12v40L22 40H10zM44 22l16 16M60 22L44 38"/></svg>'
  };

  const state = {
    band: null,
    view: "home",
    quiet: false,
    manifest: { images: [] },
    progress: loadProgress(),
    run: null
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p === "object") {
          p.stars = p.stars || 0;
          p.ribbons = p.ribbons || [];
          p.stamps = p.stamps || [];
          p.done = p.done || {};
          return p;
        }
      }
    } catch (e) { /* ignore bad JSON */ }
    return { stars: 0, ribbons: [], stamps: [], done: {}, updated: null };
  }

  function saveProgress() {
    state.progress.updated = new Date().toISOString();
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress));
    paintChrome();
  }

  function award(opts) {
    opts = opts || {};
    if (opts.done && state.progress.done[opts.done]) return false;
    if (opts.stars) state.progress.stars += opts.stars;
    if (opts.ribbon && state.progress.ribbons.indexOf(opts.ribbon) === -1) {
      state.progress.ribbons.push(opts.ribbon);
    }
    if (opts.stamp && state.progress.stamps.indexOf(opts.stamp) === -1) {
      state.progress.stamps.push(opts.stamp);
    }
    if (opts.done) state.progress.done[opts.done] = 1;
    saveProgress();
    toast(opts.msg || "Ribbon earned.");
    HSAudio.blip("star");
    return true;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function readQuiet() {
    try {
      if (localStorage.getItem("hs.mute") === "1" || localStorage.getItem(QUIET_KEY) === "1") return true;
      if (window.HS && typeof window.HS.muted === "function") return !!window.HS.muted();
    } catch (e) { /* ignore */ }
    return false;
  }

  function applyQuiet(on, fromKit) {
    state.quiet = !!on;
    try { localStorage.setItem(QUIET_KEY, state.quiet ? "1" : "0"); } catch (e) { /* ignore */ }
    if (!fromKit) {
      try {
        if (window.HS && typeof window.HS.setMuted === "function") window.HS.setMuted(state.quiet);
        else localStorage.setItem("hs.mute", state.quiet ? "1" : "0");
      } catch (e) { /* ignore */ }
    }
    if (window.HSAudio) HSAudio.setQuiet(state.quiet);
    paintChrome();
  }

  function toast(msg) {
    const t = document.getElementById("toast");
    t.hidden = false;
    t.textContent = msg;
    clearTimeout(toast._h);
    toast._h = setTimeout(function () { t.hidden = true; }, 1800);
  }

  function readBand() {
    const hs = window.HS || {};
    if (hs.band && BAND_IDS.indexOf(hs.band) !== -1) return hs.band;
    if (typeof hs.getBand === "function") {
      const fromHs = hs.getBand();
      if (BAND_IDS.indexOf(fromHs) !== -1) return fromHs;
    }
    const q = new URLSearchParams(location.search).get("band");
    if (BAND_IDS.indexOf(q) !== -1) return q;
    const stored = localStorage.getItem(BAND_KEY);
    if (BAND_IDS.indexOf(stored) !== -1) return stored;
    return null;
  }

  function setBand(id) {
    state.band = id;
    localStorage.setItem(BAND_KEY, id);
    const url = new URL(location.href);
    url.searchParams.set("band", id);
    history.replaceState({}, "", url);
    paintChrome();
  }

  function activitiesForBand() {
    return C.activities.filter(function (a) {
      return a.bands.indexOf(state.band) !== -1;
    });
  }

  function bandMeta() {
    return C.bands.find(function (b) { return b.id === state.band; }) || C.bands[0];
  }

  function speak(text) {
    HSAudio.speak(text);
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function poseItem(id) {
    const images = (state.manifest && state.manifest.images) || [];
    for (let i = 0; i < images.length; i++) {
      if (images[i].slot === "pose-" + id) return images[i];
    }
    return null;
  }

  function poseBlock(mv) {
    const id = (mv && mv.id) || "march";
    const item = poseItem(id) || poseItem("march");
    const file = item ? item.file : "poses/march.svg";
    const alt = item ? item.alt : ((mv && mv.name) || "Parade pose");
    return (
      '<figure class="pose-wrap"><img class="pose-still" src="' + u("images/" + file) + '" alt="' + esc(alt) + '"></figure>'
    );
  }

  function stopRun() {
    HSAudio.stopBand();
    if (!state.run) return;
    if (state.run.interval) clearInterval(state.run.interval);
    if (state.run.holdTick) clearInterval(state.run.holdTick);
    if (state.run.timeout) clearTimeout(state.run.timeout);
    state.run = null;
  }

  function paintChrome() {
    const bandChip = document.getElementById("band-chip");
    const quietBtn = document.getElementById("quiet-btn");
    const stars = document.getElementById("star-count");
    if (state.band) {
      bandChip.hidden = false;
      bandChip.textContent = bandMeta().label;
    } else {
      bandChip.hidden = true;
    }
    quietBtn.innerHTML = state.quiet ? icon.mute : icon.speaker;
    quietBtn.setAttribute("aria-label", state.quiet ? "Sound is off" : "Sound is on");
    stars.textContent = String(state.progress.stars);
    HSAudio.setQuiet(state.quiet);
  }

  function go(view) {
    stopRun();
    state.view = view;
    const url = new URL(location.href);
    url.hash = view === "home" ? "" : view;
    history.replaceState({}, "", url);
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    const root = document.getElementById("view");
    if (!state.band) {
      root.innerHTML = pickerHTML();
      bindPicker(root);
      return;
    }
    const views = {
      home: renderHome,
      peek: renderPeek,
      rhymes: renderRhymes,
      parade: renderFollow,
      ringmaster: renderRingmaster,
      freeze: renderFreeze,
      count: renderCount,
      ballet: function () { renderFollow("ballet"); },
      tap: function () { renderFollow("tap"); },
      street: function () { renderFollow("street"); },
      builder: renderBuilder,
      practice: renderPractice,
      glossary: renderGlossary,
      collection: renderCollection
    };
    (views[state.view] || renderHome)();
  }

  function pickerHTML() {
    const buttons = C.bands.map(function (b) {
      return '<button type="button" data-band="' + b.id + '"><strong>' + b.label + "</strong><span>" + b.blurb + "</span></button>";
    }).join("");
    return (
      '<article class="panel">' +
        '<p class="kicker">Circus Parade</p>' +
        "<h1>Who is marching?</h1>" +
        '<p class="lede">Pick a band. You can change it later. Nothing here is a grade.</p>' +
        '<div class="band-pick">' + buttons + "</div>" +
      "</article>"
    );
  }

  function bindPicker(root) {
    root.querySelectorAll("[data-band]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setBand(btn.getAttribute("data-band"));
        go("home");
      });
    });
  }

  function renderHome() {
    const cards = activitiesForBand().map(function (a) {
      return (
        '<button type="button" class="card" data-go="' + a.id + '">' +
          '<img src="' + u(a.img) + '" alt="' + a.alt + '">' +
          '<span class="copy"><span>' + a.kicker + "</span><strong>" + a.title + "</strong></span>" +
        "</button>"
      );
    }).join("");
    document.getElementById("view").innerHTML =
      '<figure class="hero">' +
        '<img src="' + u("images/circus-parade-hero.jpg") + '" alt="A circus parade wagon and horse on a dusty fairground">' +
        "<figcaption>Join the parade · earn ribbons</figcaption>" +
      "</figure>" +
      '<article class="panel">' +
        '<p class="kicker">' + bandMeta().label + "</p>" +
        "<h1>Circus Parade</h1>" +
        '<p class="lede">' + C.parentNotes[state.band] + "</p>" +
        '<div class="progress-peek"><span class="stars">★ ' + state.progress.stars + "</span><span>Ribbons " + state.progress.ribbons.length + "</span></div>" +
      "</article>" +
      '<div class="grid">' + cards + "</div>" +
      (document.documentElement.dataset.runner
        ? ""
        : '<p class="note" style="color:var(--cream);border-color:var(--brass)">Change band: tap the ticket in the header.</p>');
    document.getElementById("view").querySelectorAll("[data-go]").forEach(function (btn) {
      btn.addEventListener("click", function () { go(btn.getAttribute("data-go")); });
    });
  }

  function moveById(id) { return C.moves[id]; }

  function sequenceIds(kind) {
    if (kind === "ballet") return C.balletSet.filter(function (id) {
      const m = C.moves[id];
      return m && m.bands.indexOf(state.band) !== -1;
    });
    if (kind === "tap") return C.tapSet.filter(function (id) {
      const m = C.moves[id];
      return m && m.bands.indexOf(state.band) !== -1;
    });
    if (kind === "street") return C.streetSet.filter(function (id) {
      const m = C.moves[id];
      return m && m.bands.indexOf(state.band) !== -1;
    });
    return (C.sequences[state.band] || C.sequences.toddler).slice();
  }

  function renderFollow(kind) {
    const ids = sequenceIds(kind);
    const titles = { ballet: "Tent-Pole Ballet", tap: "Board-Walk Tap", street: "Street-Beat Parade" };
    const title = titles[kind] || "Join the Parade";
    const hold = state.band === "toddler" || state.band === "preschool" ? 7000 : 5500;
    state.run = { i: 0, ids: ids, kind: kind || "parade", hold: hold };
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel">' +
        '<p class="kicker">Follow the leader</p>' +
        "<h1>" + title + "</h1>" +
        '<p class="lede">Watch, hear the cue, then do the move. Modest shapes only.</p>' +
      "</article>" +
      '<div class="move-stage" id="stage">' + poseBlock({ id: "march", name: "Ready" }) + '<p class="kicker">Ready</p><h2>Tap start</h2></div>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main" id="go-btn">Start the parade</button>' +
        '<button type="button" class="btn" id="next-btn">Next move</button>' +
        '<button type="button" class="btn btn-ghost" id="home-btn">Back</button>' +
      "</div>";
    function show(i) {
      const mv = moveById(ids[i]);
      if (!mv) return finish();
      document.getElementById("stage").innerHTML =
        poseBlock(mv) +
        '<p class="kicker">Move ' + (i + 1) + " of " + ids.length + "</p>" +
        "<h2>" + mv.name + "</h2>" +
        '<p class="move-how">' + mv.how + "</p>";
      speak(mv.say);
      HSAudio.blip("toot");
    }
    function finish() {
      stopRun();
      document.getElementById("stage").innerHTML = poseBlock({ id: "bow", name: "Bow" }) + "<h2>Parade rest</h2><p>Bow to the crowd.</p>";
      speak("Parade rest. Bow to the crowd.");
      award({ stars: 1, ribbon: kind === "ballet" ? "cream" : kind === "tap" ? "blue" : kind === "street" ? "green" : "red", stamp: "horse", done: "parade-" + (kind || "all"), msg: "A parade ribbon!" });
    }
    function step() {
      if (!state.run) return;
      if (state.run.i >= ids.length) return finish();
      show(state.run.i);
      state.run.i += 1;
      state.run.timeout = setTimeout(step, hold);
    }
    document.getElementById("go-btn").addEventListener("click", function () {
      if (state.run.timeout) return;
      state.run.i = 0;
      step();
    });
    document.getElementById("next-btn").addEventListener("click", function () {
      if (state.run.timeout) {
        clearTimeout(state.run.timeout);
        state.run.timeout = null;
      }
      if (state.run.i >= ids.length && document.getElementById("stage").textContent.indexOf("rest") !== -1) return;
      show(state.run.i);
      state.run.i += 1;
      if (state.run.i >= ids.length) finish();
    });
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
  }

  function renderRingmaster() {
    const pool = sequenceIds().filter(function (id) {
      return ["statue", "bow"].indexOf(id) === -1;
    });
    state.run = { round: 0, score: 0, total: state.band === "preschool" ? 6 : 8, timeout: null, holdTick: null };
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Listen first</p><h1>Ringmaster Says</h1>' +
      '<p class="lede">Tap the picture only when you hear “Ringmaster says”. A bare name is a trap — wait it out.</p></article>' +
      '<div class="move-stage" id="stage">' + poseBlock({ id: "statue", name: "Ready" }) + "<h2>Listen</h2></div>" +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main" id="did">I did the move</button>' +
        '<button type="button" class="btn btn-ghost" id="home-btn">Back</button>' +
      "</div>";
    let current = null;
    function alive() {
      return !!(state.run && state.view === "ringmaster" && typeof state.run.round === "number" && document.getElementById("stage"));
    }
    function clearCue() {
      if (!state.run) return;
      if (state.run.timeout) clearTimeout(state.run.timeout);
      if (state.run.holdTick) clearInterval(state.run.holdTick);
      state.run.timeout = null;
      state.run.holdTick = null;
    }
    function nextCue() {
      if (!alive()) return;
      clearCue();
      const stage = document.getElementById("stage");
      if (state.run.round >= state.run.total) {
        const passed = state.run.score >= Math.ceil(state.run.total * 0.6);
        stage.innerHTML = poseBlock({ id: "bow", name: "Bow" }) + "<h2>" + (passed ? "The ring is yours" : "Listen and try again") + "</h2>";
        if (passed) award({ stars: 1, ribbon: "gold", stamp: "star", done: "ringmaster", msg: "Gold ribbon!" });
        else toast("Move only when Ringmaster says.");
        current = null;
        return;
      }
      const mv = moveById(pool[Math.floor(Math.random() * pool.length)]);
      const trap = Math.random() < 0.35;
      const waitMs = state.band === "preschool" ? 4500 : 3200;
      current = { mv: mv, trap: trap, answered: false, left: Math.ceil(waitMs / 1000) };
      const line = trap ? mv.name : "Ringmaster says " + mv.name;
      stage.innerHTML =
        poseBlock(mv) +
        '<p class="kicker">Cue ' + (state.run.round + 1) + "</p><h2>" + line + "</h2>" +
        '<p class="move-how">' + mv.how + "</p>" +
        '<p class="move-how" id="cue-clock">' + (trap ? "Trap — wait " : "Do it — ") + current.left + "</p>";
      speak(line);
      state.run.holdTick = setInterval(function () {
        if (!alive() || !current || current.answered) return;
        current.left -= 1;
        const clock = document.getElementById("cue-clock");
        if (clock && current.left > 0) clock.textContent = (current.trap ? "Trap — wait " : "Do it — ") + current.left;
      }, 1000);
      state.run.timeout = setTimeout(function () {
        if (!alive()) return;
        state.run.timeout = null;
        resolveCue(false);
      }, waitMs);
    }
    function resolveCue(tapped) {
      if (!alive() || !current || current.answered) return;
      current.answered = true;
      clearCue();
      const shouldMove = !current.trap;
      const ok = tapped === shouldMove;
      state.run.round += 1;
      if (ok) {
        state.run.score += 1;
        HSAudio.blip("up");
        toast(shouldMove ? "You moved on the real cue." : "You waited out the trap.");
      } else {
        HSAudio.blip("down");
        toast(shouldMove ? "That cue needed a move." : "Ringmaster did not say.");
      }
      current = null;
      state.run.timeout = setTimeout(function () {
        if (!alive()) return;
        state.run.timeout = null;
        nextCue();
      }, 700);
    }
    document.getElementById("did").addEventListener("click", function () { resolveCue(true); });
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
    nextCue();
  }

  function renderFreeze() {
    const cfg = C.freeze[state.band] || C.freeze.preschool;
    const holdFor = state.band === "toddler" ? 5 : state.band === "preschool" ? 4 : 3;
    const root = document.getElementById("view");
    root.innerHTML =
      '<figure class="hero"><img src="' + u("images/freeze-ring.jpg") + '" alt="Empty circus ring under a spotlight"><figcaption>Freeze band</figcaption></figure>' +
      '<article class="panel"><p class="kicker">Move with the drums</p><h1>Freeze Band</h1>' +
      '<p class="lede">Dance while the calliope plays. When it stops, hold the statue for the whole count. Tap only if you moved.</p></article>' +
      '<div class="move-stage" id="stage">' + poseBlock({ id: "statue", name: "Statue" }) + '<div class="beat-lamp" id="lamp"></div><h2>Band is still</h2></div>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main" id="start">Start the band</button>' +
        '<button type="button" class="btn btn-warn" id="moved" disabled>I moved</button>' +
        '<button type="button" class="btn btn-ghost" id="home-btn">Back</button>' +
      "</div>";
    const stage = document.getElementById("stage");
    const lamp = document.getElementById("lamp");
    const moved = document.getElementById("moved");
    let beatOn = false;
    const still = reducedMotion();
    state.run = {
      holds: 0,
      holding: false,
      broke: false,
      interval: still ? null : setInterval(function () {
        beatOn = !beatOn;
        lamp.classList.toggle("on", beatOn && HSAudio.playing && !HSAudio.frozen);
      }, 240),
      holdTick: null,
      timeout: null
    };
    if (still) lamp.classList.add("on");
    function heading(text) {
      const h = stage.querySelector("h2");
      if (h) h.textContent = text;
    }
    function clearHold() {
      if (state.run && state.run.holdTick) clearInterval(state.run.holdTick);
      if (state.run) state.run.holdTick = null;
    }
    function onWarn() {
      stage.classList.add("warn");
      stage.classList.remove("frozen");
      heading("Get ready…");
      speak("Get ready");
    }
    function onFreeze() {
      if (!state.run) return;
      clearHold();
      state.run.holding = true;
      state.run.broke = false;
      stage.classList.remove("warn");
      stage.classList.add("frozen");
      moved.disabled = false;
      let left = holdFor;
      heading("Hold " + left);
      speak("Freeze");
      state.run.holdTick = setInterval(function () {
        if (!state.run || !state.run.holding || state.view !== "freeze") return;
        left -= 1;
        if (state.run.broke) {
          state.run.holding = false;
          clearHold();
          moved.disabled = true;
          heading("The statue broke");
          toast("The statue broke");
          return;
        }
        if (left <= 0) {
          state.run.holding = false;
          clearHold();
          moved.disabled = true;
          state.run.holds += 1;
          heading("Held the statue");
          toast("Held " + holdFor);
          if (state.run.holds === 3) {
            award({ stars: 1, ribbon: "gold", stamp: "drum", done: "freeze", msg: "Freeze ribbon!" });
          }
          return;
        }
        heading("Hold " + left);
      }, 1000);
    }
    function onGo() {
      stage.classList.remove("frozen");
      stage.classList.remove("warn");
      if (state.run && state.run.holding) return;
      moved.disabled = true;
      heading("Parade");
      speak("Go");
    }
    document.getElementById("start").addEventListener("click", function () {
      HSAudio.stopBand();
      clearHold();
      if (state.run) state.run.holding = false;
      HSAudio.startBand({
        bpm: cfg.bpm,
        barsMin: cfg.barsMin,
        barsMax: cfg.barsMax,
        warn: cfg.warn,
        onWarn: onWarn,
        onFreeze: onFreeze,
        onGo: onGo
      });
      heading("Parade");
      speak("March with the band.");
    });
    moved.addEventListener("click", function () {
      if (!state.run || !state.run.holding) return;
      state.run.broke = true;
      moved.disabled = true;
    });
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
  }

  function renderCount() {
    const cfg = C.counts[state.band] || C.counts.preschool;
    const skipChoices = [].concat(cfg.skip);
    state.run = { n: 0, target: cfg.targets[0], skip: skipChoices[0], room: false };
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Count the steps</p><h1>Step Counter</h1>' +
      '<p class="lede">' + cfg.prompt + " The taps only count. The win is doing that many across the room.</p></article>" +
      '<div class="move-stage"><p class="kicker" id="goal"></p><div class="counter" id="num">0</div><div class="beat-lamp" id="lamp"></div></div>' +
      '<p class="lede" id="room-msg" hidden>Now do that across the room.</p>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main big-hit" id="step">I stepped</button>' +
        '<button type="button" class="btn" id="room-win" hidden>I did them across the room</button>' +
        '<button type="button" class="btn" id="reset">Reset</button>' +
      "</div>" +
      '<div class="btn-row" id="targets"></div>' +
      (skipChoices.length > 1 ? '<div class="btn-row" id="skips"></div>' : "") +
      '<div class="btn-row"><button type="button" class="btn btn-ghost" id="home-btn">Back</button></div>';
    function paint() {
      document.getElementById("num").textContent = String(state.run.n);
      document.getElementById("goal").textContent = "Count by " + state.run.skip + " to " + state.run.target;
      document.getElementById("room-msg").hidden = !state.run.room;
      document.getElementById("room-win").hidden = !state.run.room;
      document.getElementById("step").disabled = !!state.run.room;
    }
    document.getElementById("targets").innerHTML = cfg.targets.map(function (t) {
      return '<button type="button" class="btn" data-t="' + t + '">To ' + t + "</button>";
    }).join("");
    if (skipChoices.length > 1) {
      document.getElementById("skips").innerHTML = skipChoices.map(function (s) {
        return '<button type="button" class="btn" data-s="' + s + '">By ' + s + "</button>";
      }).join("");
      document.getElementById("skips").addEventListener("click", function (e) {
        const s = e.target.getAttribute("data-s");
        if (!s || !state.run) return;
        state.run.skip = Number(s);
        state.run.n = 0;
        state.run.room = false;
        paint();
      });
    }
    document.getElementById("targets").addEventListener("click", function (e) {
      const t = e.target.getAttribute("data-t");
      if (!t || !state.run) return;
      state.run.target = Number(t);
      state.run.n = 0;
      state.run.room = false;
      paint();
    });
    document.getElementById("step").addEventListener("click", function () {
      if (!state.run || state.run.room) return;
      state.run.n += state.run.skip;
      HSAudio.blip("stamp");
      speak(String(state.run.n));
      if (state.run.n >= state.run.target) {
        state.run.room = true;
        speak("Now do " + state.run.target + " steps across the room.");
      }
      paint();
    });
    document.getElementById("room-win").addEventListener("click", function () {
      if (!state.run || !state.run.room) return;
      const key = "count-" + state.run.target + "-by-" + state.run.skip;
      award({ stars: 1, ribbon: "blue", stamp: "elephant", done: key, msg: "Room steps counted." });
      state.run.n = 0;
      state.run.room = false;
      paint();
    });
    document.getElementById("reset").addEventListener("click", function () {
      if (!state.run) return;
      state.run.n = 0;
      state.run.room = false;
      paint();
    });
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
    paint();
  }

  function renderRhymes() {
    const list = C.rhymes.filter(function (r) { return r.bands.indexOf(state.band) !== -1; });
    state.run = { i: 0, line: 0, list: list };
    const root = document.getElementById("view");
    function paint() {
      const r = list[state.run.i];
      const line = r.lines[state.run.line];
      const dots = r.lines.map(function (_, idx) {
        return '<span class="dot' + (idx === state.run.line ? " on" : "") + '"></span>';
      }).join("");
      root.innerHTML =
        '<figure class="hero"><img src="' + u("images/lap-quilt.jpg") + '" alt="Lap quilt and wooden circus blocks"><figcaption>Lap tent</figcaption></figure>' +
        '<article class="panel"><p class="kicker">' + r.source + "</p><h1>" + r.title + "</h1>" +
        '<p class="note">' + r.grownup + "</p></article>" +
        '<div class="move-stage"><p class="rhyme-line" id="line">' + line + '</p><div class="dots">' + dots + '</div></div>' +
        '<div class="btn-row">' +
          '<button type="button" class="btn btn-main" id="next-line">Next line</button>' +
        "</div>" +
        '<div class="btn-row">' +
          list.map(function (item, idx) {
            return '<button type="button" class="btn' + (idx === state.run.i ? " btn-main" : "") + '" data-r="' + idx + '">' + item.title + "</button>";
          }).join("") +
        "</div>" +
        '<div class="btn-row"><button type="button" class="btn btn-ghost" id="home-btn">Back</button></div>';
      document.getElementById("next-line").addEventListener("click", function () {
        state.run.line += 1;
        if (state.run.line >= r.lines.length) {
          state.run.line = 0;
          award({ stars: 1, ribbon: "cream", stamp: "tent", done: "rhyme-" + r.id, msg: "Rhyme stamp!" });
        }
        paint();
      });
      root.querySelectorAll("[data-r]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.run.i = Number(btn.getAttribute("data-r"));
          state.run.line = 0;
          paint();
        });
      });
      document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
      speak(line);
    }
    paint();
  }

  function renderPeek() {
    const animals = [
      { name: "Horse", img: "images/circus-horse.jpg", say: "Peekaboo, parade horse." },
      { name: "Elephant", img: "images/circus-elephant.jpg", say: "Peekaboo, elephant." },
      { name: "Wagon", img: "images/circus-parade-hero.jpg", say: "Here comes the wagon." },
      { name: "Tent", img: "images/circus-tent.jpg", say: "The tent is open." }
    ];
    let x = 8;
    let which = 0;
    let open = false;
    const root = document.getElementById("view");
    const first = animals[0];
    root.innerHTML =
      '<article class="panel"><p class="kicker">Grown-up play</p><h1>Wagon Watch</h1>' +
      '<p class="lede">Hold the little one. Follow the big wagon. Then open the tent flap.</p></article>' +
      '<div class="wagon-track"><img class="wagon" id="wagon" src="' + u("images/circus-parade-hero.jpg") + '" alt="Parade wagon filling the track"></div>' +
      '<div class="peek-show">' +
        '<img class="reveal" id="reveal" src="' + u(first.img) + '" alt="">' +
        '<button type="button" class="tent-flap" id="flap" aria-expanded="false"><span class="flap-label">Open the tent</span></button>' +
      "</div>" +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main" id="toot">Toot</button>' +
        '<button type="button" class="btn btn-ghost" id="home-btn">Back</button>' +
      "</div>";
    const wagon = document.getElementById("wagon");
    wagon.style.left = "8%";
    if (reducedMotion()) {
      state.run = { interval: null };
    } else {
      state.run = { interval: setInterval(function () {
        x += 8;
        if (x > 78) x = -30;
        wagon.style.left = x + "%";
      }, 900) };
    }
    document.getElementById("toot").addEventListener("click", function () {
      HSAudio.blip("toot");
      speak("Toot toot");
    });
    document.getElementById("flap").addEventListener("click", function () {
      const flap = document.getElementById("flap");
      const reveal = document.getElementById("reveal");
      if (!open) {
        const a = animals[which % animals.length];
        reveal.src = u(a.img);
        reveal.alt = a.name;
        flap.classList.add("open");
        flap.setAttribute("aria-expanded", "true");
        flap.querySelector(".flap-label").textContent = "Close the flap";
        open = true;
        speak(a.say);
        which += 1;
        if (which === animals.length) award({ stars: 1, stamp: "wagon", ribbon: "red", done: "peek", msg: "Peekaboo stamp!" });
      } else {
        flap.classList.remove("open");
        flap.setAttribute("aria-expanded", "false");
        flap.querySelector(".flap-label").textContent = "Open the tent";
        open = false;
      }
    });
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
  }


  function renderGlossary() {
    const rows = C.glossary.filter(function (g) {
      return g.bands.indexOf(state.band) !== -1;
    });
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Original step names</p><h1>Step Names</h1>' +
      '<p class="lede">Tap a word to hear it. These are home-practice names, not a studio syllabus.</p></article>' +
      rows.map(function (g, i) {
        return '<button type="button" class="card" data-g="' + i + '" style="grid-template-columns:1fr;padding:12px 16px;min-height:64px">' +
          '<span class="copy"><span>Tap to hear</span><strong>' + g.term + "</strong><span style='display:block;margin-top:4px;text-transform:none;letter-spacing:0;font-family:var(--serif);color:var(--ink)'>" + g.def + "</span></span></button>";
      }).join("") +
      '<div class="btn-row"><button type="button" class="btn btn-ghost" id="home-btn">Back</button></div>';
    root.querySelectorAll("[data-g]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const g = rows[Number(btn.getAttribute("data-g"))];
        speak(g.term + ". " + g.def);
        HSAudio.blip("up");
      });
    });
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
  }

  function renderPractice() {
    const mins = (C.practiceMinutes[state.band] || [5])[0];
    state.run = { left: mins * 60, running: false };
    const root = document.getElementById("view");
    function fmt(n) {
      const m = Math.floor(n / 60);
      const s = n % 60;
      return m + ":" + String(s).padStart(2, "0");
    }
    function paintTime() {
      document.getElementById("clock").textContent = fmt(state.run.left);
    }
    root.innerHTML =
      '<article class="panel"><p class="kicker">Home practice</p><h1>Practice Tent</h1>' +
      '<p class="lede">A short timer and a bag check. This is not a class video.</p></article>' +
      '<div class="practice-clock"><div class="move-stage"><div class="timer" id="clock"></div></div></div>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main" id="start">Start</button>' +
        '<button type="button" class="btn" id="min5">5 min</button>' +
        '<button type="button" class="btn" id="min10">10 min</button>' +
      "</div>" +
      '<article class="panel"><p class="kicker">Bag packed?</p>' +
      C.bag.map(function (item, i) {
        return '<label class="check"><input type="checkbox" data-bag="' + i + '"> ' + item + "</label>";
      }).join("") + "</article>" +
      '<div class="btn-row"><button type="button" class="btn btn-ghost" id="home-btn">Back</button></div>';
    paintTime();
    document.getElementById("start").addEventListener("click", function () {
      if (state.run.running) return;
      state.run.running = true;
      state.run.interval = setInterval(function () {
        state.run.left -= 1;
        paintTime();
        if (state.run.left <= 0) {
          stopRun();
          speak("Practice rest. Drink water.");
          award({ stars: 1, ribbon: "green", stamp: "tent", done: "practice", msg: "Practice ribbon!" });
        }
      }, 1000);
    });
    function setMinutes(m) {
      if (state.run && state.run.interval) clearInterval(state.run.interval);
      HSAudio.stopBand();
      state.run = { left: m * 60, running: false };
      paintTime();
    }
    document.getElementById("min5").addEventListener("click", function () { setMinutes(5); });
    document.getElementById("min10").addEventListener("click", function () { setMinutes(10); });
    root.querySelectorAll("[data-bag]").forEach(function (box) {
      box.addEventListener("change", function () {
        const boxes = root.querySelectorAll("[data-bag]");
        let n = 0;
        boxes.forEach(function (b) { if (b.checked) n += 1; });
        if (n === boxes.length) award({ stars: 1, stamp: "star", done: "bag", msg: "Bag is packed." });
      });
    });
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
  }

  function renderBuilder() {
    const pool = ["march", "drum-major", "tightrope", "spot-spin", "statue", "bow", "box-step", "point-pose", "clap-stomp", "ribbon-twirl"];
    const ids = pool.filter(function (id) {
      const m = C.moves[id];
      return m && m.bands.indexOf(state.band) !== -1;
    });
    state.run = { picked: [] };
    const root = document.getElementById("view");
    function paint() {
      if (state.run && state.run.timeout) {
        clearTimeout(state.run.timeout);
        state.run.timeout = null;
      }
      root.innerHTML =
        '<article class="panel"><p class="kicker">Make a short show</p><h1>Parade Builder</h1>' +
        '<p class="lede">Pick four to six moves. Play them in order. Then run the same order in the room.</p></article>' +
        '<div class="seq-picks">' + ids.map(function (id) {
          const on = state.run.picked.indexOf(id) !== -1;
          return '<button type="button" class="btn" data-m="' + id + '" aria-pressed="' + on + '">' + C.moves[id].name + "</button>";
        }).join("") + "</div>" +
        '<p class="lede" style="margin-top:12px">Order: ' + (state.run.picked.map(function (id) { return C.moves[id].name; }).join(" → ") || "none yet") + "</p>" +
        '<div class="move-stage" id="stage">' + poseBlock({ id: "march", name: "Parade" }) + "<h2>Your parade</h2></div>" +
        '<div class="btn-row">' +
          '<button type="button" class="btn btn-main" id="play">Play sequence</button>' +
          '<button type="button" class="btn" id="clear">Clear</button>' +
          '<button type="button" class="btn btn-ghost" id="home-btn">Back</button>' +
        "</div>";
      root.querySelectorAll("[data-m]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const id = btn.getAttribute("data-m");
          const at = state.run.picked.indexOf(id);
          if (at === -1) {
            if (state.run.picked.length >= 6) return toast("Six is a full ring.");
            state.run.picked.push(id);
          } else state.run.picked.splice(at, 1);
          paint();
        });
      });
      document.getElementById("clear").addEventListener("click", function () { state.run.picked = []; paint(); });
      document.getElementById("play").addEventListener("click", function () {
        if (state.run.picked.length < 4) return toast("Pick at least four moves.");
        let i = 0;
        function step() {
          if (i >= state.run.picked.length) {
            speak("Now run that parade in the room.");
            award({ stars: 1, ribbon: "star", stamp: "star", done: "builder", msg: "Now lead it live." });
            return;
          }
          const mv = C.moves[state.run.picked[i]];
          document.getElementById("stage").innerHTML = poseBlock(mv) + "<h2>" + mv.name + "</h2><p>" + mv.how + "</p>";
          speak(mv.say);
          i += 1;
          state.run.timeout = setTimeout(step, 5000);
        }
        step();
      });
      document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
    }
    paint();
  }

  function renderCollection() {
    const root = document.getElementById("view");
    const ribbons = C.ribbons.map(function (r) {
      const got = state.progress.ribbons.indexOf(r.id) !== -1;
      return '<div class="ribbon-badge' + (got ? " got" : "") + '"><span class="tail" style="background:' + r.color + '"></span>' + r.name + "</div>";
    }).join("");
    const stamps = C.stamps.map(function (s) {
      const got = state.progress.stamps.indexOf(s.id) !== -1;
      return '<div class="stamp-badge' + (got ? " got" : "") + '">' + (got ? "★ " : "") + s.name + "</div>";
    }).join("");
    root.innerHTML =
      '<figure class="hero"><img src="' + u("images/circus-ribbons.jpg") + '" alt="Prize ribbons on navy cloth"><figcaption>Prize board</figcaption></figure>' +
      '<article class="panel"><p class="kicker">Collectibles, not grades</p><h1>Ribbon Board</h1>' +
      "<p>Stars collected: <strong>" + state.progress.stars + "</strong></p></article>" +
      '<article class="panel"><h2>Ribbons</h2><div class="collection">' + ribbons + "</div></article>" +
      '<article class="panel"><h2>Stamps</h2><div class="collection">' + stamps + "</div></article>" +
      '<div class="btn-row"><button type="button" class="btn btn-ghost" id="home-btn">Back</button></div>';
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
  }

  function boot() {
    state.quiet = readQuiet();
    try {
      localStorage.setItem(QUIET_KEY, state.quiet ? "1" : "0");
      if (state.quiet) {
        if (window.HS && typeof window.HS.setMuted === "function") window.HS.setMuted(true);
        else localStorage.setItem("hs.mute", "1");
      }
    } catch (e) { /* ignore */ }
    window.addEventListener("hs-mute", function (ev) {
      applyQuiet(!!(ev.detail && ev.detail.muted), true);
    });
    document.getElementById("home-btn-top").addEventListener("click", function () { go("home"); });
    document.getElementById("quiet-btn").addEventListener("click", function () {
      applyQuiet(!readQuiet(), false);
    });
    document.getElementById("band-chip").addEventListener("click", function () {
      state.band = null;
      const url = new URL(location.href);
      url.searchParams.delete("band");
      history.replaceState({}, "", url);
      go("home");
    });
    state.band = readBand();
    const hash = (location.hash || "").replace("#", "");
    if (hash && hash !== "home") state.view = hash;
    paintChrome();
    render();
    window.scrollTo(0, 0);
    if (!document.documentElement.dataset.runner && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () { /* optional */ });
    }
  }

  function start() {
    fetch(u("images.json")).then(function (r) { return r.json(); }).then(function (man) {
      state.manifest = man || { images: [] };
    }).catch(function () {
      state.manifest = { images: [] };
    }).then(boot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
