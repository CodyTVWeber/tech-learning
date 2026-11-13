/* Original fact generators. All 0–12 times and matching shares. */
(function (global) {
  function shuffle(arr, salt) {
    const a = arr.slice();
    let h = 2166136261;
    const s = String(salt || "x");
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    for (let i = a.length - 1; i > 0; i--) {
      h = Math.imul(h ^ i, 16777619);
      const j = Math.abs(h) % (i + 1);
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function choices(ans, extra, salt) {
    const seen = {};
    const opts = [];
    [ans].concat(extra || []).forEach(function (v) {
      const s = String(v);
      if (seen[s]) return;
      seen[s] = 1;
      opts.push(s);
    });
    let n = 0;
    while (opts.length < 3) {
      const cand = String(Math.max(0, Number(ans) + (n % 2 ? n : -n) || n + 1));
      n += 1;
      if (!seen[cand]) {
        seen[cand] = 1;
        opts.push(cand);
      }
      if (n > 20) break;
    }
    return shuffle(opts, salt).slice(0, 4);
  }

  function mulTable(n) {
    const items = [];
    for (let b = 0; b <= 12; b++) {
      const p = n * b;
      const id = "drill-mul-" + n + "x" + b;
      const row = n > 0 && n <= 6 && b > 0 && b <= 6;
      items.push({
        id: id,
        kind: row ? "array" : "choice",
        prompt: n + " × " + b + " =",
        audioText: n + " times " + b + ".",
        answer: String(p),
        choices: choices(p, [p + n || 1, Math.abs(p - b) || p + 1, n + b], id),
        rows: row ? n : undefined,
        cols: row ? b : undefined,
      });
    }
    return items;
  }

  function divTable(n) {
    const items = [];
    if (!n) return items;
    for (let b = 0; b <= 12; b++) {
      const p = n * b;
      const id = "drill-div-" + p + "d" + n;
      items.push({
        id: id,
        kind: "choice",
        prompt: p + " ÷ " + n + " =",
        audioText: p + " divided by " + n + ".",
        answer: String(b),
        choices: choices(b, [b + 1, Math.max(0, b - 1), n], id),
      });
    }
    return items;
  }

  global.VoyageFacts = { mulTable: mulTable, divTable: divTable, choices: choices };
})(window);
