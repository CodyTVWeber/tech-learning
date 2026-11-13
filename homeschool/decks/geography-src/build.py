#!/usr/bin/env python3
"""Build per-band geography Anki decks. CSV is the source; .apkg uses a fixed zip date."""
from __future__ import annotations

import csv
import hashlib
import io
import json
import sqlite3
import sys
import tempfile
import zipfile
from pathlib import Path

try:
    import genanki
except ImportError:
    sys.stderr.write("pip install genanki\n")
    raise

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "geography"
FIXED_TS = 1700000000
DATE_TIME = (2023, 11, 14, 22, 13, 20)

STATES = [
    ("ME", "Maine", "Augusta"),
    ("NH", "New Hampshire", "Concord"),
    ("MA", "Massachusetts", "Boston"),
    ("RI", "Rhode Island", "Providence"),
    ("CT", "Connecticut", "Hartford"),
    ("VT", "Vermont", "Montpelier"),
    ("NY", "New York", "Albany"),
    ("NJ", "New Jersey", "Trenton"),
    ("PA", "Pennsylvania", "Harrisburg"),
    ("DE", "Delaware", "Dover"),
    ("MD", "Maryland", "Annapolis"),
    ("VA", "Virginia", "Richmond"),
    ("WV", "West Virginia", "Charleston"),
    ("NC", "North Carolina", "Raleigh"),
    ("SC", "South Carolina", "Columbia"),
    ("GA", "Georgia", "Atlanta"),
    ("FL", "Florida", "Tallahassee"),
    ("AL", "Alabama", "Montgomery"),
    ("MS", "Mississippi", "Jackson"),
    ("LA", "Louisiana", "Baton Rouge"),
    ("MI", "Michigan", "Lansing"),
    ("OH", "Ohio", "Columbus"),
    ("IN", "Indiana", "Indianapolis"),
    ("KY", "Kentucky", "Frankfort"),
    ("TN", "Tennessee", "Nashville"),
    ("WI", "Wisconsin", "Madison"),
    ("IL", "Illinois", "Springfield"),
    ("IA", "Iowa", "Des Moines"),
    ("MO", "Missouri", "Jefferson City"),
    ("AR", "Arkansas", "Little Rock"),
    ("MN", "Minnesota", "St. Paul"),
    ("ND", "North Dakota", "Bismarck"),
    ("SD", "South Dakota", "Pierre"),
    ("WY", "Wyoming", "Cheyenne"),
    ("NE", "Nebraska", "Lincoln"),
    ("KS", "Kansas", "Topeka"),
    ("OK", "Oklahoma", "Oklahoma City"),
    ("TX", "Texas", "Austin"),
    ("CO", "Colorado", "Denver"),
    ("NM", "New Mexico", "Santa Fe"),
    ("UT", "Utah", "Salt Lake City"),
    ("AZ", "Arizona", "Phoenix"),
    ("NV", "Nevada", "Carson City"),
    ("CA", "California", "Sacramento"),
    ("HI", "Hawaii", "Honolulu"),
    ("MT", "Montana", "Helena"),
    ("ID", "Idaho", "Boise"),
    ("WA", "Washington", "Olympia"),
    ("OR", "Oregon", "Salem"),
    ("AK", "Alaska", "Juneau"),
]

