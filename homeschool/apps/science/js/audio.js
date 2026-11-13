(function (w) {
  let ctx = null;
  function ac() {
    if (!ctx) {
      const C = w.AudioContext || w.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function muted() {
    if (w.HS && typeof w.HS.muted === "function") return !!w.HS.muted();
    try { if (localStorage.getItem("hs.mute") === "1") return true; } catch (e) { /* ignore */ }
    return false;
  }

  function beep(freq, dur, type, gain, at) {
    if (muted()) return;
    const c = ac();
    if (!c) return;
    const t = c.currentTime + (at || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise(dur, gain) {
    if (muted()) return;
    const c = ac();
    if (!c) return;
    const n = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, n, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1200;
    src.buffer = buf;
    g.gain.value = gain || 0.04;
    src.connect(f);
    f.connect(g);
    g.connect(c.destination);
    src.start();
  }

  w.HSScienceAudio = {
    unlock: ac,
    page: function () { noise(0.12, 0.03); beep(180, 0.08, "triangle", 0.02); },
    stamp: function () {
      beep(90, 0.12, "square", 0.05);
      beep(140, 0.08, "triangle", 0.03, 0.05);
      noise(0.08, 0.05);
    },
    chirp: function () {
      beep(880, 0.08, "sine", 0.04);
      beep(1320, 0.1, "sine", 0.03, 0.07);
    },
    drop: function () { beep(520, 0.05, "sine", 0.04); beep(240, 0.12, "sine", 0.03, 0.05); },
    ok: function () { beep(392, 0.1, "sine", 0.05); beep(523, 0.16, "sine", 0.05, 0.1); },
    miss: function () { beep(196, 0.16, "triangle", 0.04); },
    wind: function () { noise(0.3, 0.025); }
  };

  if (w.HS && typeof w.HS.followMute === "function") {
    w.HS.followMute(function (on) {
      if (!on) return;
      if (w.HSScienceSpeech && w.HSScienceSpeech.stop) w.HSScienceSpeech.stop();
      if (w.speechSynthesis) {
        try { w.speechSynthesis.cancel(); } catch (e) {}
      }
    });
  }
})(window);
