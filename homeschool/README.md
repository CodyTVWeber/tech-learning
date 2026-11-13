# Homeschool

Static, offline-first learning homes for a Christian family. Served from GitHub Pages at `/tech-learning/homeschool/`.

**Untested, awaiting parent test.**

## Run locally

From the repo root:

```bash
python3 tools/homeschool/serve.py --port 4173
```

Open `http://127.0.0.1:4173/tech-learning/homeschool/`.

## What’s here

| Path | Role |
| --- | --- |
| `stages.json` | Learner folders, first names, age field, bands, subject levels |
| `apps/math` | Treasure Voyage (sample) |
| `apps/reading` | Garden reading + two decodable books (sample) |
| `Joey/` … `Shiloh/` | Per-learner installable PWAs (generated) |
| `kit/` | Nav, runner, PWA, a11y, progress — no shared look |
| `DESIGN.md` | Themes, contract, rubric |
| `SPEC.md` | Content spec |
| `AGENTS.md` | Rules for agents |
| `CONTRIBUTING.md` | How a subject PR plugs in |

Other subjects land in parallel PRs under `apps/<id>/`.

## Rebuild generated files

```bash
python3 tools/homeschool/build_assets.py
python3 tools/anki/build_decks.py
```
