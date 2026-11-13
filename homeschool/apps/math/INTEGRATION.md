# Math — Treasure Voyage

Theme: pirate treasure voyage (deep water, rope, brass, island chart, crew, chests). No skulls. Band via `HS.getBand` (`?band=` then `hs.band`); standalone shows a picker if both are unset. Progress: `hs.progress.math`. Art is original SVG/CSS (coins, islands, ship, crew). Placeholder PNGs stay in `images.json` for the later picture wave.

## Bands

| Band | Chart |
| --- | --- |
| baby | Care voyage: tap-and-hear coins 1–3, peek chest, rock the hull |
| toddler | Counting 1–5 (tap each coin), more/fewer/same, one more/one less, match number to coins |
| preschool | Ten-frames to 10, count-on add-to-10, before/after, shapes, skip 2s |
| early | Add/sub facts, tens-crates (bundle ten ones), regrouping within 100, skip 2s/5s/10s, cents, hour clocks, length, rectangles, word problems, 3×4 arrays |
| primary | Fact families, hundreds, skip 3–11, array grids then **all × tables 0–12**, **all ÷ tables 1–12**, halves/thirds/fourths, quarters and dollars, half-hour clocks, feet/cups, perimeter, word problems |
| upper | Fractions (why 1/2 = 0.5), lined-up decimals, money, elapsed time, customary + metric, area, **long × and ÷ in the app** (ones/tens rows; divide-multiply-subtract-bring-down), turn/group/share-out/stay-the-same, skip 13–15 + squares/cubes, two-step stories, mixed operations |

Every island teaches a **technique the learner does**, then **now do this on paper**. The app never grades paper work. A miss shows the actual step (teach text + visual).

## Standalone kit

Standalone installs `HS.getBand`, `HS.setBand`, `HS.speak`, `HS.playCue`, `HS.readProgress`, `HS.writeProgress`, and mute. Cues use the kit recipe shape (`ok`, `tryAgain`, `reward`). The runner’s kit is left as-is.

## Progress shape

`localStorage['hs.progress.math']`:

- `by.<learnerFolder>` — chests, crew, tables, lastItem for that home (`Joey`, `Hanna`, or `standalone`). Not a shared lifetime pile.
- Visit doubloons live in memory for this page load only, labeled **This visit**.
- `chests` (`{ "<band>:<islandId>": true }`)
- `crew` (first-name ids aboard)
- `tablesMul` / `tablesDiv` (completed 0–12 crates)
- `band`, `lastItem`, `updatedAt`

No last names, ages, or grades.

In-app **Easier / Steady / Harder** (session only): fewer items in order, shuffled full set, or shuffled plus extra skips/transposed arrays.

## Sounds

WebAudio only (no audio files). Read-aloud uses `HS.speak`. Mute is `hs.mute`.

## Files

See `assets.json`. Do not register a service worker when `document.documentElement.dataset.runner === "1"`. Fetch JSON with `HS.url(...)`.

## Decks

CI builds `homeschool/decks/math.apkg` from `data/*.json` items (unique ids; toddler has no duplicate count pairs). Per-band decks live in `homeschool/decks/math/` and are built from `homeschool/decks/math-src/build.py` (CSV + full 0–12 facts).
