# Field Expedition — science decks (source)

Original public-safe fact cards. Topic titles may align with Cycle 3 science weeks; the wording is original field notes, not recitation text.

Card rules (kit lessons):
- Fronts never contain the answer.
- Every card stands alone in text — no missing picture.
- `.apkg` zip timestamp is fixed (`1700000000`) so CI should check CSV + note counts, not byte-diff the wrapper.

```
python3 build_decks.py
```

Writes CSV here (`csv/*.csv`), JSON to `apps/science/data/`, and `.apkg` files to `../science/`.

Anki UI is parent-run. Stars in the science app are stamps, not grades.

Do not mix this folder with any private Cycle 3 recitation pack.
