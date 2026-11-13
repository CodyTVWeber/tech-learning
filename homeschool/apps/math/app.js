(function () {
  const SUBJECT = "math";
  const CUES = {
    ok: [
      { f: 880, t: 0, d: 0.08, type: "square", g: 0.05 },
      { f: 1174, t: 0.08, d: 0.12, type: "square", g: 0.05 },
    ],
    tryAgain: [{ f: 180, t: 0, d: 0.14, type: "triangle", g: 0.06 }],
    reward: [
      { f: 392, t: 0, d: 0.12, type: "sawtooth", g: 0.04 },
      { f: 523, t: 0.12, d: 0.18, type: "sawtooth", g: 0.05 },
    ],
    level: [
      { f: 523, t: 0, d: 0.12, type: "square", g: 0.05 },
      { f: 659, t: 0.12, d: 0.12, type: "square", g: 0.05 },
      { f: 784, t: 0.24, d: 0.2, type: "square", g: 0.06 },
    ],
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
  function speak(t) {
    if (hs().speak) hs().speak(t);
  }

  function img(slot, manifest, className) {
    const item = (manifest.images || []).find(function (i) {
      return i.slot === slot;
    });
    if (!item) return "";
    return (
      '<img class="' +
      (className || "slot") +
      '" src="' +
      url("images/" + item.file) +
      '" alt="' +
      item.alt.replace(/"/g, "") +
      '" width="' +
      item.width +
      '" height="' +
      item.height +
      '">'
    );
  }

  function coins(n, manifest) {
    const item = (manifest.images || []).find(function (i) {
      return i.slot === "coin";
    });
    if (!item || !n) return "";
    let h = '<div class="voyage-coins" aria-hidden="true">';
    for (let i = 0; i < n; i++) {
      h +=
        '<img src="' +
        url("images/" + item.file) +
        '" alt="" width="56" height="56">';
    }
    h += "</div>";
    return h;
  }

  function loadProgress() {
    return (hs().readProgress && hs().readProgress(SUBJECT)) || {};
  }
  function saveProgress(p) {
    if (hs().writeProgress) hs().writeProgress(SUBJECT, p);
  }

  async function boot() {
    const host = document.querySelector(".voyage") || document.getElementById("math-root");
    if (!host) return;
    if (!document.documentElement.dataset.runner) {
      window.HS = window.HS || {};
      HS.appBase = HS.appBase || new URL("./", location.href).href;
      HS.subject = SUBJECT;
      HS.band = band();
      document.documentElement.dataset.appBase = HS.appBase;
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./sw.js", { scope: "./" });
      }
    }

    const b = band();
    if (b === "baby") {
      host.innerHTML =
        "<p class=\"voyage-map\" style=\"color:#f3e2c4;padding:16px\">No voyage yet for this band. Open another home, or change the band in settings.</p>";
      return;
    }

    const [data, manifest] = await Promise.all([
      fetch(url("data/" + b + ".json")).then(function (r) {
        if (!r.ok) throw new Error("no data");
        return r.json();
      }),
      fetch(url("images.json")).then(function (r) {
        return r.json();
      }),
    ]);

    const progress = loadProgress();
    progress.band = b;
    progress.doubloons = progress.doubloons || 0;
    let i = 0;
    let phase = "lesson";

    function render() {
      if (phase === "paper") {
        host.innerHTML =
          img("paper", manifest, "voyage-hero") +
          '<div class="voyage-cabin voyage-paper">' +
          "<h2>Drop anchor. Now do this on paper.</h2>" +
          "<p>The voyage showed the technique. Finish these at the desk. Do not tap answers here — write them.</p>" +
          "<ol>" +
          data.paper
            .map(function (p) {
              return "<li>" + p.prompt + "</li>";
            })
            .join("") +
          "</ol>" +
          '<p class="voyage-doubloons">Doubloons this visit: ' +
          progress.doubloons +
          "</p>" +
          '<button type="button" id="math-again">Sail again</button>' +
          "</div>";
        cue("reward");
        document.getElementById("math-again").onclick = function () {
          i = 0;
          phase = "lesson";
          render();
        };
        return;
      }

      const item = data.items[i];
      const island = data.islands[Math.min(data.islands.length - 1, Math.floor(i / 4))];
      host.innerHTML =
        img("hero", manifest, "voyage-hero") +
        '<div class="voyage-map">' +
        "<h1>Treasure Voyage</h1>" +
        "<p>" +
        data.title +
        ' · <span class="voyage-doubloons">' +
        progress.doubloons +
        " doubloons</span></p>" +
        '<div class="voyage-path">' +
        data.islands
          .map(function (isl, idx) {
            const wake = idx < data.islands.length - 1 ? '<div class="voyage-wake" aria-hidden="true"></div>' : "";
            return (
              '<div class="voyage-island' +
              (isl.id === island.id ? " is-now" : "") +
              '">' +
              img(isl.slot, manifest) +
              "<span>" +
              isl.label +
              "</span></div>" +
              wake
            );
          })
          .join("") +
        "</div></div>" +
        '<div class="voyage-cabin">' +
        (phase === "lesson"
          ? '<div class="voyage-technique"><h2>' +
            data.technique.title +
            "</h2><p>" +
            data.technique.body +
            "</p></div>" +
            '<button type="button" class="voyage-hear" id="math-hear">Hear the technique</button>' +
            '<button type="button" id="math-start">Cast off</button>'
          : "<h2>" +
            item.prompt +
            "</h2>" +
            '<button type="button" class="voyage-hear" id="math-hear">Hear it</button>' +
            coins(item.count || (item.rows && item.cols ? item.rows * item.cols : 0), manifest) +
            '<div class="voyage-choices" id="math-choices">' +
            item.choices
              .map(function (c) {
                return '<button type="button" data-v="' + c + '">' + c + "</button>";
              })
              .join("") +
            '</div><p class="voyage-status" id="math-status"></p>') +
        "</div>";

      const hear = document.getElementById("math-hear");
      if (hear) {
        hear.onclick = function () {
          speak(phase === "lesson" ? data.technique.audioText : item.audioText);
        };
      }
      const start = document.getElementById("math-start");
      if (start) {
        start.onclick = function () {
          phase = "play";
          cue("level");
          render();
          speak(data.items[0].audioText);
        };
      }
      const box = document.getElementById("math-choices");
      if (box) {
        box.addEventListener("click", function (ev) {
          const btn = ev.target.closest("button[data-v]");
          if (!btn) return;
          const val = btn.getAttribute("data-v");
          const status = document.getElementById("math-status");
          if (val === String(item.answer)) {
            btn.classList.add("is-right");
            cue("ok");
            progress.doubloons += 1;
            progress.lastItem = item.id;
            saveProgress(progress);
            status.textContent = "Stowed. On to the next crate.";
            setTimeout(function () {
              i += 1;
              if (i >= data.items.length) {
                phase = "paper";
                cue("level");
              }
              render();
              if (phase === "play") speak(data.items[i].audioText);
            }, 650);
          } else {
            btn.classList.add("is-wrong");
            cue("tryAgain");
            status.textContent = "Try the next heading. " + data.technique.title + ".";
            speak("Try again. " + data.technique.audioText);
          }
        });
      }

      if (phase === "lesson") speak(data.technique.audioText);
    }

    render();
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
