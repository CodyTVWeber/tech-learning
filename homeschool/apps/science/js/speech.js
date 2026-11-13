(function (w) {
  let on = false;
  let supported = typeof w.speechSynthesis !== "undefined";

  function speak(text, band) {
    if (!on || !supported || !text) return;
    try {
      w.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/\s+/g, " ").trim());
      u.lang = "en-US";
      u.rate = (band === "baby" || band === "toddler") ? 0.85 : 0.95;
      u.pitch = band === "baby" ? 1.05 : 1;
      w.speechSynthesis.speak(u);
    } catch (e) { /* no voice pack */ }
  }

  function stop() {
    if (supported) {
      try { w.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
  }

  w.HSScienceSpeech = {
    supported: supported,
    isOn: function () { return on; },
    toggle: function () {
      on = !on;
      if (!on) stop();
      return on;
    },
    speak: speak,
    stop: stop
  };
})(window);
