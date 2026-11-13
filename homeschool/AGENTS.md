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
- Progress: `localStorage['hs.progress.<subject>']`, plus other `hs.*` keys. Export/import JSON from the homes.

## Layout

- `stages.json` — learner folders, first names, `age`, band, subject levels. Hub, SW, and tests **read this file**. Rename a learner with a one-line edit here plus `git mv` of the folder, then `python3 tools/homeschool/build_assets.py`.
- `apps/<id>/` — one app per subject. This lane ships **math** and **reading**. Other subjects: other PRs, same contract (`DESIGN.md`).
- `<FirstName>/` — generated learner PWA (manifest, SW, `play.html` runner). Do not hand-edit; change `pwa-templates/` and regenerate.
- `kit/` — nav, PWA, a11y, runner, progress. **No visual theme.**
- `decks/` — public-safe `.apkg` + CSV. Not the private Cycle 3 pack.

## App contract (do not break)

Documented in `DESIGN.md`. Short version:

- `index.html`, `assets.json`, `images.json`, `INTEGRATION.md`
- Band: `?band=` else `localStorage['hs.band']`
- Progress: `localStorage['hs.progress.<id>']`
- Learner SW and CI **consume `assets.json`**. New apps plug in without kit edits.
- Runner: `play.html?app=<id>&band=<band>` loads the app **inside** the learner scope. Never navigate to `../apps/`.

## Parallel work

Subject agents write only `homeschool/apps/<id>/` and `homeschool/decks/<id>*`. Do not touch kit, learner folders, hub, or CI. See `CONTRIBUTING.md`.
