# Homeschool design

Wave 1 (this lane) ships the shared kit, learner homes, the in-scope runner, CI, and polished **math** and **reading** samples. Other subjects land in separate PRs. Every app: **untested, awaiting parent test.** Do not write “kid-friendly” or “kid-tested.”

## App contract (kit does not change when a subject is added)

A subject agent writes **only**:

- `homeschool/apps/<id>/` (the app)
- `homeschool/decks/<id>*` (optional public-safe Anki files)

Folder `<id>` must match `assets.json` `"id"` and a key under `subjects` in `homeschool/stages.json`.

### Required files

| File | Role |
| --- | --- |
| `index.html` | Plain, self-contained app page. Works standalone at `apps/<id>/` and inside the learner runner. |
| `assets.json` | Precache list. Runner, learner service workers, and CI read this. If a file is not listed, it will not work offline. |
| `images.json` | Image slots (filename, width, height, alt, theme notes, slot). PNGs live in `images/`. |
| `INTEGRATION.md` | Notes for the kit/runner (band keys you honor, progress shape, sound, any query params). |

### `assets.json`

```json
{
  "id": "math",
  "title": "Treasure Voyage",
  "shortTitle": "Math",
  "theme": "pirate treasure voyage",
  "version": "1",
  "files": [
    "index.html",
    "style.css",
    "app.js",
    "assets.json",
    "images.json",
    "data/toddler.json",
    "images/hero-ship.png"
  ]
}
```

- Paths are relative to the app folder. List **every** HTML/CSS/JS/JSON/image the app needs at runtime.
- Do not list `INTEGRATION.md`.
- New files → add them here. CI fails if a runtime file is missing from `assets.json` or a listed file does not exist.

### `images.json`

```json
{
  "app": "math",
  "theme": "pirate treasure voyage",
  "images": [
    {
      "file": "hero-ship.png",
      "width": 1024,
      "height": 512,
      "alt": "A wooden sailing ship on bright water. No skulls.",
      "themeNotes": "Hero banner. Final wave: real picture.",
      "slot": "hero"
    }
  ]
}
```

Alt text describes the **intended** final picture. Placeholders are neutral fields of the listed size. Service workers precache `images/` because those files are in `assets.json`.

### Band

Apps must **not** use grade labels. They read a **band**:

1. Query `?band=` on the page URL (the runner always sets this)
2. Else `localStorage['hs.band']`
3. Else unset (`""`). Standalone apps show a band picker. Do not assume `early`.

Allowed bands: `baby` | `toddler` | `preschool` | `early` | `primary` | `upper`.

| Band | Typical learner (builder note) | Math sample | Reading sample |
| --- | --- | --- | --- |
| `baby` | Infant — usually no academic app | (not linked) | (not linked) |
| `toddler` | Play-based | Count coins 1–5 | Letter **sounds** (not names) |
| `preschool` | Early learner | Numbers / add to 10 | Letter **sounds** (not names) |
| `early` | Add/sub within 100; blends | Bonds, place value | Blends + decodable books |
| `primary` | Multiply / divide facts | Fact families | Volume reading + books |
| `upper` | Decimals, fractions, long ops | Technique → paper | Volume reading + books |

The runner sets `?band=` from `stages.json` (or a per-learner override) and also writes `localStorage['hs.band']` so standalone pages see the same band.

### Progress

- Key: `localStorage['hs.progress.<id>']` where `<id>` is the app id (`math`, `reading`, …)
- Value: JSON object the app owns. Include `updatedAt` (ISO string) if you can.
- Learner homes export/import **all** `hs.*` keys. Do not store last names, birth dates, photos, addresses, or medical details.

### How the runner loads an app (scope)

Learner PWAs live at `/homeschool/<FirstName>/` with `scope: "./"`. They **must not navigate** to `/homeschool/apps/<id>/`.

`play.html?app=<id>&band=<band>` (inside the learner folder):

