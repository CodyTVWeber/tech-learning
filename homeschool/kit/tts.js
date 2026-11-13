(function (global) {
  const HS = (global.HS = global.HS || {});

  HS.speak = function speak(text, opts) {
    opts = opts || {};
    if (!text || HS.muted()) return;
    const synth = global.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.rate = opts.rate || 0.9;
    u.pitch = opts.pitch || 1;
    u.lang = opts.lang || "en-US";
    synth.speak(u);
  };

  HS.silence = function silence() {
    const synth = global.speechSynthesis;
    if (synth) synth.cancel();
  };
})(window);
