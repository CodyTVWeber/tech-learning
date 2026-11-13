#!/usr/bin/env python3
"""Write assets.json and images.json (kit contract)."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

runtime_ext = {".html", ".css", ".js", ".json", ".svg", ".png", ".webmanifest", ".mjs"}
skip_names = {"INTEGRATION.md", "CREDITS.md", "offline-test.mjs", "offline-test.py"}

files = []
for p in sorted(ROOT.rglob("*")):
    if not p.is_file():
        continue
    rel = p.relative_to(ROOT).as_posix()
    # Only skip the generator folder, not images/tools plates.
    if rel.startswith("tools/"):
        continue
    if p.name in skip_names:
        continue
    if p.suffix.lower() not in runtime_ext:
        continue
    files.append(rel)

# index.html first, unique. Always list the two manifests the kit reads.
ordered = []
for f in ["index.html", "assets.json", "images.json"] + files:
    if f not in ordered:
        ordered.append(f)

assets = {
    "id": "science",
    "title": "Field Expedition",
    "shortTitle": "Science",
    "theme": "naturalist's field expedition",
    "version": "1",
    "files": ordered,
}
(ROOT / "assets.json").write_text(json.dumps(assets, indent=2) + "\n", encoding="utf-8")

images = []
for img in sorted((ROOT / "images").rglob("*.svg")):
    rel = img.relative_to(ROOT / "images").as_posix()
    slot = rel.replace("/", "-").replace(".svg", "")
    alt = img.stem.replace("-", " ")
    notes = "Original linocut field plate on cream paper. Final picture wave may replace in place."
    if rel == "ui/placeholder.svg":
        alt = "Reserved plate for a later photograph wave"
        notes = "Neutral ink frame. Do not delete this slot."
    images.append(
        {
            "file": rel,
            "width": 600,
            "height": 400,
            "alt": alt,
            "themeNotes": notes,
            "slot": slot,
        }
    )

(ROOT / "images.json").write_text(
    json.dumps(
        {
            "app": "science",
            "theme": "naturalist's field expedition",
            "images": images,
        },
        indent=2,
    )
    + "\n",
    encoding="utf-8",
)
print("assets", len(ordered), "images", len(images))
