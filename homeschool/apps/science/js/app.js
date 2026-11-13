(function () {
  const D = window.HSScienceData;
  const Store = window.HSScienceStore;
  const AudioX = window.HSScienceAudio;
  const Speech = window.HSScienceSpeech;

  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function asset(path) {
    if (!path) return path;
    if (/^(data:|blob:|https?:)/i.test(path)) return path;
    if (window.HS && typeof window.HS.url === "function") return window.HS.url(path);
    const base = document.documentElement.dataset.appBase || "./";
    try { return new URL(path, new URL(base, location.href)).href; } catch (e) { return path; }
  }

  const state = {
    band: null,
    view: "camp",
    trailId: null,
    quizIndex: 0,
    quizRight: 0,
    sortId: null,
    placed: {},
    matchId: null,
    picked: null,
    matched: {},
    specimenId: null,
    habitatId: null,
    expId: null,
    journalId: null,
    magSrc: "images/specimens/oak-leaf.svg",
    babyIndex: 0
  };

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("on");
    setTimeout(function () { el.classList.remove("on"); }, 2200);
  }

  function say(text) {
    if (!text || !Speech.isOn()) return;
    const rate = state.band === "baby" || state.band === "toddler" ? 0.85 : 0.95;
    const pitch = state.band === "baby" ? 1.05 : 1;
    if (window.HS && typeof HS.speak === "function" && (HS.inRunner || document.documentElement.dataset.runner === "1")) {
      HS.speak(text, { rate: rate, pitch: pitch });
      return;
    }
    Speech.speak(text, state.band);
  }

  function show(id) {
    state.view = id;
    $$(".view").forEach(function (v) { v.classList.toggle("on", v.id === "view-" + id); });
    $$(".tabs button").forEach(function (b) {
      b.setAttribute("aria-current", b.getAttribute("data-view") === id ? "page" : "false");
    });
    AudioX.page();
    window.scrollTo(0, 0);
  }

  function progress() { return Store.read(); }

  function bandLabel() {
    const b = D.bands.filter(function (x) { return x.id === state.band; })[0];
    return b ? b.label : "";
  }

  function paintStats() {
    const p = progress();
    $$("[data-stat='stars']").forEach(function (n) { n.textContent = String(p.stars || 0); });
    $$("[data-stat='specimens']").forEach(function (n) { n.textContent = String((p.specimens || []).length); });
    $$("[data-stat='stamps']").forEach(function (n) { n.textContent = String((p.stamps || []).length); });
    $("#band-pill").textContent = bandLabel();
  }

  function award(kind, id, stars, message) {
    Store.award(kind, id, stars);
    AudioX.stamp();
    paintStats();
    toast(message || "Field stamp earned.");
  }

  function img(src, alt, cls) {
    return '<img src="' + asset(src) + '" alt="' + (alt || "") + '" class="' + (cls || "") + '">';
  }

  function cardButton(opts) {
    const got = opts.got ? " got" : "";
    return '<button class="card' + got + '" data-act="' + opts.act + '" data-id="' + opts.id + '">' +
      img(opts.img, opts.alt || opts.title) +
      '<span class="tag">' + (opts.tag || "") + "</span>" +
      "<h3>" + opts.title + "</h3>" +
      "<p>" + (opts.blurb || "") + "</p></button>";
  }

  function renderPicker() {
    const box = $("#band-grid");
    box.innerHTML = D.bands.map(function (b) {
      return '<button class="band-pick" data-act="choose-band" data-id="' + b.id + '">' +
        img(b.img, b.label) +
        "<span><strong>" + b.label + "</strong><br>" + b.map + "</span></button>";
    }).join("");
    show("picker");
  }

  function syncSpeakBtn() {
    const on = Speech.isOn();
    const btn = $("#btn-speak");
    if (!btn) return;
    btn.classList.toggle("speak-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function enterBand(id) {
    state.band = id;
    Store.setBand(id);
    document.body.classList.toggle("baby-mode", id === "baby" && !document.documentElement.dataset.runner);
    const root = $("#app");
    if (root) root.classList.toggle("baby-mode", id === "baby");
    if (id === "baby" || id === "toddler") {
      Speech.setOn(true);
      syncSpeakBtn();
    }
    paintStats();
    if (id === "baby") renderBaby();
    else renderCamp();
  }

  function renderCamp() {
    if (state.band === "baby") { renderBaby(); return; }
    const p = progress();
    $("#camp-kicker").textContent = "Base camp · " + bandLabel();
    $("#camp-lede").textContent = "A naturalist's field expedition. Walk habitats, stamp specimen cards, use a hand lens, and run safe home labs. God's design is the frame.";
    const posts = D.posts.filter(function (x) { return D.inBand(x, state.band); });
    $("#camp-grid").innerHTML = posts.map(function (post) {
      return cardButton({ act: "nav", id: post.view, img: post.img, title: post.label, blurb: post.blurb, tag: "trail post", alt: post.label });
    }).join("");
    const leaves = [];
    for (let i = 0; i < 12; i++) leaves.push('<span class="leaf' + (i < Math.min(12, p.stamps.length) ? " filled" : "") + '"></span>');
    $("#camp-leaves").innerHTML = leaves.join("");
    show("camp");
    say("Field expedition base camp. " + bandLabel() + " trail.");
  }

  function renderBaby() {
    const plates = D.babyPlates;
    const n = plates.length;
    state.babyIndex = ((state.babyIndex % n) + n) % n;
    const pl = plates[state.babyIndex];
    const box = $("#baby-stage");
    box.innerHTML =
      '<button class="baby-plate" data-act="baby" data-id="' + pl.id + '">' +
        img(pl.img, pl.name, "hero-plate") +
        '<span class="baby-word">' + pl.name + "</span>" +
      "</button>" +
      '<div class="puddle-grow" id="baby-puddle" hidden></div>' +
      '<div class="baby-nav">' +
        '<button type="button" data-act="baby-prev">Back</button>' +
        '<span class="chip">' + (state.babyIndex + 1) + " / " + n + "</span>" +
        '<button type="button" data-act="baby-next">Next</button>' +
      "</div>";
    show("baby");
    say(pl.read);
  }

  function renderHabitats() {
    const list = D.habitats.filter(function (h) { return D.inBand(h, state.band); });
    $("#habitat-grid").innerHTML = list.map(function (h) {
      const p = progress();
      const got = h.finds.some(function (f) { return p.specimens.indexOf(f) !== -1; });
      return cardButton({ act: "habitat", id: h.id, img: h.img, title: h.name, blurb: h.blurb, tag: "habitat", got: got, alt: h.name });
    }).join("");
    show("habitats");
  }

  function renderHabitat(id) {
    const h = D.habitats.filter(function (x) { return x.id === id; })[0];
    if (!h) return;
    state.habitatId = id;
    $("#habitat-detail").innerHTML =
      "<p class='kicker'>Habitat plate</p><h2>" + h.name + "</h2>" +
      img(h.img, h.name, "hero-plate") +
      "<p class='lede'>" + h.blurb + " " + h.read + "</p>" +
      "<div class='row'><button data-act='magnify-src' data-id='" + h.img + "'>Hand lens</button>" +
      "<button class='moss' data-act='speak-text' data-text=\"" + encodeURIComponent(h.read) + "\">Read aloud</button></div>" +
      "<h3>Finds in this place</h3><div class='grid' id='habitat-finds'></div>";
    const finds = D.specimens.filter(function (s) { return h.finds.indexOf(s.id) !== -1 && D.inBand(s, state.band); });
    $("#habitat-finds").innerHTML = finds.map(function (s) {
      const got = progress().specimens.indexOf(s.id) !== -1;
      return cardButton({ act: "specimen", id: s.id, img: s.img, title: s.name, blurb: s.latin, tag: s.kind, got: got, alt: s.name });
    }).join("");
    show("habitat");
    say(h.read);
  }

  function renderTin() {
    const have = progress().specimens;
    const list = D.specimens.filter(function (s) { return D.inBand(s, state.band); });
    $("#tin-grid").innerHTML = list.map(function (s) {
      const got = have.indexOf(s.id) !== -1;
      return cardButton({ act: "specimen", id: s.id, img: s.img, title: s.name, blurb: got ? s.latin : "Not yet stamped", tag: s.kind, got: got, alt: s.name });
    }).join("");
    $("#tin-lede").textContent = have.length + " plates stamped. Look closely, then collect.";
    show("tin");
  }

  function renderSpecimen(id) {
    const s = D.specimens.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    state.specimenId = id;
    const got = progress().specimens.indexOf(id) !== -1;
    $("#specimen-detail").innerHTML =
      "<p class='kicker'>" + s.latin + "</p><h2>" + s.name + "</h2>" +
      img(s.img, s.name, "hero-plate") +
      "<p>" + s.fact + "</p><p><em>" + s.design + "</em></p>" +
      "<div class='row'>" +
      "<button data-act='magnify-src' data-id='" + s.img + "'>Hand lens</button>" +
      "<button class='moss' data-act='speak-text' data-text=\"" + encodeURIComponent(s.fact + " " + s.design) + "\">Read aloud</button>" +
      (got ? "<span class='chip'>Already in the tin</span>" : "<button class='stamp' data-act='collect' data-id='" + s.id + "'>Stamp into tin</button>") +
      "</div>";
    show("specimen");
    say(s.fact + " " + s.design);
  }

  function renderMagnify(src) {
    state.magSrc = src || state.magSrc;
    const pic = $("#mag-pic");
    pic.src = asset(state.magSrc);
    pic.alt = "Plate under a hand lens";
    const menu = D.specimens.filter(function (s) { return D.inBand(s, state.band); }).concat(
      D.habitats.filter(function (h) { return D.inBand(h, state.band); })
    );
    $("#mag-picks").innerHTML = menu.slice(0, 16).map(function (x) {
      return '<button class="chip-btn" data-act="magnify-src" data-id="' + x.img + '">' + (x.name || x.id) + "</button>";
    }).join("");
    show("magnify");
  }

  function bindLens() {
    const wrap = $("#mag-wrap");
    const lens = $("#lens");
    const pic = $("#mag-pic");
    function move(clientX, clientY) {
      const r = wrap.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      const size = 140;
      lens.style.display = "block";
      lens.style.left = (x - size / 2) + "px";
      lens.style.top = (y - size / 2) + "px";
      const scale = 2.2;
      const px = (x / r.width) * pic.naturalWidth || (x / r.width) * 600;
      const py = (y / r.height) * pic.naturalHeight || (y / r.height) * 400;
      lens.style.backgroundImage = 'url("' + pic.src + '")';
      lens.style.backgroundSize = (r.width * scale) + "px " + (r.height * scale) + "px";
      lens.style.backgroundPosition = (-x * scale + size / 2) + "px " + (-y * scale + size / 2) + "px";
      void px; void py;
    }
    wrap.addEventListener("pointermove", function (e) { move(e.clientX, e.clientY); });
    wrap.addEventListener("pointerdown", function (e) { wrap.setPointerCapture(e.pointerId); move(e.clientX, e.clientY); });
    wrap.addEventListener("pointerleave", function () { lens.style.display = "none"; });
  }

  function renderLab() {
    const list = D.experiments.filter(function (e) { return D.inBand(e, state.band); });
    const done = progress().experiments;
    $("#lab-grid").innerHTML = list.map(function (e) {
      return cardButton({ act: "exp", id: e.id, img: e.img, title: e.title, blurb: e.need, tag: done.indexOf(e.id) !== -1 ? "logged" : "lab", got: done.indexOf(e.id) !== -1, alt: e.title });
    }).join("");
    show("lab");
  }

  function renderExp(id) {
    const e = D.experiments.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    state.expId = id;
    const done = progress().experiments.indexOf(id) !== -1;
    $("#exp-detail").innerHTML =
      "<p class='kicker'>Lab tent</p><h2>" + e.title + "</h2>" +
      img(e.img, e.title, "hero-plate") +
      "<div class='safety'><strong>Safety.</strong> " + e.safety + "</div>" +
      "<p><strong>Gather:</strong> " + e.need + "</p>" +
      "<ol class='exp-steps'>" + e.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>" +
      "<div class='row'>" +
      "<a class='btn' href='printables/experiments.html#" + e.id + "'>Print steps</a>" +
      "<button class='moss' data-act='speak-text' data-text=\"" + encodeURIComponent(e.title + ". " + e.safety + " " + e.steps.join(" ")) + "\">Read aloud</button>" +
      (done ? "<span class='chip'>Logged</span>" : "<button class='stamp' data-act='log-exp' data-id='" + e.id + "'>Stamp lab log</button>") +
      "</div>";
    show("exp");
    say(e.title + ". " + e.safety);
  }

  function renderBody() {
    const senses = D.senses.filter(function (s) { return D.inBand(s, state.band); });
    $("#body-senses").innerHTML = senses.map(function (s) {
      return cardButton({ act: "speak-now", id: s.id, img: s.img, title: s.name, blurb: s.organ + ". " + s.fact, tag: "sense", alt: s.name });
    }).join("");
    const topics = D.topics.filter(function (t) { return D.inBand(t, state.band) && t.marker <= 12; });
    $("#body-systems").innerHTML = topics.length
      ? topics.map(function (t) {
        const got = !!progress().trails[t.id];
        return cardButton({ act: "trail", id: t.id, img: t.img, title: t.title, blurb: "Marker " + t.marker, tag: "body trail", got: got, alt: t.title });
      }).join("")
      : "<p>Body system trails open on Ridge and Summit Lab.</p>";
    show("body");
  }

  function renderMachines() {
    const list = D.machines.filter(function (m) { return D.inBand(m, state.band); });
    $("#machine-grid").innerHTML = list.map(function (m) {
      return cardButton({ act: "machine", id: m.id, img: m.img, title: m.name, blurb: m.fact, tag: "machine", alt: m.name });
    }).join("");
    show("machines");
  }

  function renderMachine(id) {
    const m = D.machines.filter(function (x) { return x.id === id; })[0];
    if (!m) return;
    $("#machine-detail").innerHTML =
      "<p class='kicker'>Machine shed</p><h2>" + m.name + "</h2>" +
      img(m.img, m.name, "hero-plate") +
      "<p>" + m.fact + "</p><p><em>" + m.body + "</em></p>" +
      "<div class='row'><button class='stamp' data-act='stamp-id' data-id='machine-" + m.id + "'>Stamp this machine</button>" +
      "<button class='moss' data-act='speak-text' data-text=\"" + encodeURIComponent(m.fact + " " + m.body) + "\">Read aloud</button></div>";
    show("machine");
    say(m.fact);
  }

  function renderWeather() {
    const list = D.weather.filter(function (w) { return D.inBand(w, state.band); });
    $("#weather-grid").innerHTML = list.map(function (w) {
      return cardButton({ act: "weather", id: w.id, img: w.img, title: w.name, blurb: w.fact, tag: "sky", alt: w.name });
    }).join("");
    show("weather");
  }

  function renderWeatherItem(id) {
    const w = D.weather.filter(function (x) { return x.id === id; })[0];
    if (!w) return;
    $("#weather-detail").innerHTML =
      "<p class='kicker'>Weather hill</p><h2>" + w.name + "</h2>" +
      img(w.img, w.name, "hero-plate") +
      "<p>" + w.fact + "</p>" +
      "<div class='row'><button class='stamp' data-act='stamp-id' data-id='weather-" + w.id + "'>Stamp sky note</button>" +
      "<button class='moss' data-act='speak-text' data-text=\"" + encodeURIComponent(w.fact) + "\">Read aloud</button></div>";
    show("weather-item");
    say(w.fact);
    if (id === "wind") AudioX.wind();
    if (id === "rain") AudioX.drop();
  }

  function renderCreation() {
    const notes = D.topics.filter(function (t) { return D.inBand(t, state.band) && t.marker >= 20; });
    const verses = D.scripture.map(function (s) {
      return "<blockquote><p>" + s.text + "</p><footer>" + s.ref + "</footer></blockquote>";
    }).join("");
    $("#creation-verses").innerHTML = verses;
    $("#creation-grid").innerHTML = [
      cardButton({ act: "magnify-src", id: "images/creation/heavens.svg", img: "images/creation/heavens.svg", title: "The heavens", blurb: "Psalm 19:1", tag: "lookout", alt: "Night sky" }),
      cardButton({ act: "magnify-src", id: "images/creation/kinds.svg", img: "images/creation/kinds.svg", title: "After their kind", blurb: "Beast, fish, bird", tag: "lookout", alt: "Kinds" }),
      cardButton({ act: "magnify-src", id: "images/creation/fossil.svg", img: "images/creation/fossil.svg", title: "Records in stone", blurb: "Fossils and layers", tag: "lookout", alt: "Fossil plate" }),
      cardButton({ act: "magnify-src", id: "images/creation/eye.svg", img: "images/creation/eye.svg", title: "The eye", blurb: "Parts fitted for seeing", tag: "lookout", alt: "Eye" })
    ].join("") + notes.map(function (t) {
      const got = !!progress().trails[t.id];
      return cardButton({ act: "trail", id: t.id, img: t.img, title: t.title, blurb: "Marker " + t.marker, tag: "creation trail", got: got, alt: t.title });
    }).join("");
    show("creation");
  }

  function renderTrails() {
    const list = D.topics.filter(function (t) { return D.inBand(t, state.band); });
    $("#trail-grid").innerHTML = list.map(function (t) {
      const got = !!progress().trails[t.id];
      return cardButton({ act: "trail", id: t.id, img: t.img, title: t.title, blurb: "Field marker " + t.marker, tag: "topic", got: got, alt: t.title });
    }).join("");
    $("#trail-note").textContent = "Topic titles only. Original field notes and quizzes — not class recitation wording.";
    show("trails");
  }

  function renderTrail(id) {
    const t = D.topics.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    state.trailId = id;
    state.quizIndex = 0;
    state.quizRight = 0;
    $("#trail-detail").innerHTML =
      "<div id='trail-brief'>" +
      "<p class='kicker'>Field marker " + t.marker + "</p><h2>" + t.title + "</h2>" +
      img(t.img, t.title, "hero-plate") +
      "<p class='lede'>" + t.notes + "</p>" +
      "<div class='row'><button class='moss' data-act='speak-text' data-text=\"" + encodeURIComponent(t.notes) + "\">Read notes</button>" +
      "<button class='ink' data-act='quiz-start' data-id='" + t.id + "'>Walk the quiz trail</button></div>" +
      "</div>" +
      "<div id='quiz-box'></div>";
    show("trail");
    say(t.title + ". " + t.notes);
  }

  function shuffleOrder(n) {
    const order = [];
    for (let i = 0; i < n; i++) order.push(i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }
    return order;
  }

  function renderQuiz() {
    const t = D.topics.filter(function (x) { return x.id === state.trailId; })[0];
    if (!t) return;
    const brief = $("#trail-brief");
    const box = $("#quiz-box");
    if (state.quizIndex >= t.quiz.length) {
      if (brief) brief.hidden = false;
      award("trail", t.id, 3, "Trail stamped: " + t.title);
      box.innerHTML = "<p>Trail complete. Footprints logged — no grades, just stamps.</p>" +
        "<p>Right steps on this walk: " + state.quizRight + " of " + t.quiz.length + ".</p>" +
        "<button class='moss' data-act='nav' data-id='trails'>Back to markers</button>";
      AudioX.ok();
      return;
    }
    if (brief) brief.hidden = true;
    const item = t.quiz[state.quizIndex];
    const order = shuffleOrder(item.a.length);
    box.innerHTML = "<p class='kicker'>Step " + (state.quizIndex + 1) + " of " + t.quiz.length + "</p><h3>" + item.q + "</h3>" +
      "<div class='choices'>" + order.map(function (orig) {
        return "<button data-act='quiz-ans' data-i='" + orig + "'>" + item.a[orig] + "</button>";
      }).join("") + "</div>";
    say(item.q);
    box.scrollIntoView({ block: "start" });
  }

  function answerQuiz(orig) {
    const t = D.topics.filter(function (x) { return x.id === state.trailId; })[0];
    const item = t.quiz[state.quizIndex];
    const buttons = $$("#quiz-box .choices button");
    buttons.forEach(function (b) { b.disabled = true; });
    const pick = buttons.filter(function (b) { return Number(b.getAttribute("data-i")) === orig; })[0];
    const right = buttons.filter(function (b) { return Number(b.getAttribute("data-i")) === item.ok; })[0];
    if (orig === item.ok) {
      if (pick) pick.classList.add("right");
      state.quizRight += 1;
      AudioX.ok();
      toast("True field note.");
    } else {
      if (pick) pick.classList.add("wrong");
      if (right) right.classList.add("right");
      AudioX.miss();
      toast("Look again at the plate.");
    }
    setTimeout(function () {
      state.quizIndex += 1;
      renderQuiz();
    }, 900);
  }

  function picFirst() {
    return state.band === "toddler" || state.band === "preschool";
  }

  function chipButton(act, id, label, src) {
    const pic = (picFirst() && src) ? img(src, label, "chip-pic") : "";
    return '<button class="chip-btn' + (pic ? " pic" : "") + '" data-act="' + act + '" data-id="' + id + '">' +
      pic + "<span>" + label + "</span></button>";
  }

  function renderSorts() {
    const list = D.sorts.filter(function (s) { return D.inBand(s, state.band); }).concat(
      D.matches.filter(function (m) { return D.inBand(m, state.band); }).map(function (m) {
        return { id: "match:" + m.id, title: m.title, kind: "match", img: m.img };
      })
    );
    $("#sort-grid").innerHTML = list.map(function (s) {
      const act = (s.id.indexOf("match:") === 0) ? "match" : "sort";
      const id = s.id.replace("match:", "");
      if (s.img) {
        return cardButton({ act: act, id: id, img: s.img, title: s.title, blurb: s.prompt || "Pairs", tag: act, alt: s.title });
      }
      return '<button class="card" data-act="' + act + '" data-id="' + id + '"><h3>' + s.title + "</h3></button>";
    }).join("");
    show("sorts");
  }

  function renderSort(id) {
    const s = D.sorts.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    state.sortId = id;
    state.placed = {};
    $("#sort-detail").innerHTML =
      "<p class='kicker'>Sort table</p><h2>" + s.title + "</h2><p>" + s.prompt + "</p>" +
      "<div id='sort-pool'></div><div class='sort-bins' id='sort-bins'></div>" +
      "<div class='row'><button class='stamp' data-act='sort-check'>Check the table</button></div>";
    $("#sort-bins").innerHTML = s.bins.map(function (b) {
      return '<div class="bin" data-bin="' + b.id + '"><h3>' + b.name + "</h3><div class='bin-items'></div></div>";
    }).join("");
    drawSortPool();
    show("sort");
    say(s.prompt);
  }

  function drawSortPool() {
    const s = D.sorts.filter(function (x) { return x.id === state.sortId; })[0];
    const used = state.placed;
    $("#sort-pool").innerHTML = s.items.filter(function (it) { return !used[it.id]; }).map(function (it) {
      return chipButton("sort-pick", it.id, it.name, it.img);
    }).join("") || "<p class='chip'>All placed. Check the table.</p>";
  }

  function renderMatch(id) {
    const m = D.matches.filter(function (x) { return x.id === id; })[0];
    if (!m) return;
    state.matchId = id;
    state.picked = null;
    state.matched = {};
    const left = m.pairs.map(function (p, i) { return { t: p.l, i: i, side: "l" }; });
    const right = m.pairs.map(function (p, i) { return { t: p.r, i: i, side: "r" }; });
    right.sort(function () { return Math.random() - 0.5; });
    $("#sort-detail").innerHTML =
      "<p class='kicker'>Match</p><h2>" + m.title + "</h2>" +
      "<div class='row' id='match-left'></div><div class='row' id='match-right'></div>";
    $("#match-left").innerHTML = left.map(function (x) {
      const src = m.pairs[x.i].lImg;
      const pic = (picFirst() && src) ? img(src, x.t, "chip-pic") : "";
      return '<button class="chip-btn' + (pic ? " pic" : "") + '" data-act="match-tap" data-side="l" data-i="' + x.i + '">' +
        pic + "<span>" + x.t + "</span></button>";
    }).join("");
    $("#match-right").innerHTML = right.map(function (x) {
      const src = m.pairs[x.i].rImg;
      const pic = (picFirst() && src) ? img(src, x.t, "chip-pic") : "";
      return '<button class="chip-btn' + (pic ? " pic" : "") + '" data-act="match-tap" data-side="r" data-i="' + x.i + '">' +
        pic + "<span>" + x.t + "</span></button>";
    }).join("");
    show("sort");
  }

  function renderJournal() {
    const prompts = D.journalPrompts.filter(function (p) { return D.inBand(p, state.band); });
    const notes = progress().journal || [];
    $("#journal-prompts").innerHTML = prompts.map(function (p) {
      return '<button class="card" data-act="journal-new" data-id="' + p.id + '"><h3>Prompt</h3><p>' + p.text + "</p></button>";
    }).join("");
    $("#journal-list").innerHTML = notes.length ? notes.map(function (n) {
      return '<button class="card" data-act="journal-open" data-id="' + n.id + '"><span class="tag">' + new Date(n.at).toLocaleDateString() + "</span><h3>" + n.title + "</h3><p>" + (n.text || "").slice(0, 80) + "</p></button>";
    }).join("") : "<p>No pages yet. A naturalist writes the date and the place.</p>";
    show("journal");
  }

  function openJournal(id, promptId) {
    const notes = progress().journal || [];
    let note = notes.filter(function (n) { return n.id === id; })[0];
    const prompt = D.journalPrompts.filter(function (p) { return p.id === promptId; })[0];
    if (!note) {
      note = { id: "j-" + Date.now(), title: "Field note", text: "", prompt: prompt ? prompt.text : "" };
    }
    state.journalId = note.id;
    $("#journal-editor").innerHTML =
      "<p class='kicker'>" + (note.prompt || "Field note") + "</p>" +
      "<div class='journal-page'><textarea id='journal-text' maxlength='2000' placeholder='Date, place, what you saw…'>" + (note.text || "") + "</textarea></div>" +
      "<div class='row'><button class='moss' data-act='journal-save'>Keep this page</button>" +
      "<a class='btn' href='printables/journal.html'>Print a blank page</a></div>";
    show("journal-edit");
  }

  function route(act, id, extra) {
    if (act === "choose-band") enterBand(id);
    else if (act === "nav") {
      if (id === "camp") renderCamp();
      else if (id === "habitats") renderHabitats();
      else if (id === "tin") renderTin();
      else if (id === "magnify") renderMagnify();
      else if (id === "lab") renderLab();
      else if (id === "body") renderBody();
      else if (id === "machines") renderMachines();
      else if (id === "weather") renderWeather();
      else if (id === "creation") renderCreation();
      else if (id === "trails") renderTrails();
      else if (id === "journal") renderJournal();
      else if (id === "sorts") renderSorts();
      else if (id === "picker") renderPicker();
    } else if (act === "habitat") renderHabitat(id);
    else if (act === "specimen") renderSpecimen(id);
    else if (act === "collect") {
      award("specimen", id, 2, id.replace(/-/g, " ") + " stamped into the tin.");
      renderSpecimen(id);
    }     else if (act === "magnify-src") renderMagnify(id);
    else if (act === "exp") renderExp(id);
    else if (act === "log-exp") {
      award("experiment", id, 2, "Lab logged.");
      renderExp(id);
    } else if (act === "machine") renderMachine(id);
    else if (act === "weather") renderWeatherItem(id);
    else if (act === "trail") renderTrail(id);
    else if (act === "quiz-start") { state.trailId = id; state.quizIndex = 0; state.quizRight = 0; renderQuiz(); }
    else if (act === "quiz-ans") answerQuiz(Number(id));
    else if (act === "baby-next") { state.babyIndex += 1; renderBaby(); }
    else if (act === "baby-prev") { state.babyIndex -= 1; renderBaby(); }
    else if (act === "sort") renderSort(id);
    else if (act === "match") renderMatch(id);
    else if (act === "stamp-id") award("stamp", id, 1, "Sky or shed stamped.");
    else if (act === "baby") {
      const pl = D.babyPlates.filter(function (x) { return x.id === id; })[0];
      if (pl) {
        award("baby", pl.id, 1, pl.name);
        if (pl.sound === "drop") AudioX.drop();
        else if (pl.sound === "chirp") AudioX.chirp();
        else AudioX.ok();
        say(pl.read);
        if (pl.id === "rain") {
          const puddle = $("#baby-puddle");
          if (puddle) {
            puddle.hidden = false;
            requestAnimationFrame(function () { puddle.classList.add("on"); });
          }
          setTimeout(function () {
            const idx = D.babyPlates.findIndex(function (x) { return x.id === "puddle"; });
            if (idx >= 0) {
              state.babyIndex = idx;
              renderBaby();
            }
          }, 900);
        }
      }
    } else if (act === "speak-text") {
      try { say(decodeURIComponent(id)); } catch (e) { say(id); }
    } else if (act === "speak-now") {
      const s = D.senses.filter(function (x) { return x.id === id; })[0];
      if (s) { say(s.name + ". " + s.fact); toast(s.fact); award("stamp", "sense-" + s.id, 1, s.name + " noted."); }
    } else if (act === "journal-new") openJournal(null, id);
    else if (act === "journal-open") openJournal(id);
    else if (act === "journal-save") {
      const text = ($("#journal-text") || {}).value || "";
      Store.saveJournal({ id: state.journalId, text: text, title: "Field note" });
      toast("Page kept in this device's satchel.");
      AudioX.ok();
      renderJournal();
    }     else if (act === "sort-pick") {
      delete state.placed[id];
      state.picked = id;
      paintBins();
      toast("Tap a bin.");
    } else if (act === "sort-check") {
      const s = D.sorts.filter(function (x) { return x.id === state.sortId; })[0];
      let ok = 0;
      s.items.forEach(function (it) { if (state.placed[it.id] === it.bin) ok += 1; });
      if (ok === s.items.length) {
        award("stamp", "sort-" + s.id, 2, "Table is true.");
        AudioX.ok();
      } else {
        toast(ok + " of " + s.items.length + " in the right bin. Try again.");
        AudioX.miss();
      }
    } else if (act === "match-tap") {
      const side = extra;
      const idx = Number(id);
      if (!state.picked) {
        state.picked = { side: side, i: idx };
      } else {
        if (state.picked.side !== side && state.picked.i === idx) {
          state.matched[idx] = true;
          AudioX.ok();
          toast("Pair found.");
          $$("[data-act='match-tap'][data-i='" + idx + "']").forEach(function (b) { b.disabled = true; b.classList.add("right"); });
          const m = D.matches.filter(function (x) { return x.id === state.matchId; })[0];
          if (Object.keys(state.matched).length === m.pairs.length) award("stamp", "match-" + m.id, 2, "All pairs logged.");
        } else {
          AudioX.miss();
          toast("Not a pair.");
        }
        state.picked = null;
      }
    }
  }

  function paintBins() {
    const s = D.sorts.filter(function (x) { return x.id === state.sortId; })[0];
    if (!s) return;
    drawSortPool();
    $$(".bin").forEach(function (b) {
      const bid = b.getAttribute("data-bin");
      const hold = s.items.filter(function (it) { return state.placed[it.id] === bid; });
      const slot = b.querySelector(".bin-items");
      if (slot) {
        slot.innerHTML = hold.map(function (it) {
          return chipButton("sort-pick", it.id, it.name, it.img);
        }).join("");
      }
    });
  }

  function onClick(e) {
    const btn = e.target.closest("[data-act]");
    if (!btn) {
      const bin = e.target.closest("[data-bin]");
      if (bin && state.sortId && state.picked) {
        state.placed[state.picked] = bin.getAttribute("data-bin");
        state.picked = null;
        paintBins();
      }
      return;
    }
    AudioX.unlock();
    const act = btn.getAttribute("data-act");
    const id = btn.getAttribute("data-id") || btn.getAttribute("data-i") || btn.getAttribute("data-text") || "";
    const side = btn.getAttribute("data-side");
    if (act === "speak-text") route(act, btn.getAttribute("data-text"));
    else route(act, id, side);
  }

  function toggleSpeech() {
    const on = Speech.toggle();
    syncSpeakBtn();
    toast(on ? (Speech.supported ? "Read-aloud on." : "Read-aloud on — no voice on this device, words still show.") : "Read-aloud off.");
    if (on && Speech.supported) say("Read aloud is on.");
  }

  function bootSW() {
    if (document.documentElement.dataset.runner === "1") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(asset("sw.js")).catch(function () { /* standalone cache optional */ });
  }

  function rebaseChrome() {
    $$("img[src]").forEach(function (el) {
      const s = el.getAttribute("src");
      if (s && !/^(https?:|data:|blob:)/i.test(s)) el.src = asset(s);
    });
    $$("a[href]").forEach(function (el) {
      const s = el.getAttribute("href");
      if (s && /^(printables\/|CREDITS)/.test(s)) el.href = asset(s);
    });
  }

  function boot() {
    if (window.HS && window.HS.getBand) {
      const b = window.HS.getBand();
      if (b) Store.setBand(b);
    }
    rebaseChrome();
    document.addEventListener("click", onClick);
    $("#btn-speak").addEventListener("click", toggleSpeech);
    $("#btn-camp").addEventListener("click", function () { renderCamp(); });
    bindLens();
    bootSW();
    paintStats();
    const band = Store.getBand();
    if (band) enterBand(band);
    else renderPicker();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
