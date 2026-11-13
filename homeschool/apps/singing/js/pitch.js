/* Local-only pitch detect. Mic audio never leaves the device. */
(function (global) {
  function detectPitchAutocorrelation(buf, sampleRate) {
    const size = buf.length;
    let mean = 0;
    for (let i = 0; i < size; i++) mean += buf[i];
    mean /= size;
    const n = new Float32Array(size);
    let rms = 0;
    for (let i = 0; i < size; i++) {
      n[i] = buf[i] - mean;
      rms += n[i] * n[i];
    }
    rms = Math.sqrt(rms / size);
    if (rms < 0.012) return { hz: null, confidence: 0 };

    const minLag = Math.floor(sampleRate / 900);
    const maxLag = Math.floor(sampleRate / 80);
    let bestLag = -1;
    let bestCorr = 0;
    let last = 1;
    let rising = false;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let corr = 0;
      for (let i = 0; i < size - lag; i++) corr += n[i] * n[i + lag];
      corr /= size;
      if (corr > 0.01 && corr > last) {
        rising = true;
        if (corr > bestCorr) {
          bestCorr = corr;
          bestLag = lag;
        }
      } else if (rising && corr < bestCorr) {
        break;
      }
      last = corr;
    }
    if (bestLag < 0) return { hz: null, confidence: 0 };
    return { hz: sampleRate / bestLag, confidence: Math.min(1, bestCorr * 8) };
  }

  function centsOff(hz, target) {
    return 1200 * Math.log2(hz / target);
  }

  const PitchMic = {
    stream: null,
    nodes: null,
    allowed: false,
    async request() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("no-mic");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false
      });
      this.stream = stream;
      this.allowed = true;
      const ctx = ForestSynth.ac();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);
      this.nodes = { src, analyser, buf: new Float32Array(analyser.fftSize) };
      return true;
    },
    stop() {
      if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
      this.nodes = null;
      this.allowed = false;
    },
    read() {
      if (!this.nodes) return { hz: null, confidence: 0 };
      this.nodes.analyser.getFloatTimeDomainData(this.nodes.buf);
      return detectPitchAutocorrelation(this.nodes.buf, ForestSynth.ac().sampleRate);
    },
    centsOff,
    detectPitchAutocorrelation
  };
  global.PitchMic = PitchMic;
})(window);
