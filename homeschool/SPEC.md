# Homeschool site — content spec (public GitHub Pages)

Checked into this public repo at the maintainer’s request. It is a builder brief; **site UI must still follow §1.** This brief’s old initials section was never copied here.

---

## 1. Purpose + constraints

- **Purpose:** static GitHub Pages site: games, apps, and Anki-compatible decks by *band*, covering math, reading/phonics, Cycle 3 *review of allowed facts*, singing, dancing, and other subjects the family already uses.
- **Audience:** the family’s learners first; public visitors second. **Approved first names** (folders + UI) come only from `stages.json`: Joey, Theo, Bella, Piper, Hanna, Shiloh. Still no last names, photos of the learners, addresses, church / campus / community / tutor names, troop or class rosters, or family surname.
- **Ages:** live **only** in `stages.json` as a plain editable `age` field. Never hard-code an age on a page. Never store or publish a birth date, birthday, or birth month, and do not compute ages. The UI shows the **first name** plus an **age band** or stage label (e.g. “upper elementary”, “toddler”), never the number from `age`.
- **No grade levels** anywhere (not in UI, content, or file names).
- **Kid-friendly status:** pending parent testing. Ship usable, but do not claim “kid-tested” or “kid-friendly.” Track keep/drop per app after feedback. Anki UI is likely too technical for learners alone (parent-run).
- **Stack:** static HTML/CSS/JS. No required accounts. GitHub Pages from `main` root. Offline on `/e/OS` Pixel and small Android phones. Each learner home is its own installable PWA. Apps run *inside* that home via `play.html` (see `DESIGN.md`). Touch-first, modest RAM.
- **Math handoff:** apps expose *technique*; paper finishes it. The family’s math curriculum is **CC Math Map** — **do not reproduce its content**. Original practice aligned to the skills is fine.
- **Printables:** toner-light. Letter size. Optional.
- **Do not publish:** last names; birth dates; exact ages on pages; addresses; church / campus / tutor names; photos of the learners; medical or therapy details; school names.
- **Copyright (hard):**
  - Classical Conversations memory work, Essentials charts A–M wording, Math Map / notation flashcards, and Student Body coloring pages are **copyrighted / membership materials**. Family use only. **Do not** commit `.apkg` / TSV of the Cycle 3 deck, full recitation text (history sentences, Latin lists/verses, timeline card wording, chart text), CC PDFs, or class coloring sheets.
  - Site may use *topic titles* (e.g. “Week 11 History: Civil War”), public-domain facts (states/capitals, presidents, formulas, geography feature names), and original games/quizzes.
  - No copyrighted song lyrics; no CC audio/video.
  - Note: “deck TSVs / apkg exist privately; share with the family on request,” not as a public download of the 532-card pack.
- **App contract:** `DESIGN.md`. Each app: `index.html`, `assets.json`, `images.json`, `INTEGRATION.md`. Band from `?band=` else `localStorage['hs.band']`. Progress `localStorage['hs.progress.<subject>']`. Subject folder ids: `math`, `reading`, `history`, `geography`, `science`, `bible`, `singing`, `movement`, `art`, `essentials-points`, `presentation`. There is no separate `cc-cycle3` app (history covers Cycle 3 history review). `geography` replaced `maps`. `movement` replaced `dancing`.

---

## 2. Stages table (builder)

Codes K1–K6 = birth order, eldest → youngest. **Do not print K-codes or exact ages on the site.** Public folders / names / bands:

| Code | Folder / UI name | Band | Label (UI) | Age band (UI) |
| --- | --- | --- | --- | --- |
| K1 | Joey | `upper` | Essentials + Foundations | upper elementary |
| K2 | Theo | `primary` | Foundations | early-middle elementary |
| K3 | Bella | `early` | Foundations | early elementary |
| K4 | Piper | `preschool` | Foundations, early learner | early learner |
| K5 | Hanna | `toddler` | Toddler | toddler |
| K6 | Shiloh | `baby` | Care time | infant |

Default subject levels (adjustable in the app; stored in `localStorage`, included in export/import):

- **Joey (`upper`):** Cycle 3 review, Essentials blank tracker, decimals/fractions/long ops, volume reading, maps, presentation, Bible, science/history/art topics, singing. No dance class named.
- **Theo (`primary`):** Cycle 3 review, ×/÷ facts, volume reading, maps, tap + hip hop, presentation, Bible, science/history/art, singing.
- **Bella (`early`):** Cycle 3 review, add/sub within 100, blends → teams, maps, ballet + tap, presentation, Bible, science/history/art, singing.
- **Piper (`preschool`):** Cycle 3 review, numbers to 10, letter **sounds**, maps, ballet + creative movement, presentation, Bible, science/history/art, singing.
- **Hanna (`toddler`):** letter sounds, play-based counting, creative movement, Bible, art, singing. No Cycle 3 stated.
- **Shiloh (`baby`):** no academic track yet; placeholder home.

