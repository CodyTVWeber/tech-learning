#!/usr/bin/env python3
"""Write original Treasure Voyage lesson JSON (unique items, no CC text)."""
from __future__ import annotations

import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "homeschool" / "apps" / "math" / "data"
ALL_IDS: set[str] = set()


def ch(ans, extra, salt):
    opts = []
    seen = set()
    for v in [ans] + list(extra):
        s = str(v)
        if s in seen:
            continue
        seen.add(s)
        opts.append(s)
    rng = random.Random(salt)
    rng.shuffle(opts)
    if str(ans) not in opts:
        opts[0] = str(ans)
        rng.shuffle(opts)
    if len(opts) < 3:
        n = 1
        while len(opts) < 3:
            cand = str(n)
            n += 1
            if cand not in seen:
                opts.append(cand)
                seen.add(cand)
    return opts[:4] if len(opts) > 3 else opts


def item(iid, island, prompt, answer, extra, **kw):
    audio = kw.pop("audioText", prompt)
    kind = kw.pop("kind", "choice")
    out = {
        "id": iid,
        "island": island,
        "kind": kind,
        "prompt": prompt,
        "audioText": audio,
        "answer": str(answer),
        "choices": ch(answer, extra, iid),
        "tags": ["math", kw.pop("band", ""), island],
    }
    out.update(kw)
    return {k: v for k, v in out.items() if v is not None}


def dump(band, payload):
    ids = [it["id"] for it in payload["items"]]
    if len(ids) != len(set(ids)):
        raise SystemExit("duplicate id in %s" % band)
    clash = ALL_IDS.intersection(ids)
    if clash:
        raise SystemExit("id clash with other bands: %s" % sorted(clash))
    for it in payload["items"]:
        if it.get("kind", "choice") not in ("choice", "word"):
            continue
        bare = str(it["answer"]).replace("$", "").replace("%", "").strip()
        if bare.replace(".", "", 1).isdigit():
            it["kind"] = "product"
            it.setdefault("teach", "The answer is %s." % it["answer"])
        else:
            raise SystemExit("quiz-only item left: %s answer %r" % (it["id"], it["answer"]))
    by_island = {}
    for it in payload["items"]:
        by_island.setdefault(it["island"], set()).add(it.get("kind") or "choice")
    for isl in payload["islands"]:
        kinds = by_island.get(isl["id"], set())
        if not kinds or kinds <= {"choice"}:
            raise SystemExit("%s island %s is still quiz-only: %s" % (band, isl["id"], sorted(kinds)))
    ALL_IDS.update(ids)
    keys = []
    for it in payload["items"]:
        key = (it["prompt"], str(it.get("count", "")), str(it["answer"]))
        keys.append((key, it["id"]))
    seen = {}
    for key, iid in keys:
        if key in seen:
            raise SystemExit("duplicate pair %s / %s in %s: %r" % (seen[key], iid, band, key))
        seen[key] = iid
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / ("%s.json" % band)).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    print("wrote %s (%d items, %d islands)" % (band, len(payload["items"]), len(payload["islands"])))


def baby():
    islands = [
        {
            "id": "tide",
            "slot": "island-count",
            "label": "Soft Tide",
            "crew": "pip",
            "chest": "A warm brass coin",
            "technique": {
                "title": "Tap and hear",
                "body": "Hold the little sailor. Tap each coin. Hear one number for each tap. No rush.",
                "audioText": "Tap each coin. Hear one number for each tap.",
            },
            "paper": [{"prompt": "With a grown-up, draw one round coin. Point to it and say one."}],
        },
        {
            "id": "peek",
            "slot": "chest",
            "label": "Peek Chest",
            "crew": "kit",
            "chest": "A tiny latch",
            "technique": {
                "title": "Open, then look",
                "body": "Tap the chest. When it opens, point to each coin you see.",
                "audioText": "Tap the chest. Point to each coin you see.",
            },
            "paper": [{"prompt": "Draw a closed chest. Then draw it open with 2 coins."}],
        },
        {
            "id": "rock",
            "slot": "hero",
            "label": "Rock the Hull",
            "crew": "wren",
            "chest": "A smooth pebble from the deck",
            "technique": {
                "title": "Tap to rock",
                "body": "Tap the ship. Hear the wood creak and the water splash. Three taps finish the care voyage.",
                "audioText": "Tap the ship. Hear the wood and the water.",
            },
            "paper": [{"prompt": "Sway together three times. Count the sways out loud."}],
        },
    ]
    items = [
        item("b-tide-1", "tide", "Tap the coin. How many?", 1, [2, 3], kind="tap", count=1, band="baby"),
        item("b-tide-2", "tide", "Tap each coin. How many now?", 2, [1, 3], kind="tap", count=2, band="baby"),
        item("b-tide-3", "tide", "Three taps. How many coins?", 3, [2, 4], kind="tap", count=3, band="baby"),
        item("b-peek-1", "peek", "Open the chest. How many coins inside?", 1, [2, 3], kind="peek", count=1, band="baby"),
        item("b-peek-2", "peek", "The latch pops. How many coins in this chest?", 2, [1, 3], kind="peek", count=2, band="baby"),
        item("b-rock-1", "rock", "Rock the hull. How many creaks to finish?", 3, [1, 2], kind="rock", count=3, band="baby"),
    ]
    dump(
        "baby",
        {
            "band": "baby",
            "title": "Care voyage",
            "intro": {
                "body": "A quiet sail. Tap, hear, and rock. No rush. Untested, awaiting parent test.",
                "audioText": "A quiet sail. Tap the coins and hear the numbers.",
            },
            "islands": islands,
            "items": items,
        },
    )


def toddler():
    islands = [
        {
            "id": "count",
            "slot": "island-count",
            "label": "Coin Cay",
            "crew": "pip",
            "chest": "Five stamped coins",
            "technique": {
                "title": "Point and say",
                "body": "Point to each coin. Say one number for each. The last number you say is how many.",
                "audioText": "Point to each coin. Say one number for each. The last number you say is how many.",
            },
            "paper": [
                {"prompt": "Draw 3 coins. Write the number."},
                {"prompt": "Draw 5 coins. Write the number."},
            ],
        },
        {
            "id": "sense",
            "slot": "island-sense",
            "label": "More Shoal",
            "crew": "reed",
            "chest": "A heavier pouch",
            "technique": {
                "title": "Look which pile is more",
                "body": "Look at both piles. The pile with more coins is the bigger group. Same means they match.",
                "audioText": "Look at both piles. Which has more coins? Same means they match.",
            },
            "paper": [
                {"prompt": "Draw 4 coins and 2 coins. Circle the pile that has more."},
                {"prompt": "Draw two piles of 3. Write same."},
            ],
        },
        {
            "id": "next",
            "slot": "island-add",
            "label": "One-More Reef",
            "crew": "moss",
            "chest": "A spare coil of rope",
            "technique": {
                "title": "One more, one less",
                "body": "One more means add one coin. One less means take one coin away.",
                "audioText": "One more means add one coin. One less means take one coin away.",
            },
            "paper": [
                {"prompt": "Draw 4 coins. Draw one more. Write the new number."},
                {"prompt": "Draw 3 coins. Cross one out. Write how many are left."},
            ],
        },
        {
            "id": "match",
            "slot": "island-place",
            "label": "Match Key",
            "crew": "nell",
            "chest": "A number stamp",
            "technique": {
                "title": "Match the number to the coins",
                "body": "Count the coins. Find the number that matches that count.",
                "audioText": "Count the coins. Find the number that matches.",
            },
            "paper": [
                {"prompt": "Write 1, 2, 3, 4, 5. Draw that many coins under each."},
            ],
        },
    ]
    items = [
        item("t-c1", "count", "Tap the coin. How many?", 1, [2, 3], kind="tap", count=1, band="toddler",
             teach="Tap the coin. Hear one. One coin."),
        item("t-c2", "count", "Tap each coin. How many?", 2, [1, 3], kind="tap", count=2, band="toddler",
             teach="Tap each coin. Two coins."),
        item("t-c3", "count", "Tap each coin. How many now?", 3, [2, 4], kind="tap", count=3, band="toddler",
             teach="Three taps, three coins."),
        item("t-c4", "count", "Tap every coin in this pile. How many?", 4, [3, 5], kind="tap", count=4, band="toddler",
             teach="Four coins. The last number you say is 4."),
        item("t-c5", "count", "Tap all five coins. How many?", 5, [3, 4], kind="tap", count=5, band="toddler",
             teach="Five coins. One for each tap."),
        item("t-more-41", "sense", "Which pile has more coins?", 4, [1, 2], kind="piles", left=4, right=1, ask="more", band="toddler",
             audioText="Left pile has four. Right pile has one. Which pile has more?"),
        item("t-more-25", "sense", "Which pile has more coins this time?", 5, [2, 3], kind="piles", left=2, right=5, ask="more", band="toddler",
             audioText="Left pile has two. Right pile has five. Which pile has more?"),
        item("t-few-31", "sense", "Which pile has fewer coins?", 1, [3, 2], kind="piles", left=3, right=1, ask="fewer", band="toddler",
             audioText="Left pile has three. Right pile has one. Which pile has fewer?"),
        item("t-same-22", "sense", "Do these piles match, or is one more?", "same", ["more", "fewer"], kind="piles", left=2, right=2, ask="same", band="toddler",
             audioText="Two coins and two coins. Do they match?"),
        item("t-next-1", "next", "Tap one more coin.", 2, [1, 3], kind="moreone", count=1, band="toddler", audioText="One more than 1.",
             teach="One coin, and one more, is 2."),
        item("t-next-3", "next", "Tap one more coin.", 4, [3, 5], kind="moreone", count=3, band="toddler", audioText="One more than 3.",
             teach="Three coins, and one more, is 4."),
        item("t-next-4", "next", "Tap one more coin.", 5, [3, 4], kind="moreone", count=4, band="toddler", audioText="One more than 4.",
             teach="Four coins, and one more, is 5."),
        item("t-less-5", "next", "Tap one coin to take away.", 4, [3, 5], kind="lessone", count=5, band="toddler", audioText="One less than 5.",
             teach="Five coins, take one away, is 4."),
        item("t-less-2", "next", "Tap one coin to take away.", 1, [2, 3], kind="lessone", count=2, band="toddler", audioText="One less than 2.",
             teach="Two coins, take one away, is 1."),
        item("t-match-1", "match", "Count, then pick the matching number.", 1, [2, 4], kind="tap", count=1, band="toddler",
             teach="One coin matches the number 1."),
        item("t-match-3", "match", "These coins match which number?", 3, [2, 5], kind="tap", count=3, band="toddler",
             teach="Three coins. The matching number is 3."),
        item("t-match-5", "match", "Stamp the number that matches this pile.", 5, [1, 4], kind="tap", count=5, band="toddler",
             teach="Five coins. The matching number is 5."),
    ]
    dump(
        "toddler",
        {
            "band": "toddler",
            "title": "Count the coins",
            "intro": {
                "body": "Sail Coin Cay, then More Shoal. Point, say, and match. Untested, awaiting parent test.",
                "audioText": "Point to each coin. The last number you say is how many.",
            },
            "islands": islands,
            "items": items,
        },
    )


