(function (w) {
  const KEY = "hs.progress.science";
  const BAND = "hs.band";
  const empty = function () {
    return {
      band: null,
      stars: 0,
      stamps: [],
      specimens: [],
      experiments: [],
      trails: {},
      journal: [],
      babyPlates: [],
      updated: Date.now(),
      updatedAt: new Date().toISOString()
    };
  };

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      const data = JSON.parse(raw);
      return Object.assign(empty(), data);
    } catch (e) {
      return empty();
    }
  }

  function write(data) {
    data.updated = Date.now();
    data.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* private mode or full */ }
  }

  function getBand() {
    const params = new URLSearchParams(location.search);
    const fromUrl = (params.get("band") || "").toLowerCase();
    const ids = ["baby", "toddler", "preschool", "early", "primary", "upper"];
    if (ids.indexOf(fromUrl) !== -1) return fromUrl;
    try {
      const stored = (localStorage.getItem(BAND) || "").toLowerCase();
      if (ids.indexOf(stored) !== -1) return stored;
    } catch (e) { /* ignore */ }
    const progress = read();
    if (ids.indexOf(progress.band) !== -1) return progress.band;
    return null;
  }

  function setBand(id) {
    try { localStorage.setItem(BAND, id); } catch (e) { /* ignore */ }
    const p = read();
    p.band = id;
    write(p);
  }

  function addUnique(arr, id) {
    if (arr.indexOf(id) === -1) arr.push(id);
  }

  w.HSScienceStore = {
    key: KEY,
    read: read,
    write: write,
    getBand: getBand,
    setBand: setBand,
    award: function (kind, id, stars) {
      const p = read();
      if (kind === "stamp") addUnique(p.stamps, id);
      if (kind === "specimen") addUnique(p.specimens, id);
      if (kind === "experiment") addUnique(p.experiments, id);
      if (kind === "baby") addUnique(p.babyPlates, id);
      if (kind === "trail") p.trails[id] = { done: true, at: Date.now() };
      p.stars += stars || 1;
      write(p);
      return p;
    },
    saveJournal: function (entry) {
      const p = read();
      const row = {
        id: entry.id || ("j-" + Date.now()),
        title: entry.title || "Field note",
        text: entry.text || "",
        prompt: entry.prompt || "",
        at: Date.now()
      };
      const idx = p.journal.findIndex(function (j) { return j.id === row.id; });
      if (idx >= 0) p.journal[idx] = row;
      else p.journal.unshift(row);
      write(p);
      return row;
    }
  };
})(window);