CARDS = [
    ("baby", "balloon", "What craft in these notes floats with a burner and a basket?", "a hot-air balloon", "geography baby"),
    ("baby", "cloud", "What white shape floats in the sky beside a balloon?", "a cloud", "geography baby"),
    ("baby", "water", "On a map, blue areas often stand for what?", "water", "geography baby"),
    ("baby", "land", "On a map, the brown or green parts are usually what?", "land", "geography baby"),
    ("baby", "mountain", "What do we call a very high piece of land?", "a mountain", "geography baby"),
    ("baby", "river", "What do we call a long ribbon of moving water?", "a river", "geography baby"),
    ("baby", "pin", "What marker do we drop on a map to mark a place?", "a pin", "geography baby"),
    ("baby", "compass-n", "On a compass rose, which letter stands for north?", "N", "geography baby"),
    ("toddler", "boston-ne", "Boston is a capital in which U.S. region?", "New England", "geography toddler"),
    ("toddler", "albany", "What is the capital of New York?", "Albany", "geography toddler"),
    ("toddler", "dc", "What city is the capital of the United States?", "Washington, D.C.", "geography toddler"),
    ("toddler", "florida-water", "Florida’s peninsula sticks out into which kind of water?", "ocean", "geography toddler"),
    ("toddler", "columbus-oh", "What is the capital of Ohio?", "Columbus", "geography toddler"),
    ("toddler", "hawaii-islands", "Hawaii is a state made of what?", "islands", "geography toddler"),
    ("toddler", "lakes-water", "The Great Lakes are huge bodies of what kind of water?", "fresh water", "geography toddler"),
    ("toddler", "canyon", "A canyon is a deep cut in what?", "the land", "geography toddler"),
    ("toddler", "river-move", "A river is made of moving what?", "water", "geography toddler"),
    ("preschool", "augusta", "What is the capital of Maine?", "Augusta", "geography preschool"),
    ("preschool", "richmond", "What is the capital of Virginia?", "Richmond", "geography preschool"),
    ("preschool", "atlanta", "What is the capital of Georgia?", "Atlanta", "geography preschool"),
    ("preschool", "five-lakes", "How many Great Lakes are there?", "five", "geography preschool"),
    ("preschool", "white-mtns", "The White Mountains are chiefly in which state?", "New Hampshire", "geography preschool"),
    ("preschool", "grand-canyon-st", "In which state is the Grand Canyon?", "Arizona", "geography preschool"),
    ("preschool", "mississippi-kind", "The Mississippi is a long what?", "river", "geography preschool"),
    ("preschool", "oregon-way", "The Oregon Trail headed people in which direction?", "west", "geography preschool"),
    ("preschool", "canal-dug", "A canal is a waterway that people did what to make?", "dug", "geography preschool"),
    ("preschool", "plains", "The Plains are wide areas of what?", "grassland", "geography preschool"),
    ("preschool", "desert-dry", "A desert is a place that is very what?", "dry", "geography preschool"),
    ("preschool", "olympia", "What is the capital of Washington?", "Olympia", "geography preschool"),
    ("early", "concord", "What is the capital of New Hampshire?", "Concord", "geography early"),
    ("early", "boston", "What is the capital of Massachusetts?", "Boston", "geography early"),
    ("early", "hartford", "What is the capital of Connecticut?", "Hartford", "geography early"),
    ("early", "harrisburg", "What is the capital of Pennsylvania?", "Harrisburg", "geography early"),
    ("early", "annapolis", "What is the capital of Maryland?", "Annapolis", "geography early"),
    ("early", "raleigh", "What is the capital of North Carolina?", "Raleigh", "geography early"),
    ("early", "tallahassee", "What is the capital of Florida?", "Tallahassee", "geography early"),
    ("early", "baton-rouge", "What is the capital of Louisiana?", "Baton Rouge", "geography early"),
    ("early", "lansing", "What is the capital of Michigan?", "Lansing", "geography early"),
    ("early", "nashville", "What is the capital of Tennessee?", "Nashville", "geography early"),
    ("early", "springfield", "What is the capital of Illinois?", "Springfield", "geography early"),
    ("early", "austin", "What is the capital of Texas?", "Austin", "geography early"),
    ("early", "sacramento", "What is the capital of California?", "Sacramento", "geography early"),
    ("early", "honolulu", "What is the capital of Hawaii?", "Honolulu", "geography early"),
    ("early", "juneau", "What is the capital of Alaska?", "Juneau", "geography early"),
    ("early", "salem", "What is the capital of Oregon?", "Salem", "geography early"),
    ("early", "adirondack", "The Adirondack Mountains are in which state?", "New York", "geography early"),
    ("early", "ohio-joins", "The Ohio River joins which larger river?", "the Mississippi River", "geography early"),
    ("early", "columbia-ocean", "The Columbia River reaches which ocean?", "the Pacific Ocean", "geography early"),
    ("early", "erie-state", "The Erie Canal is in which state?", "New York", "geography early"),
    ("primary", "montpelier", "What is the capital of Vermont?", "Montpelier", "geography primary"),
    ("primary", "trenton", "What is the capital of New Jersey?", "Trenton", "geography primary"),
    ("primary", "charleston-wv", "What is the capital of West Virginia?", "Charleston", "geography primary"),
    ("primary", "montgomery", "What is the capital of Alabama?", "Montgomery", "geography primary"),
    ("primary", "frankfort", "What is the capital of Kentucky?", "Frankfort", "geography primary"),
    ("primary", "madison", "What is the capital of Wisconsin?", "Madison", "geography primary"),
    ("primary", "jefferson-city", "What is the capital of Missouri?", "Jefferson City", "geography primary"),
    ("primary", "bismarck", "What is the capital of North Dakota?", "Bismarck", "geography primary"),
    ("primary", "pierre", "What is the capital of South Dakota?", "Pierre", "geography primary"),
    ("primary", "cheyenne", "What is the capital of Wyoming?", "Cheyenne", "geography primary"),
    ("primary", "topeka", "What is the capital of Kansas?", "Topeka", "geography primary"),
    ("primary", "santa-fe", "What is the capital of New Mexico?", "Santa Fe", "geography primary"),
    ("primary", "phoenix", "What is the capital of Arizona?", "Phoenix", "geography primary"),
    ("primary", "helena", "What is the capital of Montana?", "Helena", "geography primary"),
    ("primary", "boise", "What is the capital of Idaho?", "Boise", "geography primary"),
    ("primary", "homes", "Name the five Great Lakes.", "Huron, Ontario, Michigan, Erie, Superior", "geography primary lakes"),
    ("primary", "mitchell", "Mount Mitchell is the highest peak in which half of the United States?", "the East", "geography primary mountains"),
    ("primary", "whitney", "Mount Whitney is the highest peak in which group of states?", "the contiguous 48", "geography primary mountains"),
    ("primary", "denali", "Denali, the highest peak in North America, is in which state?", "Alaska", "geography primary mountains"),
    ("primary", "rainier", "Mount Rainier is in which state?", "Washington", "geography primary mountains"),
    ("primary", "chesapeake", "Chesapeake Bay lies by Maryland and which other state?", "Virginia", "geography primary bays"),
    ("primary", "puget", "Puget Sound is in which state?", "Washington", "geography primary bays"),
    ("primary", "st-lawrence", "The St. Lawrence carries Great Lakes water toward which ocean?", "the Atlantic", "geography primary rivers"),
    ("primary", "rio-grande", "The Rio Grande forms part of the U.S. border with which country?", "Mexico", "geography primary rivers"),
    ("primary", "great-salt", "The Great Salt Lake is in which state?", "Utah", "geography primary rivers"),
    ("primary", "oregon-trail", "Which historic wagon route headed to the Pacific Northwest?", "the Oregon Trail", "geography primary trails"),
    ("primary", "santa-fe-trail", "The Santa Fe Trail linked Missouri toward which present-day state?", "New Mexico", "geography primary trails"),
    ("primary", "mojave", "The Mojave Desert is chiefly in which state?", "California", "geography primary deserts"),
    ("primary", "sonoran", "The Sonoran Desert includes much of which U.S. state?", "Arizona", "geography primary deserts"),
    ("primary", "niagara", "Niagara Falls sits on the border of New York and which country?", "Canada", "geography primary features"),
    ("primary", "black-hills", "The Black Hills are in which state?", "South Dakota", "geography primary features"),
    ("primary", "mammoth", "Mammoth Cave is in which state?", "Kentucky", "geography primary features"),
    ("primary", "san-andreas", "The San Andreas Fault is in which state?", "California", "geography primary features"),
    ("primary", "woodlands", "Eastern Woodlands names forest country of which side of the continent?", "the East", "geography primary regions"),
]