1. Sets `html[data-runner="1"]`, class `hs-runner`, and `HS.inRunner` before any app file is fetched
2. If that learner’s subject level is `"none"`, shows the quiet home page and stops (no `assets.json`, no `index.html`, no `data/<band>.json`)
3. Sets `?band=` from the query, else the learner’s band (including a per-learner override), and writes `localStorage['hs.band']`
4. Fetches `../apps/<id>/assets.json` (subresource → learner SW), then `index.html`
5. Sets `dataset.appBase`, `dataset.subject`, `dataset.band`, and `window.HS` (`appBase`, `subject`, `band`, `url(path)`, `speak`, mute helpers)
6. Injects the app’s stylesheets and scripts with URLs resolved against `appBase`, and the body into `#app-root`

Relative `fetch('data/x.json')` from app JS would hit the **learner** folder. Always use:

```javascript
fetch(window.HS.url('data/toddler.json'))
// or, standalone:
fetch(new URL('data/toddler.json', document.documentElement.dataset.appBase || './'))
```

If `dataset.runner` is set, **do not** register a service worker (the learner SW already controls the page). Standalone `index.html` may register `./sw.js` and use its own manifest.

### Precache

On install and whenever the home page asks (`ensure-apps`), the learner SW:

1. Caches its own folder, `../kit/`, `../stages.json`
2. For each subject in that learner’s `stages.json` whose level is not `"none"`, fetches `../apps/<id>/assets.json` if it exists and caches every listed file

A new app **plugs in** by adding `apps/<id>/` with `assets.json` and running `python3 tools/homeschool/build_assets.py`. That regenerates `apps-index.json` `apps` (folders that exist). The kit never fetches `assets.json` for an id that is not in that list, so a missing app **does not 404 and does not break a learner home**. The runner shows a calm “not on this device yet” page if someone opens `play.html?app=<missing>`.

`apps-index.json` also lists `ids` (every subject key in `stages.json`). Homes only link ids that are in **both** `apps` (folder exists) and the learner’s non-`none` subjects.

CI discovers the same way. It does not hard-code subject names beyond math/reading fixtures.

### What subject agents must not do

- Edit `homeschool/kit/`, learner folders, `play.html`, hub, CI workflows, or other apps
- Navigate out of the runner (`location.href = '../apps/...'` is a fail)
- Ship Classical Conversations recitation text, Essentials chart wording, Math Map pages, Student Body pages, copyrighted lyrics, or CC media
- Use grade labels, last names, birth dates, or learner photos
- Claim kid-tested

After adding files, run `python3 tools/homeschool/build_assets.py --check` locally. CI will fail if `assets.json` is incomplete.

## What the shared kit is (and is not)

`homeschool/kit/` is plumbing only:

- Learner home navigation (back to home, mute, export/import on the home)
- Offline PWA helpers (SW register, update banner, `ensure-apps`, runner)
- Accessibility: visible focus, `prefers-reduced-motion`, 56px minimum targets, contrast helpers, `.sr-only`
- Progress export/import of `hs.*` keys
- Mute toggle (`localStorage['hs.mute']`) and a tiny WebAudio helper; **each app owns its cues**
- TTS helper wrapping `speechSynthesis` (offline voices only)

No shared palette, type scale, card, or game chrome. If two apps look related, that is a bug.

## Pictures

Art direction is **pictures** (real photos or licensed/generated art) as content and chrome. Until the final wave, **neutral placeholders** of the sizes in `images.json`.

Reading/phonics **may** use a picture-book spread **while a book is open** (page picture, tap-to-hear words, highlight as it reads, original decodable text, garden theme). No other app uses picture-book layout.

Record licenses in `CREDITS.md` when real files land.

## Not-AI anti-patterns (fail the PR)