Official grade = unknown for every learner. Formal curriculum names = unknown except phonics-in-use: sounds-first program for Piper/Hanna (do not name a commercial product in UI unless the owner asks).

Dance: Theo tap + hip hop; Bella ballet + tap; Piper ballet + creative movement; Hanna creative movement. Joey and Shiloh: no dance class named. Do not assign ballet to Theo.

---

## 3. Per-subject notes

### Math

- Rule: technique in the app → finish on paper.
- Joey: decimals, fractions, long ×/÷, mixed operations.
- Theo: multiplication facts → division / fact families.
- Bella: add/subtract to 100, place value, early ×.
- Piper: numbers to 10, adding to 10.
- Hanna: play-based counting (confirm before expanding).
- Shiloh: none.
- Do **not** upload CC Math Map / notations. Original symbols/practice is fine.

### Reading / phonics

- Joey/Theo: volume reading. Not a baby phonics app. Timer + optional vocabulary. Picture books still available as a warm-up.
- Bella: blends → teams → long vowels. Decodable **original** books (garden theme).
- Piper/Hanna: letter **sounds**, never letter names as the first teaching.
- Shiloh: none.
- **Picture books (reading only):** leveled, illustrated read-along; original decodable text; page-by-page pictures; tap-to-hear; highlight as it reads. Wave 1: engine + 2 sample books. Wave 2: full set. Final wave: pictures.

### CC Cycle 3 (Foundations) — Joey through Piper

- Public site: week picker × subject, topic list, original quiz UX on **public-domain / original** items.
- Private 532-card deck: **not hosted**.
- Map tracing: original US outline / feature quiz (maps app).
- Anatomy: original diagrams OK; **do not** republish Student Body coloring pages.

### Essentials — Joey only

- Public: **blank** points tracker (parent fills chart names/text from their guide). Do **not** typeset CC chart wording.
- Points idea (family tracker, not chart text): Look & Say / Eyes closed / Write copy / Write from memory, once per chart+level per day.

### Singing / dancing / other

- Singing: public-domain hymns/texts or melody-only. No CC Bible-song videos. Theme: songbird forest.
- Dancing: original practice cues; match the learner’s style. Theme: circus parade.
- Presentations: timer + outline. Theme: town-square stage.
- Bible: public-domain Scripture (KJV). Do not name a local class. Theme: shepherd’s hillside.
- Science / history: original wording on Cycle 3 *topic titles* plus public facts. Themes: creek-side bench / quilt of stories.
- Art: pottery studio. Lego learn-to-build is blocked on piece photos — not this wave.

---

## 4. Cycle 3 topic titles only (5th ed. week map)

Not recitation text. Public lists (states/capitals, feature names, formulas) are OK.

Every week has: Timeline; History; Geography; Science; English; Math; Fine Arts. Latin most weeks (none new in 13, 16, 19, 21, 23, 24).

