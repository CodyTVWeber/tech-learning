/* Treasure Voyage ship sounds. WebAudio only — no audio files. */
(function (global) {
  let ctx = null;
  let noise = null;

  function muted() {
    try {
      if (global.HS && typeof HS.muted === "function") return HS.muted();
      return global.localStorage.getItem("hs.mute") === "1";
    } catch (e) {
      return false;
    }
  }

  function ac() {
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function noiseBuf(c) {
    if (noise) return noise;
    const n = 2 * c.sampleRate;
    const buf = c.createBuffer(1, n, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    noise = buf;
    return noise;
  }

  function tone(c, t0, f, dur, type, gain) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.06, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }

  function burst(c, t0, dur, gain, freq) {
    const src = c.createBufferSource();
    src.buffer = noiseBuf(c);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.setValueAtTime(freq || 800, t0);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.08, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(c.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  const Ship = {
    unlock: function () {
      ac();
    },
    clink: function () {
      if (muted()) return;
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      tone(c, t, 880, 0.07, "square", 0.05);
      tone(c, t + 0.07, 1174, 0.11, "square", 0.05);
    },
    knock: function () {
      if (muted()) return;
      const c = ac();
      if (!c) return;
      tone(c, c.currentTime, 160, 0.14, "triangle", 0.07);
    },
    latch: function () {
      if (muted()) return;
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      tone(c, t, 392, 0.12, "sawtooth", 0.04);
      tone(c, t + 0.12, 523, 0.18, "sawtooth", 0.05);
    },
    fanfare: function () {
      if (muted()) return;
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      tone(c, t, 523, 0.12, "square", 0.05);
      tone(c, t + 0.12, 659, 0.12, "square", 0.05);
      tone(c, t + 0.24, 784, 0.22, "square", 0.06);
    },
    creak: function () {
      if (muted()) return;
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(90, t);
      o.frequency.linearRampToValueAtTime(54, t + 0.28);
      o.frequency.linearRampToValueAtTime(80, t + 0.5);
      g.gain.setValueAtTime(0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 0.58);
    },
    splash: function () {
      if (muted()) return;
      const c = ac();
      if (!c) return;
      burst(c, c.currentTime, 0.28, 0.07, 620);
    },
    bell: function () {
      if (muted()) return;
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      tone(c, t, 988, 0.5, "sine", 0.06);
      tone(c, t, 1480, 0.35, "triangle", 0.03);
    },
    wind: function () {
      if (muted()) return;
      const c = ac();
      if (!c) return;
      burst(c, c.currentTime, 0.55, 0.035, 380);
    },
    gull: function () {
      if (muted()) return;
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(980, t);
      o.frequency.linearRampToValueAtTime(1240, t + 0.12);
      o.frequency.linearRampToValueAtTime(860, t + 0.28);
      g.gain.setValueAtTime(0.03, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 0.34);
    },
    speak: function (text) {
      if (muted() || !text) return;
      if (global.HS && typeof HS.speak === "function") {
        HS.speak(text, { rate: 0.9 });
        return;
      }
      const synth = global.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.rate = 0.9;
      u.lang = "en-US";
      synth.speak(u);
    },
    hush: function () {
      if (global.HS && HS.silence) HS.silence();
      try {
        if (global.speechSynthesis) global.speechSynthesis.cancel();
      } catch (e) {}
    },
  };

  global.addEventListener(
    "pointerdown",
    function () {
      Ship.unlock();
    },
    { once: true }
  );

  global.Ship = Ship;
})(window);
