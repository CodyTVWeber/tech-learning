# Geography — Hot-Air Balloon Expedition

Theme: a balloon over a U.S. expedition chart. Flights match Cycle 3 *geography topics* (states/capitals, mountains, lakes, bays, rivers, trails, canals, Native regions, deserts, features). Drag-and-drop pins on an **original** schematic SVG chart. Looks unlike the history railway (sky, basket weave, terracotta balloon stripes, Trebuchet/Segoe).

## Plug-in

- Folder id: `geography` (replaces any old `maps` id)
- Band: `?band=` else `localStorage['hs.band']` else a picker
- Optional: `?week=1`–`24` opens that flight
- Progress: `localStorage['hs.progress.geography']` (stamps, pins, stars, `updatedAt`)
- Mute: `hs.mute`
- Do **not** register `sw.js` when `dataset.runner === "1"`
- Chart fetch: `HS.url('images/us-chart.svg')` (inline SVG for hit-testing)
- Visible banner: **Untested, awaiting parent test.**

## Bands

| Band | Flight |
| --- | --- |
| baby | Sky play: balloon, cloud, land, water, mountain, river |
| toddler | Big choices; New England and easy names |
| preschool | Regions, lakes, easy capitals |
| early | State-group capitals + drag pins (64px) |
| primary | Mountains, rivers, trails, canals, deserts |
| upper | All 50 capitals and named features on the chart |

## Precache

See `assets.json`. The SVG chart must stay listed.

## Anki

```text
python3 homeschool/decks/geography-src/build.py
```

Fixed zip timestamp; check CSV + note counts, do not byte-diff `.apkg`. Card fronts never include the answer. No card depends on a map or photo that is not printed on the card (these decks are text-only).
