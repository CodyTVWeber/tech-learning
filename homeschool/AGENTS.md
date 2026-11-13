# Homeschool — agent instructions

This tree is a **faith-friendly** family learning site (Christian household). It is still a **public** GitHub Pages site. Follow this file together with root `AGENTS.md`. If they conflict on this folder, this file wins.

Hard rules are also summarized in `SPEC.md` §1 and `DESIGN.md`.

## Hard rules

- **Static only.** HTML, CSS, vanilla JS. No bundler, no npm build to serve the site. Tools under `tools/` may use Python or Playwright for CI.
- **No ads, analytics, trackers, CDNs, webfonts, sign-ins, or runtime network calls** (same-origin files only; service worker serves them offline).
- **Relative paths only** so the site works at `/tech-learning/homeschool/` and at any base path.
- **No last names, birth dates, birthdays, photos of the learners, addresses, or school / medical / therapy details.** First names in `stages.json` (`displayName` / folder) are approved for folders and UI. Ages live **only** in `stages.json` as the editable `age` field — never hard-code an age on a page, never compute an age from a birth date.
- **No grade labels** anywhere (not “K”, “1st”, “upper elementary grade”, etc.). Use **bands**: `baby`, `toddler`, `preschool`, `early`, `primary`, `upper`.
- **No Classical Conversations copyrighted material:** no 532-card deck, recitation text, Essentials chart wording, Math Map or Student Body pages, CC audio/video, or copyrighted lyrics. Topic titles, public-domain facts, and original quizzes are OK.
- Math is original practice aligned to CC Math Map **skills**, not a copy of the Map. Teach technique, then **now do this on paper**.
- `toddler` and `preschool` phonics: letter **sounds** first, not letter names.
- Never write “kid-friendly” or “kid-tested.” Mark UI **Untested, awaiting parent test.**
- Progress: `localStorage['hs.progress.<folder>.<subject>']` via `HS.progressKey(subject)`. `<folder>` is the learner folder (`Joey`) or `standalone` under `/apps/`. Never store an age or a surname in the key. Other `hs.*` keys are still exported.

## Layout

- `stages.json` — learner folders, first names, `age`, band, subject levels. Hub, SW, and tests **read this file**. Rename a learner with a one-line edit here plus `git mv` of the folder, then `python3 tools/homeschool/build_assets.py`.
- `apps/<id>/` — one app per subject. This lane ships **math** and **reading**. Parallel ids: `history` (time-travel train; includes Cycle 3 history review), `geography`, `science`, `bible`, `singing`, `movement`, `art`. Later: `essentials-points`, `presentation`. No `cc-cycle3`, `maps`, or `dancing` folders.
- `<FirstName>/` — generated learner PWA (manifest, SW, `play.html` runner). Do not hand-edit; change `pwa-templates/` and regenerate.
- `kit/` — nav, PWA, a11y, runner, progress. **No visual theme.**
- `decks/` — public-safe `.apkg` + CSV. Not the private Cycle 3 pack.

## App contract (do not break)

Documented in `DESIGN.md`. Short version:

- `index.html`, `assets.json`, `images.json`, `INTEGRATION.md`
- Band: `HS.getBand()` reads `?band=` else `localStorage['hs.band']`. If both are unset it returns `""` — **not** `early`. Standalone apps show a band picker. The runner always sets `?band=` from the learner before the app starts.
- Progress: `HS.readProgress(id)` / `HS.writeProgress(id)` (`hs.progress.<folder>.<id>`)
- Learner SW and CI **consume `assets.json`**. New apps plug in without kit edits.
- Runner: `play.html?app=<id>&band=<band>` loads the app **inside** the learner scope. Never navigate to `../apps/`.
- If that learner’s `stages.json` level for the subject is `"none"`, the home does not link it, and `play.html?app=` shows the same quiet page as an empty home (`Not on this home. This is a quiet page for care time.`) without fetching the app (no `assets.json`, no `data/<band>.json`). Do not write a shared `hs.progress.<id>` key. Two learners on one origin must not share a flock.

## Runner chrome and speech

Before app scripts run, the runner sets:

- `document.documentElement.dataset.runner = "1"` so CSS can use `html[data-runner]` (also class `hs-runner` on `<html>`)
- `HS.inRunner = true`
- `HS.speak(text, { rate, pitch, lang })`, `HS.silence()`, `HS.muted()`, `HS.setMuted(on)`, `HS.toggleMute()`

Apps **hide their own top bar** (title, mute, band switch) and their own “Untested” banner when `html[data-runner]` or `HS.inRunner` is set. The kit keeps one banner (`.hs-banner` in `#hs-chrome`) and one mute control. Kit tap targets stay at least 56px. Do not paint a second header.

Route read-aloud through `HS.speak`. It already no-ops while muted. Do not skip `speechSynthesis` just because the page is inside the runner, and do not treat `HS.muted` as always-on — call `HS.muted()`.

## Parallel work

Subject agents write only `homeschool/apps/<id>/` and `homeschool/decks/<id>*`. Do not touch kit, learner folders, hub, or CI. See `CONTRIBUTING.md`.
