# Drum Line Shed — integrator notes

Subject id: `drums`  
Entry: `homeschool/apps/drums/index.html`  
Theme: a drum-line practice shed. Bone chart paper in a maple frame, black rubber floor, one snare pad. Cool steel wall, chalk yellow banner. Not the circus, the ship, or the forest.

## Contract

- Band: `?band=` else `localStorage['hs.band']` else a picker. Bands: `baby`, `toddler`, `preschool`, `early`, `primary`, `upper`. No ages on screen.
- Runner (`html[data-runner]`) hides this app’s title, mute, and band bar. The kit chrome is the only bar. The chart and the pad are the first screen.
- Progress: `localStorage['hs.progress.drums']` — `{ stamps, lastId, latencyMs, updatedAt }`. Stamps are collectibles. The page never shows a grade, a percent, or a hit count.
- Latency calibration: `localStorage['hs.drums.latencyMs']` (also copied onto the progress object). Milliseconds to subtract from a tap before comparing it with the audio clock.
- Mute: `HS.muted()` / `hs.mute`. The kit `hs-mute` event silences the snare, the clicks, and speech. There is no private mute key.
- Standalone registers `./sw.js` (ignoreSearch, navigate falls back to cached `index.html`). The runner does not register it.
- Precache list: `assets.json`.

## What plays

Top half is a one-line percussion staff (quarter, eighth, half, quarter rest). A playhead sweeps the measure, then the next measure pages in. Bottom half is the snare pad (`pointerdown`, one hit per finger). Count-in is four clicks. Judging uses `AudioContext.currentTime`, not `setTimeout`.

| Band | Lines |
| --- | --- |
| baby | Four Steady (quarters, 60 BPM) |
| toddler | Four Steady, Quiet Middle |
| preschool | those, plus Walk and Wait |
| early | those, plus After One and Little Pairs |
| primary | those, plus Split Line and Long and Short |
| upper | all eight, including Shed Line at 80 BPM |

Homes: preschool, early, primary, and upper are on. Toddler and baby are `none` in `stages.json` (the standalone page still runs `?band=toddler` for the offline check).

A shed stamp is written only after the line plays through and at least one note was Perfect or Good. Stopping early does not stamp. The end of a line lights the notes that were hit and speaks a short encouragement. It does not show a score.

## v2 fields (not built)

Each note has `dynamic`: `pp`, `p`, `mp`, `mf`, `f`, or `ff`. Rests use `null`. Each line has `tempoLocked: true`, `bpm`, `tempoMin`, and `tempoMax`. Playback ignores dynamics, and there is no tempo slider.

## Sounds

Web Audio only. The snare is a short high-passed noise burst plus a falling sine body. Clicks are square ticks. No audio files. Young bands hear the line’s `audioText` through `HS.speak` when Start is pressed.
