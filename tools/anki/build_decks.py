#!/usr/bin/env python3
"""Build public-safe Anki decks from app JSON (and optional CSV sources)."""
from __future__ import annotations

import csv
import hashlib
import json
import sys
from pathlib import Path

try:
    import genanki
except ImportError:
    sys.stderr.write("Install genanki: pip install -r tools/anki/requirements.txt\n")
    raise

ROOT = Path(__file__).resolve().parents[2]
HS = ROOT / "homeschool"
DECKS = HS / "decks"
APPS = HS / "apps"


def stable_id(name: str) -> int:
    h = hashlib.sha256(name.encode("utf-8")).hexdigest()
    return int(h[:8], 16) & 0x7FFFFFFF


MODEL = genanki.Model(
    stable_id("homeschool.model.basic.v1"),
    "Homeschool Basic",
    fields=[{"name": "Prompt"}, {"name": "Answer"}, {"name": "AudioText"}, {"name": "Tags"}],
    templates=[
        {
            "name": "Card 1",
            "qfmt": "{{Prompt}}",
            "afmt": "{{FrontSide}}<hr id=answer>{{Answer}}",
        }
    ],
)


def cards_from_json(path: Path, subject: str) -> list[dict]:
    data = json.loads(path.read_text())
    out = []
    for item in data.get("items") or []:
        prompt = item.get("prompt") or item.get("audioText") or item.get("blend") or item.get("phoneme")
        answer = item.get("answer") or item.get("blend") or ""
        if not prompt or not answer:
            continue
        out.append(
            {
                "id": item.get("id") or prompt,
                "prompt": str(prompt),
                "answer": str(answer),
                "audio": item.get("audioText") or "",
                "tags": " ".join(item.get("tags") or [subject, data.get("band") or ""]),
            }
        )
    return out


def cards_from_csv(path: Path) -> list[dict]:
    out = []
    with path.open(newline="", encoding="utf-8") as f:
        rows = csv.DictReader(line for line in f if not line.startswith("#"))
        for row in rows:
            out.append(
                {
                    "id": row.get("id") or row["prompt"],
                    "prompt": row["prompt"],
                    "answer": row["answer"],
                    "audio": row.get("audio_text") or "",
                    "tags": row.get("tags") or "",
                }
            )
    return out


def write_deck(subject: str, stem: str, cards: list[dict]) -> None:
    DECKS.mkdir(parents=True, exist_ok=True)
    csv_path = DECKS / f"{stem}.csv"
    apkg_path = DECKS / f"{stem}.apkg"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["id", "prompt", "answer", "audio_text", "tags"])
        w.writeheader()
        for c in cards:
            w.writerow(
                {
                    "id": c["id"],
                    "prompt": c["prompt"],
                    "answer": c["answer"],
                    "audio_text": c["audio"],
                    "tags": c["tags"],
                }
            )
    deck = genanki.Deck(stable_id("homeschool.deck." + stem), "Homeschool::" + stem)
    for c in cards:
        note = genanki.Note(
            model=MODEL,
            fields=[c["prompt"], c["answer"], c["audio"], c["tags"]],
            guid=genanki.guid_for(stem, c["id"]),
        )
        deck.add_note(note)
    # Fixed timestamp so committed .apkg files stay byte-stable in CI.
    genanki.Package(deck).write_to_file(str(apkg_path), timestamp=1700000000.0)
    print("wrote %s (%d cards)" % (apkg_path.name, len(cards)))


def collect() -> dict[str, list[dict]]:
    grouped: dict[str, list[dict]] = {}
    if APPS.exists():
        for app in sorted(APPS.iterdir()):
            data_dir = app / "data"
            if not data_dir.is_dir():
                continue
            cards = []
            for p in sorted(data_dir.glob("*.json")):
                cards.extend(cards_from_json(p, app.name))
            if cards:
                grouped[app.name] = cards
    extra = DECKS / "src"
    if extra.is_dir():
        for p in sorted(extra.glob("*.csv")):
            grouped.setdefault(p.stem, []).extend(cards_from_csv(p))
    return grouped


def verify_apkg(path: Path, expected: int) -> None:
    import sqlite3
    import tempfile
    import zipfile

    with zipfile.ZipFile(path) as z:
        name = "collection.anki21" if "collection.anki21" in z.namelist() else "collection.anki2"
        with tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False) as tmp:
            tmp.write(z.read(name))
            tmp_path = tmp.name
    con = sqlite3.connect(tmp_path)
    n = con.execute("select count(*) from notes").fetchone()[0]
    con.close()
    if n != expected:
        raise SystemExit("%s note count %s != %s" % (path.name, n, expected))


def main() -> int:
    grouped = collect()
    if not grouped:
        print("no public JSON/CSV cards found")
        return 0
    catalog = []
    for subject, cards in grouped.items():
        stem = subject
        write_deck(subject, stem, cards)
        apkg = DECKS / f"{stem}.apkg"
        verify_apkg(apkg, len(cards))
        catalog.append({"id": subject, "file": stem + ".apkg", "csv": stem + ".csv", "cards": len(cards)})
    (DECKS / "catalog.json").write_text(json.dumps({"decks": catalog}, indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
