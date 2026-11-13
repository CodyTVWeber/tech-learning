#!/usr/bin/env python3
"""Original public-safe science Anki decks.

Lessons from the kit:
- Fronts must never contain the answer.
- Every card stands alone in text (no missing picture).
- .apkg zip timestamps are fixed so CI can treat CSV + note counts as source of truth.
"""
from __future__ import annotations

import csv
import hashlib
import json
import re
import sqlite3
import tempfile
import zipfile
from pathlib import Path

import genanki

ROOT = Path(__file__).resolve().parent
CSV_DIR = ROOT / "csv"
OUT = ROOT.parent / "science"
APP_DATA = ROOT.parents[1] / "apps" / "science" / "data"
STAMP = 1700000000.0
STOP = {
    "the", "a", "an", "of", "and", "or", "to", "is", "in", "on", "for", "vs",
    "with", "from", "that", "this", "as", "it", "are", "be", "by", "at", "its",
}

VISUAL_RX = re.compile(
    r"\b(this picture|this plate|this image|shown above|see the (photo|picture|plate|image)|"
    r"look at the (picture|photo|plate|image|drawing)|how many coins|"
    r"tap the|count the coins)\b",
    re.I,
)


def gid(s: str) -> int:
    h = hashlib.sha256(s.encode("utf-8")).hexdigest()
    return int(h[:8], 16) & 0x7FFFFFFF


MODEL = genanki.Model(
    gid("hs-science-field-notes-model-v2"),
    "Field Expedition Notes",
    fields=[{"name": "Prompt"}, {"name": "Answer"}, {"name": "AudioText"}, {"name": "Tags"}],
    templates=[
        {
            "name": "Card 1",
            "qfmt": "<div style='font-family:Georgia,serif;font-size:22px;line-height:1.35'>{{Prompt}}</div>",
            "afmt": "{{FrontSide}}<hr id='answer'>"
            "<div style='font-family:Georgia,serif;font-size:20px;line-height:1.4'>{{Answer}}</div>",
        }
    ],
    css="body { background:#f3ead3; color:#241c12; }",
)


def tokens(s: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", s.lower()))


def answer_key(back: str) -> str:
    return back.split(".")[0].split("(")[0].strip()


def front_leaks_answer(front: str, back: str) -> str | None:
    key = answer_key(back)
    f_seq = re.findall(r"[a-z0-9]+", front.lower())
    k_seq = re.findall(r"[a-z0-9]+", key.lower())
    if k_seq:
        n = len(k_seq)
        if any(f_seq[i : i + n] == k_seq for i in range(len(f_seq) - n + 1)):
            return "answer phrase on front: %r" % key
    significant = tokens(key) - STOP
    if len(significant) >= 2 and significant <= tokens(front):
        return "all answer tokens on front: %r" % key
    return None


def assert_card(front: str, back: str) -> None:
    if VISUAL_RX.search(front) or VISUAL_RX.search(back):
        raise SystemExit("card depends on a missing visual: %r" % front)
    leak = front_leaks_answer(front, back)
    if leak:
        raise SystemExit("front leaks answer (%s)\n  Q: %s\n  A: %s" % (leak, front, back))
    if len(front.strip()) < 12:
        raise SystemExit("front too short to stand alone: %r" % front)


def write_csv(name: str, rows: list[tuple[str, str, str, str]]) -> Path:
    CSV_DIR.mkdir(parents=True, exist_ok=True)
    path = CSV_DIR / f"{name}.csv"
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "prompt", "answer", "audio_text", "tags"])
        w.writeheader()
        for i, (front, back, extra, tags) in enumerate(rows, start=1):
            w.writerow(
                {
                    "id": f"{name}-{i}",
                    "prompt": front,
                    "answer": back,
                    "audio_text": extra or front,
                    "tags": tags,
                }
            )
    return path


def write_json(band: str, rows: list[tuple[str, str, str, str]]) -> None:
    APP_DATA.mkdir(parents=True, exist_ok=True)
    items = []
    for i, (front, back, extra, tags) in enumerate(rows, start=1):
        items.append(
            {
                "id": f"{band}-{i}",
                "prompt": front,
                "answer": back,
                "audioText": extra or front,
                "tags": tags.split(),
            }
        )
    (APP_DATA / f"{band}.json").write_text(
        json.dumps({"band": band, "subject": "science", "items": items}, indent=2) + "\n",
        encoding="utf-8",
    )


