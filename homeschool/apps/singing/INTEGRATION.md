# Songbird Forest — integrator notes

Subject id: `singing`  
Entry: `homeschool/apps/singing/index.html`  
Theme: a songbird forest. Birds join the choir as pitch, rhythm, solfege, and songs grow.

Looks nothing like Shepherd’s Hillside (Bible): cool moss/teal, leaf-cut panels, Trebuchet/Segoe, cardinal red — vs linen ochre, serif, round hills.

## Plug-in contract

- Standalone HTML/CSS/JS. Relative paths. No CDN. No build.
- Precache `assets.json` → `files`.
- Pictures in `images.json`. The screen uses the photoreal JPGs in `img/` (`src` on each slot). `images/*.png` stay as kit placeholders.
- Band: `?band=` else `localStorage['hs.band']` else picker.
  Bands: `baby`, `toddler`, `preschool`, `early`, `primary`, `upper`.
- Progress: `HS.progressKey('singing')` (`hs.progress.<folder>.singing`).
- Microphone is optional, local, never uploaded. Pitch matching still works by tapping matching calls if the mic is off.
- Melodies are WebAudio oscillators, not audio files.
- Registers folder-scoped `sw.js` for standalone offline, unless `document.documentElement.dataset.runner === "1"` (the learner runner already controls the page).
- Visible banner on every screen, including the band picker: “Untested, awaiting parent test.” Not screen-reader-only.

Offline check (Playwright): load `index.html`, wait for the service worker, set offline, reload, pick a band, match a pitch call and play a hymn melody. Passed.

## Coverage

- Pitch matching (mic autocorrelation + tap-to-match)
- Rhythm patterns (ta, ti-ti, rests, dotted for upper)
- Solfege Do–Re–Mi with original “Climb the Branch” (not copyrighted movie lyrics)
- Public-domain hymns: Jesus Loves Me, Amazing Grace, Doxology, Holy Holy Holy, What a Friend, This Is My Father’s World, Come Thou Fount, Fairest Lord Jesus, The B-I-B-L-E, I’ve Got the Joy, Jesus Loves the Little Children, plus PD children’s tunes for baby
- Original forest songs for high/low, beat, echo, dynamics, warm-up

## Do not

- Do not add Classical Conversations Bible-song lyrics or audio.
- Do not add copyrighted hymn translations still in copyright (e.g. How Great Thou Art).
- Do not send mic samples off-device.
- Do not write family last names.

Anki (`homeschool/decks/singing-src/`): fronts never contain the answer; every card is self-contained text (no “how many” that depends on a picture). `.apkg` builds use a fixed timestamp and zip `date_time`. Prefer checking `cards.csv` / `catalog.json` note counts over byte-diffing archives.
