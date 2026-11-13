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
    quiet: localStorage.getItem(QUIET_KEY) === "1",
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
    if (opts.stars) state.progress.stars += opts.stars;
    if (opts.ribbon && state.progress.ribbons.indexOf(opts.ribbon) === -1) {
      state.progress.ribbons.push(opts.ribbon);
    }
    if (opts.stamp && state.progress.stamps.indexOf(opts.stamp) === -1) {
      state.progress.stamps.push(opts.stamp);
    }
    if (opts.done) {
      state.progress.done[opts.done] = (state.progress.done[opts.done] || 0) + 1;
    }
    saveProgress();
    toast(opts.msg || "Ribbon earned.");
    HSAudio.blip("star");
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

  function stopRun() {
    HSAudio.stopBand();
    if (state.run && state.run.interval) clearInterval(state.run.interval);
    if (state.run && state.run.timeout) clearTimeout(state.run.timeout);
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
      '<p class="note" style="color:var(--cream);border-color:var(--brass)">Change band: tap the ticket in the header.</p>';
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
      '<div class="move-stage" id="stage"><p class="kicker">Ready</p><h2>Tap start</h2></div>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main" id="go-btn">Start the parade</button>' +
        '<button type="button" class="btn" id="next-btn">Next move</button>' +
        '<button type="button" class="btn btn-ghost" id="home-btn">Back</button>' +
      "</div>";
    function show(i) {
      const mv = moveById(ids[i]);
      if (!mv) return finish();
      document.getElementById("stage").innerHTML =
        '<p class="kicker">Move ' + (i + 1) + " of " + ids.length + "</p>" +
        "<h2>" + mv.name + "</h2>" +
        '<p class="move-how">' + mv.how + "</p>";
      speak(mv.say);
      HSAudio.blip("toot");
    }
    function finish() {
      stopRun();
      document.getElementById("stage").innerHTML = "<h2>Parade rest</h2><p>Bow to the crowd.</p>";
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
    state.run = { round: 0, score: 0, total: state.band === "preschool" ? 6 : 8 };
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Listen first</p><h1>Ringmaster Says</h1>' +
      '<p class="lede">Move only when you hear “Ringmaster says”. Otherwise hold still.</p></article>' +
      '<div class="move-stage" id="stage"><h2>Tap start</h2></div>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main" id="moved">I moved</button>' +
        '<button type="button" class="btn" id="still">I stayed still</button>' +
        '<button type="button" class="btn btn-ghost" id="home-btn">Back</button>' +
      "</div>";
    let current = null;
    function nextCue() {
      if (state.run.round >= state.run.total) {
        award({ stars: 1, ribbon: "gold", stamp: "star", done: "ringmaster", msg: "Gold ribbon!" });
        document.getElementById("stage").innerHTML = "<h2>The ring is yours</h2>";
        current = null;
        return;
      }
      const mv = moveById(pool[Math.floor(Math.random() * pool.length)]);
      const trap = state.band === "preschool" ? false : Math.random() < 0.35;
      current = { mv: mv, trap: trap };
      const line = trap ? mv.name : "Ringmaster says " + mv.name;
      document.getElementById("stage").innerHTML =
        '<p class="kicker">Cue ' + (state.run.round + 1) + '</p><h2>' + line + '</h2><p class="move-how">' + mv.how + '</p>';
      speak(line);
    }
    function answer(moved) {
      if (!current) return nextCue();
      const shouldMove = !current.trap;
      const ok = moved === shouldMove;
      state.run.round += 1;
      if (ok) {
        state.run.score += 1;
        HSAudio.blip("up");
        toast(shouldMove ? "Good move." : "Good freeze.");
      } else {
        HSAudio.blip("down");
        toast(shouldMove ? "That one needed a move." : "Ringmaster did not say.");
      }
      current = null;
      setTimeout(nextCue, 650);
    }
    document.getElementById("moved").addEventListener("click", function () { answer(true); });
    document.getElementById("still").addEventListener("click", function () { answer(false); });
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
    nextCue();
  }

  function renderFreeze() {
    const cfg = C.freeze[state.band] || C.freeze.preschool;
    const root = document.getElementById("view");
    root.innerHTML =
      '<figure class="hero"><img src="' + u("images/freeze-ring.jpg") + '" alt="Empty circus ring under a spotlight"><figcaption>Freeze band</figcaption></figure>' +
      '<article class="panel"><p class="kicker">Move with the drums</p><h1>Freeze Band</h1>' +
      '<p class="lede">Dance while the calliope plays. When it stops, statue. Tap “I froze” each time.</p></article>' +
      '<div class="move-stage" id="stage"><div class="beat-lamp" id="lamp"></div><h2>Band is still</h2></div>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main" id="start">Start the band</button>' +
        '<button type="button" class="btn btn-warn" id="froze" disabled>I froze</button>' +
        '<button type="button" class="btn btn-ghost" id="home-btn">Back</button>' +
      "</div>";
    const stage = document.getElementById("stage");
    const lamp = document.getElementById("lamp");
    const froze = document.getElementById("froze");
    let freezes = 0;
    let beatOn = false;
    state.run = { interval: setInterval(function () {
      beatOn = !beatOn;
      lamp.classList.toggle("on", beatOn && HSAudio.playing && !HSAudio.frozen);
    }, 240) };
    function onFreeze() {
      stage.classList.add("frozen");
      stage.querySelector("h2").textContent = "FREEZE";
      froze.disabled = false;
      speak("Freeze!");
    }
    function onGo() {
      stage.classList.remove("frozen");
      stage.querySelector("h2").textContent = "Parade";
      froze.disabled = true;
      speak("Go!");
    }
    document.getElementById("start").addEventListener("click", function () {
      HSAudio.stopBand();
      HSAudio.startBand({
        bpm: cfg.bpm,
        barsMin: cfg.barsMin,
        barsMax: cfg.barsMax,
        warn: cfg.warn,
        onFreeze: onFreeze,
        onGo: onGo
      });
      stage.querySelector("h2").textContent = "Parade";
      speak("March with the band.");
    });
    froze.addEventListener("click", function () {
      if (!HSAudio.frozen) return;
      freezes += 1;
      froze.disabled = true;
      HSAudio.blip("stamp");
      toast("Statue " + freezes);
      if (freezes === 3) award({ stars: 1, ribbon: "gold", stamp: "drum", done: "freeze", msg: "Freeze ribbon!" });
    });
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
  }

  function renderCount() {
    const cfg = C.counts[state.band] || C.counts.preschool;
    const skipChoices = [].concat(cfg.skip);
    state.run = { n: 0, target: cfg.targets[0], skip: skipChoices[0] };
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Count the steps</p><h1>Step Counter</h1>' +
      '<p class="lede">' + cfg.prompt + " Then do the same count across the room — the app only starts the count.</p></article>" +
      '<div class="move-stage"><p class="kicker" id="goal"></p><div class="counter" id="num">0</div><div class="beat-lamp" id="lamp"></div></div>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main big-hit" id="step">I stepped</button>' +
        '<button type="button" class="btn" id="reset">Reset</button>' +
      "</div>" +
      '<div class="btn-row" id="targets"></div>' +
      (skipChoices.length > 1 ? '<div class="btn-row" id="skips"></div>' : "") +
      '<div class="btn-row"><button type="button" class="btn btn-ghost" id="home-btn">Back</button></div>';
    function paint() {
      document.getElementById("num").textContent = String(state.run.n);
      document.getElementById("goal").textContent = "Count by " + state.run.skip + " to " + state.run.target;
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
        if (!s) return;
        state.run.skip = Number(s);
        state.run.n = 0;
        paint();
      });
    }
    document.getElementById("targets").addEventListener("click", function (e) {
      const t = e.target.getAttribute("data-t");
      if (!t) return;
      state.run.target = Number(t);
      state.run.n = 0;
      paint();
    });
    document.getElementById("step").addEventListener("click", function () {
      state.run.n += state.run.skip;
      HSAudio.blip("stamp");
      speak(String(state.run.n));
      paint();
      if (state.run.n === state.run.target) {
        award({ stars: 1, ribbon: "blue", stamp: "elephant", done: "count", msg: "Now finish that many across the room." });
        speak("Now do " + state.run.target + " steps across the room.");
      }
    });
    document.getElementById("reset").addEventListener("click", function () { state.run.n = 0; paint(); });
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
          '<button type="button" class="btn btn-main" id="speak-btn">Read this line</button>' +
          '<button type="button" class="btn" id="next-line">Next line</button>' +
        "</div>" +
        '<div class="btn-row">' +
          list.map(function (item, idx) {
            return '<button type="button" class="btn' + (idx === state.run.i ? " btn-main" : "") + '" data-r="' + idx + '">' + item.title + "</button>";
          }).join("") +
        "</div>" +
        '<div class="btn-row"><button type="button" class="btn btn-ghost" id="home-btn">Back</button></div>';
      document.getElementById("speak-btn").addEventListener("click", function () { speak(line); HSAudio.blip("toot"); });
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
      { name: "Horse", img: "images/circus-horse.jpg", say: "Peekaboo, parade horse!" },
      { name: "Elephant", img: "images/circus-elephant.jpg", say: "Peekaboo, elephant!" },
      { name: "Wagon", img: "images/circus-parade-hero.jpg", say: "Here comes the wagon." },
      { name: "Tent", img: "images/circus-tent.jpg", say: "The tent is open." }
    ];
    let x = 8;
    let which = 0;
    let open = false;
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Grown-up play</p><h1>Wagon Watch</h1>' +
      '<p class="lede">Hold the little one. Track the wagon with your eyes together. Tap the tent for peekaboo.</p></article>' +
      '<div class="wagon-track"><img class="wagon" id="wagon" src="' + u("images/circus-parade-hero.jpg") + '" alt="Parade wagon"></div>' +
      '<button type="button" class="tent-flap" id="flap">Tap the tent flap</button>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn btn-main" id="toot">Toot</button>' +
        '<button type="button" class="btn btn-ghost" id="home-btn">Back</button>' +
      "</div>";
    const wagon = document.getElementById("wagon");
    state.run = { interval: setInterval(function () {
      x += 6;
      if (x > 90) x = -20;
      wagon.style.left = x + "%";
    }, 900) };
    document.getElementById("toot").addEventListener("click", function () {
      HSAudio.blip("toot");
      speak("Toot toot");
    });
    document.getElementById("flap").addEventListener("click", function () {
      open = !open;
      const a = animals[which % animals.length];
      const flap = document.getElementById("flap");
      flap.classList.toggle("open", open);
      if (open) {
        flap.innerHTML = '<img src="' + u(a.img) + '" alt="' + a.name + '" style="width:70%;height:140px;object-fit:cover">';
        speak(a.say);
        which += 1;
        if (which === 4) award({ stars: 1, stamp: "wagon", ribbon: "red", done: "peek", msg: "Peekaboo stamp!" });
      } else {
        flap.textContent = "Tap the tent flap";
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
      '<div class="move-stage"><div class="timer" id="clock"></div></div>' +
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
    let packed = 0;
    root.querySelectorAll("[data-bag]").forEach(function (box) {
      box.addEventListener("change", function () {
        if (box.checked) packed += 1;
        if (packed === C.bag.length) award({ stars: 1, stamp: "star", done: "bag", msg: "Bag is packed." });
      });
    });
    document.getElementById("home-btn").addEventListener("click", function () { go("home"); });
  }

  function renderBuilder() {
    const pool = ["march", "drum-major", "tightrope", "spot-spin", "statue", "bow", "box-step", "point-pose", "clap-stomp", "ribbon-twirl"];
    const ids = pool.filter(function (id) { return C.moves[id]; });
    state.run = { picked: [] };
    const root = document.getElementById("view");
    function paint() {
      root.innerHTML =
        '<article class="panel"><p class="kicker">Make a short show</p><h1>Parade Builder</h1>' +
        '<p class="lede">Pick four to six moves. Play them in order. Then run the same order in the room.</p></article>' +
        '<div class="seq-picks">' + ids.map(function (id) {
          const on = state.run.picked.indexOf(id) !== -1;
          return '<button type="button" class="btn" data-m="' + id + '" aria-pressed="' + on + '">' + C.moves[id].name + "</button>";
        }).join("") + "</div>" +
        '<p class="lede" style="margin-top:12px">Order: ' + (state.run.picked.map(function (id) { return C.moves[id].name; }).join(" → ") || "none yet") + "</p>" +
        '<div class="move-stage" id="stage"><h2>Your parade</h2></div>' +
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
          document.getElementById("stage").innerHTML = "<h2>" + mv.name + "</h2><p>" + mv.how + "</p>";
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
    HSAudio.setQuiet(state.quiet);
    document.getElementById("home-btn-top").addEventListener("click", function () { go("home"); });
    document.getElementById("quiet-btn").addEventListener("click", function () {
      state.quiet = !state.quiet;
      localStorage.setItem(QUIET_KEY, state.quiet ? "1" : "0");
      paintChrome();
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
    if (!document.documentElement.dataset.runner && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () { /* optional */ });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