def verify_apkg(path: Path, expected: int) -> None:
    with zipfile.ZipFile(path) as z:
        name = "collection.anki21" if "collection.anki21" in z.namelist() else "collection.anki2"
        with tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False) as tmp:
            tmp.write(z.read(name))
            tmp_path = tmp.name
    n = sqlite3.connect(tmp_path).execute("select count(*) from notes").fetchone()[0]
    if n != expected:
        raise SystemExit("%s notes %s != %s" % (path.name, n, expected))


def build_deck(band: str, title: str, rows: list[tuple[str, str, str, str]]) -> dict:
    for front, back, extra, tags in rows:
        assert_card(front, back)
    write_csv(band, rows)
    write_json(band, rows)
    deck = genanki.Deck(gid("hs-science-deck-" + band), title)
    for i, (front, back, extra, tags) in enumerate(rows, start=1):
        deck.add_note(
            genanki.Note(
                model=MODEL,
                fields=[front, back, extra or front, tags],
                guid=genanki.guid_for("hs-science", band, str(i), front),
            )
        )
    OUT.mkdir(parents=True, exist_ok=True)
    apkg = OUT / f"science-{band}.apkg"
    genanki.Package(deck).write_to_file(str(apkg), timestamp=STAMP)
    verify_apkg(apkg, len(rows))
    print(band, len(rows), "cards")
    return {"id": "science-" + band, "file": apkg.name, "csv": "csv/%s.csv" % band, "cards": len(rows)}


def baby() -> list[tuple[str, str, str, str]]:
    return [
        ("What do we call the green part of a plant that catches sunlight?", "A leaf", "The green part that catches sunlight.", "baby plant"),
        ("What do we call the bright light God set to rule the day?", "The sun", "The bright daytime light.", "baby sky"),
        ("What falls from clouds and waters the ground?", "Rain", "Water falling from clouds.", "baby weather"),
        ("What flying animal has feathers and a beak?", "A bird", "Feathers and a beak.", "baby animal"),
        ("What water animal has fins and takes air with gills?", "A fish", "Fins and gills.", "baby animal"),
        ("What is a plant's bright, often scented face that bees visit?", "A flower", "The bright face of a plant.", "baby plant"),
        ("What small package can grow into a whole plant?", "A seed", "A baby plant with lunch packed inside.", "baby plant"),
        ("What lesser light shines at night besides the stars?", "The moon", "The night light.", "baby sky"),
        ("What do we call water gathered in the sky as a visible shape?", "A cloud", "Water in the sky.", "baby weather"),
        ("What do we call air that is moving?", "Wind", "Moving air.", "baby weather"),
        ("What tall plant has a trunk, branches, and many green catchers of light?", "A tree", "Trunk, branches, and green catchers.", "baby plant"),
        ("What pond animal hops and begins life as a tadpole?", "A frog", "A hopper that starts in water.", "baby animal"),
        ("What small garden visitor carries pollen from flower to flower?", "A bee", "A pollen carrier.", "baby animal"),
        ("Which body part is mainly for touching?", "A hand (and skin)", "Touch.", "baby body"),
        ("Which body part is mainly for seeing?", "An eye", "Sight.", "baby body"),
        ("Which body part is mainly for hearing?", "An ear", "Hearing.", "baby body"),
        ("Which body part is mainly for smelling?", "A nose", "Smell.", "baby body"),
        ("Which body parts help a person stand and walk?", "The feet", "Standing and walking.", "baby body"),
        ("What do we drink, and what also fills ponds?", "Water", "A gift to drink and a home for pond life.", "baby weather"),
        ("What tiny lights shine in the night sky?", "Stars", "Night lights. The heavens declare God's glory.", "baby sky"),
    ]


