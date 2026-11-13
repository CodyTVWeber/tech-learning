/* Mute plumbing + tiny synth. Each app chooses its own cue recipe. */
(function (global) {
  const HS = (global.HS = global.HS || {});
  const MUTE_KEY = "hs.mute";
  let ctx = null;

  function muted() {
    return global.localStorage.getItem(MUTE_KEY) === "1";
  }

  HS.muted = muted;

  HS.setMuted = function setMuted(on) {
    global.localStorage.setItem(MUTE_KEY, on ? "1" : "0");
    global.dispatchEvent(new CustomEvent("hs-mute", { detail: { muted: on } }));
  };

  HS.toggleMute = function toggleMute() {
    HS.setMuted(!muted());
    return muted();
  };

  function audioCtx() {
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  HS.unlockAudio = function unlockAudio() {
    audioCtx();
  };

  /**
   * Play a short cue. `recipe` is an array of
   * { f: hz, t: startSec, d: durSec, type, g: gain }.
   * Apps pass their own recipes so sounds stay themed.
   */
  HS.playCue = function playCue(recipe) {
    if (muted()) return;
    const ac = audioCtx();
    if (!ac || !recipe || !recipe.length) return;
    const t0 = ac.currentTime;
    recipe.forEach(function (n) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = n.type || "sine";
      o.frequency.setValueAtTime(n.f, t0 + (n.t || 0));
      g.gain.setValueAtTime(0.0001, t0 + (n.t || 0));
      g.gain.exponentialRampToValueAtTime(n.g || 0.08, t0 + (n.t || 0) + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (n.t || 0) + (n.d || 0.18));
      o.connect(g);
      g.connect(ac.destination);
      o.start(t0 + (n.t || 0));
      o.stop(t0 + (n.t || 0) + (n.d || 0.18) + 0.02);
    });
  };

  global.addEventListener(
    "pointerdown",
    function () {
      HS.unlockAudio();
    },
    { once: true }
  );
})(window);