def preschool():
    islands = [
        {
            "id": "count",
            "slot": "island-count",
            "label": "Ten-Coin Cay",
            "crew": "pip",
            "chest": "A ten-frame crate",
            "technique": {
                "title": "Fill a ten-frame",
                "body": "A ten-frame is two rows of five. Drop coins into the cells. Ten fills the crate. Empty cells are what is left to ten.",
                "audioText": "A ten-frame is two rows of five. Drop coins into the cells. Ten fills the crate.",
            },
            "paper": [{"prompt": "Draw a ten-frame. Fill 8. How many empty?"}, {"prompt": "Write 6, 7, 8, 9, 10 and draw coins."}],
        },
        {
            "id": "bond",
            "slot": "island-add",
            "label": "Bond Bay",
            "crew": "reed",
            "chest": "A pair of dock ropes",
            "technique": {
                "title": "Count on",
                "body": "Hold the bigger number in your head. Count on one for each extra coin.",
                "audioText": "Hold the bigger number in your head. Count on for each extra coin.",
            },
            "paper": [{"prompt": "7 + 3 =     (count on from 7)"}, {"prompt": "4 + 6 ="}, {"prompt": "Draw 5 + 5 as two piles."}],
        },
        {
            "id": "sense",
            "slot": "island-sense",
            "label": "Before-After Spit",
            "crew": "moss",
            "chest": "A numbered flag",
            "technique": {
                "title": "Before, after, bigger",
                "body": "After a number is one more. Before is one less. Bigger means farther along the count.",
                "audioText": "After a number is one more. Before is one less.",
            },
            "paper": [{"prompt": "Write the number before 8 and the number after 8."}, {"prompt": "Circle the bigger number: 6 or 9."}],
        },
        {
            "id": "shape",
            "slot": "island-shape",
            "label": "Shape Atoll",
            "crew": "cal",
            "chest": "A round porthole lid",
            "technique": {
                "title": "Name the outline",
                "body": "A circle is round. A square has four equal sides. A triangle has three sides.",
                "audioText": "A circle is round. A square has four equal sides. A triangle has three sides.",
            },
            "paper": [{"prompt": "Draw a circle, a square, and a triangle. Label each."}],
        },
        {
            "id": "skip",
            "slot": "island-skip",
            "label": "Pair Wake",
            "crew": "nell",
            "chest": "Two coins on a string",
            "technique": {
                "title": "Count by twos",
                "body": "Pair the coins. Skip 2, 4, 6, 8, 10.",
                "audioText": "Pair the coins. Count by twos: 2, 4, 6, 8, 10.",
            },
            "paper": [{"prompt": "Write 2, 4, 6, 8, 10. Draw pairs under each."}],
        },
    ]
    items = [
        item("s-c6", "count", "Drop 6 coins in the ten-frame. How many are filled?", 6, [5, 7],
             kind="tenframe", fill=6, count=6, ask="fill", band="preschool",
             teach="A ten-frame holds 10. Six coins fill 6 cells. Four stay empty."),
        item("s-c7", "count", "Drop 7 coins in the ten-frame. How many are filled?", 7, [6, 8],
             kind="tenframe", fill=7, count=7, ask="fill", band="preschool",
             teach="Seven coins fill 7 cells of the ten-frame. Three stay empty."),
        item("s-c8", "count", "Fill the ten-frame with 8 coins. How many empty?", 2, [1, 3],
             kind="tenframe", fill=8, count=8, ask="empty", band="preschool",
             teach="A ten-frame holds 10. Eight coins leave 2 empty."),
        item("s-c9", "count", "Fill the ten-frame with 9 coins. How many empty?", 1, [0, 2],
             kind="tenframe", fill=9, count=9, ask="empty", band="preschool",
             teach="Nine coins leave 1 empty cell in the ten-frame."),
        item("s-c10", "count", "Fill every cell. How many coins in a full ten-frame?", 10, [8, 9],
             kind="tenframe", fill=10, count=10, ask="fill", band="preschool",
             teach="Two rows of five. Ten cells, ten coins. Nothing empty."),
        item("s-b32", "bond", "Hold 3. Count on 2 more. How many?", 5, [4, 6], kind="counton",
             hold=3, add=2, left=3, right=2, count=5, band="preschool",
             teach="Start at 3. Count on: 4, 5."),
        item("s-b43", "bond", "Hold 4. Count on 3 more. How many?", 7, [6, 8], kind="counton",
             hold=4, add=3, left=4, right=3, count=7, band="preschool",
             teach="Start at 4. Count on: 5, 6, 7."),
        item("s-b64", "bond", "Hold 6. Count on 4 more. How many?", 10, [9, 11], kind="counton",
             hold=6, add=4, left=6, right=4, count=10, band="preschool",
             teach="Start at 6. Count on: 7, 8, 9, 10. That fills a ten."),
        item("s-b55", "bond", "Hold 5. Count on 5 more. How many?", 10, [8, 12], kind="counton",
             hold=5, add=5, left=5, right=5, count=10, band="preschool",
             teach="Start at 5. Count on five: 6, 7, 8, 9, 10."),
        item("s-b72", "bond", "Hold 7. Count on 2 more. How many?", 9, [8, 10], kind="counton",
             hold=7, add=2, left=7, right=2, count=9, band="preschool",
             teach="Start at 7. Count on: 8, 9."),
        item("s-b19", "bond", "Hold 1. Count on 9 more. How many?", 10, [9, 11], kind="counton",
             hold=1, add=9, left=1, right=9, count=10, band="preschool",
             teach="Start at 1. Count on nine times to land on 10."),
        item("s-after6", "sense", "Six coins. Tap one more.", 7, [5, 8], kind="moreone", count=6, band="preschool",
             teach="One more than 6 is 7."),
        item("s-before10", "sense", "Ten coins. Tap one to take away.", 9, [8, 11], kind="lessone", count=10, band="preschool",
             teach="One less than 10 is 9."),
        item("s-big", "sense", "Tap the pile with more coins.", 9, [4, 5], kind="piles", left=4, right=9, ask="more", band="preschool",
             teach="9 is more than 4."),
        item("s-small", "sense", "Tap the pile with fewer coins.", 3, [8, 5], kind="piles", left=8, right=3, ask="fewer", band="preschool",
             teach="3 is fewer than 8."),
        item("s-sh-circle", "shape", "Tap the round porthole.", "circle", ["square", "triangle"], band="preschool",
             kind="shapepick", options=["circle", "square", "triangle"],
             audioText="Tap the round porthole.",
             teach="A circle is round, like a porthole. No corners."),
        item("s-sh-square", "shape", "Tap the shape with four equal sides.", "square", ["circle", "triangle"], band="preschool",
             kind="shapepick", options=["square", "circle", "triangle"],
             teach="A square has four equal sides and four square corners."),
        item("s-sh-tri", "shape", "Tap the shape with three sides.", "triangle", ["circle", "square"], band="preschool",
             kind="shapepick", options=["triangle", "circle", "square"],
             teach="A triangle has three sides and three corners."),
        item("s-sk-2", "skip", "2, 4, 6, 8. What comes next?", 10, [9, 12], kind="skip", seq=[2, 4, 6, 8], band="preschool"),
        item("s-sk-4", "skip", "Count by twos: 4, 6, 8. Next?", 10, [9, 12], kind="skip", seq=[4, 6, 8], band="preschool"),
        item("s-sk-pairs", "skip", "Tap 5 pairs. Two rows of 5.", 10, [5, 8], kind="array", rows=2, cols=5, band="preschool",
             audioText="Five pairs of coins. Tap the grid.", teach="5 pairs is 2 rows of 5, which is 10."),
    ]
    dump(
        "preschool",
        {
            "band": "preschool",
            "title": "Make ten",
            "intro": {
                "body": "Fill crates to ten, count on, and spot shapes. Then finish on paper.",
                "audioText": "Hold the bigger number. Count on for each extra coin. Ten fills a crate.",
            },
            "islands": islands,
            "items": items,
        },
    )


