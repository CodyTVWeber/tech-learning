#!/usr/bin/env python3
"""Fail if shipped homeschool UI/content looks like personal data or banned claims."""
from __future__ import annotations

import re
import sys
from pathlib import Path

HS = Path(__file__).resolve().parents[2] / "homeschool"
SCAN_EXT = {".html", ".css", ".js", ".json", ".webmanifest", ".csv"}
SKIP_NAMES = {
    "SPEC.md",
    "DESIGN.md",
    "AGENTS.md",
    "CONTRIBUTING.md",
    "CREDITS.md",
    "INTEGRATION.md",
    "README.md",
}

BANNED = [
    (re.compile(r"kid-friendly", re.I), "kid-friendly claim"),
    (re.compile(r"kid-tested", re.I), "kid-tested claim"),
    (re.compile(r"birth\s*date|birthday|birth\s*month|born\s+on", re.I), "birth date"),
    (re.compile(r"\bJennine\b"), "parent first name not approved for the site"),
    (re.compile(r"\b1st-2nd\b|\b3rd-4th\b|\b5th grade\b|\b1st grade\b"), "grade label"),
    (re.compile(r"\bkindergarten\b", re.I), "grade label"),
]


def main() -> int:
    bad = []
    for p in HS.rglob("*"):
        if not p.is_file():
            continue
        if p.name in SKIP_NAMES:
            continue
        if p.suffix.lower() not in SCAN_EXT:
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for rx, why in BANNED:
            if rx.search(text):
                bad.append("%s: %s" % (p.relative_to(HS.parent), why))
    if bad:
        print("privacy check failed:")
        for b in bad:
            print(" -", b)
        return 1
    print("privacy check ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