def toddler() -> list[tuple[str, str, str, str]]:
    rows = []
    for q, a, x, tag in [
        ("Which yard bird hops on grass and tugs worms with a thin bill?", "A robin", "Warm breast, thin bill.", "animal"),
        ("Which pond animal hops as an adult and starts life with gills?", "A frog", "Moist skin, then lungs.", "animal"),
        ("Which meadow flyer has wings tiled with tiny scales?", "A butterfly", "It was a caterpillar first.", "animal"),
        ("Which water kind uses gills and fins, not lungs and legs?", "A fish", "A water kind.", "animal"),
        ("Which garden helper packs pollen on its legs?", "A honeybee", "Flower and bee fit.", "animal"),
        ("Which soil tiller is a long segmented animal with no legs?", "An earthworm", "Tunnels let rain in.", "animal"),
        ("A light shaft with zipping vanes most likely came from which kind of animal?", "A bird", "A feather.", "animal"),
        ("A spiral mineral house on the tide line was grown by which animal?", "A snail", "Leave living ones on the shore.", "animal"),
        ("What gives daylight and warmth without us making a fire?", "The sun", "Do not stare at it.", "weather"),
        ("What falls from clouds and waters roots?", "Rain", "Drops that grew too heavy.", "weather"),
        ("What is frozen water grown in six-armed crystals?", "Snow", "Cold keeps the pattern.", "weather"),
        ("What do we call air that moves because land and water heat unevenly?", "Wind", "You can feel it.", "weather"),
        ("What do we call a visible heap, sheet, or thread of water in the sky?", "A cloud", "Look up, not at the sun.", "weather"),
        ("Which sense uses the eyes?", "Sight", "Light in.", "senses"),
        ("Which sense uses the ears?", "Hearing", "Sound waves.", "senses"),
        ("Which sense uses the nose?", "Smell", "It partners with taste.", "senses"),
        ("Which sense uses the tongue?", "Taste", "Sweet, sour, salty, bitter, savory.", "senses"),
        ("Which sense uses the skin?", "Touch", "Pressure, pain, temperature.", "senses"),
        ("What pump in the chest keeps a beat?", "The heart", "It moves blood.", "body"),
        ("What pair of organs takes in air when you breathe?", "The lungs", "Air in, air out.", "body"),
        ("What hard inner frame holds a body up?", "The skeleton (bones)", "They hold you up.", "body"),
        ("What do we chew food with?", "Teeth", "A wedge at work.", "body"),
        ("An oak's broad green catcher of light often has deep rounded cuts. What is that catcher called?", "A leaf (oak leaf)", "Later the tree may hold acorns.", "plant"),
        ("A maple's green catcher often looks like a hand with spreading veins. What is that shape called?", "A palmate (hand-like) leaf", "Veins like fingers from a palm.", "plant"),
        ("What small packed lunch can wake into a bean plant?", "A seed (bean)", "Baby plant plus food.", "plant"),
        ("A yellow head made of many tiny blossoms later sends riders on downy plumes. What plant is that?", "A dandelion", "Many tiny flowers in one head.", "plant"),
        ("Which trees keep needle-shaped catchers of light all year?", "Pines", "Needles lose less water.", "plant"),
        ("A robin has feathers, wings, and a beak. Which living kind is it?", "Bird", "Wings and feathers.", "kinds"),
        ("A trout belongs to which living kind?", "Fish", "Gills.", "kinds"),
        ("An oak belongs to which living kind?", "Plant", "Roots and green catchers of light.", "kinds"),
        ("A bee flies, but it is not a bird because it has no feathers. What kind of creeping flyer is it?", "An insect (creeping kind)", "After their kind.", "kinds"),
        ("God made living things to bring forth after their what?", "Kind", "Original field note, not class recitation.", "kinds"),
    ]:
        rows.append((q, a, x, "toddler " + tag))
    return rows


