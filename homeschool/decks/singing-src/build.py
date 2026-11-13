#!/usr/bin/env python3
"""Build Songbird Forest Anki decks from original / public-domain facts only.

Card fronts never contain the answer. Every card is self-contained text
(no prompt that depends on a picture that is not printed on the card).
.apkg files use a fixed timestamp and rewritten zip date_time so builds
are byte-stable. CI can also check cards.csv / catalog.json note counts
instead of byte-diffing the archives.
"""
from __future__ import annotations

import csv
import io
import json
import re
import sqlite3
import sys
import tempfile
import time
import zipfile
from pathlib import Path

import genanki

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
APP_DATA = REPO / "homeschool" / "apps" / "singing" / "data" / "content.json"
DECKS = REPO / "homeschool" / "decks" / "singing"
APKG_TS = 1700000000.0

BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"]
LABELS = {
    "baby": "Baby",
    "toddler": "Toddler",
    "preschool": "Preschool",
    "early": "Early",
    "primary": "Primary",
    "upper": "Upper",
}

# Prompts name the song without putting the title (the answer) on the front.
SONG_TITLE_PROMPTS = {
    "jesus-loves-me": "Which public-domain children's hymn did Anna Warner write words for in 1860?",
    "amazing-grace": "Which public-domain hymn uses the tune named NEW BRITAIN?",
    "doxology": "Which short hymn of praise uses the tune OLD HUNDREDTH?",
    "holy-holy": "Which public-domain hymn did Reginald Heber write in 1826, addressing the Lord God Almighty?",
    "friend": "Which public-domain hymn did Joseph Scriven write about carrying grief to prayer?",
    "fathers-world": "Which public-domain hymn did Maltbie Babcock write about nature singing?",
    "come-thou-fount": "Which public-domain hymn uses the tune NETTLETON?",
    "fairest": "Which public-domain hymn comes from the Münster Gesangbuch of 1677?",
    "bible-book": "Which traditional children's gospel spells the name of Scripture's book?",
    "joy-heart": "Which traditional gospel chorus talks about gladness down in the heart?",
    "little-children": "Which public-domain children's hymn did C. H. Woolston write about precious children of the world?",
    "hot-cross": "Which English traditional three-note tune is used here as a pitch game, not as a church hymn?",
    "are-you-sleeping": "Which English round is the public-domain partner of Frère Jacques?",
    "high-low-bird": "Which original forest song teaches sliding the voice from a high perch to a quiet night perch?",
    "steady-nest": "Which original forest song is about holding a steady four-count?",
    "climb-branch": "Which original forest song climbs the major-scale syllables without using a copyrighted movie lyric?",
    "echo-pines": "Which original forest song is about copying a call across the trees?",
    "soft-feather": "Which original forest song contrasts hush and woodpecker strength?",
    "morning-choir": "Which original forest song is a throat-and-window warm-up?",
}

SOLFEGE_CARDS = [
    ("A closed fist rests at the middle of the chest. Name this home-perch syllable.", "Do", "baby",
     "Fist at the middle of the chest. C-major home is C4."),
    ("The hand slopes up, fingers together, one step above the home perch. Name the syllable.", "Re", "preschool",
     "Hand slopes up, fingers together."),
    ("A flat hand, palm down, on the steady mid branch. Name the syllable.", "Mi", "toddler",
     "Flat hand, palm down."),
    ("Thumb down like a hook, leaning toward the trunk. Name the syllable.", "Fa", "early",
     "Thumb down, like a hook."),
    ("Palm toward you, thumb out, opening to the canopy. Name the syllable.", "Sol", "baby",
     "Palm toward you, thumb out."),
    ("A drooping, relaxed hand like soft light in the leaves. Name the syllable.", "La", "primary",
     "Drooping hand, relaxed."),
    ("Pointer finger points up, almost back at the home perch. Name the syllable.", "Ti", "primary",
     "Pointer finger points up."),
    ("A closed fist held high, an octave above the home perch. Name that high nest (same syllable as home).", "Do", "toddler",
     "Fist, held high. Midi 72."),
]

RHYTHM_CARDS = [
    ("How do we say one even walking beat?", "ta", "baby", "pattern [1]"),
    ("How do we say two even walking beats in a row?", "ta ta", "baby", "pattern [1, 1]"),
    ("How do we say two even half-beats that fit in one walking beat?", "ti-ti", "toddler", "pattern [0.5, 0.5]"),
    ("A walking beat then two half-beats: how do we say the pattern?", "ta ti-ti", "preschool", "pattern [1, 0.5, 0.5]"),
    ("Two half-beats then a walking beat: how do we say the pattern?", "ti-ti ta", "preschool", "pattern [0.5, 0.5, 1]"),
    ("A walking beat, a hush, then another walking beat: how do we say it?", "ta (shh) ta", "early", "pattern [1, 0, 1]"),
    ("Count four even walking beats out loud.", "1 2 3 4", "toddler", "pattern [1, 1, 1, 1]"),
    ("A half-beat, a walking beat, then a half-beat: how do we say it?", "ti ta ti", "primary", "pattern [0.5, 1, 0.5]"),
    ("Four pairs of half-beats in a row: how do we say them?", "ti-ti ti-ti ti-ti ti-ti", "primary",
     "pattern [0.5 × 8]"),
    ("A beat-and-a-half, then a leftover half-beat: how do we say it?", "ta-a ti", "upper", "pattern [1.5, 0.5]"),
]


def load_singing():
    return json.loads(APP_DATA.read_text(encoding="utf-8"))