def stable_id(name: str) -> int:
    h = hashlib.sha256(name.encode("utf-8")).hexdigest()
    return int(h[:8], 16) & 0x7FFFFFFF


MODEL = genanki.Model(
    stable_id("homeschool.model.geography.basic.v1"),
    "Homeschool Geography Basic",
    fields=[{"name": "Prompt"}, {"name": "Answer"}, {"name": "AudioText"}, {"name": "Tags"}],
    templates=[{"name": "Card 1", "qfmt": "{{Prompt}}", "afmt": "{{FrontSide}}<hr id=answer>{{Answer}}"}],
)


def leaks(prompt: str, answer: str) -> bool:
    a = answer.strip().lower()
    p = prompt.lower()
    if len(a) < 4:
        return False
    return a in p


def freeze_zip(path: Path) -> None:
    buf = io.BytesIO()
    with zipfile.ZipFile(path, "r") as src, zipfile.ZipFile(buf, "w") as dst:
        for info in src.infolist():
            data = src.read(info.filename)
            info.date_time = DATE_TIME
            dst.writestr(info, data)
    path.write_bytes(buf.getvalue())


def note_count(path: Path) -> int:
    with zipfile.ZipFile(path) as z:
        name = "collection.anki21" if "collection.anki21" in z.namelist() else "collection.anki2"
        with tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False) as tmp:
            tmp.write(z.read(name))
            tmp_path = tmp.name
    return sqlite3.connect(tmp_path).execute("select count(*) from notes").fetchone()[0]


