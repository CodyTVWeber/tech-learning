(function () {
  const C = window.HSArt;
  function u(path) {
    if (window.HS && typeof window.HS.url === "function") return window.HS.url(path);
    return path;
  }
  const BAND_KEY = "hs.band";
  const QUIET_KEY = "hs.art.quiet";
  function progressKey() {
    if (window.HS && typeof HS.progressKey === "function") return HS.progressKey("art");
    return "hs.progress.standalone.art";
  }
  const BAND_IDS = C.bands.map(function (b) { return b.id; });

  const icon = {
    home: '<svg viewBox="0 0 64 64" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M32 10L8 30h6v24h16V38h4v16h16V30h6z"/></svg>',
    speaker: '<svg viewBox="0 0 64 64" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M10 24h12l14-12v40L22 40H10zM44 24c4 4 6 8 6 8s-2 4-6 8"/></svg>',
    mute: '<svg viewBox="0 0 64 64" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M10 24h12l14-12v40L22 40H10zM44 22l16 16M60 22L44 38"/></svg>'
  };

  const state = {
    band: null,
    view: "home",
    quiet: false,
    progress: loadProgress(),
    run: null
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(progressKey());
      if (raw) {
        const p = JSON.parse(raw);
        p.stars = p.stars || 0;
        p.postcards = p.postcards || [];
        p.stamps = p.stamps || [];
        p.done = p.done || {};
        return p;
      }
    } catch (e) { /* ignore */ }
    return { stars: 0, postcards: [], stamps: [], done: {}, updated: null };
  }

  function saveProgress() {
    state.progress.updated = new Date().toISOString();
    localStorage.setItem(progressKey(), JSON.stringify(state.progress));
    paintChrome();
  }

  function award(opts) {
    opts = opts || {};
    if (opts.done && state.progress.done[opts.done]) return false;
    if (opts.stars) state.progress.stars += opts.stars;
    if (opts.postcard && state.progress.postcards.indexOf(opts.postcard) === -1) {
      state.progress.postcards.push(opts.postcard);
    }
    if (opts.stamp && state.progress.stamps.indexOf(opts.stamp) === -1) {
      state.progress.stamps.push(opts.stamp);
    }
    if (opts.done) state.progress.done[opts.done] = 1;
    saveProgress();
    toast(opts.msg || "Postcard earned.");
    HSAudio.blip("star");
    return true;
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

  function bandMeta() {
    return C.bands.find(function (b) { return b.id === state.band; }) || C.bands[0];
  }

  function speak(text) { HSAudio.speak(text); }

  function paintChrome() {
    const bandChip = document.getElementById("band-chip");
    const quietBtn = document.getElementById("quiet-btn");
    document.getElementById("star-count").textContent = String(state.progress.stars);
    if (state.band) {
      bandChip.hidden = false;
      bandChip.textContent = bandMeta().label;
    } else bandChip.hidden = true;
    quietBtn.innerHTML = state.quiet ? icon.mute : icon.speaker;
    quietBtn.setAttribute("aria-label", state.quiet ? "Sound is off" : "Sound is on");
    HSAudio.setQuiet(state.quiet);
  }

  function go(view) {
    if (view !== "studio" && state.run) state.run.challenge = null;
    state.view = view;
    const url = new URL(location.href);
    url.hash = view === "home" ? "" : view;
    history.replaceState({}, "", url);
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    window.scrollTo(0, 0);
    const root = document.getElementById("view");
    if (!state.band) {
      root.innerHTML = pickerHTML();
      root.querySelectorAll("[data-band]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          setBand(btn.getAttribute("data-band"));
          go("home");
        });
      });
      return;
    }
    const views = {
      home: renderHome,
      colors: renderColors,
      shapes: renderShapes,
      mix: renderMix,
      lesson: renderLesson,
      canvas: renderCanvas,
      looking: renderLooking,
      artists: renderArtists,
      studio: renderStudio,
      collection: renderCollection
    };
    (views[state.view] || renderHome)();
  }

  function pickerHTML() {
    return (
      '<article class="panel"><p class="kicker">Harbor Studio</p><h1>Who is in the studio?</h1>' +
      '<p class="lede">Pick a band. You can change it later. Nothing here is a grade.</p>' +
      '<div class="band-pick">' + C.bands.map(function (b) {
        return '<button type="button" data-band="' + b.id + '"><strong>' + b.label + "</strong><span> " + b.blurb + "</span></button>";
      }).join("") + "</div></article>"
    );
  }

  function renderHome() {
    const cards = C.activities.filter(function (a) {
      return a.bands.indexOf(state.band) !== -1;
    }).map(function (a) {
      return '<button type="button" class="card" data-go="' + a.id + '">' +
        '<img src="' + u(a.img) + '" alt="' + a.alt + '">' +
        '<span class="copy"><span>' + a.kicker + "</span><strong>" + a.title + "</strong></span></button>";
    }).join("");
    document.getElementById("view").innerHTML =
      '<figure class="hero"><img src="' + u("images/harbor-studio-hero.jpg") + '" alt="Watercolor studio inside a harbor boathouse">' +
      "<figcaption>Harbor Studio · look, mix, then paper</figcaption></figure>" +
      '<article class="panel"><p class="kicker">' + bandMeta().label + "</p><h1>Harbor Studio</h1>" +
      '<p class="lede">' + C.parentNotes[state.band] + "</p>" +
      '<p class="stars">★ ' + state.progress.stars + " · postcards " + state.progress.postcards.length + "</p></article>" +
      '<div class="grid">' + cards + "</div>";
    document.getElementById("view").querySelectorAll("[data-go]").forEach(function (btn) {
      btn.addEventListener("click", function () { go(btn.getAttribute("data-go")); });
    });
  }

  function backRow() {
    return '<div class="btn-row"><button type="button" class="btn btn-ghost" id="home-btn">Back to studio</button></div>';
  }
  function bindBack() {
    const b = document.getElementById("home-btn");
    if (b) b.addEventListener("click", function () { go("home"); });
  }

  function renderColors() {
    const baby = state.band === "baby";
    const set = baby
      ? C.colors.filter(function (c) { return ["red", "yellow", "blue", "white"].indexOf(c.id) !== -1; })
      : state.band === "toddler"
        ? C.colors.filter(function (c) { return ["red", "yellow", "blue", "white", "black"].indexOf(c.id) !== -1; })
        : C.colors;
    let current = set[0];
    const root = document.getElementById("view");
    function markNamed(id) {
      if (!state.run) state.run = { named: {} };
      state.run.named[id] = true;
      if (Object.keys(state.run.named).length >= 4) {
        award({ stars: 1, postcard: "buoy", stamp: "palette", done: "colors", msg: "Color postcard!" });
        state.run.named = {};
      }
    }
    function paint() {
      if (baby) {
        root.innerHTML =
          '<figure class="hero"><img src="' + u("images/color-boats.jpg") + '" alt="Primary-colored toy boats on harbor planks"><figcaption>Color dock</figcaption></figure>' +
          '<article class="panel"><p class="kicker">Tap a color</p><h1>Color dock</h1>' +
          '<p class="lede">Big patches. Hear the name. Grown-up can say it too.</p></article>' +
          '<div class="swatch-row-huge">' + set.map(function (c) {
            return '<button type="button" class="swatch swatch-huge" data-c="' + c.id + '" style="background:' + c.hex + '" aria-label="' + c.name + '"></button>';
          }).join("") + "</div>" +
          backRow();
        root.querySelectorAll("[data-c]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            const c = set.find(function (x) { return x.id === btn.getAttribute("data-c"); });
            speak(c.say);
            HSAudio.blip("up");
            markNamed(c.id);
          });
        });
        bindBack();
        return;
      }
      root.innerHTML =
        '<figure class="hero"><img src="' + u("images/color-boats.jpg") + '" alt="Primary-colored toy boats on harbor planks"><figcaption>Color dock</figcaption></figure>' +
        '<article class="panel"><p class="kicker">Say the color</p><h1>' + current.name + "</h1>" +
        '<p class="lede">' + current.say + "</p></article>" +
        '<div class="swatch" style="width:100%;height:120px;background:' + current.hex + ';border:1px solid var(--harbor)"></div>' +
        '<div class="swatch-row" style="margin-top:12px">' + set.map(function (c) {
          return '<button type="button" class="swatch" data-c="' + c.id + '" style="background:' + c.hex + '" aria-label="' + c.name + '" aria-pressed="' + (c.id === current.id) + '"></button>';
        }).join("") + "</div>" +
        '<div class="btn-row"><button type="button" class="btn btn-main" id="hear">Hear the name</button></div>' +
        backRow();
      root.querySelectorAll("[data-c]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          current = set.find(function (c) { return c.id === btn.getAttribute("data-c"); });
          speak(current.say);
          HSAudio.blip("up");
          markNamed(current.id);
          paint();
        });
      });
      document.getElementById("hear").addEventListener("click", function () { speak(current.say); });
      bindBack();
    }
    paint();
    if (!baby) speak(current.say);
  }

  function renderShapes() {
    const list = C.shapes;
    let i = 0;
    const root = document.getElementById("view");
    function svgPath(d) {
      return '<svg viewBox="0 0 64 64"><path d="' + d + '" fill="#3d6b63"/></svg>';
    }
    function paint() {
      const s = list[i];
      root.innerHTML =
        '<figure class="hero"><img src="' + u("images/harbor-shapes.jpg") + '" alt="Wooden shape blocks"><figcaption>Shape harbor</figcaption></figure>' +
        '<article class="panel"><p class="kicker">Find this shape</p><h1>' + s.name + "</h1>" +
        '<p class="lede">' + s.say + "</p></article>" +
        '<div style="background:#fff;border:1px solid var(--harbor);padding:16px;margin-bottom:12px">' + svgPath(s.d) + "</div>" +
        '<div class="shape-row">' + list.map(function (sh, idx) {
          return '<button type="button" class="shape-btn" data-i="' + idx + '" aria-label="' + sh.name + '">' + svgPath(sh.d) + "</button>";
        }).join("") + "</div>" +
        '<p class="lede" id="ok"></p>' + backRow();
      root.querySelectorAll("[data-i]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const pick = Number(btn.getAttribute("data-i"));
          if (pick === i) {
            document.getElementById("ok").textContent = "Yes — " + s.name + ".";
            speak("Yes. " + s.say);
            HSAudio.blip("star");
            i = (i + 1) % list.length;
            if (i === 0) award({ stars: 1, postcard: "sail", stamp: "easel", done: "shapes", msg: "Shape postcard!" });
            setTimeout(paint, 700);
          } else {
            document.getElementById("ok").textContent = "Try another.";
            HSAudio.blip("down");
          }
        });
      });
      bindBack();
      speak(s.say);
    }
    paint();
  }

  function renderMix() {
    const root = document.getElementById("view");
    let picked = [];
    function hex(id) {
      return C.colors.find(function (c) { return c.id === id; }).hex;
    }
    function paint() {
      const result = C.mixes.find(function (m) {
        return picked.length === 2 &&
          ((picked[0] === m.a && picked[1] === m.b) || (picked[0] === m.b && picked[1] === m.a));
      });
      root.innerHTML =
        '<figure class="hero"><img src="' + u("images/harbor-palette.jpg") + '" alt="Worn wooden palette"><figcaption>Mix pan</figcaption></figure>' +
        '<article class="panel"><p class="kicker">Two dabs</p><h1>What do they make?</h1>' +
        '<p class="lede">Tap two primaries. The pan mixes them. Then mix the same pair on paper.</p></article>' +
        '<div class="swatch-row">' +
          ["red", "yellow", "blue"].map(function (id) {
            return '<button type="button" class="swatch" data-id="' + id + '" style="background:' + hex(id) + '" aria-label="' + id + '"></button>';
          }).join("") +
        "</div>" +
        '<div class="mix-pan" role="img" aria-label="' + (result ? result.out + " mix" : "empty mix pan") + '">' +
          (picked[0] ? '<span class="dab dab-a" style="background:' + hex(picked[0]) + '"></span>' : "") +
          (picked[1] ? '<span class="dab dab-b" style="background:' + hex(picked[1]) + '"></span>' : "") +
          (result ? '<span class="dab dab-out" style="background:' + hex(result.out) + '"></span>' : "") +
        "</div>" +
        '<p class="prompt">' + (result ? "That mix is " + result.out + ". Now mix it on paper." : (picked.length ? "Pick a second color." : "Pick a first color.")) + "</p>" +
        '<div class="btn-row"><button type="button" class="btn" id="clear">Clear pan</button></div>' +
        backRow();
      root.querySelectorAll("[data-id]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (picked.length >= 2) picked = [];
          picked.push(btn.getAttribute("data-id"));
          HSAudio.blip("mix");
          if (picked.length === 2) {
            const m = C.mixes.find(function (mix) {
              return (picked[0] === mix.a && picked[1] === mix.b) || (picked[0] === mix.b && picked[1] === mix.a);
            });
            if (m) {
              speak(picked[0] + " and " + picked[1] + " make " + m.out + ". Mix it on paper.");
              award({ stars: 1, stamp: "mix", done: "mix-" + m.out, msg: "Now mix " + m.out + " on paper." });
              const trio = ["orange", "green", "purple"].every(function (id) {
                return state.progress.done["mix-" + id];
              });
              if (trio) award({ postcard: "shell", done: "mix-postcard", msg: "Mix postcard." });
            } else {
              speak("Those two are the same family. Try red, yellow, or blue pairs.");
            }
          }
          paint();
        });
      });
      document.getElementById("clear").addEventListener("click", function () { picked = []; paint(); });
      bindBack();
    }
    paint();
  }

  function drawOps(ctx, ops, w, h) {
    ctx.strokeStyle = "#1c1814";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const sx = w / 320;
    const sy = h / 220;
    ctx.save();
    ctx.scale(sx, sy);
    function closed(op, trace) {
      ctx.save();
      ctx.translate(7, 9);
      ctx.fillStyle = "rgba(36,54,60,0.35)";
      trace();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = op.fill || "rgba(196,160,90,0.55)";
      trace();
      ctx.fill();
      ctx.strokeStyle = "#1c1814";
      ctx.stroke();
    }
    ops.forEach(function (op) {
      if (op.op === "line") {
        ctx.beginPath();
        ctx.moveTo(op.x1, op.y1);
        ctx.lineTo(op.x2, op.y2);
        ctx.stroke();
      } else if (op.op === "circle") {
        closed(op, function () {
          ctx.beginPath();
          ctx.arc(op.x, op.y, op.r, 0, Math.PI * 2);
        });
      } else if (op.op === "ellipse") {
        closed(op, function () {
          ctx.beginPath();
          ctx.ellipse(op.x, op.y, op.rx, op.ry, 0, 0, Math.PI * 2);
        });
      } else if (op.op === "rect") {
        closed(op, function () {
          ctx.beginPath();
          ctx.rect(op.x, op.y, op.w, op.h);
        });
      } else if (op.op === "path") {
        const path = new Path2D(op.d);
        ctx.save();
        ctx.translate(7, 9);
        ctx.fillStyle = "rgba(36,54,60,0.35)";
        ctx.fill(path);
        ctx.restore();
        ctx.fillStyle = op.fill || "rgba(166,91,50,0.45)";
        ctx.fill(path);
        ctx.stroke(path);
      } else if (op.op === "rays") {
        for (let k = 0; k < op.n; k++) {
          const a = (Math.PI * 2 * k) / op.n;
          ctx.beginPath();
          ctx.moveTo(op.x + Math.cos(a) * op.r1, op.y + Math.sin(a) * op.r1);
          ctx.lineTo(op.x + Math.cos(a) * op.r2, op.y + Math.sin(a) * op.r2);
          ctx.stroke();
        }
      } else if (op.op === "petals") {
        for (let k = 0; k < op.n; k++) {
          const a = (Math.PI * 2 * k) / op.n;
          const petal = Object.assign({}, op, { fill: op.fill || "rgba(196,90,58,0.45)" });
          closed(petal, function () {
            ctx.beginPath();
            ctx.ellipse(op.x + Math.cos(a) * op.r, op.y + Math.sin(a) * op.r, 14, 10, a, 0, Math.PI * 2);
          });
        }
      } else if (op.op === "value") {
        const bw = op.w / op.n;
        for (let k = 0; k < op.n; k++) {
          const g = op.dir === "up"
            ? Math.round(36 + k * (200 / (op.n - 1)))
            : Math.round(255 - k * (180 / (op.n - 1)));
          ctx.fillStyle = "rgb(" + g + "," + g + "," + g + ")";
          ctx.fillRect(op.x + k * bw, op.y, bw - 4, 18);
          ctx.strokeRect(op.x + k * bw, op.y, bw - 4, 18);
        }
      }
    });
    ctx.restore();
  }

  function renderLesson() {
    const list = C.lessons.filter(function (l) { return l.bands.indexOf(state.band) !== -1; });
    state.run = { i: 0, step: 0 };
    const root = document.getElementById("view");
    function paint() {
      const lesson = list[state.run.i];
      if (!lesson) {
        root.innerHTML = '<article class="panel"><h1>No lessons in this band yet.</h1></article>' + backRow();
        bindBack();
        return;
      }
      const ready = state.run.step >= lesson.steps.length;
      root.innerHTML =
        '<article class="panel"><p class="kicker">Step one on screen</p><h1>' + lesson.title + "</h1>" +
        '<p class="lede">Watch the drawing: shapes overlap, and the strip runs dark to light. Paper is the second step.</p></article>' +
        '<figure class="lesson-model"><img src="' + u("images/harbor-still-life.jpg") + '" alt="Harbor still life, the model for this lesson"><figcaption>Model — the harbor still. Then the steps. Then paper.</figcaption></figure>' +
        '<div class="lesson-board"><canvas id="demo" width="640" height="440"></canvas></div>' +
        '<p class="prompt" id="say"></p>' +
        '<div class="btn-row">' +
          '<button type="button" class="btn btn-main" id="next">Next step</button>' +
          '<button type="button" class="btn" id="paper"' + (ready ? "" : " disabled") + '>Second step: I drew it on paper</button>' +
        "</div>" +
        '<div class="btn-row">' + list.map(function (l, idx) {
          return '<button type="button" class="btn' + (idx === state.run.i ? " btn-main" : "") + '" data-l="' + idx + '">' + l.title + "</button>";
        }).join("") + "</div>" + backRow();
      const canvas = document.getElementById("demo");
      const ctx = canvas.getContext("2d");
      function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fbf7ee";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const shown = Math.min(state.run.step, lesson.steps.length - 1);
        for (let s = 0; s <= shown; s++) {
          drawOps(ctx, lesson.steps[s].ops, canvas.width, canvas.height);
        }
        drawOps(ctx, [{ op: "value", x: 20, y: 196, w: 280, n: 5, dir: "up" }], canvas.width, canvas.height);
        const step = lesson.steps[shown];
        document.getElementById("say").textContent = ready ? lesson.paper : step.say;
      }
      redraw();
      if (!ready) speak(lesson.steps[state.run.step].say);
      else speak(lesson.paper);
      document.getElementById("next").addEventListener("click", function () {
        if (state.run.step < lesson.steps.length) {
          state.run.step += 1;
          if (state.run.step === lesson.steps.length) toast("Paper is the second step.");
          paint();
        }
      });
      document.getElementById("paper").addEventListener("click", function () {
        if (state.run.step < lesson.steps.length) {
          toast("Finish the steps first.");
          return;
        }
        award({ stars: 1, stamp: "paper", done: "lesson-" + lesson.id, msg: "Paper is the second step." });
      });
      root.querySelectorAll("[data-l]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.run.i = Number(btn.getAttribute("data-l"));
          state.run.step = 0;
          paint();
        });
      });
      bindBack();
    }
    paint();
  }

  function renderCanvas() {
    const young = state.band === "baby" || state.band === "toddler" || state.band === "preschool";
    const palette = young
      ? C.colors.filter(function (c) { return ["red", "yellow", "blue", "green", "white", "black"].indexOf(c.id) !== -1; })
      : C.colors;
    let color = palette[0].hex;
    let size = young ? 28 : 12;
    const undo = [];
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Open studio</p><h1>Paint canvas</h1>' +
      '<p class="lede">This is play paint. Real pictures still happen on paper.</p></article>' +
      '<div class="paint-wrap"><canvas id="paint" width="720" height="480"></canvas></div>' +
      '<div class="swatch-row" style="margin-top:10px">' + palette.map(function (c) {
        return '<button type="button" class="swatch" data-hex="' + c.hex + '" style="background:' + c.hex + '" aria-label="' + c.name + '"></button>';
      }).join("") + "</div>" +
      '<div class="btn-row">' +
        (young ? "" : '<button type="button" class="btn" data-sz="6">Fine</button><button type="button" class="btn" data-sz="12">Brush</button><button type="button" class="btn" data-sz="28">Wash</button>') +
        '<button type="button" class="btn" id="undo">Undo</button>' +
        '<button type="button" class="btn" id="clear">Clear</button>' +
      "</div>" + backRow();
    const canvas = document.getElementById("paint");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    function snap() {
      undo.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (undo.length > 20) undo.shift();
    }
    snap();
    function pos(ev) {
      const r = canvas.getBoundingClientRect();
      const t = ev.touches ? ev.touches[0] : ev;
      return { x: (t.clientX - r.left) * (canvas.width / r.width), y: (t.clientY - r.top) * (canvas.height / r.height) };
    }
    let drawing = false;
    function start(ev) {
      ev.preventDefault();
      drawing = true;
      snap();
      const p = pos(ev);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineWidth = size;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    function move(ev) {
      if (!drawing) return;
      ev.preventDefault();
      const p = pos(ev);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    function end() { drawing = false; }
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
    root.querySelectorAll("[data-hex]").forEach(function (btn) {
      btn.addEventListener("click", function () { color = btn.getAttribute("data-hex"); HSAudio.blip("up"); });
    });
    root.querySelectorAll("[data-sz]").forEach(function (btn) {
      btn.addEventListener("click", function () { size = Number(btn.getAttribute("data-sz")); });
    });
    document.getElementById("undo").addEventListener("click", function () {
      if (undo.length < 2) return;
      undo.pop();
      ctx.putImageData(undo[undo.length - 1], 0, 0);
    });
    document.getElementById("clear").addEventListener("click", function () {
      snap();
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    bindBack();
  }

  function artworksForBand() {
    return C.artworks.filter(function (a) { return a.bands.indexOf(state.band) !== -1; });
  }

  const SPARK = {
    "starry-night": "Dark sky swirls",
    "impression-sunrise": "Orange sun",
    "pearl-earring": "Pearl and dark",
    "night-watch": "Step into light",
    "breezing-up": "Boat in wind",
    "fighting-temeraire": "Pale old ship",
    "great-wave": "Find the boats",
    "hay-wain": "Wagon in water",
    "woman-parasol": "Look up high",
    "sunflowers": "Yellow on yellow",
    "bedroom-arles": "A small room",
    "grande-jatte": "Still Sunday people",
    "childs-bath": "Bath and stripes",
    "dance-class": "Dancers at rest",
    "fog-warning": "One small boat",
    "rembrandt-self": "Light on face",
    "canaletto-grand-canal": "Count the boats",
    "monet-japanese-bridge": "Green garden arch",
    "childrens-games": "Find one game",
    "whistlers-mother": "Grey and black",
    "girl-reading": "Girl with book",
    "sargent-carnation": "Lantern dusk flowers"
  };

  function renderLooking(startId) {
    const list = artworksForBand();
    let start = 0;
    if (startId) {
      const idx = list.findIndex(function (w) { return w.id === startId; });
      if (idx >= 0) start = idx;
    }
    state.run = { i: start, q: 0 };
    const root = document.getElementById("view");
    function paint() {
      const a = list[state.run.i];
      const q = a.look[state.run.q % a.look.length];
      const toddler = state.band === "toddler";
      const showCredit = state.band === "early" || state.band === "primary" || state.band === "upper";
      const prompt = toddler ? (SPARK[a.id] || "Look here") : q;
      const frame = '<figure class="look-frame"><img src="' + u(a.file) + '" alt="' + a.title + " by " + a.artist + '"></figure>';
      const credit = showCredit ? '<p class="credit">' + a.museum + " · " + a.credit + "</p>" : "";
      root.innerHTML = toddler
        ? frame + '<p class="spark">' + prompt + "</p>"
        : '<article class="panel"><p class="kicker">Look closely</p><h1>' + a.title + "</h1>" +
          "<p>" + a.artist + " · " + a.year + "</p></article>" +
          frame + credit +
          '<article class="panel"><p class="prompt">' + prompt + "</p>" +
          '<div class="btn-row"><button type="button" class="btn btn-main" id="hear">Hear it again</button>' +
          '<button type="button" class="btn" id="nextq">Another look</button></div></article>';
      root.innerHTML +=
        '<div class="btn-row">' +
          '<button type="button" class="btn" id="prev">Previous</button>' +
          '<button type="button" class="btn" id="next">Next picture</button>' +
        "</div>" + backRow();
      const hear = document.getElementById("hear");
      if (hear) hear.addEventListener("click", function () { speak(prompt); });
      const nextq = document.getElementById("nextq");
      if (nextq) nextq.addEventListener("click", function () {
        state.run.q += 1;
        paint();
      });
      document.getElementById("prev").addEventListener("click", function () {
        state.run.i = (state.run.i + list.length - 1) % list.length;
        state.run.q = 0;
        paint();
      });
      document.getElementById("next").addEventListener("click", function () {
        state.run.i = (state.run.i + 1) % list.length;
        state.run.q = 0;
        if (state.run.i === 0) award({ stars: 1, postcard: "starry", stamp: "looking", done: "looking", msg: "Looking stamp." });
        paint();
      });
      bindBack();
      speak(toddler ? prompt : a.title + ". " + prompt);
    }
    paint();
  }

  function artistsForBand() {
    return C.artists.filter(function (a) {
      return a.works.some(function (id) {
        const w = C.artworks.find(function (x) { return x.id === id; });
        return w && w.bands.indexOf(state.band) !== -1;
      });
    });
  }

  function renderArtists() {
    const root = document.getElementById("view");
    const people = artistsForBand();
    let i = 0;
    function paint() {
      if (!people.length) {
        root.innerHTML = '<article class="panel"><h1>No artist cards in this band yet.</h1></article>' + backRow();
        bindBack();
        return;
      }
      const a = people[i];
      const works = a.works.map(function (id) {
        return C.artworks.find(function (w) { return w.id === id; });
      }).filter(function (w) {
        return w && w.bands.indexOf(state.band) !== -1;
      });
      root.innerHTML =
        '<article class="panel"><p class="kicker">Public-domain facts</p><h1>' + a.name + "</h1>" +
        "<p>" + a.years + " · " + a.place + "</p>" +
        '<p class="lede">' + a.fact + "</p></article>" +
        works.map(function (w) {
          return '<button type="button" class="card" data-work="' + w.id + '"><img src="' + u(w.file) + '" alt="' + w.title + '">' +
            '<span class="copy"><span>' + w.year + "</span><strong>" + w.title + "</strong></span></button>";
        }).join("") +
        '<div class="btn-row">' +
          '<button type="button" class="btn btn-main" id="hear">Hear the card</button>' +
          '<button type="button" class="btn" id="next">Next artist</button>' +
        "</div>" + backRow();
      document.getElementById("hear").addEventListener("click", function () {
        speak(a.name + ". " + a.years + ". " + a.fact);
      });
      document.getElementById("next").addEventListener("click", function () {
        i = (i + 1) % people.length;
        if (i === 0) award({ stars: 1, postcard: "wave", stamp: "master", done: "artists", msg: "Artist postcard." });
        paint();
      });
      root.querySelectorAll("[data-work]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.view = "looking";
          renderLooking(btn.getAttribute("data-work"));
        });
      });
      bindBack();
    }
    paint();
  }

  function studioCanvas(root, afterDraw) {
    const canvas = document.getElementById("studio-c");
    const ctx = canvas.getContext("2d");
    function pos(ev) {
      const r = canvas.getBoundingClientRect();
      const t = ev.touches ? ev.touches[0] : ev;
      return { x: (t.clientX - r.left) * (canvas.width / r.width), y: (t.clientY - r.top) * (canvas.height / r.height) };
    }
    let drawing = false;
    function start(ev) {
      ev.preventDefault();
      drawing = true;
      const p = pos(ev);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#1c1814";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (afterDraw) afterDraw(p, "start");
    }
    function move(ev) {
      if (!drawing) return;
      ev.preventDefault();
      const p = pos(ev);
      if (afterDraw) afterDraw(p, "move");
      else {
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }
    function end() { drawing = false; }
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
    return ctx;
  }

  function finishChallenge(id, msg) {
    speak(msg);
    award({ stars: 1, stamp: "paper", done: "ch-" + id, msg: msg });
  }

  function renderStudioList() {
    const list = C.challenges.filter(function (ch) { return ch.bands.indexOf(state.band) !== -1; });
    const root = document.getElementById("view");
    root.innerHTML =
      '<figure class="hero"><img src="' + u("images/harbor-easel.jpg") + '" alt="Field easel on a harbor pier"><figcaption>Studio challenges</figcaption></figure>' +
      '<article class="panel"><p class="kicker">Work on the screen</p><h1>Challenges</h1>' +
      '<p class="lede">Mirror, copy upside-down, mix shapes, mark a pier. The job happens here.</p></article>' +
      list.map(function (ch) {
        return '<article class="panel"><p class="kicker">' + ch.id + "</p><h2>" + ch.title + "</h2>" +
          "<p>" + ch.say + "</p>" +
          '<button type="button" class="btn btn-main" data-ch="' + ch.id + '">Open this studio job</button></article>';
      }).join("") + backRow();
    root.querySelectorAll("[data-ch]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.run = { challenge: btn.getAttribute("data-ch") };
        renderStudio();
      });
    });
    bindBack();
  }

  function renderStudioMirror() {
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Mirror dock</p><h1>Draw on the fold</h1>' +
      '<p class="lede">A faint hull sits on the left. Draw on either side — the other side copies it.</p></article>' +
      '<div class="studio-board"><canvas id="studio-c" width="640" height="400"></canvas></div>' +
      '<div class="btn-row"><button type="button" class="btn btn-main" id="done">Both sides match</button>' +
      '<button type="button" class="btn" id="back-ch">All challenges</button></div>';
    const canvas = document.getElementById("studio-c");
    const ctx = canvas.getContext("2d");
    const mid = canvas.width / 2;
    function fold() {
      ctx.save();
      ctx.strokeStyle = "#cbb99a";
      ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.moveTo(mid, 8);
      ctx.lineTo(mid, canvas.height - 8);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = "#fbf7ee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(36,54,60,0.28)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mid - 20, 250);
    ctx.quadraticCurveTo(mid - 120, 250, mid - 140, 210);
    ctx.lineTo(mid - 40, 180);
    ctx.lineTo(mid - 12, 220);
    ctx.stroke();
    fold();
    let last = null;
    let ink = 0;
    studioCanvas(root, function (p, kind) {
      if (kind === "start") last = p;
      if (!last) return;
      ink += Math.hypot(p.x - last.x, p.y - last.y);
      ctx.strokeStyle = "#1c1814";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mid * 2 - last.x, last.y);
      ctx.lineTo(mid * 2 - p.x, p.y);
      ctx.stroke();
      last = p;
    });
    document.getElementById("done").addEventListener("click", function () {
      if (ink < 48) {
        toast("Draw on the fold first.");
        return;
      }
      finishChallenge("mirror", "Both sides match.");
    });
    document.getElementById("back-ch").addEventListener("click", function () {
      state.run = {};
      renderStudioList();
    });
  }

  function renderStudioUpside() {
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Upside-down lines</p><h1>Copy the edges</h1>' +
      '<p class="lede">The vase is already flipped. Copy the outline — not “vase” — on the pad below.</p></article>' +
      '<div class="upside-src" aria-hidden="true"><svg viewBox="0 0 80 110"><path d="M28 8h24l6 22c8 6 12 16 12 28 0 18-10 36-22 42v8H32v-8C20 94 10 76 10 58c0-12 4-22 12-28z" fill="none" stroke="#24363c" stroke-width="3"/></svg></div>' +
      '<div class="studio-board"><canvas id="studio-c" width="640" height="400"></canvas></div>' +
      '<div class="btn-row"><button type="button" class="btn btn-main" id="done">I copied the edges</button>' +
      '<button type="button" class="btn" id="back-ch">All challenges</button></div>';
    const ctx = document.getElementById("studio-c").getContext("2d");
    ctx.fillStyle = "#fbf7ee";
    ctx.fillRect(0, 0, 640, 400);
    studioCanvas(root);
    document.getElementById("done").addEventListener("click", function () {
      finishChallenge("upside", "Edge copy is on the pad.");
    });
    document.getElementById("back-ch").addEventListener("click", function () {
      state.run = {};
      renderStudioList();
    });
  }

  function renderStudioAbstract() {
    const root = document.getElementById("view");
    const blobs = [
      { hex: "#c45a3a", name: "apple red" },
      { hex: "#3d6b63", name: "cloth green" },
      { hex: "#d4a017", name: "table gold" }
    ];
    let color = blobs[0].hex;
    root.innerHTML =
      '<article class="panel"><p class="kicker">Abstract from still life</p><h1>Biggest shapes only</h1>' +
      '<p class="lede">Look at the still life. Dab its colors. No apple outline.</p></article>' +
      '<figure class="hero"><img src="' + u("images/harbor-still-life.jpg") + '" alt="Harbor still life on a pine table"></figure>' +
      '<div class="studio-board"><canvas id="studio-c" width="640" height="400"></canvas></div>' +
      '<div class="swatch-row">' + blobs.map(function (b) {
        return '<button type="button" class="swatch" data-hex="' + b.hex + '" style="background:' + b.hex + '" aria-label="' + b.name + '"></button>';
      }).join("") + "</div>" +
      '<div class="btn-row"><button type="button" class="btn btn-main" id="done">Shape study done</button>' +
      '<button type="button" class="btn" id="back-ch">All challenges</button></div>';
    const canvas = document.getElementById("studio-c");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fbf7ee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    studioCanvas(root, function (p, kind) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 28, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    root.querySelectorAll("[data-hex]").forEach(function (btn) {
      btn.addEventListener("click", function () { color = btn.getAttribute("data-hex"); });
    });
    document.getElementById("done").addEventListener("click", function () {
      finishChallenge("abstract", "Shape study is on the pad.");
    });
    document.getElementById("back-ch").addEventListener("click", function () {
      state.run = {};
      renderStudioList();
    });
  }

  function renderStudioPerspective() {
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Pier perspective</p><h1>Lines to one point</h1>' +
      '<p class="lede">Tap the board. Each tap draws a plank toward the vanishing point.</p></article>' +
      '<div class="studio-board"><canvas id="studio-c" width="640" height="400"></canvas></div>' +
      '<div class="btn-row"><button type="button" class="btn btn-main" id="done">Pier is drawn</button>' +
      '<button type="button" class="btn" id="back-ch">All challenges</button></div>';
    const canvas = document.getElementById("studio-c");
    const ctx = canvas.getContext("2d");
    const vp = { x: 320, y: 90 };
    ctx.fillStyle = "#fbf7ee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#8ea0a0";
    ctx.beginPath();
    ctx.moveTo(20, 90);
    ctx.lineTo(620, 90);
    ctx.stroke();
    ctx.fillStyle = "#a65b32";
    ctx.beginPath();
    ctx.arc(vp.x, vp.y, 5, 0, Math.PI * 2);
    ctx.fill();
    canvas.addEventListener("click", function (ev) {
      const r = canvas.getBoundingClientRect();
      const x = (ev.clientX - r.left) * (canvas.width / r.width);
      const y = (ev.clientY - r.top) * (canvas.height / r.height);
      ctx.strokeStyle = "#24363c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(vp.x, vp.y);
      ctx.stroke();
    });
    document.getElementById("done").addEventListener("click", function () {
      finishChallenge("perspective", "Pier runs to one point.");
    });
    document.getElementById("back-ch").addEventListener("click", function () {
      state.run = {};
      renderStudioList();
    });
  }

  function renderStudioValue() {
    const root = document.getElementById("view");
    const steps = [0, 0, 0, 0, 0];
    root.innerHTML =
      '<article class="panel"><p class="kicker">Five values</p><h1>Dark to light</h1>' +
      '<p class="lede">Tap each box to step it darker. The strip has to run dark to light before it counts.</p></article>' +
      '<p class="kicker">Dark → light</p>' +
      '<div class="value-row" id="vals"></div>' +
      '<div class="studio-board"><canvas id="studio-c" width="640" height="280"></canvas></div>' +
      '<div class="btn-row"><button type="button" class="btn btn-main" id="done">Value strip done</button>' +
      '<button type="button" class="btn" id="back-ch">All challenges</button></div>';
    function paintVals() {
      document.getElementById("vals").innerHTML = steps.map(function (n, i) {
        const g = 255 - n * 50;
        return '<button type="button" class="value-box" data-v="' + i + '" style="background:rgb(' + g + "," + g + "," + g + ')" aria-label="value ' + (i + 1) + '"></button>';
      }).join("");
      document.getElementById("vals").querySelectorAll("[data-v]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const i = Number(btn.getAttribute("data-v"));
          steps[i] = Math.min(5, steps[i] + 1);
          paintVals();
        });
      });
    }
    paintVals();
    const canvas = document.getElementById("studio-c");
    const ctx = canvas.getContext("2d");
    const zones = [
      { x: 250, fill: "#e8dcc0" },
      { x: 320, fill: "#8a8074" },
      { x: 390, fill: "#2a241c" }
    ];
    function drawSphere() {
      ctx.fillStyle = "#fbf7ee";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(320, 140, 90, 0, Math.PI * 2);
      ctx.fillStyle = "#c8b8a0";
      ctx.fill();
      zones.forEach(function (z) {
        ctx.beginPath();
        ctx.arc(z.x, 140, 28, 0, Math.PI * 2);
        ctx.fillStyle = z.fill;
        ctx.fill();
      });
    }
    drawSphere();
    canvas.addEventListener("click", function (ev) {
      const r = canvas.getBoundingClientRect();
      const x = (ev.clientX - r.left) * (canvas.width / r.width);
      zones.forEach(function (z) {
        if (Math.abs(x - z.x) < 40) {
          z.fill = z.fill === "#1c1814" ? "#e8dcc0" : "#1c1814";
        }
      });
      drawSphere();
    });
    document.getElementById("done").addEventListener("click", function () {
      let graded = true;
      for (let i = 0; i < steps.length - 1; i++) {
        if (!(steps[i] > steps[i + 1])) graded = false;
      }
      if (!graded) {
        toast("Make the strip dark, then lighter.");
        return;
      }
      finishChallenge("value", "Dark runs to light.");
    });
    document.getElementById("back-ch").addEventListener("click", function () {
      state.run = {};
      renderStudioList();
    });
  }

  function renderStudioThirds() {
    const root = document.getElementById("view");
    root.innerHTML =
      '<article class="panel"><p class="kicker">Harbor thirds</p><h1>Set the boat on a crossing</h1>' +
      '<p class="lede">Tap a third-line crossing — not dead center.</p></article>' +
      '<div class="thirds-board">' +
        '<img src="' + u("images/harbor-studio-hero.jpg") + '" alt="Harbor studio scene">' +
        '<div class="thirds-grid"></div>' +
        '<div class="thirds-hit" id="hits"></div>' +
      "</div>" +
      '<div class="btn-row"><button type="button" class="btn btn-main" id="done">Boat is on a third</button>' +
      '<button type="button" class="btn" id="back-ch">All challenges</button></div>';
    const hits = document.getElementById("hits");
    let picked = null;
    for (let i = 0; i < 9; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", i === 4 ? "center, not a crossing" : "crossing " + (i + 1));
      b.addEventListener("click", function () {
        hits.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        picked = i;
      });
      hits.appendChild(b);
    }
    document.getElementById("done").addEventListener("click", function () {
      if (picked == null) {
        toast("Tap a crossing first.");
        return;
      }
      if (picked === 4) {
        toast("Not the center. Pick another crossing.");
        return;
      }
      finishChallenge("thirds", "Boat sits on a third.");
    });
    document.getElementById("back-ch").addEventListener("click", function () {
      state.run = {};
      renderStudioList();
    });
  }

  function renderStudio() {
    const id = state.run && state.run.challenge;
    if (id === "mirror") return renderStudioMirror();
    if (id === "upside") return renderStudioUpside();
    if (id === "abstract") return renderStudioAbstract();
    if (id === "perspective") return renderStudioPerspective();
    if (id === "value") return renderStudioValue();
    if (id === "thirds") return renderStudioThirds();
    renderStudioList();
  }

  function renderCollection() {
    const root = document.getElementById("view");
    const pcs = C.postcards.map(function (p) {
      const got = state.progress.postcards.indexOf(p.id) !== -1;
      return '<div class="postcard' + (got ? " got" : "") + '">' + p.name + "</div>";
    }).join("");
    const stamps = C.stamps.map(function (s) {
      const got = state.progress.stamps.indexOf(s.id) !== -1;
      return '<div class="stamp-badge' + (got ? " got" : "") + '">' + s.name + "</div>";
    }).join("");
    root.innerHTML =
      '<figure class="hero"><img src="' + u("images/harbor-looking-wall.jpg") + '" alt="Studio wall of frames and study cards"><figcaption>Postcard rack</figcaption></figure>' +
      '<article class="panel"><p class="kicker">Collectibles, not grades</p><h1>Postcard rack</h1>' +
      "<p>Stars: <strong>" + state.progress.stars + "</strong></p></article>" +
      '<article class="panel"><h2>Postcards</h2><div class="collection">' + pcs + "</div></article>" +
      '<article class="panel"><h2>Stamps</h2><div class="collection">' + stamps + "</div></article>" +
      backRow();
    bindBack();
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
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
