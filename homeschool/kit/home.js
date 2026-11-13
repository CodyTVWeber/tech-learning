(function (global) {
  const HS = (global.HS = global.HS || {});

  function folderFromPath() {
    const parts = global.location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  }

  HS.loadStages = async function loadStages() {
    const url = new URL("../stages.json", global.location.href);
    const res = await fetch(url);
    return res.json();
  };

  HS.mountLearnerHome = async function mountLearnerHome() {
    const folder = folderFromPath();
    const stages = await HS.loadStages();
    const me = (stages.stages || []).find(function (s) {
      return s.folder === folder;
    });
    const root = document.getElementById("home-root");
    if (!me || !root) {
      if (root) root.innerHTML = "<p>Unknown home.</p>";
      return;
    }
    const band = HS.bandFor(me);
    HS.setBand(band);
    HS.mountChrome({
      atHome: true,
      title: me.displayName,
      sub: me.label + " · " + me.ageBand,
    });
    document.title = me.displayName + "’s Learning";

    const subjects = Object.keys(me.subjects || {}).filter(function (id) {
      return me.subjects[id] && me.subjects[id] !== "none";
    });
    const index = await fetch(new URL("../apps-index.json", global.location.href)).then(function (r) {
      return r.json();
    });
    const present = index.apps || [];

    const cards = [];
    for (let i = 0; i < subjects.length; i++) {
      const id = subjects[i];
      if (present.indexOf(id) === -1) continue;
      const res = await fetch(new URL("../apps/" + id + "/assets.json", global.location.href));
      if (!res.ok) continue;
      const assets = await res.json();
      cards.push({ id: id, assets: assets });
    }

    let html = '<header class="hs-home-head">';
    html += "<h1>" + me.displayName + "</h1>";
    html += "<p>" + me.label + " · " + me.ageBand + "</p>";
    html += "</header>";

    if (!cards.length) {
      html +=
        '<p class="hs-empty">No lessons on this home yet. This is a quiet page for care time.</p>';
    } else {
      html += '<ul class="hs-app-list">';
      cards.forEach(function (c) {
        const href = "./play.html?app=" + encodeURIComponent(c.id) + "&band=" + encodeURIComponent(band);
        html +=
          '<li><a class="hs-app-card" href="' +
          href +
          '"><strong>' +
          (c.assets.title || c.id) +
          "</strong><span>" +
          (c.assets.theme || "") +
          "</span></a></li>";
      });
      html += "</ul>";
    }

    html += '<section class="hs-settings" aria-labelledby="settings-h">';
    html += "<h2 id=\"settings-h\">Settings</h2>";
    html += "<p>Move this home up or down a band. Apps read the band, not a grade label.</p>";
    html += '<label>Band <select id="hs-band-select">';
    HS.BANDS.forEach(function (b) {
      html +=
        "<option value=\"" +
        b +
        "\"" +
        (b === band ? " selected" : "") +
        ">" +
        b +
        "</option>";
    });
    html += "</select></label>";
    html +=
      '<div class="hs-settings-row">' +
      '<button type="button" id="hs-export">Export progress</button>' +
      '<button type="button" id="hs-import-btn">Import progress</button>' +
      '<input type="file" id="hs-import" accept="application/json" hidden>' +
      "</div></section>";

    root.innerHTML = html;
    document.getElementById("hs-band-select").addEventListener("change", function (e) {
      HS.setLearnerBand(me.folder, e.target.value);
      HS.setBand(e.target.value);
      global.location.reload();
    });
    document.getElementById("hs-export").addEventListener("click", function () {
      HS.downloadExport();
    });
    document.getElementById("hs-import-btn").addEventListener("click", function () {
      document.getElementById("hs-import").click();
    });
    document.getElementById("hs-import").addEventListener("change", function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          HS.importAll(JSON.parse(String(reader.result)));
          global.location.reload();
        } catch (err) {
          alert("Could not import that file.");
        }
      };
      reader.readAsText(file);
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.body.classList.contains("hs-home")) return;
    HS.registerPWA({ swUrl: "./sw.js", scope: "./" });
    HS.mountLearnerHome().catch(function (err) {
      console.error(err);
    });
  });
})(window);
