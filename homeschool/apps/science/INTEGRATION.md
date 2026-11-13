# Science — Field Expedition

Theme: naturalist's field expedition (ink plates, kraft journal, specimen tin, hand lens, lab tent). Distinct from pirate math and garden reading.

Band via `?band=` or `hs.band`. If neither is set, a trail picker. Allowed: `baby | toddler | preschool | early | primary | upper`. No grade labels, no exact ages, no family names.

Progress: `localStorage['hs.progress.science']`
Shape: `{ band, stars, stamps[], specimens[], experiments[], trails{}, journal[], babyPlates[], updated, updatedAt }`. Stars and stamps are collectibles, not grades.

## Runner

When `document.documentElement.dataset.runner === "1"`, **do not** register `sw.js`. Resolve files with `HS.url(path)`. Standalone `index.html` may register `./sw.js`.

## Untested

Visible banner (not screen-reader-only): **Untested, awaiting parent test.**

## Precache

`assets.json` lists every runtime file. `images.json` lists slots (`file`, `width`, `height`, `alt`, `themeNotes`, `slot`). Original SVG plates ship now; `images/ui/placeholder.svg` is reserved for a later photograph wave. Do not list this file (`INTEGRATION.md`) in `assets.json`.

## Sounds

WebAudio only (page turn, stamp, chirp, drop). Mute honors `hs.mute` and `HS.muted`. Read-aloud uses `speechSynthesis` when present.

## Printables (letter, toner-light)

- `printables/experiments.html`
- `printables/journal.html`
- `printables/specimen-cards.html`
- `printables/field-guide.html` (original body sketch — not class coloring pages)

## Decks

Per-band `.apkg` + CSV: `homeschool/decks/science/` and `homeschool/decks/science-src/`.
JSON sources the kit builder can read: `apps/science/data/{baby,toddler,preschool,early,primary,upper}.json` (`prompt` / `answer` / `audioText`).

`.apkg` is written with a fixed zip timestamp (`1700000000`). CI should compare CSV + sqlite note counts (`decks/science/catalog.json`), not byte-diff the zip wrapper.

Card rules: fronts never contain the answer; every card is complete in text (no missing picture).

Parent-run Anki. Do not attach any private Cycle 3 recitation pack.

## Coverage

Cycle 3 science **topic titles** (anatomy/physiology markers 1–12, chemistry 13–19, creation-science 20–24) with original notes and quizzes. Broader sweep: habitats, animals, plants, weather, five senses, simple machines, body. Faith-friendly (God's design). Scripture: KJV only.

## Do not

- Do not paste recitation text, songs, or class coloring pages
- Do not add child names, last names, or exact ages
- Do not claim the app is tested with children
