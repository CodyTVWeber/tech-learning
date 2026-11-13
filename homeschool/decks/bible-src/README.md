# Bible decks (public-domain Scripture + original notes)

Rebuild:

```bash
python3 build.py
```

Uses `web-verses.json` (clean WEB) plus KJV from `/tmp/biblejson/kjv.json` when present, or `verses-extracted.json` for a no-network rebuild.

Writes:

- `homeschool/apps/bible/data/content.json`
- `verses-extracted.json` (selected KJV+WEB verses only)
- `web-verses.json`
- `cards.csv`
- `catalog.json` (per-band note counts for CI)
- `homeschool/decks/bible/bible-<band>.apkg`

Fronts never contain the answer. Cards are self-contained text. Packages are written with `timestamp=1700000000.0` and zip entries get a frozen `date_time` so rebuilds are byte-stable. CI can check CSV/catalog counts instead of byte-diffing `.apkg` files.

Do not add Classical Conversations recitation text. Do not write family last names.
