(function () {
  "use strict";

  var STORAGE_KEY = "tech-learning-progress-v1";
  var THEME_KEY = "tech-learning-theme";
  var PROGRESS_VERSION = 1;

  function $(id) {
    return document.getElementById(id);
  }

  function drillKey(moduleId, drillId) {
    return moduleId + "--" + drillId;
  }

  function sortedModules(data) {
    return data.modules.slice().sort(function (a, b) {
      return a.rank - b.rank;
    });
  }

  function allDrills(data) {
    var list = [];
    sortedModules(data).forEach(function (mod) {
      (mod.drills || []).forEach(function (drill) {
        list.push({ module: mod, drill: drill, key: drillKey(mod.id, drill.id) });
      });
    });
    return list;
  }

  function emptyProgress() {
    return { version: PROGRESS_VERSION, completed: {}, notes: {}, updatedAt: null };
  }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyProgress();
      var parsed = JSON.parse(raw);
      return normalizeProgress(parsed);
    } catch (err) {
      return emptyProgress();
    }
  }

  function normalizeProgress(parsed) {
    var next = emptyProgress();
    if (!parsed || typeof parsed !== "object") return next;
    next.completed = isPlainObject(parsed.completed) ? sanitizeCompleted(parsed.completed) : {};
    next.notes = isPlainObject(parsed.notes) ? sanitizeNotes(parsed.notes) : {};
    if (typeof parsed.updatedAt === "string") next.updatedAt = parsed.updatedAt;
    next.version = PROGRESS_VERSION;
    return next;
  }

  function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function sanitizeCompleted(obj) {
    var out = {};
    Object.keys(obj).forEach(function (key) {
      if (typeof key === "string") out[key] = !!obj[key];
    });
    return out;
  }

  function sanitizeNotes(obj) {
    var out = {};
    Object.keys(obj).forEach(function (key) {
      if (typeof obj[key] === "string") out[key] = obj[key];
    });
    return out;
  }

  function saveProgress(progress) {
    progress.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function completedCount(data, progress) {
    return allDrills(data).filter(function (item) {
      return !!progress.completed[item.key];
    }).length;
  }

  function nextIncomplete(data, progress) {
    var items = allDrills(data);
    for (var i = 0; i < items.length; i += 1) {
      if (!progress.completed[items[i].key]) return items[i];
    }
    return null;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function paragraphize(text) {
    return String(text)
      .trim()
      .split(/\n\n+/)
      .map(function (part) {
        return "<p>" + escapeHtml(part).replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function setTheme(mode) {
    var html = document.documentElement;
    if (mode === "light" || mode === "dark") {
      html.setAttribute("data-theme", mode);
      localStorage.setItem(THEME_KEY, mode);
    } else {
      html.removeAttribute("data-theme");
      localStorage.removeItem(THEME_KEY);
      mode = "system";
    }
    var btn = $("theme-toggle");
    if (btn) {
      btn.textContent = "Theme: " + mode;
      btn.setAttribute("aria-pressed", mode !== "system" ? "true" : "false");
    }
  }

  function currentTheme() {
    return localStorage.getItem(THEME_KEY) || "system";
  }

  function cycleTheme() {
    var order = ["system", "light", "dark"];
    var idx = order.indexOf(currentTheme());
    setTheme(order[(idx + 1) % order.length]);
  }

  function renderProgress(data, progress) {
    var total = allDrills(data).length;
    var done = completedCount(data, progress);
    var pct = total === 0 ? 0 : Math.round((done / total) * 100);
    $("progress-label").textContent = done + " of " + total + " drills done";
    $("progress-pct").textContent = pct + "%";
    var bar = $("progress-bar");
    bar.setAttribute("aria-valuemax", String(total));
    bar.setAttribute("aria-valuenow", String(done));
    $("progress-fill").style.width = pct + "%";
  }

  function renderToday(data, progress) {
    var target = $("today-card");
    var next = nextIncomplete(data, progress);
    if (!next) {
      target.className = "today-card all-done";
      target.innerHTML =
        "<p class=\"today-kicker\">All caught up</p>" +
        "<h3>Every drill is marked done</h3>" +
        "<p>Export your notes if you want a backup, or reset a drill when you want to run it again.</p>";
      return;
    }
    target.className = "today-card";
    target.innerHTML =
      "<p class=\"today-kicker\">" + escapeHtml(next.module.title) + "</p>" +
      "<h3>" + escapeHtml(next.drill.title) + "</h3>" +
      "<p>" + escapeHtml(next.drill.prompt) + "</p>" +
      "<div class=\"today-actions\">" +
      "<a class=\"btn btn-primary\" id=\"start-today\" href=\"#drill-" + next.key + "\">Start this drill</a>" +
      "</div>";
  }

  function renderModules(data, progress) {
    var list = $("module-list");
    var current = nextIncomplete(data, progress);
    var currentKey = current ? current.key : null;
    var hash = (location.hash || "").replace(/^#/, "");
    var html = "";

    sortedModules(data).forEach(function (mod) {
      var drills = mod.drills || [];
      var done = drills.filter(function (drill) {
        return !!progress.completed[drillKey(mod.id, drill.id)];
      }).length;
      var shouldOpen =
        hash === "module-" + mod.id ||
        drills.some(function (drill) {
          return hash === "drill-" + drillKey(mod.id, drill.id);
        }) ||
        (!hash && current && current.module.id === mod.id);

      html += "<li class=\"module" + (shouldOpen ? " is-open" : "") + "\" id=\"module-" + escapeHtml(mod.id) + "\">";
      html += "<button type=\"button\" class=\"module-header\" aria-expanded=\"" + (shouldOpen ? "true" : "false") + "\" data-module=\"" + escapeHtml(mod.id) + "\">";
      html += "<span class=\"module-title\">" + escapeHtml(mod.rank) + ". " + escapeHtml(mod.title) + "</span>";
      html += "<span class=\"drill-count\">" + done + " / " + drills.length + " drills</span>";
      html += "</button>";
      html += "<div class=\"module-body\">";
      html += "<div class=\"lesson\">" + paragraphize(mod.lesson) + "</div>";
      drills.forEach(function (drill) {
        html += renderDrill(mod, drill, progress, currentKey);
      });
      html += "</div></li>";
    });

    list.innerHTML = html;
  }

  function renderDrill(mod, drill, progress, currentKey) {
    var key = drillKey(mod.id, drill.id);
    var done = !!progress.completed[key];
    var notes = progress.notes[key] || "";
    var checkboxId = "done-" + key;
    var notesId = "notes-" + key;
    var currentClass = key === currentKey ? " is-current" : "";
    var items = (drill.done_when || [])
      .map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      })
      .join("");

    return (
      "<article class=\"drill" + currentClass + "\" id=\"drill-" + escapeHtml(key) + "\">" +
      "<h4>" + escapeHtml(drill.title) + "</h4>" +
      "<p class=\"drill-prompt\">" + escapeHtml(drill.prompt) + "</p>" +
      "<p class=\"done-when-label\">Done when</p>" +
      "<ul class=\"done-when\">" + items + "</ul>" +
      "<div class=\"drill-controls\">" +
      "<label class=\"checkbox-row\" for=\"" + escapeHtml(checkboxId) + "\">" +
      "<input type=\"checkbox\" id=\"" + escapeHtml(checkboxId) + "\" data-key=\"" + escapeHtml(key) + "\"" + (done ? " checked" : "") + ">" +
      "<span>Mark this drill done</span>" +
      "</label>" +
      "<label class=\"notes-label\" for=\"" + escapeHtml(notesId) + "\">Notes</label>" +
      "<textarea id=\"" + escapeHtml(notesId) + "\" data-key=\"" + escapeHtml(key) + "\" placeholder=\"Pass/fail, evidence, and anything you would keep.\">" + escapeHtml(notes) + "</textarea>" +
      "</div></article>"
    );
  }

  function renderTools(data) {
    $("tools-intro").textContent = data.tools.intro;
    var body = $("tools-body");
    body.innerHTML = data.tools.rows
      .map(function (row) {
        var kit = row.kit === "daily" ? "Daily kit" : "Comparison";
        return (
          "<tr>" +
          "<th scope=\"row\">" + escapeHtml(row.tool) + " <span class=\"kit\">" + escapeHtml(kit) + "</span></th>" +
          "<td>" + escapeHtml(row.maker) + "</td>" +
          "<td><code>" + escapeHtml(row.command) + "</code></td>" +
          "<td>" + escapeHtml(row.interfaces) + "</td>" +
          "<td>" + escapeHtml(row.notes) + "</td>" +
          "<td><a href=\"" + escapeHtml(row.docs) + "\" rel=\"noopener noreferrer\">Docs</a></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function render(data, progress) {
    renderProgress(data, progress);
    renderToday(data, progress);
    renderModules(data, progress);
    focusFromHash();
  }

  function focusFromHash() {
    var hash = (location.hash || "").replace(/^#/, "");
    if (!hash) return;
    var el = document.getElementById(hash);
    if (el) {
      if (typeof el.focus === "function") {
        if (!el.hasAttribute("tabindex") && el.tagName !== "A" && el.tagName !== "BUTTON" && el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") {
          el.setAttribute("tabindex", "-1");
        }
        el.focus({ preventScroll: true });
      }
      el.scrollIntoView({ block: "start" });
    }
  }

  function exportProgress(progress) {
    var payload = {
      version: PROGRESS_VERSION,
      completed: progress.completed,
      notes: progress.notes,
      exportedAt: new Date().toISOString()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var stamp = payload.exportedAt.slice(0, 10);
    a.href = url;
    a.download = "tech-learning-progress-" + stamp + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importProgress(file, data, onDone) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        if (!isPlainObject(parsed) || !isPlainObject(parsed.completed) || !isPlainObject(parsed.notes)) {
          throw new Error("Expected a progress JSON object with completed and notes.");
        }
        var next = normalizeProgress(parsed);
        saveProgress(next);
        onDone(next, null);
      } catch (err) {
        onDone(null, err);
      }
    };
    reader.onerror = function () {
      onDone(null, new Error("Could not read that file."));
    };
    reader.readAsText(file);
  }

  function bind(data) {
    var progress = loadProgress();
    var statusTimer = null;

    function flash(message, isError) {
      var existing = $("action-status");
      if (!existing) {
        existing = document.createElement("p");
        existing.id = "action-status";
        existing.className = "status";
        existing.setAttribute("role", "status");
        $("theme-toggle").parentNode.appendChild(existing);
      }
      existing.textContent = message;
      existing.className = "status" + (isError ? " error" : "");
      clearTimeout(statusTimer);
      statusTimer = setTimeout(function () {
        existing.textContent = "";
      }, 4000);
    }

    $("tagline").textContent = data.tagline;
    $("intro").textContent = data.intro;
    setTheme(currentTheme());
    renderTools(data);
    render(data, progress);

    $("theme-toggle").addEventListener("click", cycleTheme);

    $("module-list").addEventListener("click", function (event) {
      var btn = event.target.closest(".module-header");
      if (!btn) return;
      var item = btn.closest(".module");
      var open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    $("module-list").addEventListener("change", function (event) {
      var target = event.target;
      if (target.matches("input[type='checkbox'][data-key]")) {
        progress.completed[target.getAttribute("data-key")] = target.checked;
        saveProgress(progress);
        render(data, progress);
      }
    });

    $("module-list").addEventListener("input", function (event) {
      var target = event.target;
      if (target.matches("textarea[data-key]")) {
        progress.notes[target.getAttribute("data-key")] = target.value;
        saveProgress(progress);
      }
    });

    $("export-btn").addEventListener("click", function () {
      exportProgress(progress);
      flash("Progress exported.");
    });

    $("import-btn").addEventListener("click", function () {
      $("import-file").click();
    });

    $("import-file").addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      event.target.value = "";
      if (!file) return;
      importProgress(file, data, function (next, err) {
        if (err) {
          flash("Import failed. Use a JSON export from this app.", true);
          return;
        }
        progress = next;
        render(data, progress);
        flash("Progress imported.");
      });
    });

    $("reset-btn").addEventListener("click", function () {
      var ok = window.confirm("Clear all checkboxes and notes stored in this browser? This cannot be undone unless you have an export.");
      if (!ok) return;
      progress = emptyProgress();
      localStorage.removeItem(STORAGE_KEY);
      render(data, progress);
      flash("Progress reset.");
    });

    window.addEventListener("hashchange", function () {
      render(data, progress);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.APP_DATA || !Array.isArray(window.APP_DATA.modules)) {
      $("intro").textContent = "Could not load lesson data from data.js.";
      return;
    }
    bind(window.APP_DATA);
  });
})();