def preschool() -> list[tuple[str, str, str, str]]:
    rows = []
    for q, a, x, tag in [
        ("Stacked trees, shade, and a creek terrace make which habitat?", "A woodland / forest", "Homes in layers.", "habitat"),
        ("Open grass and wild bloom make which habitat?", "A meadow", "Bees at work.", "habitat"),
        ("Still water, lily pads, and hopping amphibians make which habitat?", "A pond", "Tadpoles here.", "habitat"),
        ("Beds, bean poles, and a kitchen path make which habitat?", "A garden", "We plant; the seed already holds a plan.", "habitat"),
        ("Tide line, empty spiral houses, and gulls make which habitat?", "A shore", "Land and water trade places.", "habitat"),
        ("A doorstep, shade tree, and feeder make which habitat?", "A yard", "A small expedition.", "habitat"),
        ("Moving water over stones is which habitat?", "A stream", "Some animals are built for current.", "habitat"),
        ("Heaped white piles and swallows belong to which habitat?", "The open sky", "A weather workshop.", "habitat"),
        ("Which plant part drinks from the soil and also anchors?", "The root", "Drinks and holds.", "plant"),
        ("Which plant part catches light to make food?", "The leaf", "A living light-catcher.", "plant"),
        ("Which plant part often invites a bee?", "The flower", "Lock and key with pollinators.", "plant"),
        ("Which plant part holds a baby plant and its lunch?", "The seed", "The plan is already in it.", "plant"),
        ("A stem's main jobs are to hold the plant up and to…", "Carry water (and food)", "Tubes inside.", "plant"),
        ("A green cushion on a damp stone, with no true tree-roots, is often…", "Moss", "It drinks through its body.", "plant"),
        ("Ferns make no blossoms. They raise dust-like…", "Spores", "On the underside of a frond.", "plant"),
        ("A see-saw is which simple machine?", "A lever", "Bar plus fulcrum.", "machine"),
        ("A slide is which simple machine?", "An inclined plane (ramp)", "Work spread over a longer path.", "machine"),
        ("A rolling wagon uses which simple machine pair?", "Wheel and axle", "When the wheel turns, the axle turns.", "machine"),
        ("An axe head is which simple machine?", "A wedge", "Two ramps back to back.", "machine"),
        ("A jar lid that holds tight with a twist is which simple machine?", "A screw", "A ramp wrapped around a post.", "machine"),
        ("A flag that rises when you pull down uses which simple machine?", "A pulley", "A wheel that holds a rope.", "machine"),
        ("Your jaw lifting a bite works like which simple machine?", "A lever", "Teeth are the load.", "machine"),
        ("A front tooth cutting food is which simple machine?", "A wedge", "Design in the body.", "machine"),
        ("A dense pebble in a bowl of water usually does what?", "Sinks", "Guess first, then try with a grown-up.", "matter"),
        ("A dry twig in a bowl of water often does what?", "Floats", "Shape and trapped air matter.", "matter"),
        ("Name the five senses.", "Sight, hearing, smell, taste, and touch", "Doorways to the world God made.", "senses"),
        ("A habitat is a living place that offers food, water, shelter, and a…", "Fitting home for its creatures", "Yard to woodland.", "habitat"),
        ("Where should a live frog stay after you look?", "At the pond", "Draw it; don't pocket it.", "kinds"),
        ("A naturalist writes the date, the place, and what else?", "What was truly seen", "True things, not guesses.", "journal"),
        ("Heaped fair-weather piles with flat bases are which cloud type?", "Cumulus", "Piles, not sheets.", "weather"),
        ("Rain starts when cloud drops grow too…", "Heavy", "Then they fall.", "weather"),
        ("Bees help many plants by moving what dust from flower to flower?", "Pollen", "Fruit may follow.", "plant"),
        ("A seed wakes with warmth and…", "Water", "The plan was already there.", "plant"),
        ("Birds, fish, and beasts bring forth after their…", "Kind", "Public-domain idea from Genesis wording.", "kinds"),
        ("The same great light that warms a meadow also drives which water story?", "The water cycle", "Heat lifts vapor.", "weather"),
    ]:
        rows.append((q, a, x, "preschool " + tag))
    return rows


