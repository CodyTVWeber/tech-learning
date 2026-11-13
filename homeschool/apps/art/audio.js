/* Soft studio tones — marimba-ish, not a calliope. */
(function () {
  const AudioEngine = {
    ctx: null,
    quiet: false,
    master: null,
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
      AudioEngine.master.gain.value = 0.2;
      AudioEngine.master.connect(AudioEngine.ctx.destination);
    }
    if (AudioEngine.ctx.state === "suspended") AudioEngine.ctx.resume();
    return AudioEngine.ctx;
  }

  function ding(freq, t, dur) {
    const ctx = AudioEngine.ctx;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(AudioEngine.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function kitMuted() {
    return window.HS && typeof HS.muted === "function" && HS.muted();
  }

  function applyQuiet() {
    AudioEngine.quiet = !!(AudioEngine.ownQuiet || kitMuted());
    if (AudioEngine.master) AudioEngine.master.gain.value = AudioEngine.quiet ? 0 : 0.2;
    if (AudioEngine.quiet && AudioEngine.voiceReady) window.speechSynthesis.cancel();
    if (AudioEngine.quiet && window.HS && HS.silence) HS.silence();
  }

  AudioEngine.setQuiet = function (q) {
    AudioEngine.ownQuiet = !!q;
    applyQuiet();
  };

  AudioEngine.speak = function (text) {
    if (!text || soundOff()) return;
    if (window.HS && typeof HS.speak === "function") {
      HS.speak(text, { rate: 0.9, pitch: 0.95 });
      return;
    }
    if (!AudioEngine.voiceReady) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.pitch = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) { /* no voice */ }
  };

  AudioEngine.blip = function (kind) {
    const ctx = ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    if (kind === "star") {
      ding(392, t, 0.25);
      ding(494, t + 0.08, 0.28);
      ding(587, t + 0.16, 0.35);
    } else if (kind === "mix") {
      ding(262, t, 0.2);
      ding(330, t + 0.12, 0.25);
    } else if (kind === "down") {
      ding(196, t, 0.18);
    } else {
      ding(440, t, 0.12);
    }
  };

  window.HSAudio = AudioEngine;
  if (window.HS && typeof HS.followMute === "function") {
    HS.followMute(function () { applyQuiet(); });
  }
})();
