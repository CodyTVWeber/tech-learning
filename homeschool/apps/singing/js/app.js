(function () {
  const BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"];
  const BLURB = {
    baby: "Hear high and low. Tap a bird. Hum if you like.",
    toddler: "Steady beat, echo a call, first hymn tunes.",
    preschool: "Solfege steps, clap a pattern, sing a short hymn.",
    early: "Match a pitch, echo phrases, more hymn verses.",
    primary: "Rhythm names, scale climbs, longer hymns.",
    upper: "Cents-close matching, dotted rhythms, full hymn lines."
  };
  const KEY_BAND = "hs.band";
  function progressKey() {
    if (window.HS && typeof HS.progressKey === "function") return HS.progressKey("singing");
    return "hs.progress.standalone.singing";
  }
  const $ = (s, el) => (el || document).querySelector(s);
  const appEl = $("#app");

  function hashScreen() { return (location.hash || "#home").replace("#", "") || "home"; }
  function go(s) { location.hash = s; render(); window.scrollTo(0, 0); }
  function load() {
    try { return JSON.parse(localStorage.getItem(progressKey()) || "{}") || {}; } catch (e) { return {}; }
  }
  function save(p) {
    p.updatedAt = Date.now();
    localStorage.setItem(progressKey(), JSON.stringify(p));
  }
  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  const PITCH_START = { baby: "mid", toddler: "high", preschool: "c4", early: "g4", primary: "c5", upper: "e3" };
  const RHYTHM_START = { baby: "ta", toddler: "titi", preschool: "ta-titi", early: "rest", primary: "sync", upper: "dotted" };
  function defaultPitch(b) {
    const list = pitchesFor(b);
    const want = PITCH_START[b];
    return list.find((p) => p.id === want) || list[Math.min(1, list.length - 1)] || list[0];
  }
  function defaultRhythmIndex(b) {
    const list = SINGING.rhythm.filter((r) => ok(r, b));
    const want = RHYTHM_START[b];
    const i = list.findIndex((r) => r.id === want);
    return i >= 0 ? i : 0;
  }
  function prog() {
    const p = load();
    p.birds = p.birds || [];
    p.done = p.done || { pitch: {}, rhythm: {}, solfege: {}, songs: {} };
    p.mic = !!p.mic;
    return p;
  }
  function setProg(mut) { const p = prog(); mut(p); save(p); }
  function band() {
    const q = new URLSearchParams(location.search).get("band");
    if (q && BANDS.includes(q)) return q;
    const s = localStorage.getItem(KEY_BAND);
    return (s && BANDS.includes(s)) ? s : null;
  }
  function setBand(b) {
    localStorage.setItem(KEY_BAND, b);
    const url = new URL(location.href);
    url.searchParams.set("band", b);
    history.replaceState({}, "", url);
    document.body.className = "band-" + b;
    pitchTarget = defaultPitch(b);
    rhythmAt = defaultRhythmIndex(b);
  }
  function from(min) { return BANDS.slice(BANDS.indexOf(min)); }
  function ok(item, b) { return from(item.minBand || "baby").includes(b); }
  function url(path) {
    if (window.HS && window.HS.url) return window.HS.url(path);
    const base = document.documentElement.dataset.appBase || document.baseURI;
    return new URL(path, base).href;
  }
  function img(k) {
    return url(SINGING.images[k] || SINGING.images.forest);
  }

  function celebrate(title, sub) {
    $("#celebrate-title").textContent = title;
    $("#celebrate-sub").textContent = sub;
    $("#celebrate").classList.add("show");
    ForestSynth.chirp();
    setTimeout(() => $("#celebrate").classList.remove("show"), reduceMotion() ? 400 : 1400);
  }
  function addBird(id) {
    setProg((p) => { if (!p.birds.includes(id)) p.birds.push(id); });
    celebrate("A bird joined the choir.", "The canopy is louder now.");
  }

  function choirHtml() {
    const kinds = ["wren", "cardinal", "owl", "chick"];
    const n = Math.min(prog().birds.length, 16);
    if (!n) return '<p class="tiny">No choir yet. Match a pitch or finish a song and birds will perch.</p>';
    let h = '<div class="choir">';
    for (let i = 0; i < n; i++) h += `<div class="bird ${kinds[i % kinds.length]}"><span class="body"></span><span class="head"></span><span class="beak"></span></div>`;
    return h + "</div><p class='tiny'>" + n + " birds in the choir</p>";
  }

  function shell(inner) {
    const b = band();
    const label = SINGING.bands.find((x) => x.id === b).label;
    const screen = hashScreen();
    const hero = screen === "home"
      ? `<div class="hero">
      <img src="${img("forest")}" alt="Dawn light through a mossy forest canopy">
      <div class="caption">Birds join the choir as skills grow</div>
    </div>`
      : "";
    return `<header class="mast">
      <h1>Songbird Forest</h1>
      <button class="band-chip touchy" type="button" data-act="reband">${label}</button>
    </header>
    ${hero}
    ${inner}
    <nav class="dock" aria-label="Forest paths">
      <button type="button" data-go="home" class="${screen==="home"?"on":""}">Grove</button>
      <button type="button" data-go="pitch" class="${screen==="pitch"?"on":""}">Pitch</button>
      <button type="button" data-go="rhythm" class="${screen==="rhythm"?"on":""}">Beat</button>
      <button type="button" data-go="solfege" class="${screen==="solfege"?"on":""}">Solfege</button>
      <button type="button" data-go="songs" class="${screen==="songs"?"on":""}">Songs</button>
    </nav>`;
  }

  function picker() {
    appEl.innerHTML = `<div class="app">
      <div class="hero">
        <img src="${img("forest")}" alt="Mossy forest canopy at dawn">
        <div class="caption">A forest for finding your voice</div>
      </div>
      <div class="panel">
        <p class="kicker">Choose a perch</p>
        <h2>Which path through the trees?</h2>
        <p class="lead">Stage names only — no marks, no ages on the page.</p>
        <div class="picker">${SINGING.bands.map((b) =>
          `<button type="button" data-band="${b.id}"><strong>${b.label}</strong><span>${BLURB[b.id]}</span></button>`
        ).join("")}</div>
      </div>
    </div>`;
  }

  function home() {
    const p = prog();
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">The grove</p>
        <h2>Open your throat like a window</h2>
        <p class="lead">Match a pitch, keep a beat, climb Do–Re–Mi, and sing public-domain hymns. Original forest songs teach the skills. Nothing is uploaded. The mic stays on this device, and only if you allow it.</p>
        ${choirHtml()}
        <div class="grid" style="margin-top:12px">
          <button class="tile touchy" type="button" data-go="pitch"><span class="ico">Nest</span><strong>Pitch matching</strong></button>
          <button class="tile touchy" type="button" data-go="rhythm"><span class="ico">Grove</span><strong>Rhythm</strong></button>
          <button class="tile touchy" type="button" data-go="solfege"><span class="ico">Trail</span><strong>Solfege</strong></button>
          <button class="tile touchy" type="button" data-go="songs"><span class="ico">Hollow</span><strong>Hymns &amp; songs</strong></button>
        </div>
      </section>
      <section class="panel">
        <p class="tiny">Mic is ${p.mic && PitchMic.allowed ? "on (local only)" : "off"}. Public-domain hymns plus original learning songs. No class-copyrighted lyrics.</p>
      </section>
    `)}</div>`;
  }

  let pitchTarget = null;
  let pitchTimer = null;
  function pitchesFor(b) { return SINGING.pitches.filter((p) => ok(p, b)); }

  function pitchScreen() {
    const b = band();
    const list = pitchesFor(b);
    const p = prog();
    const t = pitchTarget && list.some((x) => x.id === pitchTarget.id) ? pitchTarget : defaultPitch(b);
    pitchTarget = t;
    const hz = ForestSynth.midiToHz(t.midi);
    const micOn = p.mic && PitchMic.allowed;
    const young = b === "baby" || b === "toddler";
    const meter = micOn
      ? `<div class="pitch-meter" id="meter">
          <div class="target" style="bottom:46%"></div>
          <div class="needle" id="needle" style="bottom:8%"></div>
        </div>
        <p class="pitch-readout" id="readout">Listening · target ${Math.round(hz)} Hz</p>`
      : `<p class="pitch-readout" id="readout">${young ? "Mic off · tap the matching bird" : "Mic off · tap High / Same / Low"}</p>`;
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">Pitch nest</p>
        <h2>${t.label}</h2>
        <img class="story-art" src="${img(t.img)}" alt="">
        <p class="lead">${young ? "Hear the bird. Tap the picture of the bird that sang." : "Hear the bird. Match with your voice, or tap High / Same / Low if the mic stays off."}</p>
        ${meter}
        <div class="mic-warn">The microphone is optional. If you allow it, sound is measured here only. It is never sent anywhere.</div>
        <div class="grid">
          <button class="btn sky touchy" type="button" data-act="hearpitch">Hear the bird</button>
          <button class="btn cardinal touchy" type="button" data-act="mic">${micOn ? "Stop mic" : "Allow mic (local)"}</button>
        </div>
        <p class="tiny">${young ? "Which bird sang? (works with no mic)" : "Which call matches? (works with no mic)"}</p>
        <div class="grid ${young ? "birds" : ""}" id="match-birds"></div>
        <div class="list" style="margin-top:10px">
          ${list.map((x) => `<button class="row ${x.id===t.id?"done":""} touchy" type="button" data-pitch="${x.id}">${x.label}</button>`).join("")}
        </div>
      </section>
    `)}</div>`;
    const box = $("#match-birds");
    if (box && young) {
      const birds = [
        { img: "owl", name: "Owl", midi: 52 },
        { img: "wren", name: "Wren", midi: 60 },
        { img: "cardinal", name: "Cardinal", midi: 72 }
      ];
      box.innerHTML = birds.map((bird) => {
        const midi = bird.img === t.img ? t.midi : bird.midi;
        return `<button class="choice bird-pick touchy" type="button" data-match="${midi}" data-right="${t.midi}"><img src="${img(bird.img)}" alt="${bird.name}"></button>`;
      }).join("");
    } else if (box) {
      const choices = [t.midi - 5, t.midi, t.midi + 7];
      for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
      }
      box.innerHTML = choices.map((m) => {
        const label = m < t.midi ? "Low" : m > t.midi ? "High" : "Same";
        return `<button class="choice touchy" type="button" data-match="${m}" data-right="${t.midi}">${label}</button>`;
      }).join("");
    }
    startMeter();
    if (b === "baby") {
      heardPitch = true;
      ForestSynth.playNote(t.midi, 0.8);
    }
  }

  function startMeter() {
    if (pitchTimer) cancelAnimationFrame(pitchTimer);
    const needle = $("#needle");
    const readout = $("#readout");
    if (!needle) return;
    const loop = () => {
      if (!PitchMic.allowed || !pitchTarget) return;
      const r = PitchMic.read();
      const target = ForestSynth.midiToHz(pitchTarget.midi);
      if (r.hz && r.confidence > 0.2) {
        const cents = PitchMic.centsOff(r.hz, target);
        const y = Math.max(6, Math.min(88, 46 - cents / 4));
        needle.style.bottom = y + "%";
        readout.textContent = Math.round(r.hz) + " Hz · " + (cents > 0 ? "+" : "") + Math.round(cents) + " cents";
        if (Math.abs(cents) < (band() === "upper" ? 40 : 80) && r.confidence > 0.25) {
          readout.textContent += " · in the nest";
        }
      } else {
        readout.textContent = "Listening… sing toward the leaf line";
      }
      pitchTimer = requestAnimationFrame(loop);
    };
    if (PitchMic.allowed) loop();
  }

  let rhythmTimer = null;
  function rhythmScreen() {
    const b = band();
    const list = SINGING.rhythm.filter((r) => ok(r, b));
    const r = list[Math.min(rhythmAt, list.length - 1)];
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">Rhythm grove</p>
        <h2>${r.name}</h2>
        <p class="lead">Hear the woodpecker. Tap the pad on the sounds, rest on the hush.</p>
        <p class="tiny">${r.say}</p>
        <div class="tap-row"><button class="tap-pad touchy" type="button" id="pad" data-act="tap">Tap</button></div>
        <div class="staff" id="rhythm-vis"></div>
        <div class="grid">
          <button class="btn sky touchy" type="button" data-act="playrhythm">Play pattern</button>
          <button class="btn primary touchy" type="button" data-act="checkrhythm">I kept the beat</button>
          <button class="btn touchy" type="button" data-act="prevr">Back</button>
          <button class="btn touchy" type="button" data-act="nextr">Next pattern</button>
        </div>
      </section>
    `)}</div>`;
    drawRhythm(r);
  }
  let rhythmAt = 0;
  let taps = [];
  let expectedTaps = [];
  const heardSong = {};
  let heardPitch = false;
  let solTapped = false;
  let initedBand = null;
  function drawRhythm(r) {
    const el = $("#rhythm-vis");
    if (!el) return;
    el.innerHTML = r.pattern.map((d, i) => {
      const left = 8 + i * (80 / Math.max(4, r.pattern.length));
      if (d === 0) return "";
      return `<span class="note-dot" style="left:${left}%; top:${d < 1 ? 28 : 48}px"></span>`;
    }).join("");
  }
  function playRhythm() {
    const b = band();
    const list = SINGING.rhythm.filter((r) => ok(r, b));
    const r = list[Math.min(rhythmAt, list.length - 1)];
    const bpm = b === "baby" || b === "toddler" ? 70 : 90;
    const beat = 60 / bpm;
    const pad = $("#pad");
    taps = [];
    expectedTaps = [];
    const origin = performance.now() + 40;
    let t = 0;
    r.pattern.forEach((d) => {
      const dur = (d === 0 ? 1 : d) * beat * 1000;
      if (d !== 0) {
        expectedTaps.push(origin + t);
        setTimeout(() => {
          ForestSynth.click(d >= 1);
          if (pad) { pad.classList.add("pulse"); setTimeout(() => pad.classList.remove("pulse"), 120); }
        }, t);
      }
      t += dur;
    });
  }
  function scoreRhythm() {
    const need = expectedTaps.length;
    if (!need || taps.length < need) return false;
    const got = taps.slice(0, need);
    const g0 = got[0];
    const e0 = expectedTaps[0];
    const tol = 280;
    return got.every((g, i) => Math.abs((g - g0) - (expectedTaps[i] - e0)) < tol);
  }

  function solfegeScreen() {
    const b = band();
    let notes = SINGING.solfege;
    if (b === "baby" || b === "toddler") notes = notes.filter((n) => ["Do", "Sol", "high Do"].includes(n.syl) || n.syl === "Mi" && b !== "baby");
    if (b === "baby") notes = SINGING.solfege.filter((n) => ["Do", "Sol"].includes(n.syl));
    if (b === "preschool") notes = SINGING.solfege.filter((n) => ["Do", "Re", "Mi", "Sol", "high Do"].includes(n.syl));
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">Solfege trail</p>
        <h2>Climb the branch</h2>
        <img class="story-art" src="${img("path")}" alt="Fern forest path">
        <p class="lead">Tap a syllable. Hear it. Then climb Do to Do. Original song “Climb the Branch” — not a copyrighted movie lyric.</p>
        <div class="solfege">
          ${notes.map((n) => `<button type="button" class="touchy" data-sol="${n.syl}">${n.syl}</button>`).join("")}
        </div>
        <p class="tiny" id="sol-hint">Hand sign waits beside the perch.</p>
        <div class="grid" style="margin-top:10px">
          <button class="btn sky touchy" type="button" data-act="scaleup">Climb up</button>
          <button class="btn touchy" type="button" data-act="scaledown">Climb down</button>
          <button class="btn primary wide touchy" type="button" data-act="solfege-done">The choir learned this</button>
        </div>
      </section>
    `)}</div>`;
  }

  function songsScreen() {
    const b = band();
    const hymns = SINGING.songs.filter((s) => s.kind === "hymn" && ok(s, b));
    if (b === "upper") {
      hymns.sort((a, c) => (a.id === "come-thou-fount" ? -1 : c.id === "come-thou-fount" ? 1 : 0));
    }
    const tunes = SINGING.songs.filter((s) => s.kind === "tune" && ok(s, b));
    const orig = SINGING.songs.filter((s) => s.kind === "original" && ok(s, b));
    const kindLabel = (s) => (s.kind === "hymn" ? "hymn" : s.kind === "tune" ? "teaching tune" : "original");
    const row = (s) => `<button class="row ${prog().done.songs[s.id]?"done":""} touchy" type="button" data-song="${s.id}">
      <span>${s.title}</span><span class="tiny">${kindLabel(s)}</span>
    </button>`;
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">Hymn hollow</p>
        <h2>Public-domain hymns</h2>
        <p class="lead">Melodies are played by the device, not by a recording. Lyrics are old enough to share.</p>
        <div class="list">${hymns.map(row).join("")}</div>
      </section>
      ${tunes.length ? `<section class="panel">
        <p class="kicker">Practice perch</p>
        <h2>Teaching tunes</h2>
        <p class="lead">Pitch games, not church hymns.</p>
        <div class="list">${tunes.map(row).join("")}</div>
      </section>` : ""}
      <section class="panel">
        <p class="kicker">Forest school</p>
        <h2>Original learning songs</h2>
        <div class="list">${orig.map(row).join("")}</div>
      </section>
    `)}</div>`;
  }

  function songView(id) {
    const s = SINGING.songs.find((x) => x.id === id);
    if (!s) return songsScreen();
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">${s.kind === "hymn" ? "Hymn" : s.kind === "tune" ? "Teaching tune" : "Original song"}</p>
        <img class="story-art" src="${img(s.img)}" alt="">
        <h2>${s.title}</h2>
        <p class="tiny">${s.source}</p>
        <p class="lyrics" id="lyrics">${s.lyrics.split("\n").map((ln) => `<span>${ln}</span>`).join("\n")}</p>
        <div class="grid">
          <button class="btn sky touchy" type="button" data-act="playsong" data-songid="${s.id}">Play melody</button>
          <button class="btn olive touchy" type="button" data-speak="${encodeURIComponent(s.title + ". " + s.lyrics)}">Hear words</button>
          <button class="btn primary wide touchy" type="button" data-songdone="${s.id}">I echoed the call</button>
          <button class="btn wide touchy" type="button" data-go="songs">All songs</button>
        </div>
      </section>
    `)}</div>`;
  }

  function render() {
    window.scrollTo(0, 0);
    const b = band();
    if (!b) { picker(); return; }
    if (initedBand !== b) {
      pitchTarget = defaultPitch(b);
      rhythmAt = defaultRhythmIndex(b);
      initedBand = b;
    }
    document.body.className = "band-" + b;
    const sc = hashScreen();
    if (sc.startsWith("song/")) return songView(sc.slice(5));
    if (sc === "pitch") return pitchScreen();
    if (sc === "rhythm") return rhythmScreen();
    if (sc === "solfege") return solfegeScreen();
    if (sc === "songs") return songsScreen();
    home();
  }

  document.body.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-band],[data-go],[data-act],[data-pitch],[data-guess],[data-match],[data-sol],[data-song],[data-songdone],[data-speak],[data-songid]");
    if (!t) {
      if (e.target.closest("#pad")) taps.push(performance.now());
      return;
    }
    if (t.dataset.band) { setBand(t.dataset.band); go("home"); return; }
    if (t.dataset.go) { go(t.dataset.go); return; }
    if (t.dataset.act === "reband") {
      localStorage.removeItem(KEY_BAND);
      const url = new URL(location.href);
      url.searchParams.delete("band");
      history.replaceState({}, "", url);
      picker();
      return;
    }
    if (t.dataset.act === "tap") {
      taps.push(performance.now());
      return;
    }
    if (t.dataset.act === "hearpitch") {
      heardPitch = true;
      ForestSynth.playNote(pitchTarget.midi, 0.8);
      return;
    }
    if (t.dataset.act === "mic") {
      try {
        if (PitchMic.allowed) {
          PitchMic.stop();
          setProg((p) => { p.mic = false; });
        } else {
          await PitchMic.request();
          setProg((p) => { p.mic = true; });
        }
      } catch (err) {
        const young = band() === "baby" || band() === "toddler";
        celebrate("Mic stayed off.", young ? "You can still tap the matching bird." : "You can still tap High, Same, or Low.");
      }
      pitchScreen();
      return;
    }
    if (t.dataset.pitch) {
      pitchTarget = SINGING.pitches.find((x) => x.id === t.dataset.pitch);
      heardPitch = false;
      pitchScreen();
      return;
    }
    if (t.dataset.match) {
      const midi = Number(t.dataset.match);
      ForestSynth.playNote(midi, 0.5);
      if (!heardPitch && !(prog().mic && PitchMic.allowed)) {
        const young = band() === "baby" || band() === "toddler";
        celebrate("Hear the bird first.", young ? "Echo the call, then tap the matching bird." : "Echo the call, then tap High, Same, or Low.");
        return;
      }
      if (midi === Number(t.dataset.right)) {
        t.classList.add("right");
        setProg((p) => { p.done.pitch[pitchTarget.id] = true; });
        addBird("pitch-" + pitchTarget.id);
      } else {
        t.classList.add("wrong");
        ForestSynth.miss();
      }
      return;
    }
    if (t.dataset.act === "playrhythm") { playRhythm(); return; }
    if (t.dataset.act === "checkrhythm") {
      if (!scoreRhythm()) {
        ForestSynth.miss();
        celebrate("Keep the woodpecker’s beat.", "Hear the pattern, then tap with it.");
        return;
      }
      setProg((p) => { p.done.rhythm[String(rhythmAt)] = true; });
      addBird("rhythm-" + rhythmAt);
      return;
    }
    if (t.dataset.act === "nextr") {
      const list = SINGING.rhythm.filter((r) => ok(r, band()));
      rhythmAt = (rhythmAt + 1) % list.length;
      rhythmScreen();
      return;
    }
    if (t.dataset.act === "prevr") {
      const list = SINGING.rhythm.filter((r) => ok(r, band()));
      rhythmAt = (rhythmAt - 1 + list.length) % list.length;
      rhythmScreen();
      return;
    }
    if (t.dataset.sol) {
      const n = SINGING.solfege.find((x) => x.syl === t.dataset.sol);
      solTapped = true;
      ForestSynth.playNote(n.midi, 0.55);
      ForestSynth.speak(n.syl);
      const hint = $("#sol-hint");
      if (hint) hint.textContent = n.syl + " — " + n.hint + " " + n.hand;
      document.querySelectorAll(".solfege button").forEach((b) => b.classList.toggle("on", b.dataset.sol === n.syl));
      return;
    }
    if (t.dataset.act === "scaleup") {
      solTapped = true;
      const notes = SINGING.solfege;
      notes.forEach((n, i) => setTimeout(() => ForestSynth.playNote(n.midi, 0.35), i * 380));
      return;
    }
    if (t.dataset.act === "scaledown") {
      solTapped = true;
      const notes = SINGING.solfege.slice().reverse();
      notes.forEach((n, i) => setTimeout(() => ForestSynth.playNote(n.midi, 0.35), i * 380));
      return;
    }
    if (t.dataset.act === "solfege-done") {
      if (!solTapped) {
        celebrate("Climb a perch first.", "Tap a syllable or climb the scale, then a bird may join.");
        return;
      }
      setProg((p) => { p.done.solfege.scale = true; });
      addBird("solfege");
      return;
    }
    if (t.dataset.song) { go("song/" + t.dataset.song); return; }
    if (t.dataset.act === "playsong") {
      const s = SINGING.songs.find((x) => x.id === t.dataset.songid);
      heardSong[s.id] = true;
      ForestSynth.playMelody(s.melody, s.bpm, (i) => {
        const el = $("#lyrics");
        if (!el) return;
        const lines = s.lyrics.split("\n");
        const line = Math.min(lines.length - 1, Math.floor(i * lines.length / s.melody.length));
        el.innerHTML = lines.map((ln, li) => `<span class="${li === line ? "on" : ""}">${ln}</span>`).join("\n");
      });
      return;
    }
    if (t.dataset.songdone) {
      if (!heardSong[t.dataset.songdone]) {
        celebrate("Hear it first.", "Play the melody, echo the call, then a bird may join.");
        return;
      }
      setProg((p) => { p.done.songs[t.dataset.songdone] = true; });
      addBird(t.dataset.songdone);
      return;
    }
    if (t.dataset.speak) {
      ForestSynth.speak(decodeURIComponent(t.dataset.speak));
    }
  });

  window.addEventListener("hashchange", render);
  if (document.documentElement.dataset.runner !== "1" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  render();
})();