def early() -> list[tuple[str, str, str, str]]:
    rows = []
    for q, a, x, tag in [
        ("Eyes gather light so a person can…", "See", "A lens bends light onto the retina.", "senses"),
        ("Ears catch what kind of waves?", "Sound waves", "Tiny bones pass the shake.", "senses"),
        ("Smell and taste often work how?", "Together", "Hold your nose during a safe food test with a grown-up.", "senses"),
        ("Besides sweet, sour, salty, and bitter, taste buds notice…", "Savory", "Much of 'flavor' is actually smell.", "senses"),
        ("Where do most touch sensors live?", "In the skin", "A designed covering.", "senses"),
        ("The organ of sight is the…", "Eye", "Parts fitted for seeing.", "senses"),
        ("The organ of hearing is the…", "Ear", "Outer, middle, inner.", "senses"),
        ("Skin helps by covering the body and sensing…", "Temperature (and pressure and pain)", "A boundary.", "senses"),
        ("The heart's job is to…", "Pump blood", "A pump with rooms.", "body"),
        ("Lungs are packed with air sacs so gases can…", "Trade with the blood", "Oxygen in.", "body"),
        ("Bones of the head and trunk make the midline…", "Frame (axial skeleton)", "Skull, spine, ribs.", "body"),
        ("You choose to move arm muscles. The heart's own muscle is called…", "Cardiac muscle", "It keeps a beat.", "body"),
        ("Swallowed food travels down a tube to the…", "Stomach", "Then to the intestines.", "body"),
        ("A pulse is the heartbeat felt in an…", "Artery", "Walk-lab curiosity, not a medical test.", "body"),
        ("Name the water cycle in four field words.", "Evaporate, travel (condense), fall, run", "Bag-on-window lab.", "weather"),
        ("Evaporation is liquid water becoming…", "Vapor", "Heat helps.", "weather"),
        ("Condensation is vapor becoming…", "Liquid drops", "Cloud beads.", "weather"),
        ("A stream carries water which way?", "Downhill toward larger water", "Gravity as a gift of order.", "weather"),
        ("Heaped piles of cloud are called…", "Cumulus", "Flat bases often.", "weather"),
        ("A low gray sheet of cloud is called…", "Stratus", "May drizzle.", "weather"),
        ("High ice threads of cloud are called…", "Cirrus", "A change may be coming.", "weather"),
        ("When you mark a stick's shade, you must not stare at the…", "Sun", "Mark the tip, wait, mark again.", "weather"),
        ("A lever needs a bar and a…", "Fulcrum", "Load versus effort.", "machine"),
        ("An inclined plane spreads lifting work over a…", "Longer path", "Ramp, hill, slide.", "machine"),
        ("A pulley can change the…", "Direction of a pull", "Pull down, load goes up.", "machine"),
        ("A screw is an inclined plane that has been…", "Wrapped around a post", "Jar lid, wood screw.", "machine"),
        ("A wedge is two ramps…", "Back to back", "Axe, doorstop, front tooth.", "machine"),
        ("In a wheel and axle, when the wheel turns, the axle…", "Turns with it", "Doorknob.", "machine"),
        ("Psalm 19:1 (KJV) says the heavens declare the glory of whom?", "God", "Public-domain verse. Look up and give thanks.", "creation"),
        ("Living things bring forth after their…", "Kind", "Birds, fish, beasts, creeping things, plants.", "creation"),
        ("A seed is a clue of design because it already carries…", "A plan / information for a plant", "The plan does not write itself.", "creation"),
        ("A naturalist thanks God for what kind of noticing?", "What is truly seen in the world He made", "Journal prompt.", "creation"),
        ("After you watch a live frog, where should it remain?", "At the pond", "Draw it.", "creation"),
        ("Job 12 (KJV) says to ask the beasts, and they shall…", "Teach thee", "Public-domain Scripture.", "creation"),
        ("Inside a bean you can find a baby plant and…", "Stored food", "Bag-seed lab.", "plant"),
        ("Colored tubes in celery show how a plant…", "Moves water (drinks)", "Dye-climb lab with a grown-up.", "plant"),
        ("A leaf's veins are roads for water and…", "Sugar (food)", "Look under a hand lens.", "plant"),
        ("Needle-shaped catchers of light lose less of what than broad catchers?", "Water", "Pine design for poor, cold soils.", "plant"),
    ]:
        rows.append((q, a, x, "early " + tag))
    return rows


