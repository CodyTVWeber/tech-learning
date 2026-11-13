#!/usr/bin/env python3
"""Build Bible app data.js, CSV sources, and Anki .apkg decks.

Scripture text is copied from public-domain KJV and WEB JSON (not committed).
Original stories, book blurbs, and character notes are ours.
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

try:
    import genanki
except ImportError:
    print("Install genanki: pip install genanki", file=sys.stderr)
    raise

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
APP = REPO / "homeschool" / "apps" / "bible"
DECKS = REPO / "homeschool" / "decks" / "bible"
JSON_DIR = Path("/tmp/biblejson")
APKG_TS = 1700000000.0

BANDS = ["baby", "toddler", "preschool", "early", "primary", "upper"]
BAND_LABELS = {
    "baby": "Baby",
    "toddler": "Toddler",
    "preschool": "Preschool",
    "early": "Early",
    "primary": "Primary",
    "upper": "Upper",
}


def from_band(min_band: str) -> list[str]:
    i = BANDS.index(min_band)
    return BANDS[i:]


def clean_web(text: str) -> str:
    text = text.replace("\u00a0", " ").strip()
    text = re.sub(r"\s+'\s+", "'", text)
    text = re.sub(r"'\s+", "'", text)
    text = re.sub(r"\s+'", "'", text)
    text = re.sub(r"\s+([;:,.!?])", r"\1", text)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


def load_bibles():
    kjv = json.loads((JSON_DIR / "kjv.json").read_text())
    web = json.loads((JSON_DIR / "web.json").read_text())
    by = {}
    for label, data in (("kjv", kjv), ("web", web)):
        by[label] = {b["name"]: b["chapters"] for b in data}
    return by


def verse_text(bibles, version, book, chapter, verse) -> str:
    raw = bibles[version][book][chapter - 1][verse - 1]
    return clean_web(raw) if version == "web" else raw.strip()


def span_text(bibles, version, book, chapter, start, end) -> str:
    parts = [verse_text(bibles, version, book, chapter, v) for v in range(start, end + 1)]
    return " ".join(parts)


WEB_OVERRIDE = json.loads((ROOT / "web-verses.json").read_text()) if (ROOT / "web-verses.json").exists() else {}


# id, book, ch, start, end, min_band, blank, img
VERSE_SPECS = [
    ("gen1-1", "Genesis", 1, 1, 1, "baby", "beginning", "stars"),
    ("gen1-3", "Genesis", 1, 3, 3, "toddler", "light", "stars"),
    ("gen1-27", "Genesis", 1, 27, 27, "early", "image", "stars"),
    ("ex20-12", "Exodus", 20, 12, 12, "preschool", "father", "olives"),
    ("num6-24", "Numbers", 6, 24, 24, "baby", "bless", "lantern"),
    ("deut6-5", "Deuteronomy", 6, 5, 5, "early", "heart", "hillside"),
    ("josh1-9", "Joshua", 1, 9, 9, "primary", "courage", "olives"),
    ("1sam16-7", "1 Samuel", 16, 7, 7, "primary", "heart", "sheep"),
    ("ps19-1", "Psalms", 19, 1, 1, "preschool", "heavens", "stars"),
    ("ps23-1", "Psalms", 23, 1, 1, "baby", "shepherd", "sheep"),
    ("ps23-2", "Psalms", 23, 2, 2, "toddler", "waters", "waters"),
    ("ps23-4", "Psalms", 23, 4, 4, "early", "fear", "lantern"),
    ("ps23-full", "Psalms", 23, 1, 6, "upper", "shepherd", "waters"),
    ("ps56-3", "Psalms", 56, 3, 3, "toddler", "afraid", "lantern"),
    ("ps100-1", "Psalms", 100, 1, 1, "baby", "joyful", "hillside"),
    ("ps119-11", "Psalms", 119, 11, 11, "early", "heart", "lantern"),
    ("ps119-105", "Psalms", 119, 105, 105, "toddler", "lamp", "lantern"),
    ("ps136-1", "Psalms", 136, 1, 1, "baby", "thanks", "wheat"),
    ("ps139-14", "Psalms", 139, 14, 14, "preschool", "wonderfully", "sheep"),
    ("prov3-5", "Proverbs", 3, 5, 5, "preschool", "Trust", "hillside"),
    ("prov3-6", "Proverbs", 3, 6, 6, "early", "paths", "hillside"),
    ("prov15-1", "Proverbs", 15, 1, 1, "primary", "soft", "olives"),
    ("isa9-6", "Isaiah", 9, 6, 6, "primary", "child", "stars"),
    ("isa40-31", "Isaiah", 40, 31, 31, "upper", "eagles", "stars"),
    ("jer29-11", "Jeremiah", 29, 11, 11, "primary", "thoughts", "wheat"),
    ("jonah1-17", "Jonah", 1, 17, 17, "toddler", "fish", "waters"),
    ("mic6-8", "Micah", 6, 8, 8, "upper", "mercy", "olives"),
    ("rom1-16", "Romans", 1, 16, 16, "upper", "gospel", "stars"),
    ("matt5-9", "Matthew", 5, 9, 9, "preschool", "peacemakers", "waters"),
    ("matt5-14", "Matthew", 5, 14, 14, "early", "light", "lantern"),
    ("matt6-9", "Matthew", 6, 9, 9, "early", "Father", "stars"),
    ("matt6-9-13", "Matthew", 6, 9, 13, "upper", "Father", "stars"),
    ("matt7-12", "Matthew", 7, 12, 12, "early", "men", "wheat"),
    ("matt11-28", "Matthew", 11, 28, 28, "primary", "rest", "waters"),
    ("matt19-14", "Matthew", 19, 14, 14, "toddler", "children", "sheep"),
    ("matt22-37", "Matthew", 22, 37, 37, "early", "heart", "hillside"),
    ("matt28-6", "Matthew", 28, 6, 6, "preschool", "risen", "stars"),
    ("luke2-11", "Luke", 2, 11, 11, "toddler", "Saviour", "stars"),
    ("luke6-31", "Luke", 6, 31, 31, "preschool", "do", "wheat"),
    ("john3-16", "John", 3, 16, 16, "preschool", "loved", "stars"),
    ("john8-12", "John", 8, 12, 12, "early", "light", "lantern"),
    ("john10-11", "John", 10, 11, 11, "toddler", "shepherd", "sheep"),
    ("john11-35", "John", 11, 35, 35, "baby", "wept", "waters"),
    ("john14-6", "John", 14, 6, 6, "early", "way", "hillside"),
    ("john14-15", "John", 14, 15, 15, "preschool", "commandments", "olives"),
    ("acts1-8", "Acts", 1, 8, 8, "upper", "witnesses", "stars"),
    ("rom3-23", "Romans", 3, 23, 23, "primary", "sinned", "olives"),
    ("rom6-23", "Romans", 6, 23, 23, "primary", "gift", "wheat"),
    ("rom8-28", "Romans", 8, 28, 28, "upper", "good", "hillside"),
    ("rom12-21", "Romans", 12, 21, 21, "early", "overcome", "olives"),
    ("1cor10-31", "1 Corinthians", 10, 31, 31, "primary", "glory", "wheat"),
    ("1cor13-4", "1 Corinthians", 13, 4, 4, "early", "kind", "sheep"),
    ("1cor16-14", "1 Corinthians", 16, 14, 14, "toddler", "charity", "sheep"),
    ("gal5-22-23", "Galatians", 5, 22, 23, "primary", "fruit", "wheat"),
    ("eph2-8", "Ephesians", 2, 8, 8, "upper", "grace", "stars"),
    ("eph4-32", "Ephesians", 4, 32, 32, "preschool", "kind", "sheep"),
    ("eph6-1", "Ephesians", 6, 1, 1, "toddler", "obey", "olives"),
    ("phil4-4", "Philippians", 4, 4, 4, "baby", "Rejoice", "hillside"),
    ("phil4-6", "Philippians", 4, 6, 6, "primary", "prayer", "lantern"),
    ("phil4-13", "Philippians", 4, 13, 13, "early", "Christ", "hillside"),
    ("col3-23", "Colossians", 3, 23, 23, "primary", "heartily", "wheat"),
    ("1th5-16-18", "1 Thessalonians", 5, 16, 18, "early", "thanks", "wheat"),
    ("1th5-17", "1 Thessalonians", 5, 17, 17, "baby", "Pray", "lantern"),
    ("2tim1-7", "2 Timothy", 1, 7, 7, "early", "fear", "lantern"),
    ("2tim3-16", "2 Timothy", 3, 16, 16, "upper", "scripture", "lantern"),
    ("heb13-8", "Hebrews", 13, 8, 8, "preschool", "same", "olives"),
    ("jas1-19", "James", 1, 19, 19, "primary", "slow", "waters"),
    ("jas1-22", "James", 1, 22, 22, "primary", "doers", "wheat"),
    ("1pet5-7", "1 Peter", 5, 7, 7, "preschool", "care", "sheep"),
    ("1jn1-9", "1 John", 1, 9, 9, "early", "forgive", "waters"),
    ("1jn4-7", "1 John", 4, 7, 7, "early", "love", "sheep"),
    ("1jn4-8", "1 John", 4, 8, 8, "baby", "love", "sheep"),
    ("1jn4-19", "1 John", 4, 19, 19, "toddler", "first", "sheep"),
    ("rev4-11", "Revelation", 4, 11, 11, "upper", "worthy", "stars"),
]

STORIES = [
    {"id": "creation", "order": 1, "title": "God Makes the World", "minBand": "baby", "img": "stars",
     "ref": "Genesis 1:1", "verseId": "gen1-1",
     "text": "In the beginning there was only God. He spoke, and light came. He made sky, land, seas, plants, sun, moon, stars, birds, fish, and animals. Last of all He made people. Then He rested, and it was very good."},
    {"id": "fall", "order": 2, "title": "The Garden and the Fall", "minBand": "early", "img": "olives",
     "ref": "Genesis 3:1-24", "verseId": "gen1-27",
     "text": "God placed the first man and woman in a good garden and gave them one command. They listened to the serpent instead, and sin entered the world. God still promised that a Savior would come."},
    {"id": "noah", "order": 3, "title": "Noah and the Ark", "minBand": "toddler", "img": "waters",
     "ref": "Genesis 7:1", "verseId": "gen1-1",
     "text": "The world grew violent, but Noah walked with God. God told him to build a great ark. Rain fell, the earth was covered, and God kept Noah’s family and the animals safe. After the flood God set a rainbow in the cloud."},
    {"id": "abraham", "order": 4, "title": "God Calls Abraham", "minBand": "preschool", "img": "wheat",
     "ref": "Genesis 12:1-3", "verseId": "deut6-5",
     "text": "God called Abram to leave his country. He promised land, a family, and blessing for all nations. Abraham believed God, and God counted it as righteousness."},
    {"id": "isaac", "order": 5, "title": "Isaac, the Promised Son", "minBand": "early", "img": "sheep",
     "ref": "Genesis 21:1-3", "verseId": "ps23-1",
     "text": "Abraham and Sarah waited many years. God kept His word and gave them Isaac. The promise of a great family moved forward through this child."},
    {"id": "jacob", "order": 6, "title": "Jacob Becomes Israel", "minBand": "primary", "img": "hillside",
     "ref": "Genesis 32:28", "verseId": "ps56-3",
     "text": "Jacob ran, wrestled, and learned to cling to God. God named him Israel. From his twelve sons came the tribes of Israel."},
    {"id": "joseph", "order": 7, "title": "Joseph in Egypt", "minBand": "preschool", "img": "wheat",
     "ref": "Genesis 50:20", "verseId": "rom8-28",
     "text": "Brothers sold Joseph, but God was with him in Egypt. He became a wise helper in a famine. What others meant for harm, God used to save many lives."},
    {"id": "moses", "order": 8, "title": "Moses and the Burning Bush", "minBand": "preschool", "img": "olives",
     "ref": "Exodus 3:14", "verseId": "josh1-9",
     "text": "God heard Israel groaning in Egypt. From a bush that burned but was not eaten, He sent Moses: “I AM THAT I AM.” Moses went to Pharaoh with God’s word."},
    {"id": "exodus", "order": 9, "title": "Through the Sea", "minBand": "toddler", "img": "waters",
     "ref": "Exodus 14:21-22", "verseId": "ps100-1",
     "text": "God brought Israel out with a mighty hand. He made a path through the sea. The people walked on dry ground, and they sang to the Lord."},
    {"id": "commandments", "order": 10, "title": "The Ten Commandments", "minBand": "early", "img": "olives",
     "ref": "Exodus 20:1-17", "verseId": "ex20-12",
     "text": "At the mountain God spoke ten words for His people: worship Him only, keep His name holy, rest, honor father and mother, and love your neighbor. His law shows His heart."},
    {"id": "joshua", "order": 11, "title": "Jericho’s Walls", "minBand": "preschool", "img": "olives",
     "ref": "Joshua 6:20", "verseId": "josh1-9",
     "text": "After Moses, Joshua led Israel. They marched around Jericho as God said. On the seventh day the walls fell, and the people learned that the Lord fights for them."},
    {"id": "ruth", "order": 12, "title": "Ruth Stays", "minBand": "early", "img": "wheat",
     "ref": "Ruth 1:16", "verseId": "1jn4-19",
     "text": "Ruth would not leave Naomi. She gleaned in Boaz’s field. God folded this faithful stranger into the family line of King David—and of Jesus."},
    {"id": "samuel", "order": 13, "title": "Samuel Listens", "minBand": "preschool", "img": "lantern",
     "ref": "1 Samuel 3:10", "verseId": "1th5-17",
     "text": "The boy Samuel heard his name in the night. Eli taught him to say, “Speak, LORD; for thy servant heareth.” Samuel grew into a prophet who listened."},
    {"id": "david-goliath", "order": 14, "title": "David and Goliath", "minBand": "toddler", "img": "hillside",
     "ref": "1 Samuel 17:45", "verseId": "ps23-1",
     "text": "A shepherd boy faced a giant with a sling and with the name of the Lord. David would not let Israel be mocked. The battle was the Lord’s."},
    {"id": "david-king", "order": 15, "title": "David the King", "minBand": "early", "img": "sheep",
     "ref": "2 Samuel 7:16", "verseId": "ps23-1",
     "text": "God took David from the sheepfolds to the throne. He promised David a house that would last. From that line would come the forever King."},
    {"id": "solomon", "order": 16, "title": "Solomon Asks for Wisdom", "minBand": "primary", "img": "olives",
     "ref": "1 Kings 3:9", "verseId": "jas1-19",
     "text": "When God offered Solomon a gift, he asked for an understanding heart to judge the people. God gave wisdom, and the temple was built in Jerusalem."},
    {"id": "elijah", "order": 17, "title": "Elijah on the Mountain", "minBand": "primary", "img": "stars",
     "ref": "1 Kings 18:39", "verseId": "ps19-1",
     "text": "On Mount Carmel Elijah called the people back to the Lord. Fire fell. The people cried, “The LORD, he is the God.”"},
    {"id": "daniel", "order": 18, "title": "Daniel and the Lions", "minBand": "preschool", "img": "lantern",
     "ref": "Daniel 6:22", "verseId": "ps56-3",
     "text": "Daniel prayed with his windows open even when a law forbade it. God shut the lions’ mouths. The king learned that Daniel’s God is living."},
    {"id": "esther", "order": 19, "title": "Esther Speaks Up", "minBand": "primary", "img": "wheat",
     "ref": "Esther 4:14", "verseId": "josh1-9",
     "text": "Esther was queen in a far palace when her people were in danger. She fasted, went before the king, and was used to save many lives."},
    {"id": "jonah", "order": 20, "title": "Jonah and the Great Fish", "minBand": "toddler", "img": "waters",
     "ref": "Jonah 1:17", "verseId": "jonah1-17",
     "text": "Jonah ran from God’s call. A storm, a fish, and a second chance taught him that God’s mercy is wide—even for Nineveh."},
    {"id": "birth", "order": 21, "title": "Jesus Is Born", "minBand": "baby", "img": "stars",
     "ref": "Luke 2:11", "verseId": "luke2-11",
     "text": "In Bethlehem a baby was laid in a manger. Angels told shepherds that a Saviour was born. Wise men followed a star. God had come near."},
    {"id": "baptism", "order": 22, "title": "Jesus Is Baptized", "minBand": "early", "img": "waters",
     "ref": "Matthew 3:17", "verseId": "john14-6",
     "text": "Jesus came to the Jordan. The Spirit came like a dove, and the Father’s voice said He was the beloved Son. His public work began."},
    {"id": "storm", "order": 23, "title": "Jesus Calms the Storm", "minBand": "toddler", "img": "waters",
     "ref": "Mark 4:39", "verseId": "ps56-3",
     "text": "Waves filled the boat. The disciples were afraid. Jesus stood and said, “Peace, be still.” Wind and sea obeyed Him."},
    {"id": "five-thousand", "order": 24, "title": "A Crowd Is Fed", "minBand": "preschool", "img": "wheat",
     "ref": "John 6:11", "verseId": "phil4-13",
     "text": "A boy’s lunch of bread and fish was placed in Jesus’ hands. He gave thanks, broke it, and thousands ate. There were baskets left over."},
    {"id": "lost-sheep", "order": 25, "title": "The Lost Sheep", "minBand": "baby", "img": "sheep",
     "ref": "Luke 15:4-6", "verseId": "john10-11",
     "text": "A shepherd leaves the ninety-nine to find one lost sheep. He carries it home and calls friends to rejoice. That is how heaven feels when one sinner turns back."},
    {"id": "good-samaritan", "order": 26, "title": "The Kind Neighbor", "minBand": "early", "img": "olives",
     "ref": "Luke 10:33-34", "verseId": "eph4-32",
     "text": "A man lay hurt on the road. Two passed by. A Samaritan stopped, bound the wounds, and paid for care. Jesus said, “Go, and do thou likewise.”"},
    {"id": "prodigal", "order": 27, "title": "The Son Who Came Home", "minBand": "primary", "img": "wheat",
     "ref": "Luke 15:20", "verseId": "1jn4-19",
     "text": "A son wasted his share and came home hungry. The father ran, embraced him, and made a feast. The older brother had to learn the father’s mercy too."},
    {"id": "children", "order": 28, "title": "Jesus and the Children", "minBand": "toddler", "img": "sheep",
     "ref": "Matthew 19:14", "verseId": "matt19-14",
     "text": "People brought little ones to Jesus. The disciples tried to send them away. Jesus welcomed them and said the kingdom belongs to such as these."},
    {"id": "last-supper", "order": 29, "title": "The Last Supper", "minBand": "early", "img": "wheat",
     "ref": "Luke 22:19-20", "verseId": "john14-15",
     "text": "On the night He was betrayed, Jesus broke bread and shared the cup with His friends. He gave a new covenant in His blood, and He washed their feet."},
    {"id": "cross-rise", "order": 30, "title": "The Cross and the Empty Tomb", "minBand": "preschool", "img": "stars",
     "ref": "Matthew 28:6", "verseId": "matt28-6",
     "text": "Jesus died on a cross for sinners. Friends laid Him in a tomb. On the third day the stone was rolled away. He is risen, as He said."},
    {"id": "pentecost", "order": 31, "title": "The Spirit Comes", "minBand": "primary", "img": "lantern",
     "ref": "Acts 2:4", "verseId": "acts1-8",
     "text": "At Pentecost the Holy Spirit filled the believers. They spoke the good news in many tongues. The church was born, and thousands believed."},
    {"id": "paul", "order": 32, "title": "Paul Sent Out", "minBand": "upper", "img": "olives",
     "ref": "Acts 9:15", "verseId": "rom1-16",
     "text": "Saul the persecutor met Jesus on the road and became Paul the servant. He carried the gospel to city after city and wrote letters the church still reads."},
]

# Jonah verse is not in VERSE_SPECS; stories can still quote a title-only ref.
# We'll attach john10-11 as fallback if verseId missing from verses.

BOOK_GROUPS = [
    ("Law", "OT", ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"]),
    ("History", "OT", ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
                       "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther"]),
    ("Poetry", "OT", ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"]),
    ("Major Prophets", "OT", ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"]),
    ("Minor Prophets", "OT", ["Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
                              "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"]),
    ("Gospels", "NT", ["Matthew", "Mark", "Luke", "John"]),
    ("History", "NT", ["Acts"]),
    ("Paul's Letters", "NT", ["Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
                              "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
                              "1 Timothy", "2 Timothy", "Titus", "Philemon"]),
    ("General Letters", "NT", ["Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude"]),
    ("Prophecy", "NT", ["Revelation"]),
]

BOOK_BLURBS = {
    "Genesis": "Beginnings: creation, promise, and a family God chose.",
    "Exodus": "God frees Israel from Egypt and gives His law.",
    "Leviticus": "How a holy God dwells with His people.",
    "Numbers": "Wilderness years and God’s faithful care.",
    "Deuteronomy": "Moses retells the law before the land.",
    "Joshua": "Israel enters the land God promised.",
    "Judges": "Cycles of forgetting and God’s rescue.",
    "Ruth": "Kindness, gleaning, and a place in David’s line.",
    "1 Samuel": "Samuel, Saul, and the rise of David.",
    "2 Samuel": "David’s reign, sin, and God’s covenant.",
    "1 Kings": "Solomon, the temple, and a divided kingdom.",
    "2 Kings": "Kings, prophets, and exile.",
    "1 Chronicles": "David’s line and temple worship remembered.",
    "2 Chronicles": "Judah’s kings and the call to seek the Lord.",
    "Ezra": "The people return and rebuild the temple.",
    "Nehemiah": "Walls rebuilt and the law read aloud.",
    "Esther": "God preserves His people in a foreign court.",
    "Job": "Suffering, friends’ speeches, and the fear of the Lord.",
    "Psalms": "Songs of prayer, praise, and trust.",
    "Proverbs": "Wisdom for everyday walking.",
    "Ecclesiastes": "Life under the sun, and fearing God.",
    "Song of Solomon": "A poem of faithful love.",
    "Isaiah": "Judgment, comfort, and the coming King.",
    "Jeremiah": "Tears, a new covenant, and a call to turn.",
    "Lamentations": "Grief over a fallen city.",
    "Ezekiel": "Visions of glory, dry bones, and a new heart.",
    "Daniel": "Faith in exile and kingdoms under God.",
    "Hosea": "A faithful husband and a wandering people.",
    "Joel": "Locusts, the day of the Lord, and the Spirit poured out.",
    "Amos": "Justice rolling down like waters.",
    "Obadiah": "Edom’s pride brought low.",
    "Jonah": "A reluctant prophet and a merciful God.",
    "Micah": "Do justly, love mercy, walk humbly.",
    "Nahum": "Nineveh’s fall.",
    "Habakkuk": "The just shall live by faith.",
    "Zephaniah": "The day of the Lord and a singing God.",
    "Haggai": "Rebuild the house of the Lord.",
    "Zechariah": "Visions of a coming King, humble and riding.",
    "Malachi": "A messenger, a warning, and a promise of the sun of righteousness.",
    "Matthew": "Jesus the King and Son of David.",
    "Mark": "Jesus the Servant who acts with power.",
    "Luke": "Jesus the Savior for all kinds of people.",
    "John": "Jesus the Son who reveals the Father.",
    "Acts": "The Spirit and the spreading church.",
    "Romans": "The gospel of God’s righteousness.",
    "1 Corinthians": "A church called back to love and order.",
    "2 Corinthians": "Weakness, comfort, and true ministry.",
    "Galatians": "Freedom in Christ, not by the law’s works.",
    "Ephesians": "The church as Christ’s body.",
    "Philippians": "Joy in the Lord from a prison letter.",
    "Colossians": "Christ above all.",
    "1 Thessalonians": "Hope and the coming of the Lord.",
    "2 Thessalonians": "Stand firm until He comes.",
    "1 Timothy": "Care for the household of God.",
    "2 Timothy": "Guard the good deposit.",
    "Titus": "Sound teaching that leads to good works.",
    "Philemon": "A runaway welcomed as a brother.",
    "Hebrews": "Jesus, better than all that came before.",
    "James": "Faith that works in real life.",
    "1 Peter": "Hope while you sojourn.",
    "2 Peter": "True knowledge versus false teachers.",
    "1 John": "That you may know you have life.",
    "2 John": "Walk in truth and love.",
    "3 John": "Welcome faithful workers.",
    "Jude": "Contend for the faith.",
    "Revelation": "The Lamb wins, and all things are made new.",
}

QUALITIES = [
    {"id": "love", "name": "Love", "minBand": "baby", "verseId": "1jn4-8",
     "note": "Love seeks the good of another. God loved us first."},
    {"id": "joy", "name": "Joy", "minBand": "baby", "verseId": "phil4-4",
     "note": "Joy is gladness in the Lord, not only when things go our way."},
    {"id": "peace", "name": "Peace", "minBand": "toddler", "verseId": "matt5-9",
     "note": "Peace is quiet trust, and peacemakers help others rest too."},
    {"id": "patience", "name": "Patience", "minBand": "preschool", "verseId": "gal5-22-23",
     "note": "Patience waits without snapping. Scripture also calls it longsuffering."},
    {"id": "kindness", "name": "Kindness", "minBand": "toddler", "verseId": "eph4-32",
     "note": "Kindness is tender help. Be kind, tenderhearted, and ready to forgive."},
    {"id": "goodness", "name": "Goodness", "minBand": "preschool", "verseId": "rom12-21",
     "note": "Goodness chooses what is right even when no one is watching."},
    {"id": "faith", "name": "Faith", "minBand": "early", "verseId": "prov3-5",
     "note": "Faith trusts the Lord with the whole heart and leans not on ourselves."},
    {"id": "gentleness", "name": "Gentleness", "minBand": "preschool", "verseId": "prov15-1",
     "note": "Gentleness is strength under control. A soft answer turns away wrath."},
    {"id": "self-control", "name": "Self-control", "minBand": "early", "verseId": "gal5-22-23",
     "note": "Self-control holds the tongue, the hands, and the wants."},
    {"id": "courage", "name": "Courage", "minBand": "preschool", "verseId": "josh1-9",
     "note": "Courage is not loudness. It is obeying God when you feel small."},
    {"id": "honesty", "name": "Honesty", "minBand": "early", "verseId": "jas1-22",
     "note": "Honesty tells the truth and keeps its word."},
    {"id": "humility", "name": "Humility", "minBand": "primary", "verseId": "mic6-8",
     "note": "Humility walks low before God and does not put others down."},
    {"id": "gratitude", "name": "Gratitude", "minBand": "toddler", "verseId": "ps136-1",
     "note": "Gratitude says thank you to God, because His mercy lasts."},
    {"id": "obedience", "name": "Obedience", "minBand": "toddler", "verseId": "eph6-1",
     "note": "Obedience is doing what is asked, as unto the Lord."},
    {"id": "mercy", "name": "Mercy", "minBand": "early", "verseId": "mic6-8",
     "note": "Mercy does not give the hurt someone earned. It stoops to help."},
    {"id": "wisdom", "name": "Wisdom", "minBand": "primary", "verseId": "prov3-5",
     "note": "Wisdom starts with trusting the Lord, then choosing the good path."},
    {"id": "diligence", "name": "Diligence", "minBand": "primary", "verseId": "col3-23",
     "note": "Diligence works heartily, as to the Lord, not only when watched."},
    {"id": "forgiveness", "name": "Forgiveness", "minBand": "early", "verseId": "eph4-32",
     "note": "Forgiveness lets go of a debt, as God in Christ forgave us."},
    {"id": "hope", "name": "Hope", "minBand": "preschool", "verseId": "rom8-28",
     "note": "Hope looks forward because God is faithful, even in hard days."},
    {"id": "reverence", "name": "Reverence", "minBand": "upper", "verseId": "rev4-11",
     "note": "Reverence honors God as worthy of glory, honor, and power."},
]


def ref_label(book, ch, start, end) -> str:
    if start == end:
        return f"{book} {ch}:{start}"
    return f"{book} {ch}:{start}-{end}"


def pick_blank(text: str, hint: str) -> str:
    words = re.findall(r"[A-Za-z']+", text)
    for w in words:
        if w.lower() == hint.lower() and len(w) > 2:
            return w
    # fallback: longest content word
    stop = {"the", "and", "for", "that", "unto", "shall", "not", "you", "your", "with", "from", "this", "are", "was"}
    cands = [w for w in words if w.lower() not in stop and len(w) > 3]
    return cands[min(2, len(cands) - 1)] if cands else (words[0] if words else hint)


def build_verses(bibles):
    verses = []
    for spec in VERSE_SPECS:
        vid, book, ch, start, end, min_band, blank, img = spec
        kjv = span_text(bibles, "kjv", book, ch, start, end)
        web = WEB_OVERRIDE.get(vid) or span_text(bibles, "web", book, ch, start, end)
        blank_word = pick_blank(kjv, blank)
        verses.append({
            "id": vid,
            "book": book,
            "chapter": ch,
            "start": start,
            "end": end,
            "ref": ref_label(book, ch, start, end),
            "kjv": kjv,
            "web": web,
            "minBand": min_band,
            "bands": from_band(min_band),
            "blank": blank_word,
            "img": img,
            "passage": start != end,
        })
    return verses


def build_books():
    books = []
    n = 0
    for group, testament, names in BOOK_GROUPS:
        for name in names:
            n += 1
            min_band = "baby"
            if n > 5:
                min_band = "toddler"
            if n > 9:
                min_band = "preschool"
            if testament == "OT" and n > 5:
                min_band = "early"
            if group in ("Major Prophets", "Minor Prophets", "Paul's Letters", "General Letters"):
                min_band = "primary"
            if name in ("Matthew", "Mark", "Luke", "John", "Acts", "Genesis", "Exodus", "Psalms", "Proverbs"):
                min_band = "preschool" if name not in ("Genesis", "Matthew", "Psalms") else "baby"
            if name in ("Genesis", "Matthew", "Psalms"):
                min_band = "baby"
            if name in ("Exodus", "Luke", "John", "Proverbs"):
                min_band = "toddler"
            books.append({
                "n": n,
                "name": name,
                "testament": testament,
                "group": group,
                "blurb": BOOK_BLURBS[name],
                "minBand": min_band,
                "bands": from_band(min_band),
            })
    return books


def available(item, band):
    return BANDS.index(band) >= BANDS.index(item["minBand"])


def write_json(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n")


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


def write_csv(path: Path, rows, fieldnames):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for row in rows:
            w.writerow(row)


def make_model(mid, name):
    return genanki.Model(
        mid,
        name,
        fields=[{"name": "Front"}, {"name": "Back"}, {"name": "Extra"}],
        templates=[{
            "name": "Card 1",
            "qfmt": '<div style="font-family:Georgia,serif;font-size:22px;text-align:center;color:#3d2a14">{{Front}}</div>',
            "afmt": '{{FrontSide}}<hr id="answer"><div style="font-family:Georgia,serif;font-size:20px;color:#3d2a14">{{Back}}</div><div style="margin-top:12px;color:#6b7c4a;font-size:14px">{{Extra}}</div>',
        }],
        css=".card { background: #f3ead6; }",
    )


def build_anki(verses, books, qualities, stories):
    DECKS.mkdir(parents=True, exist_ok=True)
    model = make_model(1605112001, "HS Bible Memory")
    deck_ids = {
        "baby": 1605112101,
        "toddler": 1605112102,
        "preschool": 1605112103,
        "early": 1605112104,
        "primary": 1605112105,
        "upper": 1605112106,
    }
    csv_rows = []
    note_id = 1605113000
    catalog = []
    for band in BANDS:
        deck = genanki.Deck(deck_ids[band], f"Homeschool::Bible::{BAND_LABELS[band]}")
        n_notes = 0
        def add(kind, front, back, extra):
            nonlocal note_id, n_notes
            assert_standalone(front, back)
            csv_rows.append({"band": band, "kind": kind, "front": front, "back": back, "extra": extra})
            deck.add_note(genanki.Note(model=model, fields=[front, back, extra], guid=str(note_id)))
            note_id += 1
            n_notes += 1
        # verses: ref -> text and text -> ref (reference is printed on the card)
        for v in verses:
            if not available(v, band):
                continue
            extra = f"KJV · {v['ref']}"
            add("verse-say", f"Say this verse: {v['ref']}", v["kjv"], extra)
            snippet = v["kjv"][:140] + ("…" if len(v["kjv"]) > 140 else "")
            add("verse-ref", f"What is the reference?\n“{snippet}”", v["ref"], "KJV")
        for b in books:
            if not available(b, band):
                continue
            if b["n"] == 1:
                front = "What is the first book of the Bible?"
            else:
                prev_name = books[b["n"] - 2]["name"]
                front = f"Which book comes after {prev_name}?"
            extra = f"{b['testament']} · {b['group']}"
            add("book-order", front, b["name"], extra)
            if band in ("primary", "upper"):
                add(
                    "book-group",
                    f"Name the testament and group for {b['name']}.",
                    f"{b['testament']} · {b['group']}\n{b['blurb']}",
                    str(b["n"]),
                )
        for q in qualities:
            if not available(q, band):
                continue
            v = next((x for x in verses if x["id"] == q["verseId"]), None)
            extra = v["ref"] + " — " + v["kjv"] if v else ""
            add("quality", f"What does the character quality “{q['name']}” look like?", q["note"], extra)
        if band in ("preschool", "early", "primary", "upper"):
            ordered = [s for s in stories if available(s, band)]
            for i, s in enumerate(ordered):
                if i == 0:
                    continue
                add(
                    "story-order",
                    f"Bible story order: what comes after “{ordered[i-1]['title']}”?",
                    s["title"],
                    s["ref"],
                )
        out = DECKS / f"bible-{band}.apkg"
        write_apkg(deck, out)
        verify_apkg(out, n_notes)
        catalog.append({
            "id": f"bible-{band}",
            "file": out.name,
            "csv": "cards.csv",
            "band": band,
            "cards": n_notes,
        })
        print("wrote", out, n_notes, "notes")
    write_csv(ROOT / "cards.csv", csv_rows, ["band", "kind", "front", "back", "extra"])
    (ROOT / "catalog.json").write_text(json.dumps({"decks": catalog}, indent=2) + "\n")
    print("wrote", ROOT / "cards.csv", "rows", len(csv_rows))
    print("catalog", ROOT / "catalog.json")


def main():
    extracted = ROOT / "verses-extracted.json"
    if (JSON_DIR / "kjv.json").exists():
        bibles = load_bibles()
        verses = build_verses(bibles)
    elif extracted.exists():
        verses = json.loads(extracted.read_text())
        print("rebuilding from", extracted)
    else:
        sys.exit("Need /tmp/biblejson/kjv.json and web.json, or verses-extracted.json")
    books = build_books()
    # Fix story verseIds that may not exist
    verse_ids = {v["id"] for v in verses}
    for s in STORIES:
        if s["verseId"] not in verse_ids:
            s["verseId"] = "ps23-1"
        s["bands"] = from_band(s["minBand"])
    for q in QUALITIES:
        q["bands"] = from_band(q["minBand"])
    payload = {
        "subject": "bible",
        "theme": "Shepherd's Hillside",
        "translationNote": "Scripture: King James Version (public domain) and World English Bible (public domain).",
        "bands": [{"id": b, "label": BAND_LABELS[b]} for b in BANDS],
        "images": {
            "hillside": "img/bible-hillside-hero.jpg",
            "sheep": "img/bible-sheep.jpg",
            "lantern": "img/bible-lantern.jpg",
            "stars": "img/bible-stars.jpg",
            "waters": "img/bible-waters.jpg",
            "olives": "img/bible-olives.jpg",
            "wheat": "img/bible-wheat.jpg",
        },
        "verses": verses,
        "stories": STORIES,
        "books": books,
        "qualities": QUALITIES,
    }
    write_json(ROOT / "verses-extracted.json", verses)
    write_json(APP / "data" / "content.json", payload)
    build_anki(verses, books, QUALITIES, STORIES)
    print("verses", len(verses), "stories", len(STORIES), "books", len(books), "qualities", len(QUALITIES))


if __name__ == "__main__":
    main()
