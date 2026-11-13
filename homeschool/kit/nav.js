(function (global) {
  const HS = (global.HS = global.HS || {});

  HS.notOnThisHomeHtml = function notOnThisHomeHtml() {
    return '<p class="hs-empty">Not on this home. This is a quiet page for care time.</p>';
  };

  HS.mountChrome = function mountChrome(opts) {
    opts = opts || {};
    const host = document.getElementById("hs-chrome");
    if (!host) return;
    const homeHref = opts.homeHref || "./";
    const atHome = !!opts.atHome;
    host.innerHTML =
      '<div class="hs-chrome-inner">' +
      (atHome
        ? ""
        : '<a class="hs-tap" href="' +
          homeHref +
          '">Home</a>') +
      '<p class="hs-chrome-title">' +
      (opts.title || "") +
      (opts.sub ? '<span class="hs-chrome-sub">' + opts.sub + "</span>" : "") +
      "</p>" +
      '<button type="button" class="hs-tap" id="hs-mute-btn" aria-pressed="false">Sound on</button>' +
      "</div>" +
      '<p class="hs-banner">Untested, awaiting parent test.</p>' +
      '<div class="hs-update" id="hs-update"><span>A new version is ready.</span><button type="button">Refresh</button></div>';

    function syncMute() {
      const btn = document.getElementById("hs-mute-btn");
      if (!btn) return;
      const on = !HS.muted();
      btn.textContent = on ? "Sound on" : "Sound off";
      btn.setAttribute("aria-pressed", on ? "false" : "true");
    }
    document.getElementById("hs-mute-btn").addEventListener("click", function () {
      HS.toggleMute();
      HS.silence && HS.silence();
      syncMute();
    });
    syncMute();
    global.addEventListener("hs-mute", syncMute);
  };
})(window);