- **W1:** Hist Columbus. Geo New England: ME Augusta, NH Concord, MA Boston, RI Providence, CT Hartford. Sci four types of tissue. Lat prepositions. Eng infinitive. Math skip 1s. FA Drawing intro; five elements of shape.
- **W2:** Hist Pilgrims. Geo VT Montpelier, NY Albany, NJ Trenton, PA Harrisburg, DE Dover. Sci axial skeleton. Lat conjunctions + adverbs. Eng present participle. Math skip 3s. FA Mirror images.
- **W3:** Hist Boston Tea Party. Geo MD Annapolis, VA Richmond, WV Charleston, NC Raleigh, SC Columbia + Washington, D.C. Sci three kinds of muscle. Lat pronouns. Eng past participle. Math skip 5s. FA Upside-down image.
- **W4:** Hist Declaration of Independence. Geo GA Atlanta, FL Tallahassee, AL Montgomery, MS Jackson, LA Baton Rouge. Sci three parts of the nervous system. Lat verbs. Eng principal parts of a verb. Math skip 7s. FA Abstract art.
- **W5:** Hist George Washington. Geo MI Lansing, OH Columbus, IN Indianapolis, KY Frankfort, TN Nashville. Sci five senses. Lat verbs. Eng principal parts of *to be*. Math skip 9s. FA Perspective.
- **W6:** Hist Louisiana Purchase. Geo WI Madison, IL Springfield, IA Des Moines, MO Jefferson City, AR Little Rock. Sci digestive system parts. Lat nouns. Eng principal parts of *to do*. Math skip 11s. FA Drawing review.
- **W7:** Hist Monroe Doctrine. Geo MN St. Paul, ND Bismarck, SD Pierre, WY Cheyenne, NE Lincoln. Sci excretory system (4 parts). Lat nouns. Eng *to rise*. Math skip 13s. FA Music theory intro; tin whistle parts.
- **W8:** Hist Missouri Compromise. Geo KS Topeka, OK Oklahoma City, TX Austin, CO Denver, NM Santa Fe. Sci circulatory system (6 parts). Lat nouns. Eng *to raise*. Math skip 14s. FA Dynamics.
- **W9:** Hist secession of the Southern states. Geo UT Salt Lake City, AZ Phoenix, NV Carson City, CA Sacramento, HI Honolulu. Sci lymph system (4 parts). Lat rule for verbs. Eng *to lay*. Math skip 15s. FA Note values and staff.
- **W10:** Hist Manifest Destiny. Geo MT Helena, ID Boise, WA Olympia, OR Salem, AK Juneau. Sci respiratory system parts. Lat rule for articles. Eng *to lie*. Math skip squares. FA Rhythm.
- **W11:** Hist Civil War. Geo 4 Northern Appalachians: White, Green, Adirondack, Allegheny. Sci endocrine system. Lat rule for nouns and pronouns. Eng *to set*. Math skip cubes. FA Note names and the D scale.
- **W12:** Hist General Robert E. Lee. Geo 5 Southern Appalachians: The Great Valley, Blue Ridge, Great Smoky, Cumberland, Mt. Mitchell. Sci major purposes of blood. Lat John 1:1 (weeks 12–13). Eng *to sit*. Math teaspoon/tablespoon equivalents. FA Review.
- **W13:** Hist Fourteenth Amendment. Geo 5 Western Mountains: Rockies, Pikes Peak, Mt. Elbert, Sierra Nevadas, Mt. Whitney. Sci atomic number. Eng *to beat*. Math liquid equivalents. FA Great artists intro; Grandma Moses.
- **W14:** Hist tycoons. Geo 4 Northwest Mountains: Cascades, Mt. Rainier, Mt. St. Helens, Denali. Sci what is an element. Lat John 1:2. Eng *to break*. Math linear equivalents. FA Picasso.
- **W15:** Hist immigrants coming to America. Geo 5 Great Lakes: Huron, Ontario, Michigan, Erie, Superior. Sci parts of an atom. Lat John 1:3 (weeks 15–16). Eng *to write*. Math metric measurements. FA Georgia O’Keeffe.
- **W16:** Hist United States and World War I. Geo 5 bays: Chesapeake, Hudson, San Francisco, Puget Sound, Pamlico Sound. Sci periodic table elements #1–4 (number, name, symbol, mass). Eng *to go*. Math area of a rectangle. FA Norman Rockwell.
- **W17:** Hist Nineteenth Amendment. Geo 5 rivers (East): St. Lawrence, Ohio, Mississippi, Missouri, Arkansas. Sci elements #5–8. Lat John 1:4. Eng subject. Math area of a square. FA Andrew Wyeth.
- **W18:** Hist Pearl Harbor. Geo 5 rivers (West): Colorado, Red, Rio Grande, Columbia, Great Salt Lake. Sci elements #9–12. Lat John 1:5 (weeks 18–19). Eng predicate. Math area of a triangle. FA Roy Lichtenstein.
- **W19:** Hist NATO. Geo 7 trails: Cumberland Road, Santa Fe, Mormon, Gila, Old Spanish, California, Oregon. Sci acid vs base. Eng clause. Math area of a circle. FA composers + orchestra intro; Romantic and Modern periods.
- **W20:** Hist Brown v. Board of Education. Geo 5 canals: Erie, Pennsylvania, Chesapeake and Ohio, Ohio and Erie, Miami and Erie. Sci “the heavens declare…” (Psalm text is Scripture; do not add CC commentary). Lat John 1:6 (weeks 20–21). Eng independent clause. Math circumference of a circle. FA Tchaikovsky (pieces not required).
- **W21:** Hist U.S. astronauts. Geo 7 Native American regions: Eastern Woodlands, Plains, Plateau, Northwest Coast, California, Great Basin, Southwest. Sci what the theory of evolution relies on (original, careful wording; don’t paste CC sentence). Eng subordinate/dependent clause. Math Associative Law. FA Debussy.
- **W22:** Hist September 11, 2001. Geo 5 deserts: Mojave, Sonoran, Colorado, Painted, Great Salt Lake Desert. Sci intelligent design (original wording only). Lat John 1:7 (weeks 22–24). Eng phrase. Math Commutative Law. FA Stravinsky.
- **W23:** Hist Preamble to the U.S. Constitution (public-domain text OK). Geo 6 features: Grand Canyon, Black Hills, Ozark Highlands, Okefenokee Swamp, Olympic Rainforests, Niagara Falls. Sci ways earth’s history is preserved. Eng four sentence structures. Math Distributive Law. FA orchestra overview.
- **W24:** Hist Bill of Rights (public-domain). Geo 5 more features: Mississippi River Delta, Mammoth Cave, San Andreas Fault, Gulf of Mexico, Death Valley. Sci natural selection (original wording). Eng seven sentence patterns. Math Identity Law. TL U.S. Presidents (public quiz may include #47 as a public fact). FA orchestra review.

Latin John 1:1–7 is Scripture (public domain in English/Vulgate). Do not paste CC Latin *list* recitations.

---

## 5. Anki

**Private (do not upload):** 532-card Cycle 3 pack and per-subject CC apkg.

**Public-safe to build:** original / public-domain decks aligned to topics (states/capitals, skip-counts, formulas, presidents, geography names, original grammar wording, math facts, letter sounds). This repo’s `tools/anki/build_decks.py` builds those from `apps/<id>/data/*.json`.

---

## 6. Priorities

1. Cycle 3 weekly memory-work *review* of allowed facts (other PR).
2. Essentials blank tracker (other PR).
3. Math facts + technique → paper (**this PR sample**).
4. Reading time + phonics by band (**this PR sample**, including garden books).
5. US geography / maps (other PR: history + geography).
6. Dance short practice (other PR: movement + art).
7. Presentation timer (later).
8. Anki public companions.
9. Lego (blocked).
10. Singing (other PR: bible + singing).

---

## 7. Open questions for the parents

Write **TBD — confirm with the parents** on the site until answered.

- Named paper math curriculum placement (Math Map skills vs a named book).
- Named reading curriculum for Joey/Theo/Bella. Independent reading levels.
- Does Hanna (or later Shiloh) attend Foundations community day?
- May president #47 be added to the *private* deck? Public quiz may include #47.
- Approve loading Cycle 3 + planned Anki decks onto tech-time phones? AnkiDroid vs Flash Deck?
- Private channel for the copyrighted deck?
- Usability testing plan for each new game (required before calling anything kid-tested).
- Singing: which existing app/progression, starting lesson.
- Dance: studio step lists vs generic timers.
- Lego piece-tray photos; confirm no kit purchases.
- Fine Arts weeks 20–22: pieces vs composer-only.
- Target devices: `/e/OS` Pixel + small Android only, or also other phones.
- Any 6th-edition Cycle 3 topic changes to wait for.

---

## 8. Review checklist

- [ ] No last names, birth dates, learner photos, addresses, church/campus/tutor/troop names on any public page, filename, commit, or alt text. First names only as in `stages.json`.
- [ ] UI uses first name + age band / stage / band code (`baby`…`upper`), never exact ages, never grade labels.
- [ ] Every stated “level” cites a source or is labeled TBD / unknown.
- [ ] No CC recitation text, Essentials chart wording, Math Map / notation scans, Student Body pages, copyrighted lyrics, or CC media.
- [ ] Math activities tell the learner to finish on paper.
- [ ] Piper/Hanna (`preschool`/`toddler`) phonics teach sounds, not letter names first.
- [ ] Offline path works on a small Android browser.
- [ ] Anki public files are only original / public-domain; notes do not attach the 532-card pack.
- [ ] Kid-friendly claims are absent until parents test.
- [ ] Dance / singing match stated participation (don’t assign ballet to Theo).
- [ ] No initials-only secret key from old briefs.

---

## 9. Site structure, bands, pictures (amendments)

1. No grade levels anywhere.
2. Math curriculum is CC Math Map; do not reproduce it.
3. Default bands by approximate age band (numbers only in `stages.json`): Joey upper; Theo primary; Bella early; Piper preschool; Hanna toddler; Shiloh baby.
4. UI shows name + age band or stage, never an exact age. Per-subject / band overrides live in the app (`hs.learnerBands`, `hs.band`) and export/import.
5. Each app is built once at `/homeschool/apps/<subject>/`. Each learner home is `/homeschool/<FirstName>/` and links via `play.html?app=&band=` so the PWA never leaves its scope.
6. Pictures: `images.json` slots; placeholders until the final wave. Reading may use picture-book spreads; other apps use pictures without picture-book chrome.
7. Shared kit is plumbing only. Each app owns its theme (`DESIGN.md`).
8. Parallel agents: history + geography, science, bible + singing, movement + art. This foundation PR: kit, homes, runner, CI, math, reading. No `cc-cycle3` app.
