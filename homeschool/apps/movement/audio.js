/* WebAudio calliope + parade drums. SpeechSynthesis when available. */
(function () {
  const AudioEngine = {
    ctx: null,
    quiet: false,
    master: null,
    playing: false,
    frozen: false,
    bpm: 100,
    nextTime: 0,
    step: 0,
    timer: null,
    onFreeze: null,
    onGo: null,
    onWarn: null,
    warn: false,
    barsMin: 2,
    barsMax: 5,
    freezeAt: 0,
    voiceReady: typeof window !== "undefined" && "speechSynthesis" in window
  };

  function soundOff() {
    if (AudioEngine.quiet) return true;
    try {
      if (window.HS && typeof window.HS.muted === "function" && window.HS.muted()) return true;
      if (localStorage.getItem("hs.mute") === "1") return true;
    } catch (e) { /* storage blocked */ }
    return false;
  }

  function ensure() {
    if (soundOff()) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!AudioEngine.ctx) {
      AudioEngine.ctx = new AC();
      AudioEngine.master = AudioEngine.ctx.createGain();
      AudioEngine.master.gain.value = 0.22;
      AudioEngine.master.connect(AudioEngine.ctx.destination);
    }
    if (AudioEngine.ctx.state === "suspended") AudioEngine.ctx.resume();
    return AudioEngine.ctx;
  }

  function envGain(ctx, t, a, d, peak) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    g.connect(AudioEngine.master);
    return g;
  }

  function kick(ctx, t) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    o.connect(envGain(ctx, t, 0.01, 0.16, 0.9));
    o.start(t);
    o.stop(t + 0.18);
  }

  function snare(ctx, t) {
    const len = ctx.sampleRate * 0.12;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    src.connect(bp);
    bp.connect(envGain(ctx, t, 0.005, 0.1, 0.45));
    src.start(t);
    src.stop(t + 0.12);
  }

  function hat(ctx, t) {
    const len = ctx.sampleRate * 0.04;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    src.connect(hp);
    hp.connect(envGain(ctx, t, 0.001, 0.03, 0.18));
    src.start(t);
    src.stop(t + 0.04);
  }

  const CALLIOPE = [196, 220, 262, 294, 330, 392, 440];

  function toot(ctx, t, idx, beat) {
    if (beat % 2 !== 0) return;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = CALLIOPE[idx % CALLIOPE.length];
    const g = envGain(ctx, t, 0.01, 0.18, 0.22);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.2);
  }

  function schedule() {
    const ctx = AudioEngine.ctx;
    if (!ctx || !AudioEngine.playing) return;
    const spb = 60 / AudioEngine.bpm;
    while (AudioEngine.nextTime < ctx.currentTime + 0.18) {
      const t = AudioEngine.nextTime;
      const beat = AudioEngine.step % 4;
      if (!AudioEngine.frozen) {
        if (beat === 0) kick(ctx, t);
        if (beat === 2) snare(ctx, t);
        hat(ctx, t);
        toot(ctx, t, AudioEngine.step, beat);
      }
      if (
        AudioEngine.warn &&
        !AudioEngine.frozen &&
        AudioEngine.freezeAt > 4 &&
        AudioEngine.step === AudioEngine.freezeAt - 4
      ) {
        toot(ctx, t, 6, 0);
        toot(ctx, t + 0.12, 5, 0);
        if (AudioEngine.onWarn) AudioEngine.onWarn();
      }
      if (AudioEngine.step >= AudioEngine.freezeAt && !AudioEngine.frozen) {
        AudioEngine.frozen = true;
        if (AudioEngine.onFreeze) AudioEngine.onFreeze();
        const holdBeats = (2 + Math.floor(Math.random() * 3)) * 4;
        AudioEngine.goAt = AudioEngine.step + holdBeats;
      }
      if (AudioEngine.frozen && AudioEngine.step >= AudioEngine.goAt) {
        AudioEngine.frozen = false;
        pickNextFreeze();
        if (AudioEngine.onGo) AudioEngine.onGo();
      }
      AudioEngine.step += 1;
      AudioEngine.nextTime += spb;
    }
    AudioEngine.timer = setTimeout(schedule, 40);
  }

  function pickNextFreeze() {
    const bars = AudioEngine.barsMin + Math.floor(Math.random() * (AudioEngine.barsMax - AudioEngine.barsMin + 1));
    AudioEngine.freezeAt = AudioEngine.step + bars * 4;
  }

  AudioEngine.setQuiet = function (q) {
    AudioEngine.quiet = q;
    if (q && AudioEngine.ctx) AudioEngine.master.gain.value = 0;
    else if (AudioEngine.master) AudioEngine.master.gain.value = 0.22;
    if (q && AudioEngine.voiceReady) window.speechSynthesis.cancel();
  };

  AudioEngine.speak = function (text) {
    if (!text) return;
    if (soundOff() || !AudioEngine.voiceReady) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    } catch (e) { /* no voice on this device */ }
  };

  AudioEngine.blip = function (kind) {
    const ctx = ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    if (kind === "stamp") {
      kick(ctx, t);
      snare(ctx, t + 0.02);
    } else if (kind === "star") {
      [392, 494, 587].forEach(function (f, i) {
        const o = ctx.createOscillator();
        o.type = "triangle";
        o.frequency.value = f;
        o.connect(envGain(ctx, t + i * 0.08, 0.01, 0.2, 0.3));
        o.start(t + i * 0.08);
        o.stop(t + i * 0.08 + 0.22);
      });
    } else if (kind === "toot") {
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.value = 330;
      o.connect(envGain(ctx, t, 0.01, 0.25, 0.2));
      o.start(t);
      o.stop(t + 0.28);
    } else {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = kind === "down" ? 180 : 420;
      o.connect(envGain(ctx, t, 0.005, 0.08, 0.35));
      o.start(t);
      o.stop(t + 0.1);
    }
  };

  AudioEngine.startBand = function (opts) {
    const ctx = ensure();
    AudioEngine.bpm = opts.bpm || 100;
    AudioEngine.barsMin = opts.barsMin || 2;
    AudioEngine.barsMax = opts.barsMax || 5;
    AudioEngine.warn = !!opts.warn;
    AudioEngine.onWarn = opts.onWarn || null;
    AudioEngine.onFreeze = opts.onFreeze || null;
    AudioEngine.onGo = opts.onGo || null;
    AudioEngine.playing = true;
    AudioEngine.frozen = false;
    AudioEngine.step = 0;
    if (ctx) {
      AudioEngine.nextTime = ctx.currentTime + 0.05;
      pickNextFreeze();
      schedule();
    } else {
      // Silent visual freeze loop when audio is blocked.
      let beats = 0;
      const spb = 60000 / AudioEngine.bpm;
      pickNextFreeze();
      AudioEngine.timer = setInterval(function () {
        beats += 1;
        AudioEngine.step = beats;
        if (
          AudioEngine.warn &&
          !AudioEngine.frozen &&
          AudioEngine.freezeAt > 4 &&
          beats === AudioEngine.freezeAt - 4
        ) {
          if (AudioEngine.onWarn) AudioEngine.onWarn();
        }
        if (!AudioEngine.frozen && beats >= AudioEngine.freezeAt) {
          AudioEngine.frozen = true;
          AudioEngine.goAt = beats + 8;
          if (AudioEngine.onFreeze) AudioEngine.onFreeze();
        } else if (AudioEngine.frozen && beats >= AudioEngine.goAt) {
          AudioEngine.frozen = false;
          pickNextFreeze();
          if (AudioEngine.onGo) AudioEngine.onGo();
        }
      }, spb);
    }
  };

  AudioEngine.stopBand = function () {
    AudioEngine.playing = false;
    AudioEngine.frozen = false;
    if (AudioEngine.timer) {
      clearTimeout(AudioEngine.timer);
      clearInterval(AudioEngine.timer);
      AudioEngine.timer = null;
    }
  };

  AudioEngine.tickMetronome = function (bpm, onBeat) {
    AudioEngine.stopBand();
    const ctx = ensure();
    AudioEngine.playing = true;
    AudioEngine.bpm = bpm;
    AudioEngine.step = 0;
    const spb = 60 / bpm;
    function loop() {
      if (!AudioEngine.playing) return;
      if (ctx) {
        while (AudioEngine.nextTime < ctx.currentTime + 0.12) {
          hat(ctx, AudioEngine.nextTime);
          if (AudioEngine.step % 4 === 0) kick(ctx, AudioEngine.nextTime);
          if (onBeat) onBeat(AudioEngine.step);
          AudioEngine.step += 1;
          AudioEngine.nextTime += spb;
        }
        AudioEngine.timer = setTimeout(loop, 40);
      }
    }
    if (ctx) {
      AudioEngine.nextTime = ctx.currentTime + 0.05;
      loop();
    } else {
      AudioEngine.timer = setInterval(function () {
        if (onBeat) onBeat(AudioEngine.step);
        AudioEngine.step += 1;
      }, spb * 1000);
    }
  };

  window.HSAudio = AudioEngine;
})();