def from_band(min_band: str):
    return BANDS[BANDS.index(min_band):]


def available(min_band, band):
    return band in from_band(min_band)


def norm_words(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (text or "").lower()).strip()


def assert_standalone(front: str, back: str) -> None:
    """Fail if the answer is already on the front (kit lesson)."""
    f = " " + norm_words(front) + " "
    b = norm_words(back)
    if len(b) >= 2 and f" {b} " in f:
        raise SystemExit("answer appears on the front:\n  Q: %s\n  A: %s" % (front, back))


def freeze_zip(path: Path) -> None:
    dt = time.gmtime(APKG_TS)[:6]
    buf_in = io.BytesIO(path.read_bytes())
    buf_out = io.BytesIO()
    with zipfile.ZipFile(buf_in, "r") as zin:
        with zipfile.ZipFile(buf_out, "w", compression=zipfile.ZIP_STORED) as zout:
            for info in sorted(zin.infolist(), key=lambda x: x.filename):
                data = zin.read(info.filename)
                new = zipfile.ZipInfo(filename=info.filename, date_time=dt)
                new.compress_type = zipfile.ZIP_STORED
                new.create_system = 0
                new.create_version = 20
                new.extract_version = 20
                zout.writestr(new, data)
    path.write_bytes(buf_out.getvalue())


def write_apkg(deck, path: Path) -> None:
    genanki.Package(deck).write_to_file(str(path), timestamp=APKG_TS)
    freeze_zip(path)


def verify_apkg(path: Path, expected: int) -> None:
    with zipfile.ZipFile(path) as z:
        name = "collection.anki21" if "collection.anki21" in z.namelist() else "collection.anki2"
        with tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False) as tmp:
            tmp.write(z.read(name))
            tmp_path = tmp.name
    con = sqlite3.connect(tmp_path)
    n = con.execute("select count(*) from notes").fetchone()[0]
    con.close()
    Path(tmp_path).unlink(missing_ok=True)
    if n != expected:
        raise SystemExit("%s note count %s != %s" % (path.name, n, expected))


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


def iter_cards(data):
    for front, back, minb, extra in SOLFEGE_CARDS:
        yield minb, "solfege", front, back, extra
    for front, back, minb, extra in RHYTHM_CARDS:
        yield minb, "rhythm", front, back, extra
    for song in data["songs"]:
        minb = song["minBand"]
        title = song["title"]
        prompt = SONG_TITLE_PROMPTS.get(song["id"])
        if not prompt:
            raise SystemExit("missing title prompt for song id %s" % song["id"])
        yield minb, "song-title", prompt, title, song["source"]
        lines = [ln.strip() for ln in song["lyrics"].split("\n") if ln.strip()]
        if len(lines) >= 2:
            front = "What line comes next?\n“%s”" % lines[0]
            yield minb, "song-line", front, lines[1], title
        lead = song["source"].split("·")[0].strip().rstrip(".")
        if lead and not lead.lower().startswith("original"):
            front = "Who or what is credited for “%s”?" % title
            yield "primary", "song-source", front, lead, song["source"]
    yield "preschool", "scale", (
        "Name the eight syllables of the major scale from the home perch "
        "up to the high nest, ending on that high nest."
    ), "Do Re Mi Fa Sol La Ti Do", "Original climbing song in the app; not a copyrighted movie lyric."
    yield "baby", "high-low", (
        "A wren-sized dawn singer compared with a large night bird: "
        "where in the pitch range is the dawn singer's call?"
    ), "nearer the top", "Pitch nest in Songbird Forest. Text-only; no picture required."
    yield "baby", "high-low", (
        "Where in the pitch range is a large night bird compared with a wren-sized dawn singer?"
    ), "nearer the bottom", "Pitch nest in Songbird Forest. Text-only; no picture required."
    yield "baby", "high-low", (
        "Which forest voice in this app is the lowest perch?"
    ), "Low owl", "Named in the app as the bass hoot."
    yield "toddler", "high-low", (
        "Which forest voice in this app is the highest perch?"
    ), "High cardinal", "Named in the app as the treble song."


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
    specs = list(iter_cards(data))
    for minb, kind, front, back, extra in specs:
        assert_standalone(front, back)
    rows = []
    nid = 1705113000
    catalog = []
    for band in BANDS:
        deck = genanki.Deck(deck_ids[band], f"Homeschool::Singing::{LABELS[band]}")
        n_notes = 0
        for minb, kind, front, back, extra in specs:
            if not available(minb, band):
                continue
            rows.append({"band": band, "kind": kind, "front": front, "back": back, "extra": extra})
            deck.add_note(genanki.Note(model=m, fields=[front, back, extra], guid=str(nid)))
            nid += 1
            n_notes += 1
        out = DECKS / f"singing-{band}.apkg"
        write_apkg(deck, out)
        verify_apkg(out, n_notes)
        catalog.append({
            "id": f"singing-{band}",
            "file": out.name,
            "csv": "cards.csv",
            "band": band,
            "cards": n_notes,
        })
        print("wrote", out, n_notes, "notes")
    fieldnames = ["band", "kind", "front", "back", "extra"]
    with (ROOT / "cards.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)
    (ROOT / "catalog.json").write_text(json.dumps({"decks": catalog}, indent=2) + "\n")
    print("csv rows", len(rows))
    print("catalog", ROOT / "catalog.json")


if __name__ == "__main__":
    try:
        main()
    except json.JSONDecodeError as e:
        print("Could not parse singing data/content.json:", e, file=sys.stderr)
        sys.exit(1)