- Generic purple/blue gradients, glow orbs, glassmorphism, neon palettes
- The same card grid / rounded-24 shadow / Inter-Roboto stack copied app to app
- Walls of stock emoji, or emoji standing in for pictures
- Template sameness (swap a CSS variable and call it a new app)
- Fake “handmade paper,” scribbly fake-child drawings, or picture-book chrome on non-reading apps
- Claims that the app is kid-tested

Each app should be recognizable from a screenshot with the logo cropped off.

## Review rubric (every subject PR)

1. **Theme fidelity.** Art, copy, sound, and rewards match the assigned theme below.
2. **Variety.** Palette, type, layout, motion, and sound differ from math, reading, and neighbors.
3. **Not-AI.** None of the anti-patterns.
4. **Pictures.** Slots in `images.json`; files in `assets.json`; no emoji-as-content.
5. **Reading books.** Original-decodable, garden-themed, tap-to-hear, highlight-while-reading. Other apps do not grow book readers.
6. **Slots.** Do not delete slots; replace files in place.
7. **Motion.** Gentle; honor `prefers-reduced-motion`.
8. **Touch.** Primary controls ≥ 56px. Instant feedback. Encouraging try-again.
9. **Non-readers.** `toddler` / `preschool` prompts have `audioText` and TTS.
10. **Privacy.** First names only as in `stages.json`. No last names, birth dates, learner photos, addresses, school or medical details, no grades.
11. **Copyright.** No CC recitation, Essentials chart wording, Math Map, Student Body, copyrighted lyrics, CC media.
12. **Math.** Technique in the app, then “now do this on paper.”
13. **Sounds-first.** `toddler` and `preschool` reading teach phonemes, not letter names first.
14. **Untested.** “Untested, awaiting parent test.”
15. **Contract.** `assets.json` complete; band and progress keys as specified; works in the runner offline.
16. **Faith-friendly.** Wholesome. KJV (public domain) only where it belongs.

## Apps — theme and style direction

Subject-agent ids and themes **win** where they already chose. There is **no** separate `cc-cycle3` or `maps` or `dancing` folder. **This lane implements math and reading only.**

| App id | Theme | Who | Notes |
| --- | --- | --- | --- |
| **math** | Pirate treasure voyage | This PR | Deep water, rope, brass, island path. No skulls. Technique → paper. |
| **reading** | Garden | This PR | Soil beds; picture-book spread **only when a book is open**. Sounds-first for toddler/preschool. |
| **history** | Time-travel train | Parallel agent | Also covers Cycle 3 *history* review (public-domain / original items only — no CC recitation). |
| **geography** | Hot-air balloon expedition | Parallel agent | Replaces the old `maps` / trail-scout id. |
| **science** | Naturalist’s field expedition | Parallel agent | Original facts; no Student Body pages. |
| **bible** | Shepherd’s hillside | Parallel agent | KJV / public-domain Scripture. Calm. |
| **singing** | Songbird forest | Parallel agent | No copyrighted lyrics. |
| **movement** | Circus parade | Parallel agent | Replaces `dancing`. Match tap/hip hop vs ballet vs creative. |
| **art** | Artist’s harbor studio | Parallel agent | That agent may pick another distinct theme; update this row when its PR lands. |
| **essentials-points** | Lantern library | Later | Blank tracker; never CC chart wording. |
| **presentation** | Town-square stage | Later | Timer + outline. |

Do not reintroduce `cc-cycle3`, `maps`, or `dancing` as app ids.

## UX checklist

- [ ] Primary tap targets at least 56×56 CSS pixels
- [ ] Immediate visual + optional sound (mute and reduced motion honored)
- [ ] Encouraging try-again; teach the path, do not shame
- [ ] Themed progress (islands, blooms — not a generic XP bar)
- [ ] Non-reader bands can hear the prompt
- [ ] Portrait on a small Android phone
- [ ] Offline through `play.html?app=<id>&band=<band>`
- [ ] `assets.json` / `images.json` complete
- [ ] “Untested, awaiting parent test”

## Self-review (wave 1)

See the pull request report (math, reading, hub/runner vs this rubric).
