# Movement app — integrator notes

Plug this folder in as subject `movement`. Do not rewrite files here unless the scaffold path layout changes.

## Mount
- URL: `/homeschool/apps/movement/` (GitHub Pages: `/tech-learning/homeschool/apps/movement/`)
- Entry: `index.html`
- Theme name to show in nav: **Circus Parade**
- Home blurb: Join the parade. Earn ribbons. Follow-the-leader, freeze band, step counts, lap rhymes.

## Contract
- Band: `?band=` (`baby` | `toddler` | `preschool` | `early` | `primary` | `upper`). Else `localStorage['hs.band']`. Else in-app picker. No exact ages on screen.
- Progress: `localStorage['hs.progress.movement']` — `{ stars, ribbons[], stamps[], done{}, updated }`. Stars/ribbons/stamps only; never grades.
- Quiet toggle: `localStorage['hs.movement.quiet']`
- Precache: read `assets.json` → `files`. Standalone `sw.js` precaches that list. Do **not** register it inside the learner runner (`dataset.runner`).
- Visible banner: “Untested, awaiting parent test.” (not screen-reader-only).
- Images: `images.json` slots. Generated stills ship in `img/`.

## Coverage
| Band | What opens |
|---|---|
| baby | Wagon Watch, Lap Tent rhymes |
| toddler | Watch, rhymes, parade, freeze, step count |
| preschool | Rhymes, parade, ringmaster, freeze, count, ballet shapes, practice tent |
| early | Parade, ringmaster, freeze, count, ballet, tap, practice, glossary |
| primary | Parade, ringmaster, freeze, count, tap, street-beat, builder, practice, glossary |
| upper | Parade, ringmaster, freeze, count, builder, practice, glossary |

Dance-class alignment (generic shapes, original cues — not studio combos): preschool ballet+creative; early ballet+tap; primary tap+street-beat; no ballet track on primary.

## Anki
Public decks live in `/homeschool/decks/movement/` with CSV + `build.py` in `/homeschool/decks/movement-src/`. Fronts never contain the answer; cards are text-only (no missing picture). `.apkg` is written with a fixed zip timestamp; `catalog.json` holds note counts so CI can skip byte-diffing the zip wrapper.

## Do not
- Do not link CC recitation, studio class tapes, or copyrighted lyrics.
- Do not show last names or exact ages.
- Mark UI untested; never claim the app has been tried with learners.
