(function () {
  const SUBJECT = "reading";
  const CUES = {
    bee: [{ f: 620, t: 0, d: 0.05, type: "sawtooth", g: 0.03 }, { f: 740, t: 0.06, d: 0.08, type: "sawtooth", g: 0.03 }],
    rustle: [{ f: 140, t: 0, d: 0.12, type: "triangle", g: 0.05 }],
    bloom: [
      { f: 523, t: 0, d: 0.1, type: "sine", g: 0.05 },
      { f: 784, t: 0.1, d: 0.16, type: "sine", g: 0.05 },
    ],
    page: [{ f: 240, t: 0, d: 0.06, type: "square", g: 0.03 }],
  };

  function hs() {
    return window.HS || {};
  }
  function url(path) {
    if (hs().url) return hs().url(path);
    const base = document.documentElement.dataset.appBase || "./";
    return new URL(path, base).href;
  }
  function band() {
    return (hs().getBand && hs().getBand()) || "early";
  }
  function cue(name) {
    if (hs().playCue) hs().playCue(CUES[name]);
  }
  function speak(t, opts) {
    if (hs().speak) hs().speak(t, opts || { rate: 0.8 });
  }
  function imgFor(manifest) {
    return function (slot, cls) {
      const item = (manifest.images || []).find(function (i) {
        return i.slot === slot;
      });
      if (!item) return "";
      return (
        '<img class="' +
        (cls || "slot") +
        '" src="' +
        url("images/" + item.file) +
        '" alt="' +
        item.alt.replace(/"/g, "") +
        '">'
      );
    };
  }

  async function boot() {
    const host = document.getElementById("reading-root");
    if (!host) return;
    if (!document.documentElement.dataset.runner) {
      window.HS = window.HS || {};
      HS.appBase = HS.appBase || new URL("./", location.href).href;
      HS.subject = SUBJECT;
      document.documentElement.dataset.appBase = HS.appBase;
      if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js", { scope: "./" });
    }

    const b = band();
    if (b === "baby") {
      host.innerHTML = "<p style=\"padding:16px\">No garden lessons for this band yet.</p>";
      return;
    }

    const [data, manifest] = await Promise.all([
      fetch(url("data/" + b + ".json")).then(function (r) {
        return r.json();
      }),
      fetch(url("images.json")).then(function (r) {
        return r.json();
      }),
    ]);
    const img = imgFor(manifest);
    const progress = (hs().readProgress && hs().readProgress(SUBJECT)) || { blooms: 0 };
    progress.band = b;
    progress.blooms = progress.blooms || 0;

    function save() {
      if (hs().writeProgress) hs().writeProgress(SUBJECT, progress);
    }

    function home() {
      host.className = "garden";
      let beds = "";
      if (data.mode === "sounds" || data.mode === "blends") {
        beds +=
          '<div class="garden-bed">' +
          img("bed-sounds") +
          '<button type="button" id="go-sounds">Sound beds</button></div>';
      }
      if (data.books) {
        beds +=
          '<div class="garden-bed">' +
          img("bed-books") +
          '<button type="button" id="go-books">Picture books</button></div>';
      }
      if (data.mode === "volume") {
        beds +=
          '<div class="garden-bed"><button type="button" id="go-timer">Reading timer</button></div>';
      }
      host.innerHTML =
        img("hero", "garden-hero") +
        '<div class="garden-intro"><h1>' +
        data.title +
        "</h1><p>" +
        data.intro.body +
        "</p><p>" +
        progress.blooms +
        " blooms</p></div>" +
        '<div class="garden-beds">' +
        beds +
        "</div>";
      const gs = document.getElementById("go-sounds");
      if (gs) gs.onclick = function () {
        startItems();
      };
      const gb = document.getElementById("go-books");
      if (gb) gb.onclick = function () {
        listBooks();
      };
      const gt = document.getElementById("go-timer");
      if (gt) gt.onclick = function () {
        timer();
      };
      speak(data.intro.audioText);
    }

    function startItems() {
      let i = 0;
      function show() {
        const item = data.items[i];
        if (!item) {
          progress.blooms += 1;
          progress.soundsDone = true;
          save();
          cue("bloom");
          if (data.books) listBooks();
          else home();
          return;
        }
        if (data.mode === "sounds") {
          host.innerHTML =
            img("hero", "garden-hero") +
            '<div class="garden-prompt">' +
            img("bee", "garden-bee") +
            "<h2>Find the sound</h2>" +
            "<p>The bee says a sound — not a letter name.</p>" +
            '<button type="button" id="hear">Hear the sound</button>' +
            "</div>" +
            '<div class="garden-flowers" id="choices">' +
            item.choices
              .map(function (c) {
                return (
                  '<button type="button" data-v="' +
                  c +
                  '">' +
                  img("flower-" + c) +
                  '<span class="garden-letter">' +
                  c +
                  "</span></button>"
                );
              })
              .join("") +
            '</div><p class="garden-status" id="st"></p>';
          document.getElementById("hear").onclick = function () {
            cue("bee");
            speak(item.audioText, { rate: 0.7 });
          };
          cue("bee");
          speak(item.audioText, { rate: 0.7 });
        } else if (item.kind === "sight") {
          host.innerHTML =
            '<div class="garden-prompt"><h2>Helper word</h2><p>' +
            (item.prompt || "Look and say. This word is not sounded out letter by letter.") +
            '</p><button type="button" id="hear">Hear it</button></div>' +
            '<div class="garden-flowers" id="choices">' +
            item.choices
              .map(function (c) {
                return '<button type="button" data-v="' + c + '">' + c + "</button>";
              })
              .join("") +
            '</div><p class="garden-status" id="st"></p>';
          document.getElementById("hear").onclick = function () {
            speak(item.audioText, { rate: 0.75 });
          };
          speak(item.audioText, { rate: 0.75 });
        } else {
          host.innerHTML =
            '<div class="garden-prompt"><h2>Blend</h2><p>' +
            (item.sounds || []).join(" · ") +
            '</p><button type="button" id="hear">Hear the sounds</button></div>' +
            '<div class="garden-flowers" id="choices">' +
            item.choices
              .map(function (c) {
                return '<button type="button" data-v="' + c + '">' + c + "</button>";
              })
              .join("") +
            '</div><p class="garden-status" id="st"></p>';
          document.getElementById("hear").onclick = function () {
            speak((item.sounds || []).join(", ") || item.audioText);
          };
          speak((item.sounds || []).join(", ") || item.audioText);
        }
        document.getElementById("choices").onclick = function (ev) {
          const btn = ev.target.closest("button[data-v]");
          if (!btn) return;
          const st = document.getElementById("st");
          const expect = item.answer || item.blend;
          if (btn.getAttribute("data-v") === expect) {
            btn.classList.add("is-right");
            cue("bloom");
            st.textContent = "That bed blooms.";
            if (item.blend) speak(item.blend, { rate: 0.85 });
            setTimeout(function () {
              i += 1;
              show();
            }, 700);
          } else {
            btn.classList.add("is-wrong");
            cue("rustle");
            st.textContent = "Try another flower. Listen again.";
            speak(item.audioText, { rate: 0.7 });
          }
        };
      }
      show();
    }

    function listBooks() {
      host.className = "garden";
      host.innerHTML =
        img("hero", "garden-hero") +
        '<div class="garden-intro"><h1>Garden books</h1><p>Original decodable text. Tap a word to hear it.</p></div>' +
        '<div class="garden-beds" id="book-list"></div>' +
        '<p style="padding:12px"><button type="button" id="back-home">Back to garden</button></p>';
      const list = document.getElementById("book-list");
      const titles = { "sam-sat": "Sam Sat", "the-fig": "The Fig" };
      const gate = data.bookGate || {};
      (data.books || []).forEach(function (id) {
        const b = document.createElement("div");
        b.className = "garden-bed";
        const slot = id === "sam-sat" ? "sam-sat-cover" : "fig-cover";
        const need = gate[id];
        const read = progress.booksRead || [];
        const locked =
          (need && read.indexOf(need) === -1) ||
          (id === "the-fig" && data.mode === "blends" && !progress.soundsDone);
        const label = titles[id] || id;
        const btnLabel = locked
          ? label + (need ? " — read " + (titles[need] || need) + " first" : " — finish the sound beds first")
          : label;
        b.innerHTML = img(slot) + '<button type="button"' + (locked ? " disabled" : "") + ">" + btnLabel + "</button>";
        if (!locked) {
          b.querySelector("button").onclick = function () {
            openBook(id);
          };
        }
        list.appendChild(b);
      });
      document.getElementById("back-home").onclick = home;
    }

    function openBook(id) {
      GardenReader.open({
        url: url("books/" + id + ".json"),
        host: host,
        speak: speak,
        cue: cue,
        imgFor: img,
        onDone: function () {
          progress.blooms += 1;
          progress.booksRead = progress.booksRead || [];
          if (progress.booksRead.indexOf(id) === -1) progress.booksRead.push(id);
          save();
          listBooks();
        },
      });
    }

    function timer() {
      let left = (data.minutes || 20) * 60;
      let tick = null;
      function paint() {
        const m = Math.floor(left / 60);
        const s = String(left % 60).padStart(2, "0");
        host.innerHTML =
          img("hero", "garden-hero") +
          '<div class="garden-intro"><h1>Reading time</h1><p class="garden-timer">' +
          m +
          ":" +
          s +
          "</p><p>Paper book beside you is fine. This is only a timer.</p>" +
          '<button type="button" id="t-toggle">Start</button> ' +
          '<button type="button" id="t-books">Books</button> ' +
          '<button type="button" id="t-home">Garden</button></div>';
        document.getElementById("t-toggle").onclick = function () {
          if (tick) {
            clearInterval(tick);
            tick = null;
            paint();
            return;
          }
          tick = setInterval(function () {
            left = Math.max(0, left - 1);
            if (left === 0) {
              clearInterval(tick);
              tick = null;
              cue("bloom");
            }
            const tm = Math.floor(left / 60);
            const ts = String(left % 60).padStart(2, "0");
            const el = host.querySelector(".garden-timer");
            if (el) el.textContent = tm + ":" + ts;
          }, 1000);
          document.getElementById("t-toggle").textContent = "Pause";
        };
        document.getElementById("t-books").onclick = function () {
          if (tick) clearInterval(tick);
          listBooks();
        };
        document.getElementById("t-home").onclick = function () {
          if (tick) clearInterval(tick);
          home();
        };
      }
      paint();
    }

    if (data.mode === "volume") home();
    else home();
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
