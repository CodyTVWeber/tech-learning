# Reading — Garden

Theme: garden (soil beds, clay pots, seed-packet marks, a bee that speaks **sounds**). Letter **sounds** first for `toddler` and `preschool` (never letter names as the first prompt). Picture-book reader for every band that has books.

Band via `?band=` or `hs.band`. Standalone with neither shows a plot picker (band names only, no ages). Progress: `hs.progress.reading`.

## Bands

| Band | What happens |
| --- | --- |
| baby | Not linked. Calm “no garden lessons” if opened. |
| toddler | Sound beds only. SATPIN + a few more. The bee speaks phonemes (`sss`, not “ess”). Visible graphemes on flowers. |
| preschool | Full letter-sound set, then gated listen-and-blend, then *Sam Sat*. Still sounds first. |
| early | CVC → helper signs → blends → digraphs → silent e. Four original books per plot, gated in order. |
| primary | Sundial (20 min), vowel teams, r-controlled roses, multisyllable plants, more helpers, vocabulary blooms. Earlier books open as a warm-up. |
| upper | Sundial (25 min), vocabulary, original comprehension stories + questions. All 28 books unlocked as a warm-up. |

## Books

28 original decodable read-alongs (4 per phonics plot). Tap a word to hear it. Read-page highlights as it reads. Image slots per page in `images.json`. Each book uses only sounds and helper words taught so far.

| Plot | Books |
| --- | --- |
| CVC | *Sam Sat*, *The Fig*, *A Hot Pot*, *The Red Bug* |
| Blends | *Stan Stands*, *The Plum Plot*, *Grant Trots*, *The Pond* |
| Digraphs | *The Shed*, *Chop*, *The Duck*, *The Moth* |
| Silent e | *The Cake*, *The Vine*, *The Rose*, *The Mule* |
| Vowel teams | *The Rain*, *The Bee*, *The Boat*, *The Moon Pool* |
| R-controlled | *The Cart*, *The Corn*, *The Fern*, *The Herd* |
| Multisyllable | *The Picnic*, *The Rabbit*, *The Sunflower*, *The Pumpkin* |

## Progress shape

`localStorage['hs.progress.reading']`:

- `blooms` — collectible count (not a grade)
- `stamps` — plot and book ids collected
- `bedsDone` — `{ sounds: true, cvc: true, … }`
- `booksRead` — book ids
- `totalMinutes` — sundial minutes (not a score)
- `updatedAt`

## Sounds

Leaf rustle (try again), bee (prompt), bloom chime (correct), page turn. WebAudio cues; Web Speech for read-aloud. Mute via kit chrome, or a Sound on/off control when standalone.

## Runner notes

Fetch with `HS.url('data/early.json')` (and `data/books.json`, `books/<id>.json`). Do not register a service worker when `data-runner` is set. Keep `#go-sounds` on the toddler/preschool sound-bed button. Visible graphemes use `.garden-letter`.
