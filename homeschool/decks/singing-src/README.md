# Singing decks (public-domain hymns + original learning songs)

Rebuild:

```bash
python3 build.py
```

Reads `homeschool/apps/singing/js/data.js` and writes `cards.csv`, `catalog.json`, plus `homeschool/decks/singing/singing-<band>.apkg`.

Fronts never contain the answer (no first-line/title overlap, no “higher or lower” with Higher on the back). Cards are self-contained text. Packages are written with `timestamp=1700000000.0` and zip entries get a frozen `date_time` so rebuilds are byte-stable. CI can check CSV/catalog counts instead of byte-diffing `.apkg` files.

No CC songs. No copyrighted movie solfege lyrics. Do not write family last names.
