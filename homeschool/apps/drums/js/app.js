/* Drum Line Shed. Clock, judging, and screen changes use the audio clock and rAF. */
(function (global) {
  "use strict";

  const BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"];
  const BAND_LABEL = {
    baby: "Baby",
    toddler: "Toddler",
    preschool: "Preschool",
    early: "Early",
    primary: "Primary",
    upper: "Upper"
  };
  const PRAISE = [
    "You found the line. The bright notes are the ones your hands met.",
    "Steady hands. Those lit notes stayed with the pattern.",
    "The shed kept your good taps. They are the notes still shining."
  ];
  const KEEP = [
    "The clicks are still here. Listen once, then tap with them.",
    "Leave the rests quiet, and tap when a note arrives.",
    "Try the line again. The drum will wait for your hands."
  ];

  const state = {
    band: "",
    screen: "pick",
    exercise: null,
    phase: "ready",
    notes: [],
    totalBeats: 0,
    t0: 0,
    beatDur: 1,
    page: 0,
    raf: 0,
    metro: true,
    lastJudge: "",
    tapWord: "",
    shownCount: "",
    endText: "",
    stampedThis: false,
    lineupClicks: [],
    lineupTaps: [],
    lineupMsg: "Tap the pad each time you hear a click.",
    lineupMs: null
  };
  const downs = new Set();

  function esc(text) {
    return String(text == null ? "" : text).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function young(band) {
    return band === "baby" || band === "toddler" || band === "preschool" || band === "early";
  }

  function linesFor(band) {
    return (global.DRUM_LINES || []).filter(function (ex) {
      return ex.bands.indexOf(band) !== -1;
    });
  }

  function windowsFor(band) {
    if (band === "upper") return { perfect: 0.06, good: 0.13 };
    if (band === "primary") return { perfect: 0.075, good: 0.15 };
    if (band === "early") return { perfect: 0.09, good: 0.18 };
    return { perfect: 0.1, good: 0.2 };
  }

  function latencySec() {
    let ms = 0;
    try { ms = Number(localStorage.getItem("hs.drums.latencyMs")) || 0; } catch (e) { ms = 0; }
    if (!isFinite(ms)) ms = 0;
    if (ms > 250) ms = 250;
    if (ms < -250) ms = -250;
    return ms / 1000;
  }

  function loadProgress() {
    try {
      if (global.HS && typeof global.HS.readProgress === "function") return global.HS.readProgress("drums") || {};
      return JSON.parse(localStorage.getItem("hs.progress.drums") || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveProgress(data) {
    if (global.HS && typeof global.HS.writeProgress === "function") global.HS.writeProgress("drums", data);
    else {
      data.updatedAt = new Date().toISOString();
      try { localStorage.setItem("hs.progress.drums", JSON.stringify(data)); } catch (e) {}
    }
  }

  function readBand() {
    const q = new URLSearchParams(global.location.search).get("band");
    if (BANDS.indexOf(q) !== -1) return q;
    try {
      const stored = localStorage.getItem("hs.band");
      if (BANDS.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    return "";
  }

  function speak(text) {
    if (!text || global.DrumAudio.muted()) return;
    try {
      if (global.HS && typeof global.HS.speak === "function") global.HS.speak(text);
      else if (global.speechSynthesis && global.SpeechSynthesisUtterance) {
        const u = new global.SpeechSynthesisUtterance(text);
        u.rate = 0.92;
        global.speechSynthesis.cancel();
        global.speechSynthesis.speak(u);
      }
    } catch (e) {}
  }

  function cancelSpeech() {
    try {
      if (global.HS && typeof global.HS.silence === "function") global.HS.silence();
      else if (global.speechSynthesis) global.speechSynthesis.cancel();
    } catch (e) {}
  }

  function cancelFrame() {
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
  }

  function stopQuiet() {
    cancelFrame();
    global.DrumAudio.stopAll();
    cancelSpeech();
    state.phase = "ready";
  }

  function prepare() {
    let beat = 0;
    const notes = (state.exercise && state.exercise.notes) || [];
    state.notes = notes.map(function (n, i) {
      const row = {
        i: i,
        beats: n.beats,
        rest: !!n.rest,
        dynamic: n.rest ? null : n.dynamic,
        onset: beat,
        time: null,
        judge: ""
      };
      beat += n.beats;
      return row;
    });
    state.totalBeats = beat;
    state.page = 0;
    state.t0 = 0;
    state.tapWord = "";
    state.shownCount = "";
    state.endText = "";
    state.stampedThis = false;
    state.lastJudge = "";
  }

  function adoptBand(band) {
    state.band = band;
    try {
      if (global.HS && typeof global.HS.setBand === "function") global.HS.setBand(band);
      else localStorage.setItem("hs.band", band);
    } catch (e) {}
    const list = linesFor(band);
    const saved = loadProgress().lastId;
    state.exercise = list.filter(function (ex) { return ex.id === saved; })[0] || list[0];
    prepare();
    state.phase = "ready";
    state.screen = "play";
  }

  function setLive(text) {
    const el = document.getElementById("live");
    if (el && el.textContent !== text) el.textContent = text;
  }

  function setMarker(i, word) {
    const text = document.querySelector('#app .marker[data-i="' + i + '"]');
    if (text) {
      text.textContent = word;
      const fill = word === "Perfect" ? "#1f6a45" : word === "Good" ? "#8a4e12" : "#7a3030";
      text.setAttribute("fill", fill);
      text.setAttribute("data-judge", word);
    }
    const head = document.querySelector('#app .head[data-i="' + i + '"]');
    if (head && (word === "Perfect" || word === "Good")) {
      const fill = word === "Perfect" ? "#1f6a45" : "#d4783a";
      head.setAttribute("fill", fill);
      head.setAttribute("stroke", fill);
    }
  }

  function mark(i, word) {
    const note = state.notes[i];
    if (!note || note.judge) return;
    note.judge = word;
    state.lastJudge = word;
    setMarker(i, word);
    setLive(word);
  }

  function judge(now) {
    const win = windowsFor(state.band);
    const adj = now - latencySec();
    let best = null;
    let bestAbs = Infinity;
    state.notes.forEach(function (n) {
      if (n.rest || n.judge || n.time == null) return;
      const ad = Math.abs(adj - n.time);
      if (ad < bestAbs) { bestAbs = ad; best = n; }
    });
    if (!best || bestAbs > win.good) {
      state.lastJudge = "Miss";
      state.tapWord = "Miss";
      setLive("Miss");
      return "Miss";
    }
    const word = bestAbs <= win.perfect ? "Perfect" : "Good";
    mark(best.i, word);
    state.tapWord = word;
    return word;
  }

  function sweep(now) {
    const win = windowsFor(state.band);
    const adj = now - latencySec();
    state.notes.forEach(function (n) {
      if (n.rest || n.judge || n.time == null) return;
      if (adj > n.time + win.good) mark(n.i, "Miss");
    });
  }

  function pieceOver(now) {
    if (!state.t0 || !state.notes.length) return false;
    const win = windowsFor(state.band);
    let last = state.t0;
    state.notes.forEach(function (n) {
      if (!n.rest && n.time != null && n.time > last) last = n.time;
    });
    const end = Math.max(last + win.good, state.t0 + state.totalBeats * state.beatDur);
    return now > end + 0.02;
  }

  function mountStaff(turn) {
    const host = document.getElementById("staff-host");
    if (!host || !state.exercise) return;
    if (state.phase === "done") {
      host.innerHTML = global.DrumStaff.summarySVG(state.notes, state.totalBeats);
      return;
    }
    const pageNotes = state.notes.filter(function (n) {
      return Math.floor(n.onset / 4) === state.page;
    });
    const raw = state.t0 && state.beatDur ? (global.DrumAudio.now() - state.t0) / state.beatDur : 0;
    const inPage = raw < 0 ? 0 : Math.min(3.999, raw - state.page * 4);
    host.innerHTML = global.DrumStaff.pageSVG(pageNotes, raw < 0 ? 0 : inPage, !!turn);
  }

  function movePlayhead(beatInPage) {
    const x = global.DrumStaff.xForBeat(beatInPage);
    const line = document.getElementById("playhead");
    if (!line) return;
    line.setAttribute("x1", String(x));
    line.setAttribute("x2", String(x));
  }

  function countNumber(raw) {
    if (raw >= 0) return "";
    let n = Math.floor(raw + 4) + 1;
    if (n < 1) n = 1;
    if (n > 4) n = 4;
    return String(n);
  }

  function updateHud(raw) {
    const el = document.getElementById("count");
    if (!el || state.phase !== "run") return;
    if (raw < 0) {
      const num = countNumber(raw);
      el.textContent = num;
      el.className = "count is-num";
      if (num !== state.shownCount) {
        state.shownCount = num;
        setLive(num);
      }
      return;
    }
    if (state.tapWord) {
      el.textContent = state.tapWord;
      el.className = "count is-word word-" + state.tapWord.toLowerCase();
    } else {
      el.textContent = "";
      el.className = "count";
    }
  }

  function frame() {
    if (state.phase !== "run") return;
    const now = global.DrumAudio.now();
    const raw = state.beatDur ? (now - state.t0) / state.beatDur : 0;
    const pageCount = Math.max(1, Math.ceil(state.totalBeats / 4));
    const page = raw < 0 ? 0 : Math.min(pageCount - 1, Math.floor(raw / 4));
    if (page !== state.page) {
      state.page = page;
      mountStaff(true);
    } else if (raw >= 0) {
      movePlayhead(Math.min(3.999, raw - page * 4));
    }
    updateHud(raw);
    sweep(now);
    if (pieceOver(now)) {
      finish();
      return;
    }
    state.raf = requestAnimationFrame(frame);
  }

  function beginPiece() {
    if (!state.exercise) return;
    cancelFrame();
    global.DrumAudio.stopAll();
    prepare();
    const ctx = global.DrumAudio.ensure();
    if (!ctx) {
      state.phase = "ready";
      state.endText = "This browser needs Web Audio so the line can keep time.";
      paint();
      return;
    }
    const beat = 60 / state.exercise.bpm;
    const first = ctx.currentTime + 0.08;
    const t0 = first + 4 * beat;
    state.beatDur = beat;
    state.t0 = t0;
    state.notes.forEach(function (n) { n.time = t0 + n.onset * beat; });
    for (let c = 0; c < 4; c++) global.DrumAudio.scheduleClick(first + c * beat, "count");
    const clicks = Math.round(state.totalBeats);
    for (let b = 0; b < clicks; b++) global.DrumAudio.scheduleClick(t0 + b * beat, "metro");
    global.DrumAudio.setMetro(state.metro);
    state.phase = "run";
    state.screen = "play";
    const prog = loadProgress();
    prog.lastId = state.exercise.id;
    saveProgress(prog);
    paint();
    state.raf = requestAnimationFrame(frame);
  }

  function finish() {
    if (state.phase !== "run") return;
    cancelFrame();
    global.DrumAudio.stopAll();
    state.phase = "done";
    const hits = state.notes.filter(function (n) {
      return n.judge === "Perfect" || n.judge === "Good";
    });
    const list = linesFor(state.band);
    const idx = Math.max(0, list.findIndex(function (ex) { return ex.id === state.exercise.id; }));
    state.stampedThis = hits.length > 0;
    const prog = loadProgress();
    prog.lastId = state.exercise.id;
    prog.stamps = prog.stamps || {};
    if (hits.length > 0) {
      if (!prog.stamps[state.exercise.id]) prog.stamps[state.exercise.id] = new Date().toISOString();
      state.endText = PRAISE[idx % PRAISE.length] + " A shed stamp is saved.";
    } else {
      state.endText = KEEP[idx % KEEP.length];
    }
    saveProgress(prog);
    paint();
    speak(state.endText);
  }

  function stopToReady() {
    stopQuiet();
    if (state.exercise) prepare();
    state.screen = "play";
    paint();
  }

  function lineupFrame() {
    if (state.phase !== "lineup") return;
    const last = state.lineupClicks[state.lineupClicks.length - 1] || 0;
    if (global.DrumAudio.now() > last + 0.7) {
      finishLineup();
      return;
    }
    state.raf = requestAnimationFrame(lineupFrame);
  }

  function median(values) {
    const copy = values.slice().sort(function (a, b) { return a - b; });
    const mid = Math.floor(copy.length / 2);
    if (copy.length % 2) return copy[mid];
    return (copy[mid - 1] + copy[mid]) / 2;
  }

  function pairOffsets(clicks, taps) {
    const used = {};
    const offsets = [];
    taps.forEach(function (tap) {
      let best = -1;
      let bestD = 0.35;
      clicks.forEach(function (click, i) {
        if (used[i]) return;
        const d = Math.abs(tap - click);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best >= 0) {
        used[best] = true;
        offsets.push((tap - clicks[best]) * 1000);
      }
    });
    return offsets;
  }

  function beginLineup() {
    cancelFrame();
    global.DrumAudio.stopAll();
    const ctx = global.DrumAudio.unlockSync();
    const start = function () {
      const audio = global.DrumAudio.ensure();
      if (!audio) {
        state.lineupMsg = "This browser needs Web Audio to line up taps.";
        state.phase = "ready";
        paint();
        return;
      }
      const beat = 60 / 72;
      const first = audio.currentTime + 0.12;
      state.lineupClicks = [];
      for (let i = 0; i < 8; i++) state.lineupClicks.push(first + i * beat);
      state.lineupTaps = [];
      state.lineupMs = null;
      state.lineupMsg = "Tap with each click.";
      state.phase = "lineup";
      state.lineupClicks.forEach(function (t) { global.DrumAudio.scheduleClick(t, "count"); });
      paint();
      state.raf = requestAnimationFrame(lineupFrame);
    };
    if (ctx && ctx.state !== "running") ctx.resume().then(start);
    else start();
  }

  function finishLineup() {
    cancelFrame();
    global.DrumAudio.stopAll();
    state.phase = "ready";
    const offsets = pairOffsets(state.lineupClicks, state.lineupTaps);
    if (offsets.length < 4) {
      state.lineupMs = null;
      state.lineupMsg = "Tap along with more of the clicks, then try the lineup again.";
    } else {
      const ms = Math.max(-250, Math.min(250, Math.round(median(offsets))));
      state.lineupMs = ms;
      state.lineupMsg = "The lineup shift is " + ms + " milliseconds. Save it if the clicks and your taps felt together.";
    }
    paint();
  }

  function saveLineup() {
    if (state.lineupMs == null) return;
    try { localStorage.setItem("hs.drums.latencyMs", String(state.lineupMs)); } catch (e) {}
    const prog = loadProgress();
    prog.latencyMs = state.lineupMs;
    saveProgress(prog);
    state.lineupMsg = "Saved on this phone. The drum line will meet your taps.";
    paint();
  }

  function onPad(now) {
    if (state.phase === "lineup") {
      state.lineupTaps.push(now);
      global.DrumAudio.playSnare(now);
      return;
    }
    if (state.phase === "run" && state.t0) {
      const raw = (now - state.t0) / state.beatDur;
      const win = windowsFor(state.band);
      if (raw >= -((win.good / state.beatDur) + 0.02)) judge(now);
    }
    global.DrumAudio.playSnare(now);
  }

  function banner() {
    return '<p class="untested-banner" role="note">Untested, awaiting parent test.</p>';
  }

  function muteLabel() {
    return global.DrumAudio.muted() ? "Sound off" : "Sound on";
  }

  function appBar() {
    const pressed = global.DrumAudio.muted() ? "true" : "false";
    return '<header class="app-bar">' +
      '<p class="brand">Drum Line Shed</p>' +
      '<button type="button" id="mute" data-act="mute" aria-pressed="' + pressed + '">' + muteLabel() + "</button>" +
      '<button type="button" id="band" data-act="band">' + esc(BAND_LABEL[state.band] || "Band") + "</button>" +
      "</header>";
  }

  function drumPad() {
    return '<div id="pad" class="pad" role="button" tabindex="0" aria-label="Snare drum pad">' +
      '<div class="drum" aria-hidden="true"><div class="drum-head"></div></div></div>';
  }

  function playStage() {
    const ex = state.exercise;
    const startLabel = state.phase === "run" ? "Stop" : state.phase === "done" ? "Again" : "Start";
    const metroPressed = state.metro ? "true" : "false";
    const metroLabel = state.metro ? "Clicks on" : "Clicks off";
    const list = linesFor(state.band);
    const idx = list.findIndex(function (item) { return item.id === ex.id; });
    const hasNext = idx >= 0 && idx < list.length - 1;
    let tools = '<div class="tools">';
    tools += '<button type="button" id="patterns" data-act="patterns">Patterns</button>';
    if (state.phase === "done") {
      tools += '<button type="button" id="start" data-act="start">' + startLabel + "</button>";
      if (hasNext) tools += '<button type="button" id="next" data-act="next">Next</button>';
    } else {
      tools += '<button type="button" id="metro" data-act="metro" aria-pressed="' + metroPressed + '">' + metroLabel + "</button>";
      tools += '<button type="button" id="start" data-act="start">' + startLabel + "</button>";
    }
    tools += "</div>";
    return '<div class="stage">' +
      '<section class="staff-pane" aria-label="Snare chart">' +
      '<h1 class="chart-title"><span>' + esc(ex.title) + "</span><span>" + esc(ex.bpm) + " BPM</span></h1>" +
      (state.endText ? "" : '<p class="blurb">' + esc(ex.blurb) + "</p>") +
      '<div class="staff-view"><p id="count" class="count" aria-hidden="true"></p><div id="staff-host"></div></div>' +
      (state.endText ? '<p class="end-line">' + esc(state.endText) + "</p>" : "") +
      tools +
      "</section>" +
      drumPad() +
      "</div>";
  }

  function pickStage() {
    const buttons = BANDS.map(function (band) {
      return '<button type="button" class="band-btn" data-act="pick-band" data-band="' + band + '">' +
        esc(BAND_LABEL[band]) + "</button>";
    }).join("");
    return '<div class="stage"><div class="sheet" id="bands">' +
      "<h1>Choose a band</h1>" +
      '<p class="lede">Pick who is playing. The drum line changes with the band.</p>' +
      buttons +
      "</div></div>";
  }

  function patternStage() {
    const prog = loadProgress();
    const stamps = prog.stamps || {};
    const buttons = linesFor(state.band).map(function (ex) {
      const stamp = stamps[ex.id] ? '<span class="stamp">Stamp</span>' : "";
      return '<button type="button" class="line-btn" data-act="pick-line" data-id="' + esc(ex.id) + '">' +
        "<strong>" + esc(ex.title) + "</strong>" + stamp +
        "<small>" + esc(ex.bpm) + " BPM</small></button>";
    }).join("");
    return '<div class="stage"><div class="sheet">' +
      '<button type="button" id="back" data-act="back">Back to the drum</button>' +
      '<button type="button" data-act="lineup">Line up taps</button>' +
      "<h1>Set list</h1>" +
      buttons +
      "<blockquote><p>Make a joyful noise unto the LORD, all ye lands.</p><cite>Psalm 100:1, KJV</cite></blockquote>" +
      "</div></div>";
  }

  function lineupStage() {
    const save = state.lineupMs == null ? "" :
      '<button type="button" data-act="save-lineup">Save lineup</button>';
    return '<div class="stage">' +
      '<div class="sheet">' +
      '<button type="button" id="back" data-act="back">Back to the drum</button>' +
      "<h1>Line up taps</h1>" +
      "<p class=\"lede\">You will hear eight clicks. Tap the pad with each click. We store the shift on this phone.</p>" +
      '<p class="end-line" id="lineup-msg">' + esc(state.lineupMsg) + "</p>" +
      '<button type="button" id="lineup-go" data-act="lineup-go">Hear the clicks</button>' +
      save +
      "</div>" +
      drumPad() +
      "</div>";
  }

  function paint() {
    try { global.scrollTo(0, 0); } catch (e) {}
    const app = document.getElementById("app");
    if (!app) return;
    app.className = "band-" + (state.band || "none");
    app.setAttribute("data-screen", state.screen);
    app.setAttribute("data-phase", state.phase);
    let body = banner();
    body += '<a class="skip" href="' + (state.screen === "pick" ? "#bands" : "#pad") + '">Skip to the drum</a>';
    body += '<p id="live" class="sr-only" aria-live="polite"></p>';
    body += '<div class="shell">';
    if (state.screen !== "pick") body += appBar();
    if (state.screen === "pick") body += pickStage();
    else if (state.screen === "patterns") body += patternStage();
    else if (state.screen === "lineup") body += lineupStage();
    else body += playStage();
    body += "</div>";
    app.innerHTML = body;
    if (state.screen === "play") mountStaff(false);
  }

  function onStart() {
    if (state.phase === "run") {
      stopToReady();
      return;
    }
    if (young(state.band) && state.exercise) speak(state.exercise.audioText);
    const ctx = global.DrumAudio.unlockSync();
    if (ctx && ctx.state !== "running") ctx.resume().then(beginPiece);
    else beginPiece();
  }

  function openPatterns() {
    stopQuiet();
    if (state.exercise) prepare();
    state.screen = "patterns";
    paint();
  }

  function backToPlay() {
    stopQuiet();
    if (state.exercise) prepare();
    state.screen = "play";
    state.phase = "ready";
    paint();
  }

  function chooseBand(band) {
    if (BANDS.indexOf(band) === -1) return;
    stopQuiet();
    adoptBand(band);
    paint();
  }

  function chooseLine(id) {
    const found = linesFor(state.band).filter(function (ex) { return ex.id === id; })[0];
    if (!found) return;
    stopQuiet();
    state.exercise = found;
    prepare();
    state.screen = "play";
    state.phase = "ready";
    paint();
  }

  function goNext() {
    const list = linesFor(state.band);
    const idx = list.findIndex(function (ex) { return state.exercise && ex.id === state.exercise.id; });
    if (idx < 0 || idx >= list.length - 1) {
      openPatterns();
      return;
    }
    state.exercise = list[idx + 1];
    prepare();
    state.screen = "play";
    const ctx = global.DrumAudio.unlockSync();
    if (ctx && ctx.state !== "running") ctx.resume().then(beginPiece);
    else beginPiece();
  }

  function toggleMetro() {
    state.metro = !state.metro;
    global.DrumAudio.setMetro(state.metro);
    const btn = document.getElementById("metro");
    if (!btn) return;
    btn.textContent = state.metro ? "Clicks on" : "Clicks off";
    btn.setAttribute("aria-pressed", state.metro ? "true" : "false");
  }

  function refreshMuteButton() {
    const btn = document.getElementById("mute");
    if (!btn) return;
    const on = global.DrumAudio.muted();
    btn.textContent = on ? "Sound off" : "Sound on";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function toggleMute() {
    const next = !global.DrumAudio.muted();
    if (global.HS && typeof global.HS.setMuted === "function") global.HS.setMuted(next);
    else {
      try { localStorage.setItem("hs.mute", next ? "1" : "0"); } catch (e) {}
      global.DrumAudio.applyMute();
      refreshMuteButton();
      if (next) cancelSpeech();
    }
  }

  function onClick(e) {
    const btn = e.target.closest && e.target.closest("button");
    const app = document.getElementById("app");
    if (!btn || !app || !app.contains(btn)) return;
    const act = btn.getAttribute("data-act");
    if (act === "mute") toggleMute();
    else if (act === "band") { stopQuiet(); state.screen = "pick"; paint(); }
    else if (act === "patterns") openPatterns();
    else if (act === "metro") toggleMetro();
    else if (act === "start") onStart();
    else if (act === "back") backToPlay();
    else if (act === "lineup") { stopQuiet(); state.screen = "lineup"; state.phase = "ready"; paint(); }
    else if (act === "lineup-go") beginLineup();
    else if (act === "save-lineup") saveLineup();
    else if (act === "pick-band") chooseBand(btn.getAttribute("data-band"));
    else if (act === "pick-line") chooseLine(btn.getAttribute("data-id"));
    else if (act === "next") goNext();
  }

  function onPointerDown(e) {
    const pad = e.target.closest && e.target.closest("#pad");
    if (!pad) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    global.DrumAudio.unlockSync();
    downs.add(e.pointerId);
    pad.classList.add("is-hit");
    try { pad.setPointerCapture(e.pointerId); } catch (err) {}
    onPad(global.DrumAudio.now());
  }

  function onPointerUp(e) {
    if (!downs.has(e.pointerId)) return;
    downs.delete(e.pointerId);
    const pad = document.getElementById("pad");
    if (pad && downs.size === 0) pad.classList.remove("is-hit");
  }

  function onKey(e) {
    const pad = e.target.closest && e.target.closest("#pad");
    if (!pad) return;
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (e.repeat) return;
    global.DrumAudio.unlockSync();
    pad.classList.add("is-hit");
    onPad(global.DrumAudio.now());
  }

  function onKeyUp(e) {
    if (e.key !== " " && e.key !== "Enter") return;
    const pad = document.getElementById("pad");
    if (pad) pad.classList.remove("is-hit");
  }

  function registerSW() {
    if (document.documentElement.dataset.runner === "1") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./sw.js").catch(function () {});
  }

  function boot() {
    const app = document.getElementById("app");
    app.addEventListener("click", onClick);
    app.addEventListener("pointerdown", onPointerDown);
    app.addEventListener("pointerup", onPointerUp);
    app.addEventListener("pointercancel", onPointerUp);
    app.addEventListener("keydown", onKey);
    app.addEventListener("keyup", onKeyUp);
    global.addEventListener("hs-mute", function () {
      global.DrumAudio.applyMute();
      refreshMuteButton();
      if (global.DrumAudio.muted()) cancelSpeech();
    });
    global.addEventListener("pagehide", function () {
      cancelFrame();
      global.DrumAudio.stopAll();
      cancelSpeech();
    });
    const band = readBand();
    if (band) adoptBand(band);
    else state.screen = "pick";
    paint();
    registerSW();
    global.__drumsReady = true;
  }

  global.__drums = {
    playing: function () { return state.phase === "run"; },
    audioNow: function () { return global.DrumAudio.now(); },
    latencySec: latencySec,
    openNoteNear: function (now) {
      if (state.phase !== "run") return null;
      const win = windowsFor(state.band);
      const adj = now - latencySec();
      let best = null;
      let bestAbs = Infinity;
      state.notes.forEach(function (n) {
        if (n.rest || n.judge || n.time == null) return;
        const ad = Math.abs(adj - n.time);
        if (ad < bestAbs) { bestAbs = ad; best = n; }
      });
      if (!best || bestAbs > win.good - 0.008) return null;
      return { i: best.i, time: best.time };
    },
    lastJudge: function () { return state.lastJudge; },
    soundCount: function () { return global.DrumAudio.soundCount(); },
    phase: function () { return state.phase; }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
