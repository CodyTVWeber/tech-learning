# Art app — integrator notes

Plug this folder in as subject `art`. Visual language is a **harbor studio** (sailcloth, verdigris, copper) — keep it distinct from Circus Parade.

## Mount
- URL: `/homeschool/apps/art/`
- Entry: `index.html`
- Nav title: **Harbor Studio**
- Blurb: Look, mix, then draw it on paper. Colors, shapes, step lessons, a paint canvas, and public-domain masterpieces.

## Contract
- Band: `?band=` (`baby` | `toddler` | `preschool` | `early` | `primary` | `upper`). Else `localStorage['hs.band']`. Else picker. No exact ages.
- Progress: `HS.progressKey('art')` (`hs.progress.<folder>.art`) — `{ stars, postcards[], stamps[], done{}, updated }`.
- Quiet: `localStorage['hs.art.quiet']`
- Precache: `assets.json` → `files`. Standalone `sw.js` caches that list. Do **not** register it inside the learner runner (`dataset.runner`).
- Visible banner: “Untested, awaiting parent test.” (not screen-reader-only).
- Images: `images.json`. Generated studio stills in `images/`. Masterpiece slots in `images/masters/` (public-domain museum photographs, credited).

## Coverage
| Band | What opens |
|---|---|
| baby | Color dock, fat-brush canvas |
| toddler | Colors, shapes, canvas, Looking Wall (simple pointing) |
| preschool | Colors, shapes, mix, pier lessons → paper, canvas, looking |
| early | Mix, lessons, canvas, looking, artist cards, studio challenges (mirror / upside-down) |
| primary | Mix, lessons (perspective start), looking, artists, challenges |
| upper | Lessons (2-point, value, master line-copy), looking, artists, challenges |

Math-style handoff for drawing: **technique on screen, finish on paper.** The canvas is play, not the graded work (and nothing is graded).

## Anki
`/homeschool/decks/art/` with CSV + `build.py` in `/homeschool/decks/art-src/`. Artists and artworks plus colors/shapes for younger bands. Fronts never contain the answer; cards stand alone without a missing picture. `.apkg` uses a fixed zip timestamp; `catalog.json` holds note counts.

## Do not
- Do not ship Picasso / O’Keeffe / Rockwell / Wyeth / Lichtenstein / Grandma Moses images (still in copyright). Topic-level talk is fine; this app uses older public-domain pictures only.
- Do not paste CC Fine Arts recitation text. Studio challenges align to drawing ideas (mirror, upside-down, abstract, perspective) in original wording.
- Mark UI untested; never claim the app has been tried with learners.
