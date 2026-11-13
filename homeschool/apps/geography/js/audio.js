(function (global) {
  "use strict";

  var ctx = null;
  var muted = false;

  function loadMute() {
    try {
      if (global.HS && typeof global.HS.muted === "function") {
        muted = !!global.HS.muted();
        return;
      }
      muted = localStorage.getItem("hs.mute") === "1" || localStorage.getItem("hs.sound") === "off";
    } catch (e) {
      muted = false;
    }
  }
  loadMute();

  function setMuted(value) {
    muted = !!value;
    try {
      if (global.HS && typeof global.HS.setMuted === "function") {
        global.HS.setMuted(muted);
      } else {
        localStorage.setItem("hs.mute", muted ? "1" : "0");
        localStorage.setItem("hs.sound", muted ? "off" : "on");
      }
    } catch (e) {}
    if (muted) stopTalk();
  }

  function isMuted() {
    if (global.HS && typeof global.HS.muted === "function") return !!global.HS.muted();
    return muted;
  }

  function audio() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function unlock() {
    var c = audio();
    if (!c) return;
    var b = c.createBuffer(1, 1, 22050);
    var s = c.createBufferSource();
    s.buffer = b;
    s.connect(c.destination);
    s.start(0);
  }

  function envGain(c, t, attack, hold, release, peak) {
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak || 0.2, t + attack);
    g.gain.setValueAtTime(peak || 0.2, t + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    return g;
  }

  function tone(freq, dur, type, peak) {
    if (isMuted()) return;
    var c = audio();
    if (!c) return;
    var t = c.currentTime;
    var o = c.createOscillator();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t);
    var g = envGain(c, t, 0.01, Math.max(0.02, dur - 0.05), 0.1, peak || 0.1);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.12);
  }

  function noiseBurst(dur, peak, freq) {
    if (isMuted()) return;
    var c = audio();
    if (!c) return;
    var n = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    var d = n.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource();
    src.buffer = n;
    var f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = freq || 700;
    var t = c.currentTime;
    var g = envGain(c, t, 0.01, dur * 0.25, dur * 0.7, peak || 0.07);
    src.connect(f);
    f.connect(g);
    g.connect(c.destination);
    src.start(t);
  }

  function burner() {
    noiseBurst(0.4, 0.11, 480);
    tone(64, 0.35, "sawtooth", 0.045);
  }

  function wind() {
    noiseBurst(0.7, 0.07, 550);
  }

  function pinDrop() {
    tone(920, 0.07, "triangle", 0.11);
    noiseBurst(0.04, 0.05, 2600);
  }

  function whoosh() {
    if (isMuted()) return;
    var c = audio();
    if (!c) return;
    var t = c.currentTime;
    var o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(740, t + 0.32);
    var g = envGain(c, t, 0.03, 0.12, 0.22, 0.08);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + 0.45);
  }

  function celebrate() {
    if (isMuted()) return;
    [392, 523, 659, 784].forEach(function (f, i) {
      setTimeout(function () {
        tone(f, 0.18, "sine", 0.09);
      }, i * 100);
    });
  }

  function wrong() {
    tone(220, 0.16, "triangle", 0.06);
    setTimeout(function () {
      tone(174, 0.2, "triangle", 0.05);
    }, 140);
  }

  function playMelody(notes) {
    if (isMuted() || !notes) return;
    var t = 0;
    notes.forEach(function (n) {
      var freq = n.f;
      var dur = n.d || 0.25;
      setTimeout(function () {
        if (freq) tone(freq, dur * 0.9, "sine", 0.09);
      }, t * 1000);
      t += dur;
    });
  }

  function stopTalk() {
    if (global.speechSynthesis) {
      try {
        global.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  function talk(text) {
    if (isMuted() || !text) return;
    if (global.HS && typeof global.HS.speak === "function") {
      global.HS.speak(text, { rate: 0.92 });
      return;
    }
    stopTalk();
    if (!global.speechSynthesis || !global.SpeechSynthesisUtterance) return;
    var u = new SpeechSynthesisUtterance(String(text));
    u.rate = 0.94;
    u.pitch = 1.05;
    try {
      global.speechSynthesis.speak(u);
    } catch (e) {}
  }

  global.HSAudio = {
    unlock: unlock,
    setMuted: setMuted,
    isMuted: isMuted,
    burner: burner,
    wind: wind,
    pinDrop: pinDrop,
    whoosh: whoosh,
    celebrate: celebrate,
    wrong: wrong,
    playMelody: playMelody,
    talk: talk,
    stopTalk: stopTalk,
    tone: tone,
  };

  if (global.HS && typeof global.HS.followMute === "function") {
    global.HS.followMute(function (on) {
      muted = !!on;
      if (on) stopTalk();
    });
  }
})(window);
