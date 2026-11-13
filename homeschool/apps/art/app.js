(function () {
  const C = window.HSArt;
  function u(path) {
    if (window.HS && typeof window.HS.url === "function") return window.HS.url(path);
    return path;
  }
  const BAND_KEY = "hs.band";
  const QUIET_KEY = "hs.art.quiet";
  const PROGRESS_KEY = "hs.progress.art";
  const BAND_IDS = C.bands.map(function (b) { return b.id; });

  const icon = {
    home: '<svg viewBox="0 0 64 64" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M32 10L8 30h6v24h16V38h4v16h16V30h6z"/></svg>',
    speaker: '<svg viewBox="0 0 64 64" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M10 24h12l14-12v40L22 40H10zM44 24c4 4 6 8 6 8s-2 4-6 8"/></svg>',
    mute: '<svg viewBox="0 0 64 64" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M10 24h12l14-12v40L22 40H10zM44 22l16 16M60 22L44 38"/></svg>'
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
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress));
    paintChrome();
  }

  function award(opts) {
    opts = opts || {};
    if (opts.stars) state.progress.stars += opts.stars;
    if (opts.postcard && state.progress.postcards.indexOf(opts.postcard) === -1) {
      state.progress.postcards.push(opts.postcard);
    }
    if (opts.stamp && state.progress.stamps.indexOf(opts.stamp) === -1) {
      state.progress.stamps.push(opts.stamp);
    }
    if (opts.done) state.progress.done[opts.done] = (state.progress.done[opts.done] || 0) + 1;
    saveProgress();
    toast(opts.msg || "Postcard earned.");
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
      '<figure class="hero"><img src="' + u("img/harbor-studio-hero.jpg") + '" alt="Watercolor studio inside a harbor boathouse">' +
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
    const set = state.band === "baby" || state.band === "toddler"
      ? C.colors.filter(function (c) { return ["red", "yellow", "blue", "white", "black"].indexOf(c.id) !== -1; })
      : C.colors;
    let current = set[0];
    const root = document.getElementById("view");
    function paint() {
      root.innerHTML =
        '<figure class="hero"><img src="' + u("img/color-boats.jpg") + '" alt="Primary-colored toy boats on harbor planks"><figcaption>Color dock</figcaption></figure>' +
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
          if (!state.run) state.run = { named: {} };
          state.run.named[current.id] = true;
          if (Object.keys(state.run.named).length >= 4) {
            award({ stars: 1, postcard: "buoy", stamp: "palette", done: "colors", msg: "Color postcard!" });
            state.run.named = {};
          }
          paint();
        });
      });
      document.getElementById("hear").addEventListener("click", function () { speak(current.say); });
      bindBack();
    }
    paint();
    speak(current.say);
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
        '<figure class="hero"><img src="' + u("img/harbor-shapes.jpg") + '" alt="Wooden shape blocks"><figcaption>Shape harbor</figcaption></figure>' +
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
        '<figure class="hero"><img src="' + u("img/harbor-palette.jpg") + '" alt="Worn wooden palette"><figcaption>Mix pan</figcaption></figure>' +
        '<article class="panel"><p class="kicker">Two dabs</p><h1>What do they make?</h1>' +
        '<p class="lede">Tap two primaries. The pan mixes them. Then mix the same pair on paper.</p></article>' +
        '<div class="swatch-row">' +
          ["red", "yellow", "blue"].map(function (id) {
            return '<button type="button" class="swatch" data-id="' + id + '" style="background:' + hex(id) + '" aria-label="' + id + '"></button>';
          }).join("") +
        "</div>" +
        '<div style="margin:16px 0;height:120px;border:1px solid var(--harbor);background:' +
          (result ? hex(result.out) : picked.length === 1 ? hex(picked[0]) : "#f7f1e5") +
        '"></div>' +
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
              award({ stars: 1, postcard: "shell", stamp: "mix", done: "mix-" + m.out, msg: "Now mix it on paper." });
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
    ctx.fillStyle = "rgba(61,107,99,0.12)";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const sx = w / 320;
    const sy = h / 220;
    ctx.save();
    ctx.scale(sx, sy);
    ops.forEach(function (op) {
      ctx.beginPath();
      if (op.op === "line") {
        ctx.moveTo(op.x1, op.y1);
        ctx.lineTo(op.x2, op.y2);
        ctx.stroke();
      } else if (op.op === "circle") {
        ctx.arc(op.x, op.y, op.r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (op.op === "ellipse") {
        ctx.ellipse(op.x, op.y, op.rx, op.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (op.op === "rect") {
        ctx.strokeRect(op.x, op.y, op.w, op.h);
      } else if (op.op === "path") {
        const p = new Path2D(op.d);
        ctx.stroke(p);
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
          ctx.beginPath();
          ctx.ellipse(op.x + Math.cos(a) * op.r, op.y + Math.sin(a) * op.r, 14, 10, a, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (op.op === "value") {
        const bw = op.w / op.n;
        for (let k = 0; k < op.n; k++) {
          const g = Math.round(255 - k * (180 / (op.n - 1)));
          ctx.fillStyle = "rgb(" + g + "," + g + "," + (g - 10) + ")";
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
      root.innerHTML =
        '<article class="panel"><p class="kicker">Technique on screen · work on paper</p><h1>' + lesson.title + "</h1>" +
        '<p class="lede">Watch each step. When the demo is done, draw it on paper — the app is not the finished picture.</p></article>' +
        '<div class="lesson-board"><canvas id="demo" width="640" height="440"></canvas></div>' +
        '<p class="prompt" id="say"></p>' +
        '<div class="btn-row">' +
          '<button type="button" class="btn btn-main" id="next">Next step</button>' +
          '<button type="button" class="btn" id="paper">I drew it on paper</button>' +
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
        for (let s = 0; s <= state.run.step && s < lesson.steps.length; s++) {
          drawOps(ctx, lesson.steps[s].ops, canvas.width, canvas.height);
        }
        const step = lesson.steps[Math.min(state.run.step, lesson.steps.length - 1)];
        document.getElementById("say").textContent = state.run.step >= lesson.steps.length ? lesson.paper : step.say;
      }
      redraw();
      if (state.run.step < lesson.steps.length) speak(lesson.steps[state.run.step].say);
      else speak(lesson.paper);
      document.getElementById("next").addEventListener("click", function () {
        if (state.run.step < lesson.steps.length) {
          state.run.step += 1;
          if (state.run.step === lesson.steps.length) {
            speak(lesson.paper);
            toast("Now draw it on paper.");
          }
          paint();
        }
      });
      document.getElementById("paper").addEventListener("click", function () {
        award({ stars: 1, postcard: "bridge", stamp: "paper", done: "lesson-" + lesson.id, msg: "Paper finish stamp." });
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
      root.innerHTML =
        '<article class="panel"><p class="kicker">Look closely</p><h1>' + a.title + "</h1>" +
        "<p>" + a.artist + " · " + a.year + "</p></article>" +
        '<figure class="look-frame"><img src="' + u(a.file) + '" alt="' + a.title + " by " + a.artist + '"></figure>' +
        '<p class="credit">' + a.museum + " · " + a.credit + "</p>" +
        '<article class="panel"><p class="prompt">' + q + "</p>" +
        '<div class="btn-row"><button type="button" class="btn btn-main" id="hear">Read the looking question</button>' +
        '<button type="button" class="btn" id="nextq">Another look</button></div></article>' +
        '<div class="btn-row">' +
          '<button type="button" class="btn" id="prev">Previous</button>' +
          '<button type="button" class="btn" id="next">Next picture</button>' +
        "</div>" + backRow();
      document.getElementById("hear").addEventListener("click", function () { speak(q); });
      document.getElementById("nextq").addEventListener("click", function () {
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
      speak(a.title + " by " + a.artist + ". " + q);
    }
    paint();
  }

  function renderArtists() {
    const root = document.getElementById("view");
    let i = 0;
    function paint() {
      const a = C.artists[i];
      const works = a.works.map(function (id) {
        return C.artworks.find(function (w) { return w.id === id; });
      }).filter(Boolean);
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
        i = (i + 1) % C.artists.length;
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

  function renderStudio() {
    const list = C.challenges.filter(function (ch) { return ch.bands.indexOf(state.band) !== -1; });
    const root = document.getElementById("view");
    root.innerHTML =
      '<figure class="hero"><img src="' + u("img/harbor-easel.jpg") + '" alt="Field easel on a harbor pier"><figcaption>Studio challenges</figcaption></figure>' +
      '<article class="panel"><p class="kicker">Original studio work</p><h1>Challenges</h1>' +
      '<p class="lede">The screen names the job. The paper is the work. Mirror, upside-down looking, abstract color, perspective, value.</p></article>' +
      list.map(function (ch) {
        return '<article class="panel"><p class="kicker">' + ch.id + "</p><h2>" + ch.title + "</h2>" +
          '<p>' + ch.say + '</p><p class="note">' + ch.paper + '</p>' +
          '<button type="button" class="btn btn-main" data-ch="' + ch.id + '">I did this on paper</button></article>';
      }).join("") + backRow();
    root.querySelectorAll("[data-ch]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        speak("Good. Keep that page.");
        award({ stars: 1, stamp: "paper", postcard: "bridge", done: "ch-" + btn.getAttribute("data-ch"), msg: "Paper finish." });
      });
    });
    bindBack();
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
      '<figure class="hero"><img src="' + u("img/harbor-looking-wall.jpg") + '" alt="Studio wall of frames and study cards"><figcaption>Postcard rack</figcaption></figure>' +
      '<article class="panel"><p class="kicker">Collectibles, not grades</p><h1>Postcard rack</h1>' +
      "<p>Stars: <strong>" + state.progress.stars + "</strong></p></article>" +
      '<article class="panel"><h2>Postcards</h2><div class="collection">' + pcs + "</div></article>" +
      '<article class="panel"><h2>Stamps</h2><div class="collection">' + stamps + "</div></article>" +
      backRow();
    bindBack();
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
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
