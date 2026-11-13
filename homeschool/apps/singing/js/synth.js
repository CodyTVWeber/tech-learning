(function (global) {
  let ctx;
  function muted() {
    return (window.HS && HS.muted && HS.muted()) || localStorage.getItem("hs.mute") === "1";
  }
  function ac() {
    if (muted()) return null;
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function midiToHz(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }
  function voice(c, freq, t0, dur, gain) {
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    o1.type = "sine";
    o2.type = "triangle";
    o1.frequency.setValueAtTime(freq, t0);
    o2.frequency.setValueAtTime(freq / 2, t0);
    f.type = "lowpass";
    f.frequency.setValueAtTime(1800, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.14, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o1.connect(g);
    o2.connect(g);
    g.connect(f);
    f.connect(c.destination);
    o1.start(t0);
    o2.start(t0);
    o1.stop(t0 + dur + 0.02);
    o2.stop(t0 + dur + 0.02);
  }
  const ForestSynth = {
    ac,
    midiToHz,
    chirp() {
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      voice(c, 880, t, 0.12, 0.08);
      voice(c, 1320, t + 0.08, 0.16, 0.07);
    },
    miss() {
      const c = ac();
      if (!c) return;
      voice(c, 196, c.currentTime, 0.16, 0.05);
    },
    playNote(midi, dur) {
      const c = ac();
      if (!c) return;
      voice(c, midiToHz(midi), c.currentTime, dur || 0.55, 0.16);
    },
    playMelody(melody, bpm, onBeat) {
      const c = ac();
      if (!c) return 0;
      const beat = 60 / (bpm || 90);
      let t = c.currentTime + 0.05;
      let beats = 0;
      melody.forEach((pair, i) => {
        const midi = pair[0];
        const d = pair[1] * beat;
        if (midi > 0) voice(c, midiToHz(midi), t, Math.max(0.08, d - 0.04), 0.15);
        if (onBeat) {
          const delay = Math.max(0, (t - c.currentTime) * 1000);
          setTimeout(() => onBeat(i, beats), delay);
        }
        t += d;
        beats += pair[1];
      });
      return (t - c.currentTime) * 1000;
    },
    click(strong) {
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "square";
      o.frequency.value = strong ? 1400 : 900;
      g.gain.setValueAtTime(strong ? 0.08 : 0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 0.06);
    },
    speak(text) {
      try {
        if (muted()) return false;
        if (window.HS && typeof HS.speak === "function") {
          HS.speak(text, { rate: 0.95 });
          return true;
        }
        if (!window.speechSynthesis) return false;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
        return true;
      } catch (e) {
        return false;
      }
    },
    hush() {
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    }
  };
  global.ForestSynth = ForestSynth;
})(window);
