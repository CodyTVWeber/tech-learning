/* Mute plumbing + tiny synth. Each app chooses its own cue recipe.
   The kit Sound button is the only mute contract: hs.mute / HS.muted(). */
(function (global) {
  const HS = (global.HS = global.HS || {});
  const MUTE_KEY = "hs.mute";
  let ctx = null;
  let origConnect = null;
  const buses = [];
  let speechSuppressed = 0;

  function muted() {
    try {
      return global.localStorage.getItem(MUTE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  HS.muted = muted;

  function busGain(audioCtx) {
    if (audioCtx.__hsMuteGain) return audioCtx.__hsMuteGain;
    const g = audioCtx.createGain();
    audioCtx.__hsMuteGain = g;
    g.gain.value = muted() ? 0 : 1;
    origConnect.call(g, audioCtx.destination);
    buses.push(g);
    return g;
  }

  function installBus() {
    const proto = global.AudioNode && global.AudioNode.prototype;
    if (!proto || origConnect) return;
    origConnect = proto.connect;
    proto.connect = function (dest) {
      if (
        dest &&
        this.context &&
        dest === this.context.destination &&
        typeof this.context.startRendering !== "function" &&
        this !== this.context.__hsMuteGain
      ) {
        const g = busGain(this.context);
        if (arguments.length > 1) return origConnect.call(this, g, arguments[1]);
        return origConnect.call(this, g);
      }
      return origConnect.apply(this, arguments);
    };
  }

  function installSpeech() {
    const synth = global.speechSynthesis;
    if (!synth || synth.__hsPatched || typeof synth.speak !== "function") return;
    const orig = synth.speak.bind(synth);
    synth.__hsPatched = true;
    synth.speak = function (utterance) {
      if (muted()) {
        speechSuppressed += 1;
        return;
      }
      return orig(utterance);
    };
  }

  function applyBus(on) {
    buses.forEach(function (g) {
      try {
        g.gain.value = on ? 0 : 1;
      } catch (e) {}
    });
  }

  HS.speechSuppressed = function speechSuppressedCount() {
    return speechSuppressed;
  };

  HS.reportQuiet = function reportQuiet(quiet) {
    document.documentElement.dataset.appQuiet = quiet ? "1" : "0";
  };

  /**
   * Apps that hide their chrome call this once.
   * `apply(on)` stops that app's own WebAudio and speech.
   * The page then reports quiet on html[data-app-quiet].
   */
  HS.followMute = function followMute(apply) {
    function run(on) {
      try {
        if (typeof apply === "function") apply(!!on);
      } catch (e) {}
      HS.reportQuiet(!!on);
    }
    global.addEventListener("hs-mute", function (e) {
      const on = e && e.detail ? !!e.detail.muted : muted();
      run(on);
    });
    run(muted());
  };

  HS.setMuted = function setMuted(on) {
    const next = !!on;
    try {
      global.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch (e) {}
    applyBus(next);
    if (next) {
      if (typeof HS.silence === "function") HS.silence();
      else if (global.speechSynthesis) {
        try {
          global.speechSynthesis.cancel();
        } catch (e) {}
      }
    }
    global.dispatchEvent(new CustomEvent("hs-mute", { detail: { muted: next } }));
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

  installBus();
  installSpeech();

  global.addEventListener(
    "pointerdown",
    function () {
      HS.unlockAudio();
    },
    { once: true }
  );
})(window);
