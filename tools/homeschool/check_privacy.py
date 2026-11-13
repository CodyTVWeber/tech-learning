#!/usr/bin/env python3
"""Fail if shipped homeschool UI/content looks like personal data or banned claims."""
from __future__ import annotations

import os
import re
import sqlite3
import sys
import tempfile
import zipfile
from pathlib import Path

HS = Path(__file__).resolve().parents[2] / "homeschool"
SCAN_EXT = {".html", ".css", ".js", ".json", ".webmanifest", ".csv", ".md", ".txt"}
POLICY_DOCS = {
    "SPEC.md",
    "DESIGN.md",
    "AGENTS.md",
    "CONTRIBUTING.md",
    "CREDITS.md",
    "README.md",
}

PII = [
    (re.compile(r"birth\s*date|birthday|birth\s*month|born\s+on", re.I), "birth date"),
    (re.compile(r"\bJennine\b"), "parent first name not approved for the site"),
    (re.compile(r"\b1st-2nd\b|\b3rd-4th\b|\b5th grade\b|\b1st grade\b"), "grade label"),
    (re.compile(r"\bkindergarten\b", re.I), "grade label"),
]

MEDICAL = [
    (re.compile(r"occupational\s+therapy", re.I), "medical/therapy"),
    (re.compile(r"speech\s+therapy", re.I), "medical/therapy"),
    (re.compile(r"physical\s+therapy", re.I), "medical/therapy"),
    (re.compile(r"\btherapists?\b", re.I), "medical/therapy"),
    (re.compile(r"\bdiagnos(?:is|ed|es)\b", re.I), "medical/therapy"),
    (re.compile(r"\bIEP\b"), "medical/therapy"),
    (re.compile(r"\b504\s+plan\b", re.I), "medical/therapy"),
    (re.compile(r"\bmedications?\b", re.I), "medical/therapy"),
    (re.compile(r"\bprescriptions?\b", re.I), "medical/therapy"),
    (re.compile(r"medical\s+record", re.I), "medical/therapy"),
]

CLAIMS = [
    (re.compile(r"kid-friendly", re.I), "kid-friendly claim"),
    (re.compile(r"kid-tested", re.I), "kid-tested claim"),
]


def extra_term_checks() -> list[tuple[re.Pattern, str]]:
    raw = os.environ.get("HS_PRIVACY_TERMS") or ""
    terms = [t.strip() for t in re.split(r"[\n,]+", raw) if t.strip()]
    out = []
    for term in terms:
        out.append((re.compile(re.escape(term), re.I), "blocked private term"))
    return out


def apkg_text(path: Path) -> str:
    chunks: list[str] = []
    with zipfile.ZipFile(path) as z:
        for name in z.namelist():
            payload = z.read(name)
            lower = name.lower()
            if lower.endswith((".json", ".txt", ".html", ".css", ".xml")):
                chunks.append(payload.decode("utf-8", "replace"))
            if Path(name).name in {"collection.anki2", "collection.anki21"}:
                tmp = tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False)
                tmp.write(payload)
                tmp.close()
                con = sqlite3.connect(tmp.name)
                try:
                    cols = [r[1] for r in con.execute("PRAGMA table_info(notes)")]
                    if "flds" in cols:
                        for (flds,) in con.execute("select flds from notes"):
                            chunks.append(str(flds).replace("\x1f", " "))
                    if "tags" in cols:
                        for (tags,) in con.execute("select tags from notes"):
                            chunks.append(str(tags))
                    try:
                        for (dname,) in con.execute("select name from decks"):
                            chunks.append(str(dname))
                    except sqlite3.Error:
                        pass
                finally:
                    con.close()
    return "\n".join(chunks)


def file_text(path: Path) -> str | None:
    if path.suffix.lower() == ".apkg":
        try:
            return apkg_text(path)
        except (OSError, zipfile.BadZipFile, sqlite3.Error):
            return None
    if path.suffix.lower() not in SCAN_EXT:
        return None
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return None


def checks_for(path: Path) -> list[tuple[re.Pattern, str]]:
    # Policy docs name the bans ("no birth dates"); still scan them for medical
    # leaks and extra blocked terms. UI/content files get the full set.
    checks = list(MEDICAL) + extra_term_checks()
    if path.name not in POLICY_DOCS:
        checks.extend(PII)
        checks.extend(CLAIMS)
    return checks


def main() -> int:
    bad = []
    for p in HS.rglob("*"):
        if not p.is_file():
            continue
        text = file_text(p)
        if text is None:
            continue
        rel = p.relative_to(HS.parent)
        for rx, why in checks_for(p):
            if rx.search(text):
                bad.append("%s: %s" % (rel, why))
    if bad:
        print("privacy check failed:")
        for b in bad:
            print(" -", b)
        return 1
    extra = extra_term_checks()
    print("privacy check ok" + (" (extra terms on)" if extra else " (extra terms unset)"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
