# Adding a subject (parallel agents)

You can add a subject **without editing shared kit files**, so several agents can work at once.

## You may write

- `homeschool/apps/<id>/` (your whole app)
- `homeschool/decks/<id>.apkg` and `homeschool/decks/<id>.csv` (optional)

`<id>` must match a key in `stages.json` `subjects`. Current ids: `math`, `reading`, `history`, `geography`, `science`, `bible`, `singing`, `movement`, `art`, `essentials-points`, `presentation`. There is **no** `cc-cycle3`, `maps`, or `dancing` folder — history covers Cycle 3 history review; geography replaced maps; movement replaced dancing.

## You must not write

- `homeschool/kit/`
- `homeschool/<FirstName>/` (generated)
- `homeschool/pwa-templates/`
- `homeschool/index.html`, `hub.js`, `hub.css`, hub `sw.js`
- `.github/workflows/`
- Other apps’ folders

## Required files in `apps/<id>/`

1. **`index.html`** — plain page. Works standalone and in the runner.
2. **`assets.json`** — lists every runtime file (html/css/js/json/png/webmanifest). If it is not listed, it will not work offline and CI will fail.
3. **`images.json`** — image slots (file, width, height, alt, theme notes, slot). Put PNGs in `images/`.
4. **`INTEGRATION.md`** — band behavior, progress shape, sounds.

Follow the **theme** assigned to your `id` in `DESIGN.md`. Do not invent a second theme. Do not copy math’s pirate look or reading’s garden look.

## Band and progress

```javascript
const band =
  new URLSearchParams(location.search).get("band") ||
  localStorage.getItem("hs.band") ||
  "early";
// baby | toddler | preschool | early | primary | upper

const key = "hs.progress." + id;
const progress = JSON.parse(localStorage.getItem(key) || "{}");
localStorage.setItem(key, JSON.stringify(progress));
```

When `document.documentElement.dataset.runner === "1"`, the kit already set `window.HS` (`url()`, `band`, `appBase`). **Fetch with `HS.url('data/early.json')`**, not a bare relative path.

Do not register a service worker in the runner. Standalone `index.html` may register `./sw.js`.

## Checklist before you open a PR

- [ ] `python3 tools/homeschool/build_assets.py --check` (fails if `assets.json` is incomplete)
- [ ] No last names, birth dates, learner photos, grades, “kid-friendly”, CC recitation/chart/Math Map/Student Body/lyrics
- [ ] `toddler`/`preschool` reading: sounds, not letter names first
- [ ] Math: technique, then “now do this on paper”
- [ ] Footer or banner: **Untested, awaiting parent test.**
- [ ] Distinct visual style vs math and reading (`DESIGN.md` rubric)
- [ ] `images.json` slots listed in `assets.json`; placeholders are fine until the picture wave

The learner homes **discover** your app from generated `homeschool/apps-index.json` (a list of folders that already have `assets.json`) plus that learner’s `subjects.<id> !== "none"`. Run `python3 tools/homeschool/build_assets.py` so the index includes you. No kit source change.

If you add a **new** subject id that is not in `stages.json`, ask the maintainer to add the key (that file is shared). Prefer the ids already listed.

## Anki

Public-safe cards only. `python3 tools/anki/build_decks.py` turns `apps/<id>/data/*.json` items (`prompt`/`answer`) into `homeschool/decks/<id>.csv` + `.apkg`. Or commit your own `decks/<id>.*` if you build them another way — still no CC recitation text.
