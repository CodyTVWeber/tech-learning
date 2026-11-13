/* Snare = noise burst (wires) + sine body (shell). Clicks are short ticks.
   Scheduling uses AudioContext times. Mute follows HS.muted() / hs.mute. */
(function (global) {
  "use strict";

  let ctx = null;
  let master = null;
  let countBus = null;
  let metroBus = null;
  let metroOn = true;
  let nodes = [];
  let soundCount = 0;

  function muted() {
    try {
      if (global.HS && typeof global.HS.muted === "function") return !!global.HS.muted();
      return global.localStorage.getItem("hs.mute") === "1";
    } catch (e) {
      return false;
    }
  }

  function ensure() {
    if (ctx) return ctx;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted() ? 0 : 1;
    master.connect(ctx.destination);
    countBus = ctx.createGain();
    countBus.gain.value = 1;
    countBus.connect(master);
    metroBus = ctx.createGain();
    metroBus.gain.value = metroOn ? 1 : 0;
    metroBus.connect(master);
    return ctx;
  }

  function applyMute() {
    if (!ctx || !master) return;
    master.gain.setValueAtTime(muted() ? 0 : 1, ctx.currentTime);
  }

  function setMetro(on) {
    metroOn = !!on;
    if (ctx && metroBus) metroBus.gain.setValueAtTime(metroOn ? 1 : 0, ctx.currentTime);
  }

  function unlockSync() {
    const c = ensure();
    if (c && c.state === "suspended") c.resume();
    return c;
  }

  function env(at, attack, hold, release, peak) {
    const g = ctx.createGain();
    const a = Math.max(0.001, attack);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + a);
    g.gain.setValueAtTime(Math.max(0.0002, peak), at + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, at + a + hold + release);
    return g;
  }

  function track(node) {
    nodes.push(node);
    if (nodes.length > 80) nodes = nodes.slice(-40);
  }

  function playSnare(when) {
    const c = ensure();
    if (!c || muted()) return;
    const t = Math.max(c.currentTime, when || c.currentTime);

    const body = c.createOscillator();
    body.type = "sine";
    body.frequency.setValueAtTime(196, t);
    body.frequency.exponentialRampToValueAtTime(78, t + 0.16);
    const bg = env(t, 0.004, 0.02, 0.14, 0.55);
    body.connect(bg);
    bg.connect(master);
    body.start(t);
    body.stop(t + 0.2);
    track(body);

    const dur = 0.09;
    const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = c.createBufferSource();
    noise.buffer = buffer;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(1800, t);
    const ng = env(t, 0.002, 0.012, 0.07, 0.38);
    noise.connect(hp);
    hp.connect(ng);
    ng.connect(master);
    noise.start(t);
    noise.stop(t + dur);
    track(noise);
    soundCount += 1;
  }

  function scheduleClick(when, bus) {
    const c = ensure();
    if (!c) return;
    const t = when;
    const osc = c.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(bus === "count" ? 1320 : 1040, t);
    const g = env(t, 0.002, 0.008, 0.03, 0.18);
    osc.connect(g);
    g.connect(bus === "metro" ? metroBus : countBus);
    osc.start(t);
    osc.stop(t + 0.05);
    track(osc);
  }

  function stopAll() {
    nodes.forEach(function (node) {
      try { node.stop(); } catch (e) { /* already stopped */ }
    });
    nodes = [];
  }

  global.addEventListener("hs-mute", function () {
    applyMute();
  });

  global.DrumAudio = {
    muted: muted,
    ensure: ensure,
    applyMute: applyMute,
    unlockSync: unlockSync,
    now: function () { return ctx ? ctx.currentTime : 0; },
    playSnare: playSnare,
    scheduleClick: scheduleClick,
    setMetro: setMetro,
    stopAll: stopAll,
    soundCount: function () { return soundCount; }
  };
})(window);
