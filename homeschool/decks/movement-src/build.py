#!/usr/bin/env python3
"""Build original Circus Parade Anki decks. Public-domain / original wording only.

.apkg zip wrappers use a fixed timestamp so commits stay byte-stable.
Kit CI should still verify CSV + note counts rather than relying on a byte-diff of .apkg.
"""
from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

import genanki

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "movement"
OUT.mkdir(parents=True, exist_ok=True)

FIXED_TIMESTAMP = 1700000000.0
NEED_IMAGE = re.compile(
    r"\b(this picture|this painting|this photo|this image|how many coins|"
    r"look at the|what color is this|this shape|who painted this)\b",
    re.I,
)

MODEL_ID = 1602191101
DECK_IDS = {
    "toddler": 1602191111,
    "preschool": 1602191112,
    "early": 1602191113,
    "primary": 1602191114,
    "upper": 1602191115,
}

MODEL = genanki.Model(
    MODEL_ID,
    "HS Movement",
    fields=[{"name": "Front"}, {"name": "Back"}],
    templates=[
        {
            "name": "Card 1",
            "qfmt": '<div class="q">{{Front}}</div>',
            "afmt": '{{FrontSide}}<hr id="answer"><div class="a">{{Back}}</div>',
        }
    ],
    css="""
.card { font-family: Georgia, serif; font-size: 22px; color: #1a1a14; background: #efe4c6; text-align: center; }
.q { padding: 1em; }
.a { padding: 1em; }
""",
)


def norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def assert_standalone(front: str, back: str, src: Path, line: int) -> None:
    f = norm(front)
    b = norm(back)
    if not f or not b:
        raise SystemExit("%s:%s empty field" % (src.name, line))
    if b in f:
        raise SystemExit("%s:%s front contains the answer %r\n  front: %s" % (src.name, line, back, front))
    if NEED_IMAGE.search(front):
        raise SystemExit("%s:%s prompt needs a visual that is not on the card: %s" % (src.name, line, front))


def read_csv(path: Path) -> list[tuple[str, str]]:
    rows = []
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.reader(fh)
        next(reader, None)
        for i, row in enumerate(reader, start=2):
            if not row:
                continue
            front = row[0].strip()
            back = ",".join(part.strip() for part in row[1:] if part is not None)
            assert_standalone(front, back, path, i)
            rows.append((front, back))
    return rows


def write_apkg(deck: genanki.Deck, path: Path) -> None:
    pkg = genanki.Package(deck)
    pkg.write_to_file(str(path), timestamp=FIXED_TIMESTAMP)


def verify_notes(path: Path, expected: int) -> None:
    import sqlite3
    import tempfile
    import zipfile

    with zipfile.ZipFile(path) as z:
        name = "collection.anki21" if "collection.anki21" in z.namelist() else "collection.anki2"
        with tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False) as tmp:
            tmp.write(z.read(name))
            tmp_path = tmp.name
    n = sqlite3.connect(tmp_path).execute("select count(*) from notes").fetchone()[0]
    if n != expected:
        raise SystemExit("%s notes %s != csv %s" % (path.name, n, expected))


def main() -> None:
    catalog = []
    for band, deck_id in DECK_IDS.items():
        src = ROOT / f"{band}.csv"
        notes = read_csv(src)
        deck = genanki.Deck(deck_id, f"Homeschool::Movement::Circus Parade::{band.title()}")
        for front, back in notes:
            deck.add_note(genanki.Note(model=MODEL, fields=[front, back]))
        out = OUT / f"movement-{band}.apkg"
        write_apkg(deck, out)
        verify_notes(out, len(notes))
        catalog.append(
            {
                "id": "movement-" + band,
                "file": out.name,
                "csv": "../movement-src/%s.csv" % band,
                "cards": len(notes),
            }
        )
        print("%s: %d cards" % (out.name, len(notes)))
    (OUT / "catalog.json").write_text(json.dumps({"decks": catalog}, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except SystemExit as exc:
        if exc.code:
            print(exc, file=sys.stderr)
            raise
