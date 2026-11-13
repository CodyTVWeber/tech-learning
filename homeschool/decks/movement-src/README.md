# Circus Parade decks (source)

Original step names and cues. No studio syllabus. No CC recitation.

Rules (from the kit):

- Card fronts never contain the answer string.
- Every card is text that stands alone. No “look at this picture” without the picture on the card.
- `build.py` writes `.apkg` with a **fixed zip timestamp** (`1700000000`) and `../movement/catalog.json` note counts. Kit CI should check CSV + catalog counts, not byte-diff the zip wrapper.

```
python3 build.py
```

Writes `.apkg` files to `../movement/`. Parent-run on AnkiDroid; the app does not grade cards.