def early():
    islands = [
        {
            "id": "facts",
            "slot": "island-add",
            "label": "Fact Dock",
            "crew": "pip",
            "chest": "A tally slate",
            "technique": {
                "title": "Use what you know",
                "body": "Doubles, plus one, and make-ten help you add and subtract within 20 without counting every coin.",
                "audioText": "Doubles, plus one, and make ten help you add and subtract.",
            },
            "paper": [
                {"prompt": "Write the doubles from 1+1 to 10+10."},
                {"prompt": "8 + 5  (make 10, then add the rest)"},
                {"prompt": "14 − 6 ="},
            ],
        },
        {
            "id": "place",
            "slot": "island-place",
            "label": "Ten Crates",
            "crew": "reed",
            "chest": "A crate stamped 10",
            "technique": {
                "title": "Tens and ones",
                "body": "Tap ten loose coins, then bundle them into a ten-crate. 3 tens and 4 ones is 34, not 43.",
                "audioText": "Tap ten loose coins, then bundle them into a ten crate. Three tens and four ones is thirty-four.",
            },
            "paper": [{"prompt": "Draw 4 tens and 7 ones. Write the number."}, {"prompt": "3 tens + 12 ones =  ?"}],
        },
        {
            "id": "regroup",
            "slot": "island-add",
            "label": "Bundle Dock",
            "crew": "moss",
            "chest": "A spare ten strap",
            "technique": {
                "title": "Make a ten, then add",
                "body": "If the ones make ten or more, bundle ten ones into a ten-crate. Write the extra ones. Then add the tens. To subtract, unbundle a ten if ones are too small.",
                "audioText": "If the ones make ten or more, bundle ten ones into a ten crate. Then add the tens.",
            },
            "paper": [{"prompt": "58 + 7. Show the bundled ten."}, {"prompt": "42 − 9. Show the unbundled ten."}],
        },
        {
            "id": "skip",
            "slot": "island-skip",
            "label": "Skip Wake",
            "crew": "cal",
            "chest": "A counted oar",
            "technique": {
                "title": "Skip 2s, 5s, and 10s",
                "body": "Skip counting jumps by the same amount: 2, 4, 6… or 5, 10, 15… or 10, 20, 30…",
                "audioText": "Skip counting jumps by the same amount. Twos, fives, and tens.",
            },
            "paper": [{"prompt": "Write skip 2s from 2 to 20."}, {"prompt": "Write skip 5s from 5 to 50."}, {"prompt": "Write skip 10s from 10 to 100."}],
        },
        {
            "id": "money",
            "slot": "island-money",
            "label": "Coin Purse",
            "crew": "nell",
            "chest": "A penny, nickel, and dime",
            "technique": {
                "title": "Count cents",
                "body": "A penny is 1 cent. A nickel is 5 cents. A dime is 10 cents. Count the dimes first, then nickels, then pennies.",
                "audioText": "A penny is 1 cent. A nickel is 5 cents. A dime is 10 cents.",
            },
            "paper": [{"prompt": "3 dimes + 1 nickel =    cents"}, {"prompt": "Draw 4 pennies and 1 dime. Write the total cents."}],
        },
        {
            "id": "time",
            "slot": "island-time",
            "label": "Clock Reef",
            "crew": "kit",
            "chest": "A brass ship clock",
            "technique": {
                "title": "Read the hour",
                "body": "The short hand names the hour. When it points to 3 and the long hand points to 12, the clock says 3:00.",
                "audioText": "The short hand names the hour. When it points to 3 and the long hand to 12, the clock says 3 o'clock.",
            },
            "paper": [{"prompt": "Draw a clock that shows 4:00."}, {"prompt": "Draw a clock that shows 9:00."}],
        },
        {
            "id": "measure",
            "slot": "island-measure",
            "label": "Measure Key",
            "crew": "bram",
            "chest": "A short brass ruler",
            "technique": {
                "title": "Compare length",
                "body": "Line the ropes up at one end. The one that sticks out farther is longer. An inch is a small unit on a ruler.",
                "audioText": "Line the ropes up at one end. The one that sticks out farther is longer.",
            },
            "paper": [{"prompt": "Trace a paper clip. About how many inches long is it? Ask a grown-up to check."}],
        },
        {
            "id": "shape",
            "slot": "island-shape",
            "label": "Shape Atoll",
            "crew": "oat",
            "chest": "A four-sided hatch",
            "technique": {
                "title": "Count sides",
                "body": "A rectangle has four sides and four square corners. Opposite sides match. A triangle has three sides.",
                "audioText": "A rectangle has four sides and four square corners. A triangle has three sides.",
            },
            "paper": [{"prompt": "Draw a rectangle. Label length and width."}, {"prompt": "How many sides does a triangle have?"}],
        },
        {
            "id": "story",
            "slot": "island-story",
            "label": "Story Inlet",
            "crew": "wren",
            "chest": "A logbook page",
            "technique": {
                "title": "Find the numbers, then the action",
                "body": "Underline the amounts. Decide if you join (add) or take away (subtract). Write a number sentence, then finish on paper.",
                "audioText": "Find the numbers. Decide if you join or take away. Write a number sentence.",
            },
            "paper": [
                {"prompt": "Pip has 18 coins. Reed finds 7 more. How many now? Write the sentence and the answer."},
                {"prompt": "A crate holds 20 biscuits. The crew eats 9. How many are left?"},
            ],
        },
        {
            "id": "rows",
            "slot": "island-facts",
            "label": "Early Rows",
            "crew": "sol",
            "chest": "Three equal coils",
            "technique": {
                "title": "Equal groups",
                "body": "Tap coins into a real grid: 3 rows of 4 stay 3 by 4, not a wrapped pile. 3 rows of 4 is 4 + 4 + 4.",
                "audioText": "Tap coins into three rows of four. That is four plus four plus four. Equal groups.",
            },
            "paper": [{"prompt": "Draw 2 rows of 5. Write 5 + 5 and 2 × 5."}, {"prompt": "4 + 4 + 4 =     and 3 × 4 ="}],
        },
    ]
    items = [
        item("e-f-d4", "facts", "Tap 2 rows of 4.", 8, [6, 9], kind="array", rows=2, cols=4, band="early",
             teach="2 rows of 4 is 8. That is the double."),
        item("e-f-d7", "facts", "Hold 7. Count on 7 more to make ten, then the rest.", 14, [12, 16],
             kind="maketen", hold=7, add=7, band="early", teach="7 + 3 makes 10. 4 more makes 14."),
        item("e-f-91", "facts", "Hold 9. Add 1 to fill the ten.", 10, [8, 11],
             kind="maketen", hold=9, add=1, band="early", teach="9 + 1 fills the ten-frame. That is 10."),
        item("e-f-28", "facts", "Hold 8. Add 2 to fill the ten.", 10, [9, 11],
             kind="maketen", hold=8, add=2, band="early", teach="8 + 2 fills the ten-frame. That is 10."),
        item("e-f-65", "facts", "Hold 6. Add 5. Fill the ten, then the extra.", 11, [10, 12],
             kind="maketen", hold=6, add=5, band="early", teach="6 + 4 makes 10. 1 more makes 11."),
        item("e-f-83", "facts", "Hold 8. Add 3. Fill the ten, then the extra.", 11, [10, 13],
             kind="maketen", hold=8, add=3, band="early", teach="8 + 2 makes 10. 1 more makes 11."),
        item("e-f-9m4", "facts", "9 coins. Tap 4 to give away.", 5, [4, 6],
             kind="takeaway", start=9, take=4, band="early", teach="9 take away 4 leaves 5."),
        item("e-f-12m7", "facts", "12 coins. Tap 7 to give away.", 5, [6, 19],
             kind="takeaway", start=12, take=7, band="early", teach="12 take away 7 leaves 5. Not 12 + 7."),
        item("e-f-15m6", "facts", "15 coins. Tap 6 to give away.", 9, [8, 11],
             kind="takeaway", start=15, take=6, band="early", teach="15 take away 6 leaves 9."),
        item("e-p-34", "place", "3 ten-crates and 4 ones. What number?", 34, [43, 304], kind="place", tens=3, ones=4, band="early",
             teach="3 tens is 30. 30 and 4 ones is 34, not 43."),
        item("e-p-50", "place", "5 ten-crates and 0 ones. What number?", 50, [5, 15], kind="place", tens=5, ones=0, band="early",
             teach="5 tens is 50. No extra ones."),
        item("e-p-408", "place", "40 + 8 =", 48, [408, 32], band="early", teach="4 tens and 8 ones is 48, not 408."),
        item("e-p-27", "place", "Bundle extra ones: 2 tens and 17 ones. What number?", 37, [27, 217],
             kind="bundle", tens=2, ones=17, band="early",
             audioText="Two tens and seventeen ones. Bundle ten ones into a crate. What number?",
             teach="Ten ones make a crate. 17 ones become 1 crate and 7 ones. 2+1 tens and 7 ones is 37."),
        item("e-r-275", "regroup", "27 + 5. Bring in 5 coins, then bundle a ten.", 32, [22, 212],
             kind="regroup", tens=2, ones=7, add=5, band="early",
             teach="7 + 5 = 12 ones. Bundle 10. 3 tens and 2 ones is 32."),
        item("e-r-467", "regroup", "46 + 7. Bring in 7 coins, then bundle a ten.", 53, [43, 413],
             kind="regroup", tens=4, ones=6, add=7, band="early",
             teach="6 + 7 = 13 ones. Bundle 10. 5 tens and 3 ones is 53."),
        item("e-r-6010", "regroup", "60 − 10. Unbundle a crate, then give away 10.", 50, [70, 6],
             kind="regroup", tens=6, ones=0, take=10, band="early",
             teach="Unbundle 1 ten. Give those 10 away. 5 tens are left: 50."),
        item("e-r-358", "regroup", "35 − 8. Unbundle a crate, then give away 8.", 27, [33, 43],
             kind="regroup", tens=3, ones=5, take=8, band="early",
             teach="5 ones cannot give 8. Unbundle a ten: 2 tens and 15 ones. Give away 8. 27 left."),
        item("e-r-29p6", "regroup", "29 + 6. Bring in 6 coins, then bundle a ten.", 35, [25, 215],
             kind="regroup", tens=2, ones=9, add=6, band="early",
             teach="9 + 6 = 15 ones. Bundle 10. 3 tens and 5 ones is 35."),
        item("e-sk-2", "skip", "2, 4, 6, 8, 10. Next?", 12, [11, 14], kind="skip", seq=[2, 4, 6, 8, 10], band="early"),
        item("e-sk-5", "skip", "5, 10, 15, 20. Next?", 25, [24, 30], kind="skip", seq=[5, 10, 15, 20], band="early"),
        item("e-sk-10", "skip", "10, 20, 30, 40. Next?", 50, [41, 60], kind="skip", seq=[10, 20, 30, 40], band="early"),
        item("e-sk-2from14", "skip", "Skip by 2s: 14, 16, 18. Next?", 20, [19, 22], kind="skip", seq=[14, 16, 18], band="early"),
        item("e-m-3p", "money", "3 pennies are how many cents?", 3, [5, 30], kind="money", pennies=3, band="early"),
        item("e-m-nickel", "money", "1 nickel is how many cents?", 5, [1, 10], kind="money", nickels=1, band="early"),
        item("e-m-dime", "money", "1 dime is how many cents?", 10, [1, 5], kind="money", dimes=1, band="early"),
        item("e-m-2d1n", "money", "2 dimes and 1 nickel. How many cents?", 25, [15, 30], kind="money", dimes=2, nickels=1, band="early"),
        item("e-m-4p1n", "money", "1 nickel and 4 pennies. How many cents?", 9, [5, 14], kind="money", nickels=1, pennies=4, band="early"),
        item("e-t-3", "time", "Short hand on 3, long hand on 12. The hour is", "3:00", ["12:00", "3:30"], kind="clock", hour=3, minute=0, band="early"),
        item("e-t-6", "time", "Short hand on 6, long hand on 12. The hour is", "6:00", ["12:00", "6:30"], kind="clock", hour=6, minute=0, band="early"),
        item("e-t-9", "time", "The clock shows 9:00. The short hand points to", 9, [12, 3], kind="clock", hour=9, minute=0, band="early"),
        item("e-t-12", "time", "Both hands on 12. The hour is", "12:00", ["1:00", "6:00"], kind="clock", hour=12, minute=0, band="early"),
        item("e-me-long", "measure", "Tap the longer rope.", "5-inch", ["2-inch", "same"],
             kind="compare", leftLen=5, rightLen=2, band="early", teach="The 5-inch rope sticks out farther."),
        item("e-me-inch", "measure", "12 inches make one of these. Tap it.", "foot", ["yard", "mile"],
             kind="shapepick", options=["foot", "yard", "mile"], band="early", teach="12 inches make 1 foot."),
        item("e-sh-rect", "shape", "Tap the shape with four sides and four square corners.", "rectangle", ["triangle", "circle"],
             kind="shapepick", options=["rectangle", "triangle", "circle"], band="early",
             teach="A rectangle has four sides. Opposite sides match."),
        item("e-sh-sides", "shape", "Tap each side of the triangle.", 3, [4, 5],
             kind="perimeter", sides=[1, 1, 1], band="early", teach="A triangle has 3 sides. You tapped each one."),
        item("e-st-18", "story", "Pip stacks 9 crates. Reed stacks 6 more. How many crates?", 15, [3, 96], kind="word", band="early"),
        item("e-st-20", "story", "A chest has 12 coins. Nell spends 4. How many are left?", 8, [16, 4], kind="word", band="early"),
        item("e-st-equal", "story", "3 coils of 5 coins. How many coins in all?", 15, [8, 35], kind="word", band="early"),
        item("e-row-34", "rows", "Tap coins into 3 rows of 4. How many?", 12, [7, 16], kind="array", rows=3, cols=4, band="early",
             teach="3 rows of 4 is 4 + 4 + 4 = 12. The grid stays 3 by 4."),
        item("e-row-444", "rows", "4 + 4 + 4 =", 12, [8, 16], band="early", teach="Three fours. 4 + 4 + 4 = 12, which is 3 × 4."),
        item("e-row-25", "rows", "Tap coins into 2 rows of 5. How many?", 10, [7, 25], kind="array", rows=2, cols=5, band="early",
             teach="2 rows of 5 is 5 + 5 = 10."),
    ]
    dump(
        "early",
        {
            "band": "early",
            "title": "Tens, ones, and a full chart",
            "intro": {
                "body": "Bundle tens, skip-count, count cents, read the hour, then drop anchor for paper.",
                "audioText": "Bundle tens. Skip count. Count cents. Then finish on paper.",
            },
            "islands": islands,
            "items": items,
        },
    )


