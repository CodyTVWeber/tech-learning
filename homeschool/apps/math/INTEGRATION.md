# Math — Treasure Voyage

Theme: pirate treasure voyage (deep water, rope, brass, island chart, crew, chests). No skulls. Band via `?band=` or `hs.band`, else an in-app picker. Progress: `hs.progress.math`.

## Bands

| Band | Chart |
| --- | --- |
| baby | Care voyage: tap-and-hear coins 1–3, peek chest, rock the hull |
| toddler | Counting 1–5, more/fewer/same, one more/one less, match number to coins |
| preschool | Numbers to 10, add-to-10 (count on), before/after, shapes, skip 2s |
| early | Add/sub facts, tens and ones, regrouping within 100, skip 2s/5s/10s, cents, hour clocks, length, rectangles, word problems, equal groups |
| primary | Fact families, hundreds, skip 3–11, **all × tables 0–12**, **all ÷ tables 1–12**, halves/thirds/fourths, quarters and dollars, half-hour clocks, feet/cups, perimeter, word problems |
| upper | Fractions, decimals, money, elapsed time, customary + metric equivalents, area and circumference, long × and ÷, turn/group/share-out/stay-the-same rules, skip 13–15 + squares/cubes, two-step stories, mixed operations |

Every island teaches a **technique**, then **now do this on paper**. The app never grades paper work.

## Progress shape

`localStorage['hs.progress.math']`:

- `doubloons` (number)
- `chests` (`{ "<band>:<islandId>": true }`)
- `crew` (first-name ids aboard)
- `tablesMul` / `tablesDiv` (completed 0–12 crates)
- `band`, `lastItem`, `updatedAt`

No last names, ages, or grades.

## Sounds

WebAudio only (no audio files): coin clink, wood knock, chest latch, fanfare, hull creak, splash, bell, wind, gull. Mute is `hs.mute`. Read-aloud uses `speechSynthesis` when present.

## Files

See `assets.json`. Do not register a service worker when `document.documentElement.dataset.runner === "1"`. Fetch JSON with `HS.url(...)`.

Standalone: registers `./sw.js`, shows a band picker if `?band=` and `hs.band` are unset, and a mute control.

## Decks

CI builds `homeschool/decks/math.apkg` from `data/*.json` items (unique ids; toddler has no duplicate count pairs). Per-band decks live in `homeschool/decks/math/` and are built from `homeschool/decks/math-src/build.py` (CSV + full 0–12 facts).
