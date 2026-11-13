#!/usr/bin/env python3
"""Generate learner PWAs, placeholder images, and validate assets.json lists."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HS = ROOT / "homeschool"
TEMPL = HS / "pwa-templates"
sys.path.insert(0, str(Path(__file__).resolve().parent))
from png import parse_hex, write_png  # noqa: E402

RUNTIME_EXT = {".html", ".css", ".js", ".json", ".png", ".webmanifest", ".svg", ".woff2"}
SKIP_NAMES = {"INTEGRATION.md"}

APP_TINTS = {
    "math": (14, 74, 87),
    "reading": (44, 90, 50),
}


def load_stages():
    return json.loads((HS / "stages.json").read_text())


def apps():
    out = []
    apps_dir = HS / "apps"
    if not apps_dir.exists():
        return out
    for p in sorted(apps_dir.iterdir()):
        if (p / "assets.json").is_file():
            out.append(p)
    return out


def gen_placeholders(app_dir: Path) -> None:
    man_path = app_dir / "images.json"
    tint = APP_TINTS.get(app_dir.name, (140, 140, 132))
    if man_path.is_file():
        man = json.loads(man_path.read_text())
        for img in man.get("images", []):
            dest = app_dir / "images" / img["file"]
            w, h = int(img.get("width", 256)), int(img.get("height", 256))
            write_png(dest, w, h, tint)
    assets = json.loads((app_dir / "assets.json").read_text())
    for f in assets.get("files", []):
        if f.endswith(".png"):
            dest = app_dir / f
            if not dest.exists():
                size = 192 if "192" in f else 512 if "512" in f else 256
                write_png(dest, size, size, tint)


def fill_template(text: str, stage: dict) -> str:
    return (
        text.replace("{{NAME}}", stage["displayName"])
        .replace("{{SHORT}}", stage["displayName"][:12])
        .replace("{{THEME}}", stage.get("themeColor", "#161616"))
        .replace("{{FOLDER}}", stage["folder"])
    )


def write_kid(stage: dict) -> None:
    dest = HS / stage["folder"]
    dest.mkdir(parents=True, exist_ok=True)
    (dest / "icons").mkdir(exist_ok=True)
    for name in ("index.html", "play.html", "sw.js", "manifest.webmanifest"):
        src = (TEMPL / name).read_text()
        (dest / name).write_text(fill_template(src, stage))
    rgb = parse_hex(stage.get("themeColor", "#161616"))
    write_png(dest / "icons" / "icon-192.png", 192, 192, rgb)
    write_png(dest / "icons" / "icon-512.png", 512, 512, rgb)
    # Maskable: same field, extra inset simulated by a slightly lighter fill
    inset = tuple(min(255, c + 40) for c in rgb)
    write_png(dest / "icons" / "maskable-192.png", 192, 192, inset)
    write_png(dest / "icons" / "maskable-512.png", 512, 512, inset)


def write_hub_icons() -> None:
    d = HS / "icons"
    d.mkdir(exist_ok=True)
    write_png(d / "icon-192.png", 192, 192, (22, 22, 22))
    write_png(d / "icon-512.png", 512, 512, (22, 22, 22))
    write_png(d / "maskable-192.png", 192, 192, (60, 60, 60))
    write_png(d / "maskable-512.png", 512, 512, (60, 60, 60))


def validate_app(app_dir: Path) -> list[str]:
    errors = []
    assets_path = app_dir / "assets.json"
    assets = json.loads(assets_path.read_text())
    files = assets.get("files") or []
    listed = set(files)
    if assets.get("id") != app_dir.name:
        errors.append(f"{app_dir.name}: assets.json id must match folder")
    for f in files:
        if not (app_dir / f).is_file():
            errors.append(f"{app_dir.name}: listed missing {f}")
    for p in app_dir.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(app_dir).as_posix()
        if p.name in SKIP_NAMES:
            continue
        if p.suffix.lower() not in RUNTIME_EXT:
            continue
        if rel not in listed:
            errors.append(f"{app_dir.name}: {rel} not in assets.json")
    img_man = app_dir / "images.json"
    if img_man.is_file():
        man = json.loads(img_man.read_text())
        for img in man.get("images", []):
            rel = "images/" + img["file"]
            if rel not in listed:
                errors.append(f"{app_dir.name}: {rel} from images.json not in assets.json")
    return errors


def write_apps_index() -> None:
    ids = [p.name for p in apps()]
    (HS / "apps-index.json").write_text(json.dumps({"apps": ids}, indent=2) + "\n")


def main(check: bool) -> int:
    stages = load_stages()
    write_hub_icons()
    write_apps_index()
    for stage in stages.get("stages", []):
        write_kid(stage)
    errors = []
    for app in apps():
        gen_placeholders(app)
        errors.extend(validate_app(app))
    listed = json.loads((HS / "apps-index.json").read_text()).get("apps") or []
    found = [p.name for p in apps()]
    if listed != found:
        errors.append("apps-index.json stale: %s vs %s" % (listed, found))
    if errors:
        print("assets.json problems:")
        for e in errors:
            print(" -", e)
        return 1
    print("build_assets: ok (%d apps, %d learners)" % (len(list(apps())), len(stages.get("stages", []))))
    return 0


if __name__ == "__main__":
    raise SystemExit(main("--check" in sys.argv))
