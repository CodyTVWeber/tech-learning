#!/usr/bin/env python3
"""Build per-band Treasure Voyage Anki decks (original practice only)."""
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

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "homeschool" / "apps" / "math" / "data"
OUT = ROOT / "homeschool" / "decks" / "math"
SRC = Path(__file__).resolve().parent
BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"]


def stable_id(name: str) -> int:
    h = hashlib.sha256(name.encode("utf-8")).hexdigest()
    return int(h[:8], 16) & 0x7FFFFFFF


MODEL = genanki.Model(
    stable_id("homeschool.model.math.voyage.v1"),
    "Treasure Voyage Basic",
    fields=[{"name": "Prompt"}, {"name": "Answer"}, {"name": "AudioText"}, {"name": "Tags"}],
    templates=[
        {
            "name": "Card 1",
            "qfmt": "{{Prompt}}",
            "afmt": "{{FrontSide}}<hr id=answer>{{Answer}}",
        }
    ],
)


def dots(n: int) -> str:
    return " ".join("●" for _ in range(int(n)))


def from_item(item: dict, band: str) -> dict | None:
    prompt = str(item.get("prompt") or "")
    answer = str(item.get("answer") or "")
    if not prompt or not answer:
        return None
    count = item.get("count")
    if count is not None and "how many" in prompt.lower() and "●" not in prompt and not any(ch.isdigit() for ch in prompt):
        prompt = prompt.rstrip() + "\n" + dots(count)
    return {
        "id": item.get("id") or prompt,
        "prompt": prompt,
        "answer": answer,
        "audio": item.get("audioText") or prompt,
        "tags": " ".join(item.get("tags") or ["math", band, item.get("island") or ""]),
    }


def extra_facts(band: str) -> list[dict]:
    out = []
    if band in ("primary", "upper"):
        for a in range(0, 13):
            for b in range(0, 13):
                iid = "x-%dx%d" % (a, b)
                out.append(
                    {
                        "id": iid,
                        "prompt": "%s × %s =" % (a, b),
                        "answer": str(a * b),
                        "audio": "%s times %s." % (a, b),
                        "tags": "math %s times" % band,
                    }
                )
        for d in range(1, 13):
            for b in range(0, 13):
                p = d * b
                iid = "d-%dd%d" % (p, d)
                out.append(
                    {
                        "id": iid,
                        "prompt": "%s ÷ %s =" % (p, d),
                        "answer": str(b),
                        "audio": "%s divided by %s." % (p, d),
                        "tags": "math %s divide" % band,
                    }
                )
    if band == "early":
        for a in range(0, 11):
            for b in range(0, 11):
                if a + b > 20:
                    continue
                out.append(
                    {
                        "id": "add-%d+%d" % (a, b),
                        "prompt": "%s + %s =" % (a, b),
                        "answer": str(a + b),
                        "audio": "%s plus %s." % (a, b),
                        "tags": "math early add",
                    }
                )
                if a >= b:
                    out.append(
                        {
                            "id": "sub-%d-%d" % (a, b),
                            "prompt": "%s − %s =" % (a, b),
                            "answer": str(a - b),
                            "audio": "%s minus %s." % (a, b),
                            "tags": "math early sub",
                        }
                    )
    return out


def write_csv(path: Path, cards: list[dict]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
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


def write_apkg(stem: str, cards: list[dict], dest: Path) -> None:
    deck = genanki.Deck(stable_id("homeschool.deck." + stem), "Homeschool::" + stem)
    ids = set()
    for c in cards:
        if c["id"] in ids:
            continue
        ids.add(c["id"])
        deck.add_note(
            genanki.Note(
                model=MODEL,
                fields=[c["prompt"], c["answer"], c["audio"], c["tags"]],
                guid=genanki.guid_for(stem, c["id"]),
            )
        )
    genanki.Package(deck).write_to_file(str(dest), timestamp=1700000000.0)


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    SRC.mkdir(parents=True, exist_ok=True)
    for band in BANDS:
        path = DATA / ("%s.json" % band)
        data = json.loads(path.read_text())
        cards = []
        seen_pair = {}
        for item in data.get("items") or []:
            card = from_item(item, band)
            if not card:
                continue
            key = (card["prompt"], card["answer"])
            if key in seen_pair:
                raise SystemExit("%s duplicate pair %s / %s" % (band, seen_pair[key], card["id"]))
            seen_pair[key] = card["id"]
            cards.append(card)
        have = {c["prompt"] for c in cards}
        for extra in extra_facts(band):
            if extra["prompt"] in have:
                continue
            have.add(extra["prompt"])
            cards.append(extra)
        stem = "math-" + band
        write_csv(SRC / (stem + ".csv"), cards)
        write_apkg(stem, cards, OUT / (stem + ".apkg"))
        print("wrote %s (%d cards)" % (stem, len(cards)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
