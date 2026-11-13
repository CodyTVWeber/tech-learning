(function () {
  const HS = window.HS;

  async function boot() {
    HS.mountChrome({ atHome: true, title: "Family homes", sub: "Pick a learner" });
    HS.registerPWA({ swUrl: "./sw.js", scope: "./" });
    const stages = await (await fetch("./stages.json")).json();
    const root = document.getElementById("hub-root");
    let html = "<h1>Family learning homes</h1>";
    html +=
      '<p class="lead">Each name opens that learner’s installable home. Lessons stay inside that home so they work offline. Untested, awaiting parent test.</p>';
    html += '<ul class="hs-learner-list">';
    (stages.stages || []).forEach(function (s) {
      html +=
        "<li><a href=\"./" +
        encodeURIComponent(s.folder) +
        '/"><strong>' +
        s.displayName +
        "</strong><span>" +
        s.label +
        " · " +
        s.ageBand +
        "</span></a></li>";
    });
    html += "</ul>";
    html +=
      '<p class="hub-note">Progress stays in this browser. Export it if you switch phones. A private Cycle 3 review deck exists for the family; it is not hosted on this public site.</p>';
    html +=
      '<div class="hub-tools">' +
      '<button type="button" id="hs-export">Export progress</button>' +
      '<button type="button" id="hs-import-btn">Import progress</button>' +
      '<input type="file" id="hs-import" accept="application/json" hidden>' +
      '<a href="./decks/">Public decks</a>' +
      "</div>";
    root.innerHTML = html;
    document.getElementById("hs-export").onclick = function () {
      HS.downloadExport();
    };
    document.getElementById("hs-import-btn").onclick = function () {
      document.getElementById("hs-import").click();
    };
    document.getElementById("hs-import").onchange = function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          HS.importAll(JSON.parse(String(reader.result)));
          location.reload();
        } catch (err) {
          alert("Could not import that file.");
        }
      };
      reader.readAsText(file);
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    boot().catch(function (err) {
      console.error(err);
    });
  });
})();
