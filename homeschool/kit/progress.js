(function (global) {
  const HS = (global.HS = global.HS || {});
  const BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"];
  const LEARNER_BANDS = "hs.learnerBands";

  HS.BANDS = BANDS;

  HS.getBand = function getBand() {
    const q = new URLSearchParams(global.location.search).get("band");
    if (q && BANDS.indexOf(q) !== -1) return q;
    const stored = global.localStorage.getItem("hs.band");
    if (stored && BANDS.indexOf(stored) !== -1) return stored;
    return "";
  };

  HS.setBand = function setBand(band) {
    if (BANDS.indexOf(band) === -1) return;
    global.localStorage.setItem("hs.band", band);
  };

  HS.getLearnerBands = function getLearnerBands() {
    try {
      return JSON.parse(global.localStorage.getItem(LEARNER_BANDS) || "{}");
    } catch (e) {
      return {};
    }
  };

  HS.setLearnerBand = function setLearnerBand(folder, band) {
    if (BANDS.indexOf(band) === -1) return;
    const all = HS.getLearnerBands();
    all[folder] = band;
    global.localStorage.setItem(LEARNER_BANDS, JSON.stringify(all));
  };

  HS.bandFor = function bandFor(stage) {
    const over = HS.getLearnerBands()[stage.folder];
    if (over && BANDS.indexOf(over) !== -1) return over;
    return stage.band || "early";
  };

  function safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch (e) {
      return value;
    }
  }

  // Folder name only (Joey, Shiloh, …). Never an age or a surname.
  HS.learnerFolder = function learnerFolder() {
    const parts = String(global.location.pathname || "").split("/").filter(Boolean);
    if (parts.length && parts[parts.length - 1].toLowerCase() === "index.html") parts.pop();
    if (parts.length && parts[parts.length - 1].toLowerCase() === "play.html") parts.pop();
    const appsAt = parts.lastIndexOf("apps");
    if (appsAt !== -1 && appsAt >= parts.length - 2) return "standalone";
    const folder = parts.length ? safeDecode(parts[parts.length - 1]) : "";
    if (!/^[A-Za-z0-9-]+$/.test(folder)) return "standalone";
    if (folder === "homeschool" || folder === "kit" || folder === "apps") return "standalone";
    return folder;
  };

  HS.progressKey = function progressKey(subject) {
    const id = String(subject || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
    return "hs.progress." + HS.learnerFolder() + "." + id;
  };

  HS.readProgress = function readProgress(subject) {
    try {
      return JSON.parse(global.localStorage.getItem(HS.progressKey(subject)) || "{}");
    } catch (e) {
      return {};
    }
  };

  HS.writeProgress = function writeProgress(subject, data) {
    data = data || {};
    data.updatedAt = new Date().toISOString();
    global.localStorage.setItem(HS.progressKey(subject), JSON.stringify(data));
  };

  HS.exportAll = function exportAll() {
    const out = { exportedAt: new Date().toISOString(), keys: {} };
    for (let i = 0; i < global.localStorage.length; i++) {
      const k = global.localStorage.key(i);
      if (k && k.indexOf("hs.") === 0) out.keys[k] = global.localStorage.getItem(k);
    }
    return out;
  };

  HS.importAll = function importAll(payload) {
    if (!payload || !payload.keys) throw new Error("Not a homeschool export.");
    Object.keys(payload.keys).forEach(function (k) {
      if (k.indexOf("hs.") === 0) global.localStorage.setItem(k, payload.keys[k]);
    });
  };

  HS.fetchJson = async function fetchJson(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  };

  HS.downloadExport = function downloadExport() {
    const blob = new Blob([JSON.stringify(HS.exportAll(), null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "homeschool-progress.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
})(window);
