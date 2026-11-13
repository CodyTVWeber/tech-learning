# History — Time-Travel Train

Theme: a railway of American eras. Each stop is a Cycle 3 *history topic*. Kids collect tickets and brass stamps. Original quizzes, timelines, and songs. Public-domain Preamble and Bill of Rights text is quoted; recitation sentences are not.

## Plug-in

- Folder id: `history`
- Band: `?band=` else `localStorage['hs.band']` else a picker (runner always sets `?band=`)
- Optional: `?week=1`–`24` opens that station
- Progress: `localStorage['hs.progress.history']` (stamps, tickets, stars, `updatedAt`)
- Mute: `hs.mute` (`1` = muted), same key as the kit
- Do **not** register `sw.js` when `document.documentElement.dataset.runner === "1"`
- Resolve files with `HS.url(...)` / `dataset.appBase` so the learner runner stays in scope
- Visible banner on every load: **Untested, awaiting parent test.**

## Bands

| Band | Ride |
| --- | --- |
| baby | Play car: whistle, wheels, ticket, lantern, ship, rocket |
| toddler | Picture tickets on grouped stations |
| preschool | Short facts, songs, easy quizzes |
| early | Two-choice / three-choice tickets, timeline of 3 |
| primary | Harder tickets, timeline, presidents car |
| upper | Documents, presidents 1–47, longer tickets |

## Precache

See `assets.json`. New runtime files must be listed there.

## Anki

Public-safe decks live in `homeschool/decks/history/` with CSV + `build.py` in `homeschool/decks/history-src/`.

```text
python3 homeschool/decks/history-src/build.py
```

The builder writes `.apkg` with a **fixed zip timestamp** (`1700000000`) so bytes stay stable. Kit CI should still treat `.apkg` as non-byte-stable and check **CSV + note counts** (see `catalog.json` next to the packages). Fronts never contain the answer; cards are text-only and stand alone (no “look at the map/picture”).

Integrator: glob `homeschool/decks/history-src/*.csv` from `tools/anki/build_decks.py` if you want the shared builder to emit these stems. Do not mash all bands into one `history.apkg` unless parents ask.
