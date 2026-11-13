# Harbor Studio decks (source)

Public-domain artist/artwork facts and original studio wording. No CC Fine Arts recitation. No in-copyright modern paintings as card faces.

Rules (from the kit):

- Card fronts never contain the answer string.
- Every card is text that stands alone. Artist cards name the work in words; they do not require a missing image.
- `build.py` writes `.apkg` with a **fixed zip timestamp** (`1700000000`) and `../art/catalog.json` note counts. Kit CI should check CSV + catalog counts, not byte-diff the zip wrapper.

```
python3 build.py
```

Writes `.apkg` files to `../art/`.
