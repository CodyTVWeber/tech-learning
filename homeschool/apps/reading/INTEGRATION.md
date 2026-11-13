# Reading — Garden

Theme: garden (soil beds, clay pots, seed-packet marks, a bee that speaks **sounds**). Letter **sounds** first for `toddler` and `preschool` (never letter names as the first prompt). Picture-book reader for every band that has books.

Band via `HS.getBand()` (`?band=` else `hs.band`). Unset stays unset — standalone shows the plot picker; the runner always passes `?band=`. Standalone loads kit `audio.js`, `tts.js`, and `progress.js` so TTS, cues, and progress match the runner. Read-aloud uses `HS.speak`. The service worker matches `?band=` with `ignoreSearch` and falls back to `index.html` when offline. Progress: `HS.progressKey('reading')` (`hs.progress.<folder>.reading`).

## Bands

| Band | What happens |
| --- | --- |
| baby | Not linked. Calm “no garden lessons” if opened. |
| toddler | Sound beds only. SATPIN + a few more. The bee speaks phonemes (`sss`, `tuh`, not “ess” or “tee”). Tap a picture of the sound. The grapheme shows after a correct tap. |
| preschool | Eight sticky picture-sounds, then one tap-seed blend, then *Sam Sat*. Still sounds first. |
| early | CVC → helper signs → blends → digraphs → silent e → vowel teams. The book path shows the next open book and the next action, not a wall of locked covers. |
| primary | Longer garden books and vocabulary blooms first. Then vowel teams, r-controlled roses, multisyllable plants, helpers. Sundial last for paper reading. |
| upper | Longer garden books and vocabulary blooms first, then story questions. Sundial last. All books unlocked. |

## Books

32 original read-alongs. Tap a word to hear it. Read-page highlights as it reads. Image slots per page in `images.json`; the reader paints original SVG garden art in those slots (PNG placeholders stay for the assets contract). Each decodable book uses only sounds and helper words taught so far. Four longer volume books sit first for primary and upper.

| Plot | Books |
| --- | --- |
| CVC | *Sam Sat*, *The Fig*, *A Hot Pot*, *The Red Bug* |
| Blends | *Stan Stands*, *The Plum Plot*, *Grant Trots*, *The Pond* |
| Digraphs | *The Shed*, *Chop*, *The Duck*, *The Moth* |
| Silent e | *The Cake*, *The Vine*, *The Rose*, *The Mule* |
| Vowel teams | *The Rain*, *The Bee*, *The Boat*, *The Moon Pool* |
| R-controlled | *The Cart*, *The Corn*, *The Fern*, *The Herd* |
| Multisyllable | *The Picnic*, *The Rabbit*, *The Sunflower*, *The Pumpkin* |
| Volume | *Sun on the Rows*, *Harvest Day*, *The Garden Gate*, *Under the Trellis* — about 60 sentences each, for a long sitting |

## Progress shape

`HS.progressKey('reading')` (`hs.progress.<folder>.reading`):

- `blooms` — collectible count (not a grade)
- `stamps` — plot and book ids collected
- `bedsDone` — `{ sounds: true, cvc: true, … }`
- `booksRead` — book ids
- `totalMinutes` — sundial minutes (not a score)
- `updatedAt`

## Sounds

Leaf rustle (try again), bee (prompt), bloom chime (correct), page turn. WebAudio cues; Web Speech for read-aloud. Mute via kit chrome, or a Sound on/off control when standalone. Blend prompts speak phonemes in one utterance (`sss. aaa. tuh.`), never letter names.

## Runner notes

Fetch with `HS.url('data/early.json')` (and `data/books.json`, `books/<id>.json`). Do not register a service worker when `data-runner` is set. Keep `#go-sounds` on the toddler/preschool sound-bed button. Visible graphemes use `.garden-letter`.
