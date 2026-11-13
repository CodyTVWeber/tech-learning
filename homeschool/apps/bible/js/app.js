(function () {
  const BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"];
  const BAND_BLURB = {
    baby: "Listen, tap a sheep, hear a short verse.",
    toddler: "Short verses, one missing word, story pictures.",
    preschool: "Fill the blank, first books, kind neighbors.",
    early: "Hide the word in your heart. Gospels and the Law.",
    primary: "Longer verses, all sixty-six books, character flock.",
    upper: "Passages, story order, and the whole hillside."
  };
  const KEY_BAND = "hs.band";
  const KEY_PROG = "hs.progress.bible";

  const $ = (sel, el) => (el || document).querySelector(sel);
  const appEl = $("#app");

  function params() {
    return new URLSearchParams(location.search);
  }
  function hashScreen() {
    const h = (location.hash || "#home").replace("#", "");
    return h || "home";
  }
  function go(screen) {
    location.hash = screen;
    render();
  }

  function loadProg() {
    try {
      return JSON.parse(localStorage.getItem(KEY_PROG) || "{}") || {};
    } catch (e) {
      return {};
    }
  }
  function saveProg(p) {
    p.updatedAt = Date.now();
    localStorage.setItem(KEY_PROG, JSON.stringify(p));
  }
  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function prog() {
    const p = loadProg();
    p.sheep = p.sheep || [];
    p.lanterns = p.lanterns || 0;
    p.stars = p.stars || 0;
    p.done = p.done || { memory: {}, stories: {}, books: {}, character: {} };
    p.translation = p.translation === "web" ? "web" : "kjv";
    return p;
  }
  function setProg(mut) {
    const p = prog();
    mut(p);
    saveProg(p);
  }

  function band() {
    const q = params().get("band");
    if (q && BANDS.includes(q)) return q;
    const stored = localStorage.getItem(KEY_BAND);
    if (stored && BANDS.includes(stored)) return stored;
    return null;
  }
  function setBand(b) {
    localStorage.setItem(KEY_BAND, b);
    const url = new URL(location.href);
    url.searchParams.set("band", b);
    history.replaceState({}, "", url);
    document.body.className = "band-" + b;
  }

  function okFor(item, b) {
    const list = item.bands || (item.minBand ? BANDS.slice(BANDS.indexOf(item.minBand)) : BANDS);
    return list.includes(b);
  }
  function versesFor(b) {
    return BIBLE.verses.filter((v) => okFor(v, b));
  }
  function storiesFor(b) {
    return BIBLE.stories.filter((s) => okFor(s, b)).sort((a, c) => a.order - c.order);
  }
  function booksFor(b) {
    if (b === "baby") return BIBLE.books.filter((x) => ["Genesis", "Matthew", "Psalms"].includes(x.name));
    if (b === "toddler") return BIBLE.books.filter((x) => x.n <= 5 || ["Matthew", "Mark", "Luke", "John", "Psalms", "Proverbs"].includes(x.name));
    if (b === "preschool") return BIBLE.books.filter((x) => x.n <= 5 || ["Matthew", "Mark", "Luke", "John", "Acts", "Psalms", "Proverbs"].includes(x.name));
    if (b === "early") {
      return BIBLE.books.filter((x) =>
        (x.testament === "OT" && (x.group === "Law" || x.group === "History")) ||
        x.group === "Gospels" ||
        ["Psalms", "Proverbs", "Acts"].includes(x.name)
      );
    }
    return BIBLE.books;
  }
  function qualitiesFor(b) {
    return BIBLE.qualities.filter((q) => okFor(q, b));
  }
  function verseById(id) {
    return BIBLE.verses.find((v) => v.id === id);
  }
  function url(path) {
    if (window.HS && window.HS.url) return window.HS.url(path);
    const base = document.documentElement.dataset.appBase || document.baseURI;
    return new URL(path, base).href;
  }
  function img(key) {
    return url(BIBLE.images[key] || BIBLE.images.hillside);
  }
  function textOf(v, p) {
    return (p.translation === "web" ? v.web : v.kjv) || v.kjv;
  }

  function gatherSheep(id) {
    setProg((p) => {
      if (!p.sheep.includes(id)) p.sheep.push(id);
    });
    HillSFX.bleat();
    HillSFX.chime();
    celebrate("A sheep came home.", "The hillside is glad.");
  }
  function addLantern() {
    setProg((p) => { p.lanterns += 1; });
    HillSFX.lantern();
    celebrate("A lantern is lit.", "Thy word is a lamp.");
  }
  function addStar() {
    setProg((p) => { p.stars += 1; });
    HillSFX.star();
    celebrate("A star over the fold.", "The heavens declare.");
  }
  function celebrate(title, sub) {
    const el = $("#celebrate");
    $("#celebrate-title").textContent = title;
    $("#celebrate-sub").textContent = sub;
    el.classList.add("show");
    const ms = reduceMotion() ? 400 : 1600;
    setTimeout(() => el.classList.remove("show"), ms);
  }

  function sheepSvg(n) {
    const p = prog();
    const count = Math.min(p.sheep.length, n || 12);
    let html = '<div class="flock" aria-label="gathered sheep">';
    for (let i = 0; i < count; i++) {
      html += '<div class="sheep" title="gathered sheep"><span class="wool"></span><span class="head"></span><span class="leg a"></span><span class="leg b"></span></div>';
    }
    if (!count) html += '<p class="tiny">No sheep yet. Memorize a verse and they will wander in.</p>';
    html += "</div>";
    return html;
  }
  function rewards() {
    const p = prog();
    const stars = Array.from({ length: Math.min(p.stars, 12) }, () => '<span class="star" title="star"></span>').join("");
    const lamps = Array.from({ length: Math.min(p.lanterns, 8) }, () => '<span class="lamp" title="lantern"></span>').join("");
    return `<div class="stars">${lamps}${stars}</div>
      <p class="tiny">${p.sheep.length} sheep · ${p.lanterns} lanterns · ${p.stars} stars</p>`;
  }

  function shell(inner) {
    const b = band();
    const label = BIBLE.bands.find((x) => x.id === b).label;
    const screen = hashScreen();
    const hero = screen === "home"
      ? `<div class="hero">
        <img src="${img("hillside")}" alt="Golden-hour hillside with a flock of sheep">
        <div class="caption">Gather the flock · light a lantern · watch the stars</div>
      </div>`
      : "";
    return `<header class="mast">
        <h1>Shepherd’s Hillside</h1>
        <button class="band-chip touchy" type="button" data-act="reband">${label}</button>
      </header>
      ${hero}
      ${inner}
      <nav class="dock" aria-label="Hillside paths">
        <button type="button" data-go="home" class="${screen==="home"?"on":""}">Fold</button>
        <button type="button" data-go="memory" class="${screen==="memory"?"on":""}">Memory</button>
        <button type="button" data-go="stories" class="${screen==="stories"?"on":""}">Stories</button>
        <button type="button" data-go="books" class="${screen==="books"?"on":""}">Books</button>
        <button type="button" data-go="character" class="${screen==="character"?"on":""}">Heart</button>
      </nav>`;
  }

  function picker() {
    const buttons = BIBLE.bands.map((b) =>
      `<button type="button" data-band="${b.id}"><strong>${b.label}</strong><span>${BAND_BLURB[b.id]}</span></button>`
    ).join("");
    appEl.innerHTML = `<div class="app">
      <div class="hero">
        <img src="${img("hillside")}" alt="Shepherd hillside at golden hour">
        <div class="caption">A hillside for hiding the Word</div>
      </div>
      <div class="panel">
        <p class="kicker">Choose a path</p>
        <h2>How high is this climb?</h2>
        <p class="lead">Paths use stage names, not marks. You can change this later.</p>
        <div class="picker">${buttons}</div>
      </div>
    </div>`;
  }

  function home() {
    const b = band();
    const p = prog();
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">The fold</p>
        <h2>Come, gather the sheep</h2>
        <p class="lead">Walk the hillside. Hide a verse. A sheep comes home. Finish a story and a lantern glows. Finish a book fold or a heart quality and a star hangs over the ridge.</p>
        ${sheepSvg()}
        ${rewards()}
        <div class="grid" style="margin-top:12px">
          <button class="tile touchy" type="button" data-go="memory"><span class="ico">Pasture</span><strong>Scripture memory</strong></button>
          <button class="tile touchy" type="button" data-go="stories"><span class="ico">Path</span><strong>Stories in order</strong></button>
          <button class="tile touchy" type="button" data-go="books"><span class="ico">Fold names</span><strong>Books of the Bible</strong></button>
          <button class="tile touchy" type="button" data-go="character"><span class="ico">Heart</span><strong>Character qualities</strong></button>
        </div>
      </section>
      <section class="panel">
        <p class="kicker">${BIBLE.translationNote}</p>
        <p class="tiny">Now using ${p.translation.toUpperCase()}. Switch inside Memory. Nothing leaves this device. No names are stored.</p>
      </section>
    `)}</div>`;
  }

  function escapeRe(word) {
    return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function plainWords(text) {
    return String(text).replace(/[’‘]/g, "'");
  }
  function wordTokens(text) {
    return plainWords(text).match(/[A-Za-z']{4,}/g) || [];
  }
  function hasWord(text, word) {
    if (!word) return false;
    return new RegExp("\\b" + escapeRe(word) + "\\b", "i").test(plainWords(text));
  }
  const BLANK_ALIASES = {
    Saviour: ["Savior", "Saviour"],
    charity: ["love", "charity"],
    gospel: ["gospel", "Good"],
    courage: ["courage", "courageous"],
    joyful: ["joyful", "joy"],
    soft: ["soft", "gentle"],
    also: ["also", "exactly"],
    care: ["care", "worries", "cares"]
  };
  function blankWord(v, text) {
    const hint = v.blank || "";
    const tries = [hint].concat(BLANK_ALIASES[hint] || []);
    for (let i = 0; i < tries.length; i++) {
      if (hasWord(text, tries[i])) return tries[i];
    }
    const stop = /^(that|this|with|from|unto|them|they|shall|thou|thee|your|have|been|into|upon)$/i;
    const words = wordTokens(text).filter((w) => !stop.test(w.replace(/'/g, "")));
    return words[Math.min(2, words.length - 1)] || words[0] || hint || "word";
  }
  function blanked(text, word) {
    const norm = plainWords(text);
    const re = new RegExp("\\b" + escapeRe(word) + "\\b", "i");
    const m = norm.match(re);
    if (!m) return text + ' <span class="blank">____</span>';
    return text.slice(0, m.index) + '<span class="blank">____</span>' + text.slice(m.index + m[0].length);
  }
  function distractors(correct, pool, p) {
    const words = new Set();
    pool.forEach((v) => {
      wordTokens(textOf(v, p)).forEach((w) => {
        if (w.toLowerCase() !== correct.toLowerCase()) words.add(w);
      });
    });
    const arr = Array.from(words);
    const out = [];
    while (out.length < 3 && arr.length) {
      const i = Math.floor(Math.random() * arr.length);
      const w = arr.splice(i, 1)[0];
      if (!out.some((x) => x.toLowerCase() === w.toLowerCase())) out.push(w);
    }
    const choices = [correct, ...out].slice(0, 4);
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
  }

  let memCursor = 0;
  function memory() {
    const b = band();
    const p = prog();
    const list = versesFor(b);
    if (!list.length) return;
    memCursor = memCursor % list.length;
    const v = list[memCursor];
    const t = textOf(v, p);
    const baby = b === "baby";
    const firstLetters = b === "upper" || b === "primary";
    const word = blankWord(v, t);
    const first = t.split(/\s+/).map((w) => w[0] + w.slice(1).replace(/[A-Za-z]/g, "·")).join(" ");
    const verseHtml = baby
      ? t
      : (firstLetters
        ? `<span class="first-letters">${first}</span>`
        : blanked(t, word));
    const choices = baby ? [] : distractors(word, list, p);
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">Memory pasture · ${memCursor + 1} of ${list.length}</p>
        <div class="toggle">
          <button type="button" class="${p.translation==="kjv"?"on":""}" data-tr="kjv">KJV</button>
          <button type="button" class="${p.translation==="web"?"on":""}" data-tr="web">WEB</button>
        </div>
        <img class="story-art" src="${img(v.img)}" alt="">
        <p class="ref">${v.ref}</p>
        <p class="verse" id="verse-full">${verseHtml}</p>
        ${baby ? `<p class="tiny">Listen. The verse is read when this pasture opens. Tap the sheep when you have heard it.</p>` : `<p class="tiny">${firstLetters ? "First letters hide the words. Hear, then fill the hillside word." : "One word is hidden. Hear the verse, then pick that word."}</p>`}
        <div class="grid ${baby ? "one" : ""}" id="choices">
          ${baby
            ? `<button class="btn lantern wide touchy" type="button" data-sheep="${v.id}">The sheep heard it</button>`
            : choices.map((c) => `<button class="choice touchy" type="button" data-pick="${c.replace(/"/g, "&quot;")}" data-right="${word.replace(/"/g, "&quot;")}">${c}</button>`).join("")}
        </div>
        <div class="grid" style="margin-top:10px">
          <button class="btn olive touchy" type="button" data-speak="${encodeURIComponent(v.ref + ". " + t)}">Hear</button>
          <button class="btn touchy" type="button" data-reveal="1">Show verse</button>
          <button class="btn touchy" type="button" data-mem="-1">Back</button>
          <button class="btn primary touchy" type="button" data-mem="1">Next pasture</button>
        </div>
      </section>
    `)}</div>`;
    if (baby) HillSFX.speak(v.ref + ". " + t);
  }

  function stories() {
    const b = band();
    const list = storiesFor(b);
    const p = prog();
    const rows = list.map((s, i) => {
      const done = p.done.stories[s.id];
      const n = b === "baby" || b === "toddler" || b === "preschool" ? i + 1 : s.order;
      return `<button class="row ${done ? "done" : ""} touchy" type="button" data-story="${s.id}">
        <span><span class="num">${n}</span> ${s.title}</span>
        <span class="tiny">${s.ref}</span>
      </button>`;
    }).join("");
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">The path of stories</p>
        <h2>From the first light to the Lamb</h2>
        <p class="lead">Walk them in order. Original tellings; each one leans on public-domain Scripture.</p>
        <div class="list">${rows}</div>
        ${b === "early" || b === "primary" || b === "upper" ? `<p style="margin-top:12px"><button class="btn primary wide touchy" type="button" data-act="storyquiz">What happened next?</button></p>` : ""}
      </section>
    `)}</div>`;
  }

  function storyView(id) {
    const s = BIBLE.stories.find((x) => x.id === id);
    if (!s) return stories();
    const v = verseById(s.verseId);
    const p = prog();
    const t = v ? textOf(v, p) : "";
    const b = band();
    const list = storiesFor(b);
    const at = list.findIndex((x) => x.id === s.id);
    const n = (b === "baby" || b === "toddler" || b === "preschool") && at >= 0 ? at + 1 : s.order;
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">Story ${n}</p>
        <img class="story-art" src="${img(s.img)}" alt="">
        <h2>${s.title}</h2>
        <p class="ref">${s.ref}</p>
        <p class="lead">${s.text}</p>
        ${v ? `<p class="verse">${t}</p>` : ""}
        <div class="grid">
          <button class="btn olive touchy" type="button" data-speak="${encodeURIComponent(s.title + ". " + s.text + (t ? " " + s.ref + ". " + t : ""))}">Hear</button>
          <button class="btn lantern touchy" type="button" data-storydone="${s.id}">I walked this path</button>
          <button class="btn wide touchy" type="button" data-go="stories">Back to the path</button>
        </div>
      </section>
    `)}</div>`;
  }

  let storyQuizAt = 1;
  function storyQuiz() {
    const list = storiesFor(band());
    if (list.length < 3) return stories();
    storyQuizAt = Math.min(Math.max(storyQuizAt, 1), list.length - 1);
    const prev = list[storyQuizAt - 1];
    const right = list[storyQuizAt];
    const pool = list.filter((s) => s.id !== right.id && s.id !== prev.id);
    const opts = [right];
    while (opts.length < 3 && pool.length) opts.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">What happened next?</p>
        <h2>After “${prev.title}”</h2>
        <div class="list">
          ${opts.map((o) => `<button class="choice touchy" type="button" data-nextstory="${o.id}" data-right="${right.id}">${o.title}</button>`).join("")}
        </div>
        <p style="margin-top:10px"><button class="btn touchy" type="button" data-go="stories">Back</button></p>
      </section>
    `)}</div>`;
  }

  function books() {
    const b = band();
    const list = booksFor(b);
    const p = prog();
    const groups = {};
    list.forEach((bk) => {
      const k = bk.testament + " · " + bk.group;
      (groups[k] = groups[k] || []).push(bk);
    });
    const blocks = Object.keys(groups).map((g) => {
      const items = groups[g].map((bk) =>
        `<button class="row ${p.done.books[bk.name] ? "done" : ""} touchy" type="button" data-book="${bk.name}">
          <span><span class="num">${bk.n}</span> ${bk.name}</span>
          <span class="tiny">${bk.testament}</span>
        </button>`
      ).join("");
      return `<p class="kicker">${g}</p><div class="list">${items}</div>`;
    }).join("");
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">The names of the fold</p>
        <h2>Books of the Bible</h2>
        <p class="lead">${list.length === 66 ? "Sixty-six books, in order." : list.length + " books for this path, in order."} Tap a name, then name the next book.</p>
        <p><button class="btn primary wide touchy" type="button" data-act="bookquiz">What comes next?</button></p>
        ${blocks}
      </section>
    `)}</div>`;
  }

  function bookView(name) {
    const bk = BIBLE.books.find((x) => x.name === name);
    if (!bk) return books();
    const list = booksFor(band());
    const idx = list.findIndex((x) => x.name === bk.name);
    const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
    let quiz = "";
    if (next) {
      const pool = list.filter((x) => x.name !== next.name && x.name !== bk.name);
      const opts = [next];
      while (opts.length < 3 && pool.length) opts.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      quiz = `<p class="tiny">Which book comes after ${bk.name}?</p>
        <div class="grid">
          ${opts.map((o) => `<button class="choice touchy" type="button" data-stampbook="${bk.name}" data-nextbook="${o.name}" data-right="${next.name}">${o.name}</button>`).join("")}
        </div>`;
    } else {
      quiz = `<button class="btn lantern wide touchy" type="button" data-bookdone="${bk.name}">This is the last book on this path</button>`;
    }
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">${bk.testament} · ${bk.group} · book ${bk.n}</p>
        <h2>${bk.name}</h2>
        <p class="lead">${bk.blurb}</p>
        <div class="grid">
          <button class="btn olive touchy" type="button" data-speak="${encodeURIComponent(bk.name + ". " + bk.blurb)}">Hear</button>
          <button class="btn wide touchy" type="button" data-go="books">All books</button>
        </div>
        ${quiz}
      </section>
    `)}</div>`;
  }

  function bookQuiz() {
    const list = booksFor(band());
    if (list.length < 4) return books();
    const i = 1 + Math.floor(Math.random() * (list.length - 1));
    const prev = list[i - 1];
    const right = list[i];
    const pool = list.filter((x) => x.name !== right.name && x.name !== prev.name);
    const opts = [right];
    while (opts.length < 4 && pool.length) opts.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    for (let x = opts.length - 1; x > 0; x--) {
      const j = Math.floor(Math.random() * (x + 1));
      [opts[x], opts[j]] = [opts[j], opts[x]];
    }
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">Book fold</p>
        <h2>After ${prev.name} comes…</h2>
        <div class="grid">
          ${opts.map((o) => `<button class="choice touchy" type="button" data-nextbook="${o.name}" data-right="${right.name}">${o.name}</button>`).join("")}
        </div>
        <p style="margin-top:10px"><button class="btn touchy" type="button" data-go="books">Back</button></p>
      </section>
    `)}</div>`;
  }

  function character() {
    const list = qualitiesFor(band());
    const p = prog();
    const rows = list.map((q) =>
      `<button class="row ${p.done.character[q.id] ? "done" : ""} touchy" type="button" data-qual="${q.id}">
        <span>${q.name}</span><span class="tiny">${p.done.character[q.id] ? "stamped" : "walk this"}</span>
      </button>`
    ).join("");
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">Heart of the hillside</p>
        <h2>Character qualities</h2>
        <p class="lead">Fruit of the Spirit and other good paths, each tied to a public-domain verse. Original notes — not a copied chart.</p>
        <div class="list">${rows}</div>
      </section>
    `)}</div>`;
  }

  function qualView(id) {
    const q = BIBLE.qualities.find((x) => x.id === id);
    if (!q) return character();
    const v = verseById(q.verseId);
    const p = prog();
    const others = qualitiesFor(band()).filter((x) => x.id !== id);
    const opts = [q];
    while (opts.length < 3 && others.length) opts.push(others.splice(Math.floor(Math.random() * others.length), 1)[0]);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    appEl.innerHTML = `<div class="app">${shell(`
      <section class="panel">
        <p class="kicker">A quality of the heart</p>
        <img class="story-art" src="${img("olives")}" alt="Olive trees on a stone terrace">
        <h2>${q.name}</h2>
        <p class="lead">${q.note}</p>
        ${v ? `<p class="ref">${v.ref}</p><p class="verse">${textOf(v, p)}</p>` : ""}
        <p class="tiny">Which quality is this note describing?</p>
        <div class="grid">
          ${opts.map((o) => `<button class="choice touchy" type="button" data-qualpick="${o.id}" data-right="${q.id}">${o.name}</button>`).join("")}
        </div>
        <p style="margin-top:10px"><button class="btn olive touchy" type="button" data-speak="${encodeURIComponent(q.name + ". " + q.note + (v ? " " + v.ref + ". " + textOf(v, p) : ""))}">Hear</button>
        <button class="btn touchy" type="button" data-go="character">All qualities</button></p>
      </section>
    `)}</div>`;
  }

  function render() {
    const b = band();
    if (!b) {
      picker();
      return;
    }
    document.body.className = "band-" + b;
    const screen = hashScreen();
    if (screen.startsWith("story/")) return storyView(screen.slice(6));
    if (screen.startsWith("book/")) return bookView(decodeURIComponent(screen.slice(5)));
    if (screen.startsWith("qual/")) return qualView(screen.slice(5));
    if (screen === "memory") return memory();
    if (screen === "stories") return stories();
    if (screen === "storyquiz") return storyQuiz();
    if (screen === "books") return books();
    if (screen === "bookquiz") return bookQuiz();
    if (screen === "character") return character();
    home();
  }

  document.body.addEventListener("click", (e) => {
    const t = e.target.closest("[data-band],[data-go],[data-act],[data-tr],[data-speak],[data-pick],[data-sheep],[data-mem],[data-reveal],[data-story],[data-storydone],[data-nextstory],[data-book],[data-bookdone],[data-nextbook],[data-qual],[data-qualpick]");
    if (!t) return;
    if (t.dataset.band) {
      setBand(t.dataset.band);
      go("home");
      return;
    }
    if (t.dataset.go) { go(t.dataset.go); return; }
    if (t.dataset.act === "reband") {
      localStorage.removeItem(KEY_BAND);
      const url = new URL(location.href);
      url.searchParams.delete("band");
      history.replaceState({}, "", url);
      picker();
      return;
    }
    if (t.dataset.act === "storyquiz") { go("storyquiz"); return; }
    if (t.dataset.act === "bookquiz") { go("bookquiz"); return; }
    if (t.dataset.tr) {
      setProg((p) => { p.translation = t.dataset.tr; });
      memory();
      return;
    }
    if (t.dataset.speak) {
      const spoken = HillSFX.speak(decodeURIComponent(t.dataset.speak));
      if (!spoken) t.textContent = "Read it aloud together";
      return;
    }
    if (t.dataset.reveal) {
      const b = band();
      const v = versesFor(b)[memCursor];
      const p = prog();
      const el = $("#verse-full");
      if (el) el.textContent = textOf(v, p);
      return;
    }
    if (t.dataset.mem) {
      const list = versesFor(band());
      memCursor = (memCursor + Number(t.dataset.mem) + list.length) % list.length;
      memory();
      return;
    }
    if (t.dataset.sheep) {
      setProg((p) => { p.done.memory[t.dataset.sheep] = true; });
      gatherSheep(t.dataset.sheep);
      return;
    }
    if (t.dataset.pick != null) {
      const right = t.dataset.right;
      if (t.dataset.pick.toLowerCase() === right.toLowerCase()) {
        t.classList.add("right");
        const v = versesFor(band())[memCursor];
        setProg((p) => { p.done.memory[v.id] = true; });
        gatherSheep(v.id);
      } else {
        t.classList.add("wrong");
        HillSFX.miss();
      }
      return;
    }
    if (t.dataset.story) { go("story/" + t.dataset.story); return; }
    if (t.dataset.storydone) {
      setProg((p) => { p.done.stories[t.dataset.storydone] = true; });
      addLantern();
      return;
    }
    if (t.dataset.nextstory) {
      if (t.dataset.nextstory === t.dataset.right) {
        t.classList.add("right");
        storyQuizAt += 1;
        addLantern();
        setTimeout(storyQuiz, 700);
      } else {
        t.classList.add("wrong");
        HillSFX.miss();
      }
      return;
    }
    if (t.dataset.book) { go("book/" + encodeURIComponent(t.dataset.book)); return; }
    if (t.dataset.bookdone) {
      setProg((p) => { p.done.books[t.dataset.bookdone] = true; });
      addStar();
      return;
    }
    if (t.dataset.nextbook) {
      if (t.dataset.nextbook === t.dataset.right) {
        t.classList.add("right");
        const stamped = t.dataset.stampbook || t.dataset.nextbook;
        setProg((p) => { p.done.books[stamped] = true; });
        addStar();
        if (!t.dataset.stampbook) setTimeout(bookQuiz, reduceMotion() ? 200 : 700);
      } else {
        t.classList.add("wrong");
        HillSFX.miss();
      }
      return;
    }
    if (t.dataset.qual) { go("qual/" + t.dataset.qual); return; }
    if (t.dataset.qualpick) {
      if (t.dataset.qualpick === t.dataset.right) {
        t.classList.add("right");
        setProg((p) => { p.done.character[t.dataset.right] = true; });
        addStar();
      } else {
        t.classList.add("wrong");
        HillSFX.miss();
      }
    }
  });

  window.addEventListener("hashchange", render);
  if (document.documentElement.dataset.runner !== "1" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
  render();
})();
