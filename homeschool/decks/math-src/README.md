# Treasure Voyage decks

Original practice only. Do not copy Classical Conversations Math Map pages or recitation text.

- `make_data.py` writes `homeschool/apps/math/data/<band>.json` (unique item ids; toddler has one card per count, plus more/fewer/one-more — no t2/t6-style duplicates).
- `build.py` writes per-band CSV here and `.apkg` in `homeschool/decks/math/`. Primary and upper also include every 0–12 times fact and matching shares (no divide-by-zero).

CI still builds the combined `homeschool/decks/math.apkg` from app JSON via `tools/anki/build_decks.py`.
