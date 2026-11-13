(function (w) {
  let on = false;
  let supported = typeof w.speechSynthesis !== "undefined";

  function muted() {
    if (w.HS && typeof w.HS.muted === "function") return !!w.HS.muted();
    try { return localStorage.getItem("hs.mute") === "1"; } catch (e) { return false; }
  }

  function speak(text, band) {
    if (!on || !text || muted()) return;
    const clean = String(text).replace(/\s+/g, " ").trim();
    if (!clean) return;
    const young = band === "baby" || band === "toddler" || band === "preschool";
    const rate = young ? 0.85 : 0.95;
    const pitch = band === "baby" ? 1.05 : 1;
    if (w.HS && typeof w.HS.speak === "function") {
      w.HS.speak(clean, { rate: rate, pitch: pitch, lang: "en-US" });
      return;
    }
    if (!supported) return;
    try {
      w.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = "en-US";
      u.rate = rate;
      u.pitch = pitch;
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
    setOn: function (value) {
      on = !!value;
      if (!on) stop();
      return on;
    },
    toggle: function () {
      return this.setOn(!on);
    },
    speak: speak,
    stop: stop
  };
})(window);
