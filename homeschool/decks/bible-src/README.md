# Bible decks (public-domain Scripture + original notes)

Rebuild:

```bash
python3 build.py
```

Uses `web-verses.json` (clean WEB) plus KJV from `/tmp/biblejson/kjv.json` when present, or `verses-extracted.json` for a no-network rebuild.

Writes:

- `homeschool/apps/bible/js/data.js`
- `verses-extracted.json` (selected KJV+WEB verses only)
- `web-verses.json`
- `cards.csv`
- `homeschool/decks/bible/bible-<band>.apkg`

Do not add Classical Conversations recitation text.
