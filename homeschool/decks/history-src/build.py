#!/usr/bin/env python3
"""Build per-band history Anki decks. CSV is the source; .apkg uses a fixed zip date."""
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
OUT = HERE.parent / "history"
FIXED_TS = 1700000000
DATE_TIME = (2023, 11, 14, 22, 13, 20)

# Fronts must not contain the answer. Cards are text-only (no missing picture).
CARDS = [
    # baby
    ("baby", "train-rails", "What kind of vehicle runs on rails in these notes?", "a train", "history baby train"),
    ("baby", "ticket", "What paper does a conductor punch on a railway ride?", "a ticket", "history baby train"),
    ("baby", "whistle", "What does a locomotive use to make a loud warning sound?", "a whistle", "history baby train"),
    ("baby", "lantern", "What light can sit on a dark railway platform?", "a lantern", "history baby train"),
    ("baby", "ship", "What kind of craft crossed the ocean in the 1492 story?", "a wooden ship", "history baby crossing"),
    ("baby", "rocket", "What do astronauts ride into the sky?", "a rocket", "history baby space"),
    ("baby", "stamp", "What do you collect in the railway stamp book?", "stamps", "history baby reward"),
    ("baby", "wheels", "Which part of a locomotive turns on the rails?", "the wheels", "history baby train"),
    # toddler
    ("toddler", "columbus-year", "In what year did Columbus sail west for Spain?", "1492", "history toddler columbus"),
    ("toddler", "mayflower", "What ship carried the Pilgrims in 1620?", "the Mayflower", "history toddler pilgrims"),
    ("toddler", "tea", "What did Boston protesters dump into the harbor in 1773?", "tea", "history toddler tea-party"),
    ("toddler", "first-pres", "Who was the first president of the United States?", "George Washington", "history toddler washington"),
    ("toddler", "new-country", "The Declaration of Independence said the colonies were what?", "a new country", "history toddler declaration"),
    ("toddler", "immigrants", "What word names people who move to a new country?", "immigrants", "history toddler immigrants"),
    ("toddler", "moon", "In 1969, U.S. astronauts walked on what?", "the Moon", "history toddler astronauts"),
    ("toddler", "people", "The Constitution starts with the words “We the ___.” What is the missing word?", "People", "history toddler preamble"),
    ("toddler", "ticket-quiz", "On the time-train, a correct answer earns a punched what?", "ticket", "history toddler train"),
    # preschool
    ("preschool", "columbus-spain", "Columbus’s 1492 voyage was paid for by which European kingdom?", "Spain", "history preschool columbus"),
    ("preschool", "plymouth-year", "In what year did the Pilgrims begin Plymouth Colony?", "1620", "history preschool pilgrims"),
    ("preschool", "tea-year", "In what year was the Boston Tea Party?", "1773", "history preschool tea-party"),
    ("preschool", "july4", "On what date in 1776 did Congress approve the Declaration of Independence?", "July 4", "history preschool declaration"),
    ("preschool", "washington-job", "Besides being president, Washington had been a leader of which kind of force?", "an army", "history preschool washington"),
    ("preschool", "louisiana-from", "From which country did the United States buy the Louisiana land in 1803?", "France", "history preschool louisiana"),
    ("preschool", "civil-span", "The U.S. Civil War lasted from 1861 to which year?", "1865", "history preschool civil-war"),
    ("preschool", "vote-women", "The Nineteenth Amendment is about the right to do what?", "vote", "history preschool nineteenth"),
    ("preschool", "brown-schools", "Brown v. Board of Education was a case about fairness in what places?", "public schools", "history preschool brown"),
    ("preschool", "bill-count", "How many amendments are in the Bill of Rights?", "ten", "history preschool bill"),
    ("preschool", "helpers", "On a sad day in 2001, these notes remember the people who did what?", "helped", "history preschool sept11"),
    # early
    ("early", "three-ships", "How many ships sailed with Columbus in 1492?", "three", "history early columbus"),
    ("early", "caribbean", "Where did Columbus make landfall in 1492?", "Caribbean islands", "history early columbus"),
    ("early", "plymouth-state", "Plymouth Colony was in which present-day state?", "Massachusetts", "history early pilgrims"),
    ("early", "compact", "What is the name of the short 1620 self-government agreement signed before the Pilgrims settled ashore?", "the Mayflower Compact", "history early pilgrims"),
    ("early", "tea-company", "The tea destroyed in Boston Harbor belonged to which company?", "the British East India Company", "history early tea-party"),
    ("early", "jefferson-draft", "Who wrote the main draft of the Declaration of Independence?", "Thomas Jefferson", "history early declaration"),
    ("early", "washington-years", "Washington’s presidency ran from 1789 to which year?", "1797", "history early washington"),
    ("early", "louisiana-pres", "Which president’s government made the Louisiana Purchase?", "Thomas Jefferson", "history early louisiana"),
    ("early", "monroe-year", "In what year was the Monroe Doctrine announced?", "1823", "history early monroe"),
    ("early", "missouri-year", "In what year was the Missouri Compromise?", "1820", "history early missouri"),
    ("early", "lincoln-war", "Who was president of the United States during the Civil War?", "Abraham Lincoln", "history early civil-war"),
    ("early", "sumter", "Where did Civil War fighting begin in 1861?", "Fort Sumter", "history early civil-war"),
    ("early", "amend14-year", "In what year was the Fourteenth Amendment ratified?", "1868", "history early fourteenth"),
    ("early", "ellis", "In what year did Ellis Island open as a major immigrant station?", "1892", "history early immigrants"),
    ("early", "us-wwi", "In what year did the United States enter World War I?", "1917", "history early wwi"),
    ("early", "amend19-year", "In what year was the Nineteenth Amendment ratified?", "1920", "history early nineteenth"),
    ("early", "pearl-date", "On what date in 1941 did Japan attack the U.S. fleet in Hawaii?", "December 7", "history early pearl"),
    ("early", "nato-year", "In what year was NATO founded?", "1949", "history early nato"),
    ("early", "brown-year", "In what year did the Supreme Court decide Brown v. Board of Education?", "1954", "history early brown"),
    ("early", "apollo-year", "In what year did Apollo 11 land people on the Moon?", "1969", "history early astronauts"),
    ("early", "constitution-year", "In what year was the Constitution written?", "1787", "history early preamble"),
    ("early", "bill-year", "In what year was the Bill of Rights ratified?", "1791", "history early bill"),
    # primary
    ("primary", "ferdinand", "Which Spanish king and queen paid for Columbus’s 1492 voyage?", "Ferdinand and Isabella", "history primary columbus"),
    ("primary", "wampanoag", "Which Native people lived near Plymouth and helped the newcomers survive the first winter?", "the Wampanoag", "history primary pilgrims"),
    ("primary", "coercive", "Parliament’s 1774 punishments after the Tea Party are often called the Coercive Acts or what other name?", "the Intolerable Acts", "history primary tea-party"),
    ("primary", "july2", "On which July day in 1776 did Congress vote independence (before approving the Declaration text two days later)?", "July 2", "history primary declaration"),
    ("primary", "two-terms", "Washington set an example by leaving the presidency after how many terms?", "two", "history primary washington"),
    ("primary", "lewis-clark", "Which pair explored the Louisiana Purchase and lands beyond for Jefferson?", "Lewis and Clark", "history primary louisiana"),
    ("primary", "jq-adams", "Which secretary of state helped shape the 1823 Monroe message?", "John Quincy Adams", "history primary monroe"),
    ("primary", "36-30", "The Missouri Compromise drew a slavery line in the remaining Louisiana land at which latitude?", "36°30′ north", "history primary missouri"),
    ("primary", "sc-first", "Which state was first to secede in December 1860?", "South Carolina", "history primary secession"),
    ("primary", "osullivan", "Who used the words “manifest destiny” in print in 1845?", "John L. O’Sullivan", "history primary manifest"),
    ("primary", "emancipation", "What 1863 order declared enslaved people in rebel areas free?", "the Emancipation Proclamation", "history primary civil-war"),
    ("primary", "appomattox", "Where did Robert E. Lee surrender to Ulysses S. Grant in 1865?", "Appomattox Court House", "history primary lee"),
    ("primary", "equal-protection", "Which clause of the Fourteenth Amendment did Brown v. Board later use?", "equal protection", "history primary fourteenth"),
    ("primary", "gilded", "The late-1800s boom of railroads, steel, and oil is often called what Age?", "the Gilded Age", "history primary tycoons"),
    ("primary", "liberty-year", "In what year was the Statue of Liberty dedicated?", "1886", "history primary immigrants"),
    ("primary", "zimmermann", "What German offer to Mexico in 1917 angered many Americans?", "the Zimmermann Telegram", "history primary wwi"),
    ("primary", "tennessee-1920", "Which state’s ratification in August 1920 put the Nineteenth Amendment over the top?", "Tennessee", "history primary nineteenth"),
    ("primary", "infamy", "Roosevelt called December 7, 1941, a date which will live in what?", "infamy", "history primary pearl"),
    ("primary", "article5", "NATO’s Article 5 treats an attack on one member as an attack on whom?", "all members", "history primary nato"),
    ("primary", "topeka", "The Brown family in the school case lived in which Kansas city?", "Topeka", "history primary brown"),
    ("primary", "armstrong", "Who was the first person to step onto the Moon in 1969?", "Neil Armstrong", "history primary astronauts"),
    ("primary", "pentagon", "Besides the World Trade Center, which U.S. defense building was struck on September 11, 2001?", "the Pentagon", "history primary sept11"),
    ("primary", "justice", "Name one purpose listed in the Constitution’s Preamble besides liberty.", "establish Justice", "history primary preamble"),
    ("primary", "madison-amend", "Who framed the Bill of Rights amendments in Congress?", "James Madison", "history primary bill"),
    ("primary", "lincoln-num", "Abraham Lincoln was U.S. president number what?", "16", "history primary presidents"),
    # upper
    ("upper", "four-voyages", "How many transatlantic voyages did Columbus make?", "four", "history upper columbus"),
    ("upper", "guanahani", "Columbus’s 1492 landfall Guanahani is in which island group?", "the Bahamas", "history upper columbus"),
    ("upper", "jamestown", "Which English town in North America began in 1607, earlier than Plymouth?", "Jamestown", "history upper pilgrims"),
    ("upper", "committee-five", "The Declaration committee of five included Jefferson, Adams, Franklin, Sherman, and whom?", "Livingston", "history upper declaration"),
    ("upper", "inaug-nyc", "In which city was Washington first inaugurated in 1789?", "New York City", "history upper washington"),
    ("upper", "haiti-sale", "Napoleon sold Louisiana after losing a war in which Caribbean colony and needing money?", "Haiti", "history upper louisiana"),
    ("upper", "dred-scott", "Which 1857 Supreme Court case treated parts of the Missouri Compromise as unconstitutional?", "Dred Scott", "history upper missouri"),
    ("upper", "richmond", "What city became the Confederacy’s later capital?", "Richmond, Virginia", "history upper secession"),
    ("upper", "gettysburg-year", "In what year were the battles of Gettysburg and Vicksburg?", "1863", "history upper civil-war"),
    ("upper", "sherman-1890", "What 1890 federal law targeted business trusts?", "the Sherman Antitrust Act", "history upper tycoons"),
    ("upper", "quotas", "In which two early-1920s years did Congress pass immigration quota laws?", "1921 and 1924", "history upper immigrants"),
    ("upper", "versailles", "After World War I, the U.S. Senate rejected the Treaty of Versailles and membership in what league?", "the League of Nations", "history upper wwi"),
    ("upper", "carriers-sea", "At Pearl Harbor, U.S. aircraft carriers were where, so they were not destroyed at the dock?", "at sea", "history upper pearl"),
    ("upper", "brussels", "In which city is NATO’s headquarters?", "Brussels, Belgium", "history upper nato"),
    ("upper", "warren", "Which Chief Justice wrote the Brown v. Board opinion?", "Earl Warren", "history upper brown"),
    ("upper", "twelve-moon", "How many Apollo astronauts walked on the Moon?", "twelve", "history upper astronauts"),
    ("upper", "al-qaeda", "Which network carried out the September 11, 2001 attacks?", "al-Qaeda", "history upper sept11"),
    ("upper", "preamble-power", "Does the Preamble itself grant government powers?", "No. It states aims; the articles grant powers", "history upper preamble"),
    ("upper", "twelve-sent", "How many amendments were sent to the states in 1789, of which ten were ratified by 1791?", "twelve", "history upper bill"),
    ("upper", "pres-3", "Who was U.S. president number 3?", "Thomas Jefferson", "history upper presidents"),
    ("upper", "pres-32", "Who was U.S. president number 32?", "Franklin D. Roosevelt", "history upper presidents"),
    ("upper", "pres-46", "Who was U.S. president number 46?", "Joe Biden", "history upper presidents"),
    ("upper", "pres-47", "Who is U.S. president number 47 in this public list?", "Donald Trump", "history upper presidents"),
]


def stable_id(name: str) -> int:
    h = hashlib.sha256(name.encode("utf-8")).hexdigest()
    return int(h[:8], 16) & 0x7FFFFFFF


MODEL = genanki.Model(
    stable_id("homeschool.model.history.basic.v1"),
    "Homeschool History Basic",
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
    n = sqlite3.connect(tmp_path).execute("select count(*) from notes").fetchone()[0]
    return n


def write_deck(band: str, rows: list[tuple]) -> dict:
    stem = "history-" + band
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
    deck = genanki.Deck(stable_id("homeschool.deck." + stem), "Homeschool::History::" + band)
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
    bands = ["baby", "toddler", "preschool", "early", "primary", "upper"]
    catalog = []
    for band in bands:
        rows = [c for c in CARDS if c[0] == band]
        if not rows:
            raise SystemExit("no cards for " + band)
        catalog.append(write_deck(band, rows))
    (OUT / "catalog.json").write_text(json.dumps({"decks": catalog}, indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
