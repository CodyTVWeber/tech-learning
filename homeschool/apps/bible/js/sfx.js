/* WebAudio chimes + Web Speech read-aloud. No audio files. */
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
  function tone(freq, t0, dur, type, gain) {
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }
  const sfx = {
    chime() {
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      tone(523.25, t, 0.18, "triangle", 0.1);
      tone(659.25, t + 0.09, 0.22, "triangle", 0.1);
      tone(783.99, t + 0.18, 0.32, "sine", 0.12);
    },
    lantern() {
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      tone(392, t, 0.4, "sine", 0.08);
      tone(588, t + 0.05, 0.5, "triangle", 0.07);
    },
    star() {
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      [880, 1046, 1318].forEach((f, i) => tone(f, t + i * 0.07, 0.25, "sine", 0.08));
    },
    bleat() {
      const c = ac();
      if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(220, t);
      o.frequency.linearRampToValueAtTime(140, t + 0.18);
      o.frequency.linearRampToValueAtTime(190, t + 0.32);
      g.gain.setValueAtTime(0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 0.4);
    },
    miss() {
      const c = ac();
      if (!c) return;
      tone(196, c.currentTime, 0.18, "square", 0.04);
    },
    speak(text) {
      try {
        if (muted()) return false;
        if (window.HS && typeof HS.speak === "function") {
          HS.speak(text, { rate: 0.92 });
          return true;
        }
        if (!window.speechSynthesis) return false;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.92;
        u.pitch = 1;
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
  global.HillSFX = sfx;
})(window);
