(function () {
  const SUBJECT = "reading";
  const BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"];
  const BAND_BLURB = {
    baby: "Care time. No garden lessons yet.",
    toddler: "Letter sounds first — not names.",
    preschool: "More sounds, then listen-and-blend.",
    early: "Short words, blends, teams, silent e.",
    primary: "Vowel teams, roses, tall plants, sundial.",
    upper: "Volume reading, words, and stories.",
  };
  const CUES = {
    bee: [
      { f: 620, t: 0, d: 0.05, type: "sawtooth", g: 0.03 },
      { f: 740, t: 0.06, d: 0.08, type: "sawtooth", g: 0.03 },
    ],
    rustle: [{ f: 140, t: 0, d: 0.12, type: "triangle", g: 0.05 }],
    bloom: [
      { f: 523, t: 0, d: 0.1, type: "sine", g: 0.05 },
      { f: 784, t: 0.1, d: 0.16, type: "sine", g: 0.05 },
    ],
    page: [{ f: 240, t: 0, d: 0.06, type: "square", g: 0.03 }],
  };

  let audioCtx = null;

  function hs() {
    return window.HS || {};
  }
  function url(path) {
    if (hs().url) return hs().url(path);
    const base = document.documentElement.dataset.appBase || "./";
    return new URL(path, base).href;
  }
  function muted() {
    if (hs().muted) return hs().muted();
    try {
      return localStorage.getItem("hs.mute") === "1";
    } catch (e) {
      return false;
    }
  }
  function setMuted(on) {
    if (hs().setMuted) hs().setMuted(on);
    else localStorage.setItem("hs.mute", on ? "1" : "0");
  }
  function inRunner() {
    return document.documentElement.dataset.runner === "1";
  }
  const PHONEME = {
    s: "sss",
    m: "mmm",
    a: "aaa",
    t: "tuh",
    p: "puh",
    i: "iii",
    n: "nnn",
    d: "duh",
    g: "guh",
    o: "ooo",
    c: "kuh",
    k: "kuh",
    e: "eh",
    u: "uhh",
    r: "rrr",
    h: "huh",
    b: "buh",
    f: "fff",
    l: "lll",
    j: "juh",
    v: "vvv",
    w: "wuh",
    x: "ks",
    y: "yuh",
    z: "zzz",
    qu: "kwuh",
    sh: "shh",
    ch: "chuh",
    th: "thhh",
    ck: "kuh",
    ng: "ing",
    st: "sss tuh",
    sl: "sss lll",
    pl: "puh lll",
    fl: "fff lll",
    cl: "kuh lll",
    gr: "guh rrr",
    tr: "tuh rrr",
    fr: "fff rrr",
    nd: "nnn duh",
    ft: "fff tuh",
    ll: "lll",
    ai: "ay",
    ay: "ay",
    ee: "eee",
    ea: "eee",
    oa: "oh",
    ow: "oh",
    oo: "ooo",
    ar: "ar",
    or: "or",
    er: "er",
    ir: "er",
    ur: "er",
    a_e: "ay",
    i_e: "eye",
    o_e: "oh",
    u_e: "yoo",
  };
  function validBand(b) {
    return BANDS.indexOf(b) !== -1;
  }
  function phonemeOf(g) {
    return PHONEME[g] || String(g);
  }
  function phonemeLine(sounds) {
    return (sounds || []).map(phonemeOf).join(". ");
  }
  function graphemeLabel(g) {
    return String(g || "").replace(/_/g, "-");
  }
  function band() {
    if (hs().getBand) return hs().getBand();
    const q = new URLSearchParams(location.search).get("band");
    if (validBand(q)) return q;
    try {
      const stored = localStorage.getItem("hs.band");
      if (validBand(stored)) return stored;
    } catch (e) {}
    return "";
  }
  function setBand(b) {
    if (!validBand(b)) return;
    if (hs().setBand) hs().setBand(b);
    else localStorage.setItem("hs.band", b);
    const next = new URL(location.href);
    next.searchParams.set("band", b);
    history.replaceState({}, "", next);
  }
  function playCueLocal(recipe) {
    if (muted() || !recipe || !recipe.length) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t0 = audioCtx.currentTime;
    recipe.forEach(function (n) {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = n.type || "sine";
      o.frequency.setValueAtTime(n.f, t0 + (n.t || 0));
      g.gain.setValueAtTime(0.0001, t0 + (n.t || 0));
      g.gain.exponentialRampToValueAtTime(n.g || 0.08, t0 + (n.t || 0) + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (n.t || 0) + (n.d || 0.18));
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t0 + (n.t || 0));
      o.stop(t0 + (n.t || 0) + (n.d || 0.18) + 0.02);
    });
  }
  function cue(name) {
    if (hs().playCue) hs().playCue(CUES[name]);
    else playCueLocal(CUES[name]);
  }
  function speak(t, opts) {
    if (!t || muted()) return;
    if (hs().speak) {
      hs().speak(t, opts || { rate: 0.8 });
      return;
    }
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(String(t));
    u.rate = (opts && opts.rate) || 0.8;
    u.lang = "en-US";
    synth.speak(u);
  }
  function silence() {
    if (hs().silence) hs().silence();
    else if (window.speechSynthesis) window.speechSynthesis.cancel();
  }
  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }
  function imgFor(manifest) {
    return function (slot, cls) {
      const item = (manifest.images || []).find(function (i) {
        return i.slot === slot;
      });
      const alt = item ? item.alt : slot;
      if (window.GardenArt && GardenArt.forSlot) return GardenArt.forSlot(slot, cls || "slot", alt);
      if (!item) return "";
      return (
        '<img class="' +
        (cls || "slot") +
        '" src="' +
        url("images/" + item.file) +
        '" alt="' +
        esc(alt) +
        '">'
      );
    };
  }
  function bloomLabel(n) {
    return n + (n === 1 ? " bloom" : " blooms");
  }
  function stampLabel(n) {
    return n + (n === 1 ? " stamp" : " stamps");
  }
  function wait() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 220
      : 700;
  }
  function celebrate(msg) {
    const el = document.getElementById("garden-celebrate");
    const p = document.getElementById("garden-celebrate-msg");
    if (!el || !p) return;
    p.textContent = msg || "That plot is tended.";
    el.hidden = false;
    setTimeout(function () {
      el.hidden = true;
    }, 1200);
  }

  function loadScript(src) {
    return new Promise(function (resolve) {
      const el = document.createElement("script");
      el.src = src;
      el.onload = resolve;
      el.onerror = resolve;
      document.head.appendChild(el);
    });
  }
  async function loadKitStandalone() {
    if (inRunner()) return;
    if (hs().getBand && hs().speak && hs().playCue && hs().readProgress) return;
    const kit = new URL("../../kit/", location.href);
    await loadScript(new URL("audio.js", kit).href);
    await loadScript(new URL("tts.js", kit).href);
    await loadScript(new URL("progress.js", kit).href);
  }
  async function boot() {
    const host = document.getElementById("reading-root");
    if (!host) return;
    if (!inRunner()) {
      await loadKitStandalone();
      window.HS = window.HS || {};
      HS.appBase = HS.appBase || new URL("./", location.href).href;
      HS.subject = SUBJECT;
      document.documentElement.dataset.appBase = HS.appBase;
      if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js", { scope: "./" });
    }

    const b = band();
    if (!b) {
      showPicker(host);
      return;
    }
    if (b === "baby") {
      host.className = "garden band-baby";
      host.innerHTML =
        '<div class="garden-intro"><h1>Garden rest</h1><p>No garden lessons for this band yet. Open another home, or switch the plot.</p></div>' +
        (inRunner() ? "" : '<p style="padding:12px"><button type="button" id="switch-plot">Switch plot</button></p>');
      const sw = document.getElementById("switch-plot");
      if (sw)
        sw.onclick = function () {
          try {
            localStorage.removeItem("hs.band");
          } catch (e) {}
          showPicker(host);
        };
      return;
    }

    const pre = window.__GARDEN_PRE;
    const usePre = pre && pre.band === b;
    const [data, manifest, catalog] = await Promise.all([
      usePre
        ? pre.data
        : fetch(url("data/" + b + ".json")).then(function (r) {
            if (!r.ok) throw new Error("no data");
            return r.json();
          }),
      usePre
        ? pre.images
        : fetch(url("images.json")).then(function (r) {
            return r.json();
          }),
      usePre
        ? pre.books
        : fetch(url("data/books.json")).then(function (r) {
            return r.json();
          }),
    ]);
    const img = imgFor(manifest);
    const bookMeta = catalog.books || [];
    const progress = (hs().readProgress && hs().readProgress(SUBJECT)) || readProgressLocal();
    progress.band = b;
    progress.blooms = progress.blooms || 0;
    progress.stamps = progress.stamps || [];
    progress.bedsDone = progress.bedsDone || {};
    progress.booksRead = progress.booksRead || [];
    progress.totalMinutes = progress.totalMinutes || 0;
    if (progress.soundsDone) progress.bedsDone.sounds = true;

    function save() {
      progress.updatedAt = new Date().toISOString();
      if (hs().writeProgress) hs().writeProgress(SUBJECT, progress);
      else {
        try {
          localStorage.setItem("hs.progress." + SUBJECT, JSON.stringify(progress));
        } catch (e) {}
      }
    }
    function readProgressLocal() {
      try {
        return JSON.parse(localStorage.getItem("hs.progress." + SUBJECT) || "{}");
      } catch (e) {
        return {};
      }
    }
    function bedById(id) {
      return (data.beds || []).find(function (x) {
        return x.id === id;
      });
    }
    function titleOfBook(id) {
      const m = bookMeta.find(function (x) {
        return x.id === id;
      });
      return m ? m.title : id;
    }
    function bedLocked(bed) {
      if (!bed || !bed.requires) return null;
      if (progress.bedsDone[bed.requires]) return null;
      const need = bedById(bed.requires);
      return "Finish " + ((need && need.title) || bed.requires) + " first";
    }
    function bookLocked(id) {
      const meta = bookMeta.find(function (x) {
        return x.id === id;
      });
      if (!meta) return "Missing book";
      if (data.unlockAllBooks) return null;
      const free = data.unlockLevels || [];
      if (free.indexOf(meta.level) !== -1) return null;
      const bedNeed = meta.requiresBed;
      if (bedNeed && bedById(bedNeed) && !progress.bedsDone[bedNeed]) {
        const bd = bedById(bedNeed);
        return "Finish " + ((bd && bd.title) || bedNeed) + " first";
      }
      if (meta.requires && progress.booksRead.indexOf(meta.requires) === -1) {
        const prev = bookMeta.find(function (x) {
          return x.id === meta.requires;
        });
        if (prev && free.indexOf(prev.level) !== -1) return null;
        if (prev && (data.books || []).indexOf(prev.id) === -1) return null;
        return "Read " + titleOfBook(meta.requires) + " first";
      }
      return null;
    }
    function addStamp(id) {
      if (progress.stamps.indexOf(id) === -1) progress.stamps.push(id);
    }
    function finishBed(bed) {
      progress.bedsDone[bed.id] = true;
      if (bed.id === "sounds") progress.soundsDone = true;
      progress.blooms += 1;
      addStamp(bed.id);
      save();
      cue("bloom");
      celebrate((bed.title || "That plot") + " blooms.");
      setTimeout(home, wait() + 400);
    }
    function itemsFor(bed) {
      return (data.items || []).filter(function (it) {
        return (it.bed || "sounds") === bed.id;
      });
    }
    function muteBtn() {
      if (inRunner()) return "";
      return (
        '<button type="button" class="garden-mute" id="mute-btn">' +
        (muted() ? "Sound off" : "Sound on") +
        "</button>"
      );
    }
    function bindMute() {
      const btn = document.getElementById("mute-btn");
      if (!btn) return;
      btn.onclick = function () {
        setMuted(!muted());
        home();
      };
    }

    function home() {
      silence();
      host.className = "garden band-" + b;
      const stamps = (progress.stamps || [])
        .slice(-12)
        .map(function (s) {
          return '<span class="garden-stamp">' + esc(s) + "</span>";
        })
        .join("");
      let plots = "";
      (data.beds || []).forEach(function (bed) {
        const lock = bedLocked(bed);
        const bid = bed.id === "sounds" ? "go-sounds" : "go-" + bed.id;
        plots +=
          '<div class="garden-plot' +
          (lock ? " is-locked" : "") +
          '">' +
          img(bed.slot) +
          '<button type="button" id="' +
          bid +
          '"' +
          (lock ? " disabled" : "") +
          ">" +
          esc(bed.title) +
          (lock ? " — " + esc(lock) : "") +
          "</button></div>";
      });
      host.innerHTML =
        muteBtn() +
        img("hero", "garden-hero") +
        '<div class="garden-intro"><h1>' +
        esc(data.title) +
        "</h1><p>" +
        esc(data.intro.body) +
        '</p><p class="garden-blooms">' +
        bloomLabel(progress.blooms) +
        " · " +
        stampLabel(progress.stamps.length || 0) +
        (progress.totalMinutes ? " · " + progress.totalMinutes + " min in the sundial" : "") +
        "</p><div class=\"garden-stamps\">" +
        stamps +
        "</div></div>" +
        '<div class="garden-path">' +
        plots +
        "</div>" +
        (inRunner()
          ? ""
          : '<p style="padding:12px"><button type="button" id="switch-plot">Switch plot</button></p>');
      bindMute();
      (data.beds || []).forEach(function (bed) {
        const bid = bed.id === "sounds" ? "go-sounds" : "go-" + bed.id;
        const btn = document.getElementById(bid);
        if (!btn || btn.disabled) return;
        btn.onclick = function () {
          speak(bed.audioText || bed.title);
          if (bed.kind === "books") listBooks();
          else if (bed.kind === "timer") timer(bed);
          else if (bed.kind === "comprehend") startComprehend();
          else startItems(bed);
        };
      });
      const sw = document.getElementById("switch-plot");
      if (sw)
        sw.onclick = function () {
          try {
            localStorage.removeItem("hs.band");
          } catch (e) {}
          showPicker(host);
        };
      speak(data.intro.audioText);
    }

    function startItems(bed) {
      const items = itemsFor(bed);
      let itemIndex = 0;
      function chrome(hearLabel) {
        return (
          '<div class="garden-toolbar garden-toolbar-top">' +
          '<button type="button" id="back-home">Garden</button>' +
          (hearLabel
            ? '<button type="button" class="garden-hear" id="hear">' + hearLabel + "</button>"
            : "") +
          "</div>"
        );
      }
      function bindChrome() {
        document.getElementById("back-home").onclick = home;
      }
      function nextItem() {
        itemIndex += 1;
        show();
      }
      function show() {
        const item = items[itemIndex];
        if (!item) {
          finishBed(bed);
          return;
        }
        const expect = item.answer || item.blend;
        const isSound = bed.kind === "sounds" || (!item.kind && item.phoneme);
        const isBlend = !!(item.sounds && item.sounds.length) && !item.kind;
        host.className = "garden band-" + b;

        if (isBlend) {
          const sounds = item.sounds || [];
          const line = phonemeLine(sounds);
          host.innerHTML =
            chrome("Hear the sounds") +
            '<div class="garden-prompt"><h2>Blend</h2><p>Tap each seed in order, then blend.</p></div>' +
            '<div class="garden-seeds" id="seeds">' +
            sounds
              .map(function (g, idx) {
                return (
                  '<button type="button" data-i="' +
                  idx +
                  '"><span class="garden-letter">' +
                  esc(graphemeLabel(g)) +
                  "</span></button>"
                );
              })
              .join("") +
            '</div><p class="garden-status" id="st">Listen. Then tap the seeds.</p>';
          bindChrome();
          let next = 0;
          const seeds = host.querySelectorAll("#seeds button");
          function hearSounds() {
            cue("bee");
            speak(line, { rate: 0.62 });
          }
          document.getElementById("hear").onclick = hearSounds;
          hearSounds();
          host.querySelector("#seeds").onclick = function (ev) {
            const btn = ev.target.closest("button[data-i]");
            if (!btn) return;
            const idx = Number(btn.getAttribute("data-i"));
            const st = document.getElementById("st");
            if (idx === next) {
              btn.classList.add("is-right");
              speak(phonemeOf(sounds[idx]), { rate: 0.6 });
              next += 1;
              if (next >= sounds.length) {
                cue("bloom");
                st.textContent = "Blend: " + (item.blend || expect);
                speak((item.blend || expect) + ".", { rate: 0.85 });
                setTimeout(nextItem, wait() + 500);
              }
            } else {
              cue("rustle");
              st.textContent = "Start at the first seed. Listen again.";
              next = 0;
              seeds.forEach(function (b) {
                b.classList.remove("is-right", "is-on");
              });
              speak(line, { rate: 0.62 });
            }
          };
          return;
        }

        const choices = item.choices || [];
        let promptHtml = "";
        let autoSpeak = item.audioText || "";
        let rate = 0.75;
        let hearLabel = "Hear it";
        if (isSound) {
          promptHtml =
            img("bee", "garden-bee") +
            "<h2>Find the sound</h2>" +
            "<p>The bee says a sound — not a letter name.</p>";
          autoSpeak = item.audioText || item.phoneme || phonemeOf(expect);
          rate = 0.65;
          hearLabel = "Hear the sound";
        } else if (item.kind === "helper" || item.kind === "sight") {
          promptHtml =
            "<h2>Helper word</h2><p>" +
            esc(item.prompt || "Look and say. This word is not sounded out letter by letter.") +
            "</p>";
          autoSpeak = item.audioText || expect;
          hearLabel = "Hear it";
        } else if (item.kind === "vocab" || bed.kind === "vocab") {
          promptHtml =
            "<h2>" +
            esc(item.word || "Vocabulary bloom") +
            "</h2><p>" +
            esc(item.prompt || "What does this garden word mean?") +
            "</p>";
          autoSpeak = item.audioText || item.word;
          hearLabel = "Hear the word";
        } else {
          promptHtml = "<h2>" + esc(bed.title || "Garden") + "</h2><p>" + esc(item.prompt || "") + "</p>";
          autoSpeak = item.audioText || expect;
        }
        const choiceHtml = choices
          .map(function (c) {
            const flower = isSound ? img("flower-" + c) : "";
            const letter = isSound
              ? '<span class="garden-letter">' + esc(c) + "</span>"
              : esc(c);
            return '<button type="button" data-v="' + esc(c) + '">' + flower + letter + "</button>";
          })
          .join("");
        host.innerHTML =
          chrome(hearLabel) +
          '<div class="garden-prompt">' +
          promptHtml +
          "</div>" +
          '<div class="garden-flowers' +
          (choices.length > 2 ? " cols-3" : "") +
          '" id="choices">' +
          choiceHtml +
          '</div><p class="garden-status" id="st"></p>';
        bindChrome();
        const hear = document.getElementById("hear");
        if (hear)
          hear.onclick = function () {
            cue("bee");
            speak(autoSpeak, { rate: rate });
          };
        cue("bee");
        speak(autoSpeak, { rate: rate });
        document.getElementById("choices").onclick = function (ev) {
          const btn = ev.target.closest("button[data-v]");
          if (!btn) return;
          const st = document.getElementById("st");
          if (btn.getAttribute("data-v") === expect) {
            btn.classList.add("is-right");
            cue("bloom");
            st.textContent = "That bed blooms.";
            if (item.kind === "vocab") speak(expect, { rate: 0.9 });
            setTimeout(nextItem, wait());
          } else {
            btn.classList.add("is-wrong");
            cue("rustle");
            st.textContent = "Try another flower. Listen again.";
            speak(autoSpeak, { rate: 0.65 });
          }
        };
      }
      show();
    }

    function listBooks() {
      host.className = "garden band-" + b;
      const ids = data.books || [];
      let plots = "";
      ids.forEach(function (id) {
        const meta = bookMeta.find(function (x) {
          return x.id === id;
        }) || { title: id, coverSlot: id + "-cover", level: "" };
        const lock = bookLocked(id);
        const lv = (catalog.levels || []).find(function (x) {
          return x.id === meta.level;
        });
        const levelLabel = lv ? lv.title : "";
        plots +=
          '<div class="garden-plot' +
          (lock ? " is-locked" : "") +
          '">' +
          img(meta.coverSlot) +
          '<button type="button"' +
          (lock ? " disabled" : "") +
          " data-book=\"" +
          esc(id) +
          '">' +
          esc(meta.title) +
          (levelLabel ? " · " + esc(levelLabel) : "") +
          (lock ? " — " + esc(lock) : "") +
          "</button></div>";
      });
      host.innerHTML =
        '<div class="garden-toolbar garden-toolbar-top"><button type="button" id="back-home">Garden</button></div>' +
        img("hero", "garden-hero") +
        '<div class="garden-intro"><h1>Garden books</h1><p>Original stories. Tap a word to hear it. The sun follows as the page is read.</p></div>' +
        '<div class="garden-path" id="book-list">' +
        plots +
        "</div>";
      document.getElementById("book-list").onclick = function (ev) {
        const btn = ev.target.closest("button[data-book]");
        if (!btn || btn.disabled) return;
        openBook(btn.getAttribute("data-book"));
      };
      document.getElementById("back-home").onclick = home;
    }

    function openBook(id) {
      GardenReader.open({
        url: url("books/" + id + ".json"),
        host: host,
        speak: speak,
        cue: cue,
        imgFor: img,
        onClose: listBooks,
        onDone: function () {
          progress.blooms += 1;
          if (progress.booksRead.indexOf(id) === -1) progress.booksRead.push(id);
          addStamp(id);
          save();
          cue("bloom");
          celebrate(titleOfBook(id) + " is tended.");
          setTimeout(listBooks, 900);
        },
      });
    }

    function timer(bed) {
      let left = (bed.minutes || data.minutes || 20) * 60;
      const startLeft = left;
      let tick = null;
      function paint(running) {
        const m = Math.floor(left / 60);
        const s = String(left % 60).padStart(2, "0");
        host.className = "garden band-" + b;
        host.innerHTML =
          '<div class="garden-toolbar garden-toolbar-top">' +
          '<button type="button" id="t-home">Garden</button>' +
          '<button type="button" id="t-books">Books</button></div>' +
          img("hero", "garden-hero") +
          '<div class="garden-intro"><h1>Sundial reading</h1><p class="garden-timer">' +
          m +
          ":" +
          s +
          "</p><p>A paper book beside you is fine. This sundial is not a test.</p>" +
          '<div class="garden-toolbar">' +
          '<button type="button" id="t-toggle">' +
          (running ? "Pause" : "Start") +
          "</button></div></div>";
        document.getElementById("t-toggle").onclick = function () {
          if (tick) {
            clearInterval(tick);
            tick = null;
            paint(false);
            return;
          }
          tick = setInterval(function () {
            left = Math.max(0, left - 1);
            if (left === 0) {
              clearInterval(tick);
              tick = null;
              const spent = Math.max(1, Math.round(startLeft / 60));
              progress.totalMinutes += spent;
              progress.blooms += 1;
              addStamp("sundial");
              save();
              cue("bloom");
              celebrate("The sundial is done.");
              left = startLeft;
            }
            const tm = Math.floor(left / 60);
            const ts = String(left % 60).padStart(2, "0");
            const el = host.querySelector(".garden-timer");
            if (el) el.textContent = tm + ":" + ts;
            const tg = document.getElementById("t-toggle");
            if (tg && left === 0) tg.textContent = "Start";
          }, 1000);
          document.getElementById("t-toggle").textContent = "Pause";
        };
        document.getElementById("t-books").onclick = function () {
          if (tick) clearInterval(tick);
          listBooks();
        };
        document.getElementById("t-home").onclick = function () {
          if (tick) clearInterval(tick);
          home();
        };
      }
      paint(false);
    }

    function startComprehend() {
      const passages = data.passages || [];
      let p = 0;
      function showPassage() {
        const pas = passages[p];
        if (!pas) {
          finishBed({ id: "comprehend", title: "Story bench" });
          return;
        }
        host.className = "garden band-" + b;
        host.innerHTML =
          '<div class="garden-toolbar garden-toolbar-top">' +
          '<button type="button" id="back-home">Garden</button>' +
          '<button type="button" class="garden-hear" id="hear">Hear the story</button></div>' +
          '<div class="garden-passage">' +
          img(pas.slot) +
          "<h2>" +
          esc(pas.title) +
          "</h2><p>" +
          esc(pas.text) +
          "</p></div>" +
          '<div class="garden-toolbar">' +
          '<button type="button" id="go-q">Questions</button></div>';
        document.getElementById("hear").onclick = function () {
          speak(pas.text, { rate: 0.92 });
        };
        document.getElementById("go-q").onclick = function () {
          showQs(pas, 0);
        };
        document.getElementById("back-home").onclick = home;
        speak(pas.title + ". " + pas.text, { rate: 0.92 });
      }
      function showQs(pas, qi) {
        const qs = (data.items || []).filter(function (it) {
          return it.passageId === pas.id;
        });
        const item = qs[qi];
        if (!item) {
          progress.blooms += 1;
          addStamp(pas.id);
          save();
          cue("bloom");
          p += 1;
          showPassage();
          return;
        }
        host.innerHTML =
          '<div class="garden-toolbar garden-toolbar-top">' +
          '<button type="button" id="back-home">Garden</button>' +
          '<button type="button" class="garden-hear" id="hear">Hear the question</button></div>' +
          '<div class="garden-prompt"><h2>' +
          esc(pas.title) +
          "</h2><p>" +
          esc(item.prompt) +
          "</p></div>" +
          '<div class="garden-flowers" id="choices">' +
          (item.choices || [])
            .map(function (c) {
              return '<button type="button" data-v="' + esc(c) + '">' + esc(c) + "</button>";
            })
            .join("") +
          '</div><p class="garden-status" id="st"></p>';
        document.getElementById("hear").onclick = function () {
          speak(item.audioText || item.prompt);
        };
        document.getElementById("back-home").onclick = home;
        speak(item.audioText || item.prompt);
        document.getElementById("choices").onclick = function (ev) {
          const btn = ev.target.closest("button[data-v]");
          if (!btn) return;
          const st = document.getElementById("st");
          if (btn.getAttribute("data-v") === item.answer) {
            btn.classList.add("is-right");
            cue("bloom");
            st.textContent = "That bed blooms.";
            setTimeout(function () {
              showQs(pas, qi + 1);
            }, wait());
          } else {
            btn.classList.add("is-wrong");
            cue("rustle");
            st.textContent = "Listen again. Try another.";
            speak(item.audioText || item.prompt);
          }
        };
      }
      showPassage();
    }

    home();
  }

  function showPicker(host) {
    host.className = "garden";
    host.innerHTML =
      '<div class="garden-intro"><h1>Pick a garden plot</h1><p>Plots use bands, not grades. Untested, awaiting parent test.</p></div>' +
      '<div class="garden-picker">' +
      BANDS.map(function (id) {
        return (
          '<button type="button" data-band="' +
          id +
          '"><strong>' +
          id +
          "</strong><span>" +
          esc(BAND_BLURB[id]) +
          "</span></button>"
        );
      }).join("") +
      "</div>";
    host.querySelector(".garden-picker").onclick = function (ev) {
      const btn = ev.target.closest("button[data-band]");
      if (!btn) return;
      setBand(btn.getAttribute("data-band"));
      boot().catch(function (e) {
        console.error(e);
      });
    };
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