def primary():
    islands = [
        {
            "id": "facts",
            "slot": "island-add",
            "label": "Fast Dock",
            "crew": "pip",
            "chest": "A worn slate",
            "technique": {
                "title": "Fact families",
                "body": "If 8 + 6 = 14, then 6 + 8 = 14, 14 − 8 = 6, and 14 − 6 = 8. One family, four facts.",
                "audioText": "If 8 plus 6 is 14, then 6 plus 8 is 14, 14 minus 8 is 6, and 14 minus 6 is 8.",
            },
            "paper": [{"prompt": "Write the fact family for 9, 7, and 16."}, {"prompt": "13 − 8 =     and 8 + 5 ="}],
        },
        {
            "id": "place",
            "slot": "island-place",
            "label": "Hundred Crates",
            "crew": "reed",
            "chest": "A hundred-crate",
            "technique": {
                "title": "Hundreds, tens, ones",
                "body": "10 tens make 1 hundred. 2 hundreds, 3 tens, and 5 ones is 235.",
                "audioText": "Ten tens make one hundred. Two hundreds, three tens, and five ones is two hundred thirty-five.",
            },
            "paper": [{"prompt": "Write 4 hundreds, 0 tens, 6 ones."}, {"prompt": "Expand 508 as hundreds + tens + ones."}],
        },
        {
            "id": "skip",
            "slot": "island-skip",
            "label": "Skip Shoals",
            "crew": "moss",
            "chest": "A skip chart",
            "technique": {
                "title": "Skip 3s through 11s",
                "body": "Keep adding the same jump. 3, 6, 9, 12… 4, 8, 12… 7, 14, 21… 9, 18, 27… 11, 22, 33…",
                "audioText": "Keep adding the same jump. Threes, fours, sixes, sevens, eights, nines, and elevens.",
            },
            "paper": [
                {"prompt": "Skip 3s from 3 to 36."},
                {"prompt": "Skip 7s from 7 to 70."},
                {"prompt": "Skip 9s from 9 to 90."},
                {"prompt": "Skip 11s from 11 to 99."},
            ],
        },
        {
            "id": "times",
            "slot": "island-facts",
            "label": "Row Island",
            "crew": "cal",
            "chest": "Twelve tidy rows",
            "drill": {"kind": "mul", "from": 0, "to": 12},
            "technique": {
                "title": "Equal rows",
                "body": "Tap coins into equal rows — 3 rows of 4 stay a 3-by-4 grid. Then pick a table and sail every fact from 0 through 12. Write that table on paper.",
                "audioText": "Tap coins into equal rows. Three rows of four stay a three by four grid. Then pick a table.",
            },
            "paper": [{"prompt": "Write the n times facts from 0 to 12 on paper. Circle any you paused on."}],
        },
        {
            "id": "share",
            "slot": "island-share",
            "label": "Share Crews",
            "crew": "nell",
            "chest": "Equal pouches",
            "drill": {"kind": "div", "from": 1, "to": 12},
            "technique": {
                "title": "Share into equal crews",
                "body": "Division is sharing a chest into equal crews, or making equal groups. 12 ÷ 4 = 3 because 4 rows of 3 make 12. There is no table for dividing by 0.",
                "audioText": "Division is sharing into equal crews. 12 divided by 4 is 3 because 4 rows of 3 make 12.",
            },
            "paper": [{"prompt": "Write the divide-by-n facts that land on whole numbers, n from 1 to 12. Skip divide-by-0."}],
        },
        {
            "id": "frac",
            "slot": "island-share",
            "label": "Half Chest",
            "crew": "kit",
            "chest": "A split lid",
            "technique": {
                "title": "Equal shares",
                "body": "Halves split one whole into 2 equal parts. Thirds into 3. Fourths into 4. The bottom number names the equal parts.",
                "audioText": "Halves split one whole into 2 equal parts. Thirds into 3. Fourths into 4.",
            },
            "paper": [{"prompt": "Shade 1/2, 1/3, and 1/4 of three equal chests."}, {"prompt": "Which is more: 1/2 or 1/4? Draw both."}],
        },
        {
            "id": "money",
            "slot": "island-money",
            "label": "Purse Dock",
            "crew": "bram",
            "chest": "A quarter and a dollar",
            "technique": {
                "title": "Quarters and dollars",
                "body": "A quarter is 25 cents. 4 quarters make 100 cents, which is 1 dollar. Count quarters by 25s.",
                "audioText": "A quarter is 25 cents. Four quarters make one dollar.",
            },
            "paper": [{"prompt": "3 quarters + 1 dime =    cents"}, {"prompt": "$1 =     cents. 2 dollars =     cents."}],
        },
        {
            "id": "time",
            "slot": "island-time",
            "label": "Half-Hour Reef",
            "crew": "oat",
            "chest": "A clock with a half mark",
            "technique": {
                "title": "Half and quarter past",
                "body": "Long hand on 6 means 30 minutes (half past). Long hand on 3 means 15 minutes (quarter past). Long hand on 9 means 45 minutes.",
                "audioText": "Long hand on 6 means 30 minutes, half past. Long hand on 3 means 15 minutes. Long hand on 9 means 45 minutes.",
            },
            "paper": [{"prompt": "Draw 2:30 and 4:15."}, {"prompt": "What time is a quarter to 5?"}],
        },
        {
            "id": "measure",
            "slot": "island-measure",
            "label": "Measure Key",
            "crew": "wren",
            "chest": "A cup and a foot-rope",
            "technique": {
                "title": "Feet, inches, cups",
                "body": "12 inches = 1 foot. 3 feet = 1 yard. 8 fluid ounces = 1 cup. 2 cups = 1 pint.",
                "audioText": "12 inches make 1 foot. 3 feet make 1 yard. 8 fluid ounces make 1 cup. 2 cups make 1 pint.",
            },
            "paper": [{"prompt": "5 feet =     inches"}, {"prompt": "2 pints =     cups"}, {"prompt": "A 1-yard rope is how many feet?"}],
        },
        {
            "id": "shape",
            "slot": "island-shape",
            "label": "Perimeter Atoll",
            "crew": "sol",
            "chest": "A fence of rope",
            "technique": {
                "title": "Walk the edge",
                "body": "Perimeter is the distance around. For a rectangle, add length + width + length + width, or 2 × (length + width).",
                "audioText": "Perimeter is the distance around. For a rectangle, add both lengths and both widths.",
            },
            "paper": [{"prompt": "A hatch 6 by 4. Perimeter?"}, {"prompt": "A square with side 5. Perimeter?"}],
        },
        {
            "id": "story",
            "slot": "island-story",
            "label": "Story Inlet",
            "crew": "pike",
            "chest": "A plotted course",
            "technique": {
                "title": "Choose the operation",
                "body": "Equal groups → multiply. Sharing or grouping → divide. Joining leftover amounts → add. Write the sentence, then paper.",
                "audioText": "Equal groups, multiply. Sharing, divide. Then write the sentence on paper.",
            },
            "paper": [
                {"prompt": "6 crews of 8 sailors. How many sailors?"},
                {"prompt": "A chest of 36 coins, 9 pouches. How many each?"},
                {"prompt": "24 biscuits, 6 eaten, then shared by 3. How many each? Show two steps."},
            ],
        },
    ]
    mul_samples = [
        (0, 9, 0),
        (1, 7, 7),
        (2, 2, 4),
        (2, 5, 10),
        (2, 10, 20),
        (3, 3, 9),
        (3, 4, 12),
        (3, 7, 21),
        (4, 4, 16),
        (4, 6, 24),
        (4, 9, 36),
        (5, 5, 25),
        (5, 6, 30),
        (5, 8, 40),
        (5, 12, 60),
        (6, 6, 36),
        (6, 7, 42),
        (6, 8, 48),
        (7, 7, 49),
        (7, 8, 56),
        (8, 8, 64),
        (8, 9, 72),
        (9, 9, 81),
        (9, 12, 108),
        (10, 10, 100),
        (11, 11, 121),
        (12, 8, 96),
        (12, 12, 144),
    ]
    items = [
        item("m-f-86", "facts", "14 coins. Tap 6 to give away.", 8, [6, 14], kind="takeaway", start=14, take=6, band="primary",
             teach="14 take away 6 is 8. That is the other part of 8 + 6."),
        item("m-f-97", "facts", "Hold 9. Add 7. Fill the ten, then the extra.", 16, [15, 63],
             kind="maketen", hold=9, add=7, band="primary", teach="9 + 1 makes 10. 6 more makes 16."),
        item("m-f-13m5", "facts", "13 coins. Tap 5 to give away.", 8, [7, 18], kind="takeaway", start=13, take=5, band="primary",
             teach="13 take away 5 leaves 8."),
        item("m-pl-235", "place", "2 hundreds, 3 tens, 5 ones is", 235, [253, 325], kind="place", hundreds=2, tens=3, ones=5, band="primary"),
        item("m-pl-508", "place", "5 hundreds, 0 tens, 8 ones is", 508, [58, 580], kind="place", hundreds=5, tens=0, ones=8, band="primary"),
        item("m-pl-10tens", "place", "10 tens make how many hundreds?", 1, [10, 100], band="primary"),
        item("m-sk-3", "skip", "3, 6, 9, 12. Next?", 15, [14, 18], kind="skip", seq=[3, 6, 9, 12], band="primary"),
        item("m-sk-4", "skip", "4, 8, 12, 16. Next?", 20, [18, 24], kind="skip", seq=[4, 8, 12, 16], band="primary"),
        item("m-sk-6", "skip", "6, 12, 18, 24. Next?", 30, [28, 36], kind="skip", seq=[6, 12, 18, 24], band="primary"),
        item("m-sk-7", "skip", "7, 14, 21, 28. Next?", 35, [32, 42], kind="skip", seq=[7, 14, 21, 28], band="primary"),
        item("m-sk-8", "skip", "8, 16, 24, 32. Next?", 40, [36, 48], kind="skip", seq=[8, 16, 24, 32], band="primary"),
        item("m-sk-9", "skip", "9, 18, 27, 36. Next?", 45, [40, 54], kind="skip", seq=[9, 18, 27, 36], band="primary"),
        item("m-sk-11", "skip", "11, 22, 33, 44. Next?", 55, [54, 66], kind="skip", seq=[11, 22, 33, 44], band="primary"),
        item("m-fr-half", "frac", "1 of 2 equal shares of a chest is", "1/2", ["1/3", "2/2"], kind="fraction", filled=1, parts=2, band="primary"),
        item("m-fr-third", "frac", "1 of 3 equal shares is", "1/3", ["1/2", "1/4"], kind="fraction", filled=1, parts=3, band="primary"),
        item("m-fr-fourth", "frac", "1 of 4 equal shares is", "1/4", ["1/2", "1/3"], kind="fraction", filled=1, parts=4, band="primary"),
        item("m-fr-2fourths", "frac", "2 of 4 equal shares is the same as", "1/2", ["2/2", "1/4"], kind="fraction", filled=2, parts=4, band="primary"),
        item("m-mo-q", "money", "1 quarter is how many cents?", 25, [10, 50], kind="money", quarters=1, band="primary"),
        item("m-mo-4q", "money", "4 quarters make how many cents?", 100, [25, 4], kind="money", quarters=4, band="primary"),
        item("m-mo-3q1d", "money", "3 quarters and 1 dime. How many cents?", 85, [75, 40], kind="money", quarters=3, dimes=1, band="primary"),
        item("m-mo-dollar", "money", "1 dollar is how many cents?", 100, [10, 25], band="primary"),
        item("m-t-230", "time", "Short hand past 2, long hand on 6. The time is", "2:30", ["6:10", "2:00"], kind="clock", hour=2, minute=30, band="primary"),
        item("m-t-415", "time", "Short hand a little past 4, long hand on 3. The time is", "4:15", ["3:20", "4:00"], kind="clock", hour=4, minute=15, band="primary"),
        item("m-t-545", "time", "Long hand on 9, short hand near 6. The time is", "5:45", ["9:30", "6:00"], kind="clock", hour=5, minute=45, band="primary"),
        item("m-me-12in", "measure", "12 inches = how many feet? Type it.", 1, [12, 3], kind="product", band="primary",
             teach="12 inches make 1 foot."),
        item("m-me-3ft", "measure", "3 feet = how many yards? Type it.", 1, [3, 36], kind="product", band="primary",
             teach="3 feet make 1 yard."),
        item("m-me-cup", "measure", "8 fluid ounces = how many cups? Type it.", 1, [8, 2], kind="product", band="primary",
             teach="8 fluid ounces make 1 cup."),
        item("m-me-pint", "measure", "2 cups = how many pints? Type it.", 1, [2, 8], kind="product", band="primary",
             teach="2 cups make 1 pint."),
        item("m-sh-per", "shape", "Tap each side of the 5 by 3 hatch.", 16, [15, 8],
             kind="perimeter", sides=[5, 3, 5, 3], band="primary", teach="5 + 3 + 5 + 3 = 16. That is the walk around."),
        item("m-sh-sq", "shape", "Tap each side of the square with side 6.", 24, [12, 36],
             kind="perimeter", sides=[6, 6, 6, 6], band="primary", teach="6 + 6 + 6 + 6 = 24."),
        item("m-st-68", "story", "6 crews of 8 sailors. How many sailors?", 48, [14, 68], kind="word", band="primary"),
        item("m-st-369", "story", "36 coins in 9 pouches, equal share. How many each?", 4, [27, 45], kind="word", band="primary"),
        item("m-st-fam", "story", "If 7 × 8 = 56, then 56 ÷ 8 =", 7, [8, 6], band="primary"),
    ]
    for a, b, p in mul_samples:
        items.append(
            item(
                "m-mul-%dx%d" % (a, b),
                "times",
                "%s × %s =" % (a, b),
                p,
                [a + b, a * b + a if a else 1, abs(p - b) or p + 1],
                kind="array" if 0 < a <= 6 and 0 < b <= 6 else "product",
                rows=a if a else None,
                cols=b if a else None,
                band="primary",
                audioText="%s times %s." % (a, b),
                teach=("%s rows of %s is %s." % (a, b, p) if 0 < a <= 6 and 0 < b <= 6 else "%s times %s is %s." % (a, b, p)),
            )
        )
        if a != 0:
            items.append(
                item(
                    "m-div-%dd%d" % (p, a),
                    "share",
                    ("Deal %s coins into %s crews." % (p, a)) if p <= 20 else ("%s ÷ %s =" % (p, a)),
                    b,
                    [a, p - a if p > a else a + 1],
                    kind="deal" if p <= 20 else "product",
                    dividend=p,
                    divisor=a,
                    band="primary",
                    audioText="%s divided by %s." % (p, a),
                    teach="%s shared into %s crews is %s each." % (p, a, b),
                )
            )
    dump(
        "primary",
        {
            "band": "primary",
            "title": "Crews, shares, and every table",
            "intro": {
                "body": "Sail every times table 0 through 12, then the matching shares. Fractions, money, time, and perimeter wait down the chart. Finish each island on paper.",
                "audioText": "Equal rows for multiplying. Equal crews for dividing. Sail every table, then finish on paper.",
            },
            "islands": islands,
            "items": items,
        },
    )