def primary() -> list[tuple[str, str, str, str]]:
    rows = []
    for q, a, x, tag in [
        ("A tissue is a team of similar cells with one…", "Job", "Four kinds: cover, support, move, signal.", "anatomy"),
        ("Which tissue covers and lines?", "Epithelial tissue", "Skin surface and linings.", "anatomy"),
        ("Which tissue is built to contract and move?", "Muscle tissue", "Skeletal, smooth, cardiac.", "anatomy"),
        ("Which tissue carries messages?", "Nervous tissue", "Brain, cord, nerves.", "anatomy"),
        ("The axial skeleton includes the skull, spine, ribs, and…", "Sternum (breastbone)", "Head and trunk frame.", "anatomy"),
        ("Stacked backbone bones are called…", "Vertebrae", "They guard the spinal cord.", "anatomy"),
        ("Which muscle kind moves when you choose to pick up a rock?", "Skeletal muscle", "You decide.", "anatomy"),
        ("Which muscle kind lives in organ walls and works without a thought?", "Smooth muscle", "Stomach walls.", "anatomy"),
        ("Which muscle kind is found only in the heart?", "Cardiac muscle", "A never-resting beat.", "anatomy"),
        ("Three nervous parts we map are the brain, the spinal cord, and the…", "Nerves", "Desk and message roads.", "anatomy"),
        ("The tube that carries swallowed food to the stomach is the…", "Esophagus", "Not the windpipe.", "anatomy"),
        ("Most nutrient soaking happens in the…", "Small intestine", "A long workshop.", "anatomy"),
        ("Which organs filter blood and make urine?", "The kidneys", "Excretory trail.", "anatomy"),
        ("Ureters carry urine to the…", "Bladder", "A holding room.", "anatomy"),
        ("The heart pumps; vessels that go away from it are…", "Arteries", "Veins return.", "anatomy"),
        ("The tiniest vessels, where goods are traded, are…", "Capillaries", "Thin walls.", "anatomy"),
        ("Valves in the heart and some vessels exist to keep…", "One-way flow", "No backward river.", "anatomy"),
        ("Lymph nodes work like…", "Filter stations", "Quiet germ watch.", "anatomy"),
        ("The windpipe's other name is the…", "Trachea", "Air's path, not food's.", "anatomy"),
        ("The muscle floor under the lungs that helps you breathe is the…", "Diaphragm", "It moves as you inhale.", "anatomy"),
        ("Chemical messengers sent in the blood by glands are called…", "Hormones", "Endocrine system.", "anatomy"),
        ("Name three major jobs of blood.", "Carry oxygen, carry food bits, carry wastes", "Also: germ fight, clot, share heat.", "anatomy"),
        ("Which blood cells are especially for carrying oxygen?", "Red cells", "A major blood purpose.", "anatomy"),
        ("Name the five senses.", "Sight, hearing, smell, taste, touch", "Designed doorways.", "anatomy"),
        ("A solid keeps its…", "Shape", "Ice, rock, wood.", "matter"),
        ("A liquid takes the shape of its…", "Container", "Water in a jar.", "matter"),
        ("A gas spreads to fill…", "Its space", "Air in a bag.", "matter"),
        ("Ice, water, and steam are the same substance in different…", "States", "Heat moves it.", "matter"),
        ("Lemon juice is a household example of an…", "Acid", "Do not taste lab jars.", "matter"),
        ("Soap water leans toward being a…", "Base", "Slippery clue.", "matter"),
        ("A vinegar and baking-soda fizz shows an acid meeting a…", "Base", "Carbon dioxide gas. Adult required. Open jar.", "matter"),
        ("A food chain starts with a plant that catches…", "Light", "Design in provision.", "nature"),
        ("A habitat must offer food, water, shelter, and a…", "Fitting place", "Yard to woodland.", "nature"),
        ("Buried leftovers of life in stone are called…", "Fossils", "Records, not toys.", "nature"),
        ("Tree rings can record seasons of…", "Growth", "A quiet history.", "nature"),
        ("The water cycle is powered largely by the…", "Sun", "Evaporate, condense, fall, run.", "nature"),
        ("Simple machines do not make energy from nothing; they change how…", "Work is applied", "Direction, distance, force.", "nature"),
        ("Celery tubes carrying dye are a picture of how plants…", "Move water", "Home lab with a grown-up.", "nature"),
        ("A seed's baby plant plus packed lunch is a clue that a… already exists.", "Plan", "The plan does not write itself.", "nature"),
        ("Oak from oak and robin from robin is reproduction after a creature's…", "Kind", "Public-domain idea, original wording.", "creation"),
        ("Psalm 19 points a naturalist to look up and see whose glory in the sky?", "God's", "KJV public domain.", "creation"),
        ("A good field journal records date, place, true observations, and…", "Questions", "No made-up grades.", "journal"),
        ("Under a hand lens, a leaf's edge and veins help you study…", "What is truly there, not what you guessed", "Draw one small square.", "nature"),
    ]:
        rows.append((q, a, x, "primary " + tag))
    return rows


