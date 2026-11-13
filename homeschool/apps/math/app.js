(function () {
  const SUBJECT = "math";
  const BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"];
  const BAND_LABEL = {
    baby: "Care time",
    toddler: "Toddler",
    preschool: "Early learner",
    early: "Early elementary",
    primary: "Early-middle elementary",
    upper: "Upper elementary",
  };
  const CREW = {
    pip: { name: "Pip", role: "lookout" },
    reed: { name: "Reed", role: "bosun" },
    moss: { name: "Moss", role: "cook" },
    cal: { name: "Cal", role: "chart-keeper" },
    nell: { name: "Nell", role: "purse" },
    kit: { name: "Kit", role: "cabin hand" },
    bram: { name: "Bram", role: "rigger" },
    oat: { name: "Oat", role: "carpenter" },
    wren: { name: "Wren", role: "helms" },
    sol: { name: "Sol", role: "navigator" },
    pike: { name: "Pike", role: "quartermaster" },
  };

  function hs() {
    return window.HS || {};
  }
  function inRunner() {
    return document.documentElement.dataset.runner === "1";
  }
  function url(path) {
    if (hs().url) return hs().url(path);
    const base = document.documentElement.dataset.appBase || "./";
    return new URL(path, base).href;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function readBand() {
    const q = new URLSearchParams(location.search).get("band");
    if (q && BANDS.indexOf(q) !== -1) return q;
    if (hs().getBand) {
      const b = hs().getBand();
      if (b && BANDS.indexOf(b) !== -1) return b;
    }
    try {
      const stored = localStorage.getItem("hs.band");
      if (stored && BANDS.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    return null;
  }
  function writeBand(b) {
    if (BANDS.indexOf(b) === -1) return;
    try {
      localStorage.setItem("hs.band", b);
    } catch (e) {}
    if (hs().setBand) hs().setBand(b);
    const next = new URL(location.href);
    next.searchParams.set("band", b);
    history.replaceState({}, "", next);
    document.documentElement.dataset.mathBand = b;
  }
  function loadProgress() {
    return (hs().readProgress && hs().readProgress(SUBJECT)) || (function () {
      try {
        return JSON.parse(localStorage.getItem("hs.progress." + SUBJECT) || "{}");
      } catch (e) {
        return {};
      }
    })();
  }
  function saveProgress(p) {
    p = p || {};
    p.updatedAt = new Date().toISOString();
    if (hs().writeProgress) hs().writeProgress(SUBJECT, p);
    else {
      try {
        localStorage.setItem("hs.progress." + SUBJECT, JSON.stringify(p));
      } catch (e) {}
    }
  }
  function muted() {
    try {
      if (hs().muted) return hs().muted();
      return localStorage.getItem("hs.mute") === "1";
    } catch (e) {
      return false;
    }
  }
  function setMuted(on) {
    if (hs().setMuted) hs().setMuted(on);
    else {
      try {
        localStorage.setItem("hs.mute", on ? "1" : "0");
      } catch (e) {}
    }
  }

  function imgTag(manifest, slot, className, w, h) {
    const item = (manifest.images || []).find(function (i) {
      return i.slot === slot;
    });
    if (!item) return "";
    return (
      '<img class="' +
      esc(className || "slot") +
      '" src="' +
      esc(url("images/" + item.file)) +
      '" alt="' +
      esc(item.alt) +
      '"' +
      (w ? ' width="' + w + '"' : "") +
      (h ? ' height="' + h + '"' : "") +
      ">"
    );
  }

  function coinsHtml(n, manifest, tap) {
    n = Math.max(0, Math.min(12, Number(n) || 0));
    if (!n) return "";
    const item = (manifest.images || []).find(function (i) {
      return i.slot === "coin";
    });
    if (!item) return "";
    let h = '<div class="voyage-coins' + (tap ? " is-tap" : "") + '" role="' + (tap ? "list" : "presentation") + '">';
    for (let i = 0; i < n; i++) {
      if (tap) {
        h +=
          '<button type="button" class="voyage-coin-btn" data-coin="' +
          i +
          '" aria-label="Coin ' +
          (i + 1) +
          '"><img src="' +
          esc(url("images/" + item.file)) +
          '" alt="" width="64" height="64"></button>';
      } else {
        h +=
          '<img src="' +
          esc(url("images/" + item.file)) +
          '" alt="" width="56" height="56">';
      }
    }
    h += "</div>";
    return h;
  }

  function ensureStandalone() {
    if (inRunner()) return;
    window.HS = window.HS || {};
    HS.appBase = HS.appBase || new URL("./", location.href).href;
    HS.subject = SUBJECT;
    document.documentElement.dataset.appBase = HS.appBase;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js", { scope: "./" });
    }
  }

  const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

  async function boot() {
    ensureStandalone();
    const host = document.querySelector(".voyage") || document.getElementById("math-root");
    if (!host) return;

    let band = readBand();
    if (!band) {
      renderPicker(host);
      return;
    }
    writeBand(band);
    document.documentElement.dataset.mathBand = band;

    const [data, manifest] = await Promise.all([
      fetch(url("data/" + band + ".json")).then(function (r) {
        if (!r.ok) throw new Error("no data");
        return r.json();
      }),
      fetch(url("images.json")).then(function (r) {
        return r.json();
      }),
    ]);

    const progress = loadProgress();
    progress.band = band;
    progress.doubloons = progress.doubloons || 0;
    progress.chests = progress.chests || {};
    progress.crew = progress.crew || [];
    progress.tablesMul = progress.tablesMul || {};
    progress.tablesDiv = progress.tablesDiv || {};
    saveProgress(progress);

    const img = function (slot, cls, w, h) {
      return imgTag(manifest, slot, cls, w, h);
    };

    let screen = "map";
    let island = null;
    let items = [];
    let i = 0;
    let tableN = null;
    let tapped = {};
    let rocks = 0;
    let peeked = false;
    let advancing = false;

    function chestKey(id) {
      return band + ":" + id;
    }

    function islandItems(isl) {
      return (data.items || []).filter(function (it) {
        return it.island === isl.id;
      });
    }

    function chrome(inner) {
      const muteOn = muted();
      const tools = inRunner()
        ? ""
        : '<div class="voyage-tools">' +
          '<button type="button" class="voyage-mute" id="math-mute">' +
          (muteOn ? "Sound off" : "Sound on") +
          "</button>" +
          '<button type="button" class="voyage-band-btn" id="math-reband">Band: ' +
          esc(BAND_LABEL[band] || band) +
          "</button></div>";
      return tools + inner;
    }

    function bindTools() {
      const mute = document.getElementById("math-mute");
      if (mute) {
        mute.onclick = function () {
          setMuted(!muted());
          if (muted()) Ship.hush();
          render();
        };
      }
      const re = document.getElementById("math-reband");
      if (re) {
        re.onclick = function () {
          try {
            localStorage.removeItem("hs.band");
          } catch (e) {}
          const next = new URL(location.href);
          next.searchParams.delete("band");
          location.href = next.href;
        };
      }
    }

    function renderMap() {
      const done = data.islands.filter(function (isl) {
        return progress.chests[chestKey(isl.id)];
      }).length;
      const crewHtml = data.islands
        .map(function (isl) {
          const member = CREW[isl.crew];
          if (!member) return "";
          const here = progress.crew.indexOf(isl.crew) !== -1;
          return (
            '<div class="voyage-crew' +
            (here ? " is-aboard" : "") +
            '">' +
            img("crew-" + isl.crew, "voyage-porthole") +
            "<span>" +
            (here ? esc(member.name) : "—") +
            "</span><small>" +
            esc(member.role) +
            "</small></div>"
          );
        })
        .join("");
      host.innerHTML = chrome(
        img("hero", "voyage-hero") +
          '<div class="voyage-map">' +
          "<h1>Treasure Voyage</h1>" +
          "<p>" +
          esc(data.title) +
          " · " +
          esc(BAND_LABEL[band]) +
          ' · <span class="voyage-doubloons">' +
          progress.doubloons +
          " doubloons</span> · " +
          done +
          "/" +
          data.islands.length +
          " chests</p>" +
          '<div class="voyage-crew-row" aria-label="Crew">' +
          crewHtml +
          "</div>" +
          '<button type="button" class="voyage-hear" id="math-hear-map">Hear the chart</button>' +
          '<ol class="voyage-chart">' +
          data.islands
            .map(function (isl, idx) {
              const stowed = progress.chests[chestKey(isl.id)];
              return (
                '<li><button type="button" class="voyage-island-btn' +
                (stowed ? " is-stowed" : "") +
                '" data-island="' +
                esc(isl.id) +
                '">' +
                img(isl.slot, "voyage-island-pic") +
                '<span class="voyage-island-label">' +
                (idx + 1) +
                ". " +
                esc(isl.label) +
                (stowed ? " · chest stowed" : "") +
                "</span></button></li>"
              );
            })
            .join("") +
          "</ol></div>"
      );
      bindTools();
      document.getElementById("math-hear-map").onclick = function () {
        Ship.wind();
        Ship.speak(data.intro.audioText);
      };
      host.querySelectorAll("[data-island]").forEach(function (btn) {
        btn.onclick = function () {
          openIsland(btn.getAttribute("data-island"));
        };
      });
      Ship.creak();
      Ship.speak(data.intro.audioText);
    }

    function openIsland(id) {
      island = data.islands.find(function (x) {
        return x.id === id;
      });
      if (!island) return;
      tableN = null;
      i = 0;
      tapped = {};
      rocks = 0;
      peeked = false;
      advancing = false;
      if (island.drill) {
        screen = "tables";
      } else {
        items = islandItems(island);
        screen = "lesson";
      }
      Ship.splash();
      render();
    }

    function startPlay() {
      if (island.drill && tableN == null) {
        screen = "tables";
        render();
        return;
      }
      if (island.drill) {
        items =
          island.drill.kind === "div"
            ? VoyageFacts.divTable(tableN)
            : VoyageFacts.mulTable(tableN);
      } else {
        items = islandItems(island);
      }
      i = 0;
      tapped = {};
      rocks = 0;
      peeked = false;
      advancing = false;
      screen = "play";
      Ship.fanfare();
      render();
      if (items[0] && items[0].audioText) Ship.speak(items[0].audioText);
    }

    function renderTables() {
      const kind = island.drill.kind;
      const from = island.drill.from;
      const to = island.drill.to;
      const doneMap = kind === "div" ? progress.tablesDiv : progress.tablesMul;
      let btns = "";
      for (let n = from; n <= to; n++) {
        btns +=
          '<button type="button" data-table="' +
          n +
          '" class="' +
          (doneMap[String(n)] ? "is-stowed" : "") +
          '">' +
          n +
          (doneMap[String(n)] ? " ✓" : "") +
          "</button>";
      }
      host.innerHTML = chrome(
        img("hero", "voyage-hero") +
          '<div class="voyage-cabin">' +
          "<h2>" +
          esc(island.technique.title) +
          "</h2><p>" +
          esc(island.technique.body) +
          "</p>" +
          '<button type="button" class="voyage-hear" id="math-hear">Hear the technique</button>' +
          "<p>Pick a crate. Every fact in that table, then paper.</p>" +
          '<div class="voyage-tables">' +
          btns +
          "</div>" +
          '<button type="button" class="voyage-back" id="math-back">Back to the chart</button></div>'
      );
      bindTools();
      document.getElementById("math-hear").onclick = function () {
        Ship.speak(island.technique.audioText);
      };
      document.getElementById("math-back").onclick = function () {
        screen = "map";
        render();
      };
      host.querySelectorAll("[data-table]").forEach(function (btn) {
        btn.onclick = function () {
          tableN = Number(btn.getAttribute("data-table"));
          startPlay();
        };
      });
      Ship.speak(island.technique.audioText);
    }

    function renderLesson() {
      host.innerHTML = chrome(
        img(island.slot, "voyage-hero") +
          '<div class="voyage-cabin">' +
          '<p class="voyage-kicker">' +
          esc(island.label) +
          "</p>" +
          '<div class="voyage-technique"><h2>' +
          esc(island.technique.title) +
          "</h2><p>" +
          esc(island.technique.body) +
          "</p></div>" +
          '<button type="button" class="voyage-hear" id="math-hear">Hear the technique</button>' +
          '<button type="button" id="math-start">Cast off</button>' +
          '<button type="button" class="voyage-back" id="math-back">Back to the chart</button></div>'
      );
      bindTools();
      document.getElementById("math-hear").onclick = function () {
        Ship.speak(island.technique.audioText);
      };
      document.getElementById("math-start").onclick = startPlay;
      document.getElementById("math-back").onclick = function () {
        screen = "map";
        render();
      };
      Ship.speak(island.technique.audioText);
    }

    function visual(item) {
      const kind = item.kind || "choice";
      if (kind === "clock") {
        const h = Number(item.hour) || 0;
        const m = Number(item.minute) || 0;
        const hd = 30 * (h % 12) + 0.5 * m;
        const md = 6 * m;
        return (
          '<div class="voyage-clock" aria-hidden="true"><span class="voyage-clock-hour" style="transform:rotate(' +
          hd +
          'deg)"></span><span class="voyage-clock-min" style="transform:rotate(' +
          md +
          'deg)"></span></div>'
        );
      }
      if (kind === "fraction") {
        const parts = Number(item.parts) || 2;
        const filled = Number(item.filled) || 0;
        let bars = "";
        for (let k = 0; k < parts; k++) {
          bars += '<span class="' + (k < filled ? "is-filled" : "") + '"></span>';
        }
        return '<div class="voyage-frac" style="grid-template-columns:repeat(' + parts + ',1fr)">' + bars + "</div>";
      }
      if (kind === "place") {
        const hun = Number(item.hundreds) || 0;
        const tens = Number(item.tens) || 0;
        const ones = Number(item.ones) || 0;
        return (
          '<div class="voyage-place">' +
          (hun ? '<div class="voyage-crate hun">' + hun + " hundred crate" + (hun === 1 ? "" : "s") + "</div>" : "") +
          '<div class="voyage-crate">' +
          tens +
          " ten-crate" +
          (tens === 1 ? "" : "s") +
          "</div>" +
          coinsHtml(Math.min(ones, 12), manifest, false) +
          "<p>" +
          tens +
          " tens, " +
          ones +
          " ones" +
          (hun ? ", " + hun + " hundreds" : "") +
          "</p></div>"
        );
      }
      if (kind === "money") {
        const bits = [];
        ["quarters", "dimes", "nickels", "pennies"].forEach(function (k) {
          const n = Number(item[k]) || 0;
          if (n) bits.push(n + " " + k);
        });
        return (
          '<div class="voyage-money">' +
          coinsHtml(
            Math.min(12, (item.quarters || 0) + (item.dimes || 0) + (item.nickels || 0) + (item.pennies || 0) || item.count || 0),
            manifest,
            false
          ) +
          (bits.length ? "<p>" + esc(bits.join(" · ")) + "</p>" : "") +
          "</div>"
        );
      }
      if (kind === "array" && item.rows && item.cols) {
        let grid = '<div class="voyage-array" style="grid-template-columns:repeat(' + item.cols + ',56px)">';
        const coin = (manifest.images || []).find(function (x) {
          return x.slot === "coin";
        });
        const src = coin ? url("images/" + coin.file) : "";
        const total = Math.min(36, item.rows * item.cols);
        for (let k = 0; k < total; k++) {
          grid += '<img src="' + esc(src) + '" alt="" width="56" height="56">';
        }
        grid += "</div>";
        return grid;
      }
      if (kind === "piles") {
        return (
          '<div class="voyage-piles"><div><p>Left</p>' +
          coinsHtml(item.left, manifest, false) +
          "</div><div><p>Right</p>" +
          coinsHtml(item.right, manifest, false) +
          "</div></div>"
        );
      }
      if (kind === "skip" && item.seq) {
        return (
          '<p class="voyage-seq">' +
          item.seq.map(function (n) {
            return "<span>" + esc(n) + "</span>";
          }).join("<i></i>") +
          "<span class=\"is-ask\">?</span></p>"
        );
      }
      if (kind === "steps" && item.board) {
        return '<pre class="voyage-board">' + esc(item.board) + "</pre>";
      }
      if (kind === "peek") {
        return (
          '<button type="button" class="voyage-peek" id="math-peek">' +
          img(peeked ? "chest-open" : "chest", "voyage-chest") +
          "<span>" +
          (peeked ? "Chest open" : "Tap to open") +
          "</span></button>" +
          (peeked ? coinsHtml(item.count, manifest, false) : "")
        );
      }
      if (kind === "rock") {
        return (
          '<button type="button" class="voyage-rock' +
          (rocks ? " is-tilt" : "") +
          '" id="math-rock">' +
          img("hero", "voyage-ship-tilt") +
          "<span>Tap to rock · " +
          rocks +
          "/" +
          (item.count || 3) +
          "</span></button>"
        );
      }
      if (kind === "tap") {
        return coinsHtml(item.count, manifest, true);
      }
      if (item.count) return coinsHtml(item.count, manifest, false);
      if (item.left || item.right) {
        return coinsHtml((item.left || 0) + (item.right || 0), manifest, false);
      }
      return "";
    }

    function babyAuto() {
      const item = items[i];
      if (!item) return false;
      if (item.kind === "tap") {
        const need = Number(item.count) || 1;
        return Object.keys(tapped).length >= need;
      }
      if (item.kind === "peek") return peeked;
      if (item.kind === "rock") return rocks >= (Number(item.count) || 3);
      return false;
    }

    function succeed() {
      if (advancing) return;
      advancing = true;
      const item = items[i];
      Ship.clink();
      progress.doubloons += 1;
      progress.lastItem = item.id;
      saveProgress(progress);
      const status = document.getElementById("math-status");
      if (status) status.textContent = "Stowed. On to the next crate.";
      setTimeout(function () {
        i += 1;
        tapped = {};
        rocks = 0;
        peeked = false;
        advancing = false;
        if (i >= items.length) {
          screen = "paper";
          Ship.bell();
        }
        render();
        if (screen === "play" && items[i] && items[i].audioText) Ship.speak(items[i].audioText);
      }, 550);
    }

    function renderPlay() {
      const item = items[i];
      if (!item) {
        screen = "paper";
        render();
        return;
      }
      const babyish = band === "baby" || item.kind === "tap" || item.kind === "peek" || item.kind === "rock";
      const choiceBox =
        babyish && band === "baby"
          ? '<p class="voyage-hint">Tap the picture. Hear the number.</p>'
          : '<div class="voyage-choices" id="math-choices">' +
            (item.choices || [])
              .map(function (c) {
                return '<button type="button" data-v="' + esc(c) + '">' + esc(c) + "</button>";
              })
              .join("") +
            "</div>";
      host.innerHTML = chrome(
        img("cabin", "voyage-hero") +
          '<div class="voyage-cabin">' +
          '<p class="voyage-kicker">' +
          esc(island.label) +
          " · crate " +
          (i + 1) +
          " of " +
          items.length +
          "</p>" +
          "<h2>" +
          esc(item.prompt) +
          "</h2>" +
          '<button type="button" class="voyage-hear" id="math-hear">Hear it</button>' +
          visual(item) +
          choiceBox +
          '<p class="voyage-status" id="math-status"></p>' +
          '<button type="button" class="voyage-back" id="math-back">Back to the chart</button></div>'
      );
      bindTools();
      document.getElementById("math-hear").onclick = function () {
        Ship.speak(item.audioText);
      };
      document.getElementById("math-back").onclick = function () {
        screen = "map";
        render();
      };
      const peek = document.getElementById("math-peek");
      if (peek) {
        peek.onclick = function () {
          if (peeked) return;
          peeked = true;
          Ship.latch();
          const n = Number(item.count) || 1;
          Ship.speak(WORDS[n] || String(n));
          render();
          if (band === "baby") setTimeout(succeed, 700);
        };
      }
      const rock = document.getElementById("math-rock");
      if (rock) {
        rock.onclick = function () {
          rocks += 1;
          Ship.creak();
          Ship.splash();
          if (rocks >= (Number(item.count) || 3)) {
            if (band === "baby") succeed();
            else render();
          } else render();
        };
      }
      host.querySelectorAll("[data-coin]").forEach(function (btn) {
        btn.onclick = function () {
          const idx = btn.getAttribute("data-coin");
          if (tapped[idx]) return;
          tapped[idx] = 1;
          btn.classList.add("is-tapped");
          const n = Object.keys(tapped).length;
          Ship.clink();
          Ship.speak(WORDS[n] || String(n));
          if (babyAuto()) {
            if (band === "baby") succeed();
          }
        };
      });
      const box = document.getElementById("math-choices");
      if (box) {
        box.addEventListener("click", function (ev) {
          const btn = ev.target.closest("button[data-v]");
          if (!btn) return;
          const val = btn.getAttribute("data-v");
          const status = document.getElementById("math-status");
          if (val === String(item.answer)) {
            btn.classList.add("is-right");
            succeed();
          } else {
            btn.classList.add("is-wrong");
            Ship.knock();
            if (status) status.textContent = "Try the next heading. " + island.technique.title + ".";
            Ship.speak("Try again. " + island.technique.audioText);
          }
        });
      }
    }

    function paperList() {
      let list = island.paper || [];
      if (tableN != null) {
        list = list.map(function (p) {
          return { prompt: String(p.prompt || p).replace(/\bn\b/g, String(tableN)) };
        });
      }
      return list;
    }

    function renderPaper() {
      const member = CREW[island.crew];
      host.innerHTML = chrome(
        img("paper", "voyage-hero") +
          '<div class="voyage-cabin voyage-paper">' +
          "<h2>Drop anchor. Now do this on paper.</h2>" +
          "<p>The voyage showed the technique. Finish these at the desk. Do not tap answers here — write them.</p>" +
          "<ol>" +
          paperList()
            .map(function (p) {
              return "<li>" + esc(p.prompt || p) + "</li>";
            })
            .join("") +
          "</ol>" +
          '<p class="voyage-doubloons">Doubloons this visit: ' +
          progress.doubloons +
          "</p>" +
          '<button type="button" id="math-stow">Stow the chest</button>' +
          '<button type="button" class="voyage-back" id="math-again">Sail this island again</button></div>'
      );
      bindTools();
      document.getElementById("math-stow").onclick = function () {
        progress.chests[chestKey(island.id)] = true;
        if (island.crew && progress.crew.indexOf(island.crew) === -1) progress.crew.push(island.crew);
        if (island.drill && tableN != null) {
          const map = island.drill.kind === "div" ? progress.tablesDiv : progress.tablesMul;
          map[String(tableN)] = true;
        }
        saveProgress(progress);
        screen = "chest";
        Ship.latch();
        Ship.bell();
        render();
      };
      document.getElementById("math-again").onclick = function () {
        i = 0;
        screen = "lesson";
        if (island.drill) screen = "tables";
        render();
      };
      Ship.speak("Drop anchor. Now do this on paper.");
      if (member) {
        /* keep copy wholesome; name is first-name only */
      }
    }

    function renderChest() {
      const member = CREW[island.crew];
      host.innerHTML = chrome(
        img("chest-open", "voyage-hero") +
          '<div class="voyage-cabin voyage-reward">' +
          "<h2>Chest stowed</h2>" +
          "<p>" +
          esc(island.chest || "A brass latch clicks shut.") +
          "</p>" +
          (member
            ? "<p>" +
              esc(member.name) +
              " the " +
              esc(member.role) +
              " is aboard.</p>"
            : "") +
          img("crew-" + (island.crew || "pip"), "voyage-porthole-lg") +
          '<button type="button" id="math-chart">Back to the chart</button></div>'
      );
      bindTools();
      document.getElementById("math-chart").onclick = function () {
        screen = "map";
        Ship.gull();
        render();
      };
      Ship.speak((island.chest || "Chest stowed.") + (member ? " " + member.name + " is aboard." : ""));
    }

    function render() {
      if (screen === "map") renderMap();
      else if (screen === "tables") renderTables();
      else if (screen === "lesson") renderLesson();
      else if (screen === "play") renderPlay();
      else if (screen === "paper") renderPaper();
      else if (screen === "chest") renderChest();
    }

    render();
  }

  function renderPicker(host) {
    host.innerHTML =
      '<div class="voyage-picker">' +
      "<h1>Treasure Voyage</h1>" +
      "<p>Pick a band. Names and ages stay off this page.</p>" +
      '<div class="voyage-pick-grid">' +
      BANDS.map(function (b) {
        return (
          '<button type="button" data-band="' +
          b +
          '">' +
          esc(BAND_LABEL[b]) +
          "<small>" +
          esc(b) +
          "</small></button>"
        );
      }).join("") +
      "</div></div>";
    host.querySelectorAll("[data-band]").forEach(function (btn) {
      btn.onclick = function () {
        writeBand(btn.getAttribute("data-band"));
        boot().catch(function (e) {
          console.error(e);
        });
      };
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      boot().catch(function (e) {
        console.error(e);
      });
    });
  } else {
    boot().catch(function (e) {
      console.error(e);
    });
  }
})();
