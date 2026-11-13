(function (global) {
  const HS = (global.HS = global.HS || {});

  HS.speak = function speak(text, opts) {
    opts = opts || {};
    if (!text) return;
    if (typeof HS.muted === "function" && HS.muted()) return;
    const synth = global.speechSynthesis;
    if (!synth || typeof global.SpeechSynthesisUtterance !== "function") return;
    try {
      synth.cancel();
      const u = new global.SpeechSynthesisUtterance(String(text));
      u.rate = opts.rate || 0.9;
      u.pitch = opts.pitch || 1;
      u.lang = opts.lang || "en-US";
      synth.speak(u);
    } catch (e) {
      /* device has no voice */
    }
  };

  HS.silence = function silence() {
    const synth = global.speechSynthesis;
    if (!synth) return;
    try {
      synth.cancel();
    } catch (e) {}
  };
})(window);
