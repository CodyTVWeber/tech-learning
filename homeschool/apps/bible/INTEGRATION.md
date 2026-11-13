# Shepherd’s Hillside — integrator notes

Subject id: `bible`  
Entry: `homeschool/apps/bible/index.html`  
Theme: a shepherd’s hillside. Kids gather sheep as they memorize, light lanterns for stories, and hang stars for books and character qualities.

## Plug-in contract

- Standalone HTML/CSS/JS. Relative paths only. No CDN, no build step.
- Precache every path in `assets.json` → `files`.
- Pictures are listed in `images.json`.
- Band from `?band=` else `localStorage['hs.band']` else an in-app picker.
  Bands: `baby`, `toddler`, `preschool`, `early`, `primary`, `upper`.
- Progress: `localStorage['hs.progress.bible']` (sheep ids, lantern count, stars, done maps, KJV/WEB toggle).
- No grades. Rewards are sheep, lanterns, and stars.
- No runtime network. Web Speech for read-aloud when the browser has it. WebAudio for chimes.
- Registers `sw.js` scoped to this folder so the app can run offline on its own. If the kit already precaches `assets.json` from a root worker, that is enough; this worker is extra safety.

Offline check (Playwright): load `index.html`, wait for the service worker, set offline, reload, pick a band, play Memory and a story. Passed.

## Coverage

- Scripture memory (KJV + WEB, public domain only)
- Bible stories in canonical-ish narrative order (original tellings)
- All 66 books
- Character qualities (fruit of the Spirit and related virtues, original notes + KJV/WEB verse)

## Do not

- Do not paste Classical Conversations recitation cards or Bible-song lyrics from class.
- Do not show child names, ages, or grades.
- Do not point this app at a shared CSS/JS kit; it is self-contained on purpose.