def upper() -> list[tuple[str, str, str, str]]:
    rows = []
    for q, a, x, tag in [
        ("Atomic number counts which particles in the nucleus?", "Protons", "That count names the element.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 1?", "Hydrogen (H)", "Mass about 1.008. Lightest element.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 2?", "Helium (He)", "Mass about 4.003.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 3?", "Lithium (Li)", "Mass about 6.94.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 4?", "Beryllium (Be)", "Mass about 9.012.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 5?", "Boron (B)", "Mass about 10.81.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 6?", "Carbon (C)", "Mass about 12.011. Skeleton of living chemistry.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 7?", "Nitrogen (N)", "Mass about 14.007.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 8?", "Oxygen (O)", "Mass about 15.999. Breath gas.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 9?", "Fluorine (F)", "Mass about 18.998.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 10?", "Neon (Ne)", "Mass about 20.180.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 11?", "Sodium (Na)", "Na remembers an older name, natrium. Mass about 22.990.", "chemistry"),
        ("What is the name and symbol of the element with atomic number 12?", "Magnesium (Mg)", "Mass about 24.305.", "chemistry"),
        ("An element is a substance made of only one kind of…", "Atom", "Gold is only gold atoms.", "chemistry"),
        ("Water is not an element because it joins hydrogen with…", "Oxygen", "A compound.", "chemistry"),
        ("The chart that lists elements by proton count is the…", "Periodic table", "Public chart facts.", "chemistry"),
        ("Protons live in the atom's…", "Nucleus", "Plus charge.", "chemistry"),
        ("Neutrons have what electric charge?", "None (zero)", "Nucleus partners.", "chemistry"),
        ("Electrons have what kind of electric charge?", "Minus (negative)", "Outer region of the atom.", "chemistry"),
        ("Most of an atom's mass sits in the tiny…", "Nucleus", "The outer region is mostly empty.", "chemistry"),
        ("If an atom has eight protons, which element is it?", "Oxygen", "Atomic number eight.", "chemistry"),
        ("Changing the proton count means you have a different…", "Element", "Not just a weather change.", "chemistry"),
        ("Acids donate hydrogen ions. Safe foods in that family often taste…", "Sour", "Lemon. Never taste lab chemicals.", "chemistry"),
        ("Bases accept hydrogen ions. Household soap water often feels…", "Slippery", "Adult labs only.", "chemistry"),
        ("A pH near seven is close to…", "Water (neither strong acid nor strong base)", "Scale of acidity.", "chemistry"),
        ("Vinegar plus baking soda makes which gas?", "Carbon dioxide", "Open jar, tray, grown-up.", "chemistry"),
        ("Sodium's symbol is Na because of the older name…", "Natrium", "Public history of the table.", "chemistry"),
        ("Carbon's special place in living chemistry is that it forms the… of many life molecules.", "Backbone (chain)", "Element six.", "chemistry"),
        ("Name the four tissue types.", "Epithelial, connective, muscle, nervous", "Cover, support, move, signal.", "anatomy"),
        ("Connective tissue's broad job is to support and…", "Connect", "Bone and blood sit in this family.", "anatomy"),
        ("Arms and legs belong to which skeleton division, not the midline frame?", "Appendicular", "Axial is skull, spine, ribs, sternum.", "anatomy"),
        ("The breastbone's other name is the…", "Sternum", "Ribs meet it.", "anatomy"),
        ("Name the three kinds of muscle.", "Skeletal, smooth, cardiac", "Choose / organ / heart.", "anatomy"),
        ("Brain and spinal cord together are the central… of the nervous system.", "Desk (center)", "Nerves are the roads.", "anatomy"),
        ("After the stomach, food's path is the small intestine, then the…", "Large intestine", "Helpers: liver, pancreas, gallbladder.", "anatomy"),
        ("Name the four urinary parts we map.", "Kidneys, ureters, bladder, urethra", "Filter, pipes, room, exit.", "anatomy"),
        ("Name six circulatory field parts we map.", "Heart, arteries, veins, capillaries, blood, valves", "Original list, not class recitation.", "anatomy"),
        ("Name four lymph parts we map.", "Lymph fluid, vessels, nodes, spleen", "Return and filter.", "anatomy"),
        ("Nose or mouth, throat, voice box, windpipe, then bronchi: the path ends in which pair of organs?", "The lungs", "The diaphragm helps.", "anatomy"),
        ("Endocrine glands send chemical messengers called…", "Hormones", "The pituitary in the head is a chief messenger gland.", "anatomy"),
        ("Name three major purposes of blood.", "Carry oxygen, carry nutrients, carry wastes", "Also germ fight, clot, heat.", "anatomy"),
        ("The back wall of the eye where a picture lands is the…", "Retina", "Design for seeing.", "anatomy"),
        ("Psalm 19:1 KJV: The heavens declare the glory of God; and the firmament sheweth his…", "Handywork", "Verse only — no class commentary.", "creation"),
        ("As a story of origins, evolution-without-a-designer relies on unguided natural steps making new…", "Kinds of life", "Field variation is not the same proof.", "creation"),
        ("We do observe that living things vary, and that some traits help them…", "Live", "Keep observations and confession both.", "creation"),
        ("Observing variation is not the same as proving that all life…", "Made itself", "Original careful wording.", "creation"),
        ("Intelligent design, in these notes, is the claim that fitted purpose points to a…", "Mind (God the Maker)", "Eye, wing, seed information.", "creation"),
        ("A seed carrying a plan is a clue of…", "Design (information)", "The plan does not write itself.", "creation"),
        ("Name four ways earth's history is preserved.", "Fossils, tree rings, ice layers, stacked rock (also written records)", "Study with care beside Scripture.", "creation"),
        ("A fossil typically records that real plants or animals were…", "Buried", "A gift to look at.", "creation"),
        ("Natural selection describes how traits already in a kind may become more… if they fit a place.", "Common", "Beetle shells, not oak-from-fish.", "creation"),
        ("Selection by itself does not write a brand-new… from scratch.", "Kind", "Bounce within a kind.", "creation"),
        ("Adaptation within a kind is part of the living world's built-in…", "Bounce (variation God allowed)", "God made living things able to vary.", "creation"),
        ("Genesis 1:21 KJV says God created water creatures and birds after their…", "Kind", "Public-domain Scripture.", "creation"),
        ("Job 12:9 KJV: Who knoweth not in all these that the hand of the LORD hath…", "Wrought this", "Ask the beasts; they teach.", "creation"),
        ("A naturalist's posture in this expedition is to look carefully, write truly, and…", "Give thanks", "Stars are stamps, not grades.", "creation"),
        ("Timescale debates among Christians are real; the records themselves are…", "Gifts to study", "Fossils, ice, rings, words.", "creation"),
        ("An eye's parts fit a purpose. That purpose is…", "Seeing", "Lookout notes.", "creation"),
    ]:
        rows.append((q, a, x, "upper " + tag))
    return rows


