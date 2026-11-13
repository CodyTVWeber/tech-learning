#!/usr/bin/env python3
"""Build Songbird Forest Anki decks from original / public-domain facts only."""
from __future__ import annotations

import csv
import json
import subprocess
import sys
from pathlib import Path

import genanki

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
APP_DATA = REPO / "homeschool" / "apps" / "singing" / "js" / "data.js"
DECKS = REPO / "homeschool" / "decks" / "singing"

BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"]
LABELS = {
    "baby": "Baby",
    "toddler": "Toddler",
    "preschool": "Preschool",
    "early": "Early",
    "primary": "Primary",
    "upper": "Upper",
}


def load_singing():
    path = json.dumps(str(APP_DATA))
    script = (
        "const fs=require('fs');const vm=require('vm');"
        "const ctx={window:{}};"
        f"vm.runInNewContext(fs.readFileSync({path},'utf8'),ctx);"
        "process.stdout.write(JSON.stringify(ctx.window.SINGING));"
    )
    raw = subprocess.check_output(["node", "-e", script])
    return json.loads(raw)


def from_band(min_band: str):
    return BANDS[BANDS.index(min_band):]


def available(min_band, band):
    return band in from_band(min_band)


def model():
    return genanki.Model(
        1705112001,
        "HS Singing Forest",
        fields=[{"name": "Front"}, {"name": "Back"}, {"name": "Extra"}],
        templates=[{
            "name": "Card 1",
            "qfmt": '<div style="font-family:Trebuchet MS,sans-serif;font-size:22px;text-align:center;color:#1e3d2f">{{Front}}</div>',
            "afmt": '{{FrontSide}}<hr id="answer"><div style="font-family:Trebuchet MS,sans-serif;font-size:20px;color:#1e3d2f">{{Back}}</div><div style="margin-top:12px;color:#2d5a4a;font-size:14px">{{Extra}}</div>',
        }],
        css=".card { background: #d7ebe3; }",
    )


def main():
    data = load_singing()
    DECKS.mkdir(parents=True, exist_ok=True)
    m = model()
    deck_ids = {
        "baby": 1705112101,
        "toddler": 1705112102,
        "preschool": 1705112103,
        "early": 1705112104,
        "primary": 1705112105,
        "upper": 1705112106,
    }
    rows = []
    nid = 1705113000
    for band in BANDS:
        deck = genanki.Deck(deck_ids[band], f"Homeschool::Singing::{LABELS[band]}")
        for s in data["solfege"]:
            minb = "baby" if s["syl"] in ("Do", "Sol") else "toddler" if s["syl"] in ("Mi", "Do2") else "preschool" if s["syl"] in ("Re",) else "early"
            if s["syl"] in ("La", "Ti"):
                minb = "primary"
            if not available(minb, band):
                continue
            front = f"Solfege: sing and show {s['syl']}"
            back = f"{s['hint']}\n{s['hand']}"
            extra = f"C-major Do = C4. {s['syl']} midi {s['midi']}"
            rows.append({"band": band, "kind": "solfege", "front": front, "back": back, "extra": extra})
            deck.add_note(genanki.Note(model=m, fields=[front, back, extra], guid=str(nid)))
            nid += 1
        for r in data["rhythm"]:
            if not available(r["minBand"], band):
                continue
            front = f"Rhythm: say and clap “{r['name']}”"
            back = r["say"]
            extra = "Pattern beats: " + json.dumps(r["pattern"])
            rows.append({"band": band, "kind": "rhythm", "front": front, "back": back, "extra": extra})
            deck.add_note(genanki.Note(model=m, fields=[front, back, extra], guid=str(nid)))
            nid += 1
        for song in data["songs"]:
            if not available(song["minBand"], band):
                continue
            first = song["lyrics"].split("\n")[0]
            front = f"What song starts: “{first}”"
            back = song["title"]
            extra = song["source"]
            rows.append({"band": band, "kind": "song-title", "front": front, "back": back, "extra": extra})
            deck.add_note(genanki.Note(model=m, fields=[front, back, extra], guid=str(nid)))
            nid += 1
            front = f"First line of {song['title']}"
            back = first
            rows.append({"band": band, "kind": "song-line", "front": front, "back": back, "extra": extra})
            deck.add_note(genanki.Note(model=m, fields=[front, back, extra], guid=str(nid)))
            nid += 1
        if band in ("preschool", "early", "primary", "upper"):
            front = "Name the major scale syllables from home to high home."
            back = "Do Re Mi Fa Sol La Ti Do"
            extra = "Original climbing song in the app; not a copyrighted movie lyric."
            rows.append({"band": band, "kind": "scale", "front": front, "back": back, "extra": extra})
            deck.add_note(genanki.Note(model=m, fields=[front, back, extra], guid=str(nid)))
            nid += 1
        if available("baby", band):
            front = "Is a cardinal call usually higher or lower than an owl hoot?"
            back = "Higher"
            extra = "Pitch nest in Songbird Forest."
            rows.append({"band": band, "kind": "high-low", "front": front, "back": back, "extra": extra})
            deck.add_note(genanki.Note(model=m, fields=[front, back, extra], guid=str(nid)))
            nid += 1
        out = DECKS / f"singing-{band}.apkg"
        genanki.Package(deck).write_to_file(out)
        print("wrote", out)
    fieldnames = ["band", "kind", "front", "back", "extra"]
    with (ROOT / "cards.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)
    print("csv rows", len(rows))


if __name__ == "__main__":
    try:
        main()
    except json.JSONDecodeError as e:
        print("Could not parse singing data.js as JSON:", e, file=sys.stderr)
        sys.exit(1)