def upper():
    islands = [
        {
            "id": "frac",
            "slot": "island-share",
            "label": "Share Cove",
            "crew": "pip",
            "chest": "Equal-part lids",
            "technique": {
                "title": "Same whole, named parts",
                "body": "The bottom number names equal parts. The top number counts how many you have. Equivalent shares: 1/2 = 2/4 = 3/6. Add like fractions by adding the tops, keeping the bottom. Mixed number 1 1/2 = 3/2.",
                "audioText": "The bottom number names equal parts. One half equals two fourths. Add like fractions by adding the tops.",
            },
            "paper": [
                {"prompt": "1/5 + 2/5 ="},
                {"prompt": "Write 3/4 and 6/8. Are they equivalent? Show a drawing."},
                {"prompt": "1 1/2 + 1/2 ="},
                {"prompt": "3/4 of 12 ="},
            ],
        },
        {
            "id": "dec",
            "slot": "island-share",
            "label": "Point Harbor",
            "crew": "reed",
            "chest": "A tenths rule",
            "technique": {
                "title": "Line up the point",
                "body": "Tenths, hundredths. 0.5 = 1/2 = 50%. Add in the app with the points stacked so tenths sit under tenths. Then a fresh sum on paper.",
                "audioText": "Tenths and hundredths. One half is 0.5, which is 50 percent. Line up the decimal points to add.",
            },
            "paper": [{"prompt": "4.6 + 0.75  (line up the points)"}, {"prompt": "0.2 + 0.35 ="}, {"prompt": "Write 7/10 as a decimal."}],
        },
        {
            "id": "money",
            "slot": "island-money",
            "label": "Ledger Dock",
            "crew": "moss",
            "chest": "A cents column",
            "technique": {
                "title": "Dollars and cents",
                "body": "Money is a decimal. $1.50 is 1 dollar and 50 cents. Line up the points. 100 cents = $1.00.",
                "audioText": "Money is a decimal. One dollar fifty is 1 dollar and 50 cents. Line up the points.",
            },
            "paper": [{"prompt": "$2.45 + $0.80 ="}, {"prompt": "A rope costs $3.00. You pay $5.00. Change?"}],
        },
        {
            "id": "time",
            "slot": "island-time",
            "label": "Watch Reef",
            "crew": "cal",
            "chest": "An elapsed-time glass",
            "technique": {
                "title": "Elapsed time",
                "body": "Count hours, then minutes. From 2:10 to 3:40 is 1 hour 30 minutes. If minutes pass 60, bundle into an hour.",
                "audioText": "Count hours, then minutes. From 2:10 to 3:40 is 1 hour 30 minutes.",
            },
            "paper": [{"prompt": "Watch starts 1:15, ends 2:05. Elapsed?"}, {"prompt": "A 45-minute watch starts at 4:20. When does it end?"}],
        },
        {
            "id": "measure",
            "slot": "island-measure",
            "label": "Measure Key",
            "crew": "nell",
            "chest": "Spoons, cups, and a meter tape",
            "technique": {
                "title": "Equivalents",
                "body": "3 teaspoons = 1 tablespoon. 2 tablespoons = 1 fluid ounce. 8 fl oz = 1 cup. 2 cups = 1 pint. 2 pints = 1 quart. 4 quarts = 1 gallon. 12 in = 1 ft. 3 ft = 1 yd. 10 mm = 1 cm. 100 cm = 1 m. 1000 m = 1 km.",
                "audioText": "Three teaspoons make one tablespoon. Two cups make a pint. Two pints make a quart. Four quarts make a gallon. One hundred centimeters make a meter.",
            },
            "paper": [
                {"prompt": "6 teaspoons =     tablespoons"},
                {"prompt": "3 gallons =     quarts"},
                {"prompt": "2.5 m =     cm"},
                {"prompt": "36 inches =     yards"},
            ],
        },
        {
            "id": "shape",
            "slot": "island-shape",
            "label": "Area Atoll",
            "crew": "kit",
            "chest": "A hatch plan",
            "technique": {
                "title": "Cover, then wrap",
                "body": "Area of a rectangle: length × width. Square: side × side. Triangle: (base × height) ÷ 2. Circle area: π × r × r. Circumference: 2 × π × r. Use π ≈ 3.14. Then do fresh problems on paper.",
                "audioText": "Area of a rectangle is length times width. Triangle is base times height divided by 2. Circle area is pi r squared. Circumference is 2 pi r. Use 3.14 for pi. Then paper.",
            },
            "paper": [
                {"prompt": "Rectangle 9 by 4. Area?"},
                {"prompt": "Triangle base 10, height 6. Area?"},
                {"prompt": "Circle r = 2. Area ≈ ?  Circumference ≈ ?  (π = 3.14)"},
            ],
        },
        {
            "id": "long",
            "slot": "island-long",
            "label": "Long-Work Harbor",
            "crew": "bram",
            "chest": "A column slate",
            "technique": {
                "title": "Keep the places in columns",
                "body": "Long multiply in the app: ones first, then tens (shift one place), then add. Long divide: divide, multiply, subtract, bring down. Repeat until the quotient is done. Then a fresh problem on paper.",
                "audioText": "Long multiply: ones, then tens, then add. Long divide: divide, multiply, subtract, bring down. Then do a fresh problem on paper.",
            },
            "paper": [
                {"prompt": "Long multiply: 36 × 24. Show ones, tens, and the sum."},
                {"prompt": "Long divide: 145 ÷ 5. Show divide, multiply, subtract, bring down."},
                {"prompt": "48 × 16"},
                {"prompt": "196 ÷ 7"},
            ],
        },
        {
            "id": "laws",
            "slot": "island-sense",
            "label": "Law Lagoon",
            "crew": "oat",
            "chest": "Four brass rules",
            "technique": {
                "title": "Turn, group, share-out, stay-the-same",
                "body": "Turn-around (commutative): 4 + 5 = 5 + 4 and 3 × 6 = 6 × 3. Group (associative): (2+3)+4 = 2+(3+4). Share-out (distributive): 3 × (5+2) = 3×5 + 3×2. Stay-the-same (identity): n + 0 = n and n × 1 = n.",
                "audioText": "Turn around: 4 plus 5 equals 5 plus 4. Group: you may add in grouped steps. Share out: 3 times a sum is 3 times each part. Stay the same: plus 0 or times 1 leaves n.",
            },
            "paper": [
                {"prompt": "Rewrite 7 × (10 + 4) with the share-out rule, then solve."},
                {"prompt": "Show (8+2)+5 = 8+(2+5)."},
                {"prompt": "Why is 9 × 1 = 9 but 9 × 0 = 0?"},
            ],
        },
        {
            "id": "skip",
            "slot": "island-skip",
            "label": "Square Wake",
            "crew": "wren",
            "chest": "Square and cube beads",
            "technique": {
                "title": "Skip 13s, 14s, 15s, squares, cubes",
                "body": "A square is a number times itself: 1, 4, 9, 16, 25… A cube is n × n × n: 1, 8, 27, 64, 125… Skip 13s: 13, 26, 39…",
                "audioText": "A square is a number times itself. A cube is n times n times n. Skip thirteens: 13, 26, 39.",
            },
            "paper": [
                {"prompt": "Skip 13s from 13 to 78."},
                {"prompt": "Skip 14s from 14 to 70."},
                {"prompt": "Skip 15s from 15 to 90."},
                {"prompt": "List squares from 1×1 to 12×12."},
                {"prompt": "List cubes from 1×1×1 to 6×6×6."},
            ],
        },
        {
            "id": "story",
            "slot": "island-story",
            "label": "Story Inlet",
            "crew": "sol",
            "chest": "A two-step chart",
            "technique": {
                "title": "Two steps, then paper",
                "body": "Some problems hide two actions. Find the first result, then use it. Estimate whether the answer should be larger or smaller before you compute. Finish the arithmetic on paper.",
                "audioText": "Some problems hide two actions. Find the first result, then use it. Finish the arithmetic on paper.",
            },
            "paper": [
                {"prompt": "A sail is 8 by 5 feet. Area? Then 3 of those sails. Total area?"},
                {"prompt": "You have $10.00. Buy 3 coils at $2.25 each. How much is left?"},
            ],
        },
        {
            "id": "mix",
            "slot": "island-long",
            "label": "Mix Channel",
            "crew": "pike",
            "chest": "A mixed-ops slate",
            "technique": {
                "title": "One operation at a time",
                "body": "Do the work inside parentheses first. Then multiply or divide from left to right. Then add or subtract from left to right. Write each line. Finish on paper.",
                "audioText": "Parentheses first. Then multiply or divide left to right. Then add or subtract. Write each line on paper.",
            },
            "paper": [{"prompt": "(9 + 3) × 4 − 6 ="}, {"prompt": "5 + 2 × 8 =     (not 56)"}, {"prompt": "48 ÷ (3 × 4) ="}],
        },
    ]
    items = [
        item("u-fr-halfdec", "frac", "Fill 5 of 10 tenths. That is one half, written 0.5.", "0.5", ["0.2", "2.0"],
             kind="tenths", fill=5, band="upper",
             teach="Five tenths is 0.5. That is the same share as 1/2. Not 0.2 and not 2.0."),
        item("u-fr-25", "frac", "Shade 1 of 4 equal parts. That is 0.25.", "1/4", ["1/25", "25/1"], band="upper",
             kind="fraction", filled=1, parts=4, teach="One of four equal parts is 1/4, written 0.25."),
        item("u-fr-50p", "frac", "Tap half of these 10 coins. 50% is half.", 5, [2, 50],
             kind="selectn", count=10, need=5, band="upper", teach="50% is half. Half of 10 coins is 5."),
        item("u-fr-3tenth", "frac", "Fill 3 of 10 tenths. That decimal is 0.3.", "0.3", ["0.03", "3.10"], band="upper",
             kind="tenths", fill=3, teach="Three of ten equal parts is 0.3. 0.03 would be three hundredths."),
        item("u-fr-like", "frac", "Shade 1 fifth, then 2 more. Same-size parts.", "3/5", ["3/10", "2/5"], kind="fraction", filled=3, parts=5, band="upper",
             teach="Same bottoms. 1 + 2 tops is 3. Keep the 5. 3/5."),
        item("u-fr-eq", "frac", "Shade 2 of 4 equal parts. That matches 1/2.", "2/4", ["1/4", "2/2"], kind="fraction", filled=2, parts=4, band="upper",
             teach="Two of four equal parts is the same share as one of two."),
        item("u-fr-of", "frac", "Tap 3 of every 4 coins. 12 coins in all.", 9, [3, 16],
             kind="selectn", count=12, need=9, band="upper", teach="12 into 4 equal parts is 3 each. Three of those parts is 9."),
        item("u-fr-mixed", "frac", "Fill 3 halves. One whole is 2/2, plus 1/2.", "3/2", ["2/3", "1/2"], band="upper",
             kind="wholes", parts=2, filled=3, teach="One whole is 2/2. One more half makes 3/2."),
        item("u-d-add", "dec", "Line up 1.20 + 0.45. Add hundredths, tenths, ones.", "1.65", ["0.57", "5.7"],
             kind="decimal", addends=["1.20", "0.45"], band="upper",
             teach="Points stacked. Hundredths 0+5=5, tenths 2+4=6, ones 1+0=1. Sum 1.65."),
        item("u-d-tenth", "dec", "Fill 7 of 10 tenths.", "0.7", ["0.07", "7.0"], band="upper",
             kind="tenths", fill=7, teach="Seven tenths is 0.7. The first place after the point is tenths, not hundredths."),
        item("u-d-hund", "dec", "0.40 is four tenths. Fill them.", 4, [40, 2], band="upper",
             kind="tenths", fill=4, teach="40 hundredths is 4 tenths. 0.40 = 0.4. Not 40 and not 2."),
        item("u-d-pct", "dec", "0.5 is five tenths. Fill them. That is 50%.", "50%", ["5%", "0.5%"], band="upper",
             kind="tenths", fill=5, teach="Five tenths is 0.5, which is 50 hundredths, which is 50%."),
        item("u-m-add", "money", "$1.50 + $0.25 =", "$1.75", ["$1.25", "$2.50"], kind="money", band="upper"),
        item("u-m-cents", "money", "$2.00 is how many cents?", 200, [2, 20], band="upper"),
        item("u-m-chg", "money", "Pay $5.00 for a $3.25 coil. Change?", "$1.75", ["$2.75", "$8.25"], band="upper"),
        item("u-t-elapse", "time", "From 2:00 to 2:45 is how many minutes?", 45, [15, 30], kind="clock", hour=2, minute=45, band="upper"),
        item("u-t-hourmin", "time", "From 1:10 to 3:10 is how many hours?", 2, [1, 3], band="upper"),
        item("u-t-bundle", "time", "75 minutes is 1 hour and how many minutes?", 15, [75, 25], band="upper"),
        item("u-me-tsp", "measure", "3 teaspoons = how many tablespoons?", 1, [3, 6], band="upper"),
        item("u-me-tbsp", "measure", "2 tablespoons = how many fluid ounces?", 1, [2, 8], band="upper"),
        item("u-me-gal", "measure", "4 quarts = how many gallons?", 1, [4, 8], band="upper"),
        item("u-me-cm", "measure", "100 centimeters = how many meters?", 1, [100, 10], band="upper"),
        item("u-me-km", "measure", "1000 meters = how many kilometers?", 1, [1000, 100], band="upper"),
        item("u-me-in", "measure", "36 inches = how many yards?", 1, [3, 12], band="upper"),
        item("u-sh-rect", "shape", "Rectangle 7 by 3. Area?", 21, [20, 10], band="upper"),
        item("u-sh-sq", "shape", "Square side 5. Area?", 25, [20, 10], band="upper"),
        item("u-sh-tri", "shape", "Triangle base 8, height 5. Area?", 20, [40, 13], band="upper"),
        item("u-sh-circA", "shape", "Circle r = 2. Area ≈ (π = 3.14)", "12.56", ["6.28", "12.14"], band="upper"),
        item("u-sh-circC", "shape", "Circle r = 2. Circumference ≈ (π = 3.14)", "12.56", ["6.28", "3.14"], band="upper"),
        item("u-long-84", "long", "Long divide 84 ÷ 4. Divide, multiply, subtract, bring down.", 21, [20, 24],
             kind="longdiv", dividend=84, divisor=4, band="upper",
             teach="How many 4s in 8? 2. Multiply 2×4=8, subtract 0, bring down 4. 4÷4=1. Quotient 21."),
        item("u-long-145", "long", "Long divide 145 ÷ 5. Divide, multiply, subtract, bring down.", 29, [25, 35],
             kind="longdiv", dividend=145, divisor=5, band="upper",
             teach="How many 5s in 14? 2. Multiply 10, subtract 4, bring down 5 → 45. 45÷5=9. Quotient 29."),
        item("u-long-23x4", "long", "Long multiply 23 × 4. Ones, then tens.", 92, [86, 26],
             kind="longmul", a=23, b=4, band="upper",
             teach="3×4=12. Write 2, carry 1. 2×4=8 plus 1 is 9. Product 92."),
        item("u-long-36x24", "long", "Long multiply 36 × 24. Ones row, tens row, add.", 864, [144, 720],
             kind="longmul", a=36, b=24, band="upper",
             teach="36×4=144. 36×2=72, shift one place → 720. 144+720=864."),
        item("u-long-48x6", "long", "Long multiply 48 × 6. Ones, then tens.", 288, [240, 54],
             kind="longmul", a=48, b=6, band="upper",
             teach="8×6=48. Write 8, carry 4. 4×6=24 plus 4 is 28. Product 288."),
        item("u-law-com", "laws", "Fill 4 rows of 6, and 6 rows of 4.", "yes", ["no", "only add"],
             kind="arraypair", rows=4, cols=6, band="upper",
             teach="4×6 and 6×4 are the same coins turned. Both are 24."),
        item("u-law-id", "laws", "9 × 1 =", 9, [0, 10], kind="product", band="upper",
             teach="One group of 9 is 9. Multiplying by 1 leaves the number."),
        item("u-law-zero", "laws", "9 × 0 =", 0, [9, 90], kind="product", band="upper",
             teach="Zero groups of 9 is 0. Nothing to count."),
        item("u-law-dist", "laws", "3 × (5 + 2). First type 5 + 2, then times 3.", 21, [17, 10],
             kind="stepskey", steps=[{"prompt": "5 + 2 =", "expect": "7"}, {"prompt": "3 × 7 =", "expect": "21"}],
             band="upper", teach="Share the 3: 3×5 + 3×2 = 15 + 6 = 21."),
        item("u-law-assoc", "laws", "(2 + 3) + 4. Add the pair, then the 4.", 9, [5, 24],
             kind="stepskey", steps=[{"prompt": "2 + 3 =", "expect": "5"}, {"prompt": "5 + 4 =", "expect": "9"}],
             band="upper", teach="The grouping changes. The sum does not. Both ways make 9."),
        item("u-sk-13", "skip", "13, 26, 39. Next?", 52, [50, 65], kind="skip", seq=[13, 26, 39], band="upper"),
        item("u-sk-14", "skip", "14, 28, 42. Next?", 56, [54, 70], kind="skip", seq=[14, 28, 42], band="upper"),
        item("u-sk-15", "skip", "15, 30, 45. Next?", 60, [50, 75], kind="skip", seq=[15, 30, 45], band="upper"),
        item("u-sk-sq", "skip", "Squares: 1, 4, 9, 16. Next?", 25, [20, 36], kind="skip", seq=[1, 4, 9, 16], band="upper"),
        item("u-sk-cu", "skip", "Cubes: 1, 8, 27. Next?", 64, [36, 81], kind="skip", seq=[1, 8, 27], band="upper"),
        item("u-st-area", "story", "A sail 8 by 5 feet. Tap the grid, or the keys finish it.", 40, [13, 26],
             kind="product", band="upper", teach="Area is 8 × 5 = 40 square feet. Not 8 + 5."),
        item("u-st-two", "story", "3 coils at $2.00 each. Type the total.", "$6.00", ["$5.00", "$2.00"],
             kind="product", band="upper", teach="3 × 2 dollars is 6 dollars."),
        item("u-mix-paren", "mix", "(9 + 3) × 2. Parentheses first.", 24, [15, 11],
             kind="stepskey", steps=[{"prompt": "9 + 3 =", "expect": "12"}, {"prompt": "12 × 2 =", "expect": "24"}],
             band="upper", teach="Inside the parentheses first: 12. Then 12 × 2 = 24."),
        item("u-mix-mdas", "mix", "5 + 2 × 8. Multiply before you add.", 21, [56, 13],
             kind="stepskey", steps=[{"prompt": "2 × 8 =", "expect": "16"}, {"prompt": "5 + 16 =", "expect": "21"}],
             band="upper", teach="Multiply first: 16. Then 5 + 16 = 21. Not 7 × 8."),
    ]
    dump(
        "upper",
        {
            "band": "upper",
            "title": "Shares, points, and long work",
            "intro": {
                "body": "Fractions, decimals, money, time, measurement, area, long multiply and divide, and the four turn-and-group rules. The app shows the path. Paper finishes it.",
                "audioText": "Name the place. Line up the decimal point. For long division: divide, multiply, subtract, bring down. Then do a fresh problem on paper.",
            },
            "islands": islands,
            "items": items,
        },
    )


def main():
    baby()
    toddler()
    preschool()
    early()
    primary()
    upper()


if __name__ == "__main__":
    main()