def all_cards() -> list[tuple]:
    rows = list(CARDS)
    # Upper: every capital as a self-contained text card (no map required).
    for abbr, name, capital in STATES:
        cid = "cap-" + abbr.lower()
        prompt = "What is the capital of %s?" % name
        if leaks(prompt, capital):
            prompt = "Name the capital city of the state whose postal abbreviation is %s." % abbr
        if leaks(prompt, capital):
            raise SystemExit("cannot place capital card for " + name)
        rows.append(("upper", cid, prompt, capital, "geography upper capitals"))
        rev = "Which state’s capital is %s?" % capital
        if not leaks(rev, name):
            rows.append(("upper", "st-" + abbr.lower(), rev, name, "geography upper capitals"))
    extra = [
        ("upper", "dc-nation", "What city is the capital of the United States?", "Washington, D.C.", "geography upper"),
        ("upper", "superior", "Which Great Lake is largest by area and farthest west?", "Superior", "geography upper lakes"),
        ("upper", "ontario-east", "Which Great Lake is farthest east?", "Ontario", "geography upper lakes"),
        ("upper", "whitney-name", "What is the highest peak in the contiguous 48 states?", "Mount Whitney", "geography upper mountains"),
        ("upper", "elbert", "Mount Elbert is a high summit of which western range, in Colorado?", "the Rockies", "geography upper mountains"),
        ("upper", "cascades", "Mount Rainier belongs to which Pacific Northwest range?", "the Cascades", "geography upper mountains"),
        ("upper", "seven-trails", "Name the seven historic routes in the week-19 set (Road plus six Trails).", "Cumberland Road, Santa Fe, Mormon, Gila, Old Spanish, California, Oregon", "geography upper trails"),
        ("upper", "five-canals", "Name the five canals in the week-20 set.", "Erie; Pennsylvania; Chesapeake and Ohio; Ohio and Erie; Miami and Erie", "geography upper canals"),
        ("upper", "seven-regions", "Name the seven Native geographic culture areas in the week-21 set.", "Eastern Woodlands, Plains, Plateau, Northwest Coast, California, Great Basin, Southwest", "geography upper regions"),
        ("upper", "five-deserts", "Name the five deserts in the week-22 set.", "Mojave, Sonoran, Colorado, Painted, Great Salt Lake Desert", "geography upper deserts"),
        ("upper", "delta", "The Mississippi River Delta is chiefly in which state?", "Louisiana", "geography upper features"),
        ("upper", "death-valley", "Death Valley is in which state?", "California", "geography upper features"),
        ("upper", "gulf", "The Gulf of Mexico lies south of which U.S. coast?", "the Gulf Coast", "geography upper features"),
        ("upper", "okefenokee", "Okefenokee Swamp is in Georgia and which other state?", "Florida", "geography upper features"),
        ("upper", "ozark", "The Ozark Highlands are in Missouri and which other state?", "Arkansas", "geography upper features"),
        ("upper", "olympic", "Olympic rain forests are in which state?", "Washington", "geography upper features"),
    ]
    rows.extend(extra)
    return rows


def write_deck(band: str, rows: list[tuple]) -> dict:
    stem = "geography-" + band
    csv_path = HERE / (stem + ".csv")
    apkg_path = OUT / (stem + ".apkg")
    OUT.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["id", "prompt", "answer", "audio_text", "tags"])
        w.writeheader()
        for _band, cid, prompt, answer, tags in rows:
            if leaks(prompt, answer):
                raise SystemExit("front contains answer: %s / %s" % (prompt, answer))
            w.writerow({"id": cid, "prompt": prompt, "answer": answer, "audio_text": prompt, "tags": tags})
    deck = genanki.Deck(stable_id("homeschool.deck." + stem), "Homeschool::Geography::" + band)
    for _band, cid, prompt, answer, tags in rows:
        deck.add_note(
            genanki.Note(
                model=MODEL,
                fields=[prompt, answer, prompt, tags],
                guid=genanki.guid_for(stem, cid),
            )
        )
    pkg = genanki.Package(deck)
    try:
        pkg.write_to_file(str(apkg_path), timestamp=float(FIXED_TS))
    except TypeError:
        pkg.write_to_file(str(apkg_path))
    freeze_zip(apkg_path)
    n = note_count(apkg_path)
    if n != len(rows):
        raise SystemExit("%s notes %s != %s" % (apkg_path.name, n, len(rows)))
    print("wrote", apkg_path.name, n)
    return {"id": stem, "file": stem + ".apkg", "csv": stem + ".csv", "cards": n}


def main() -> int:
    grouped: dict[str, list] = {b: [] for b in ["baby", "toddler", "preschool", "early", "primary", "upper"]}
    for row in all_cards():
        grouped[row[0]].append(row)
    catalog = []
    for band in grouped:
        if not grouped[band]:
            raise SystemExit("no cards for " + band)
        catalog.append(write_deck(band, grouped[band]))
    (OUT / "catalog.json").write_text(json.dumps({"decks": catalog}, indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