def main() -> None:
    decks = [
        ("baby", "Field Expedition :: Nest (Baby)", baby()),
        ("toddler", "Field Expedition :: Meadow (Toddler)", toddler()),
        ("preschool", "Field Expedition :: Garden Path (Preschool)", preschool()),
        ("early", "Field Expedition :: Creek Trail (Early)", early()),
        ("primary", "Field Expedition :: Ridge (Primary)", primary()),
        ("upper", "Field Expedition :: Summit Lab (Upper)", upper()),
    ]
    catalog = []
    all_rows: list[tuple[str, str, str, str]] = []
    for band, title, rows in decks:
        tagged = [(a, b, c, (d + " " + band).strip()) for a, b, c, d in rows]
        catalog.append(build_deck(band, title, tagged))
        all_rows.extend(tagged)
    write_csv("all", all_rows)
    deck = genanki.Deck(gid("hs-science-deck-all"), "Field Expedition :: Science (all bands)")
    for i, (front, back, extra, tags) in enumerate(all_rows, start=1):
        assert_card(front, back)
        deck.add_note(
            genanki.Note(
                model=MODEL,
                fields=[front, back, extra or front, tags],
                guid=genanki.guid_for("hs-science", "all", str(i), front),
            )
        )
    OUT.mkdir(parents=True, exist_ok=True)
    apkg = OUT / "science-all.apkg"
    genanki.Package(deck).write_to_file(str(apkg), timestamp=STAMP)
    verify_apkg(apkg, len(all_rows))
    catalog.append({"id": "science-all", "file": "science-all.apkg", "csv": "csv/all.csv", "cards": len(all_rows)})
    (OUT / "catalog.json").write_text(json.dumps({"decks": catalog, "apkgTimestamp": STAMP}, indent=2) + "\n")
    print("all", len(all_rows))


if __name__ == "__main__":
    main()
