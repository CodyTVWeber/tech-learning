#!/usr/bin/env python3
"""Serve the repo as GitHub Pages would: /tech-learning/..."""
from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[2]
PREFIX = "/tech-learning/"


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys_stderr = __import__("sys").stderr
        sys_stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def guess_type(self, path):
        if path.endswith(".webmanifest"):
            return "application/manifest+json"
        return super().guess_type(path)

    def translate_path(self, path):
        parsed = unquote(urlparse(path).path)
        if parsed.startswith(PREFIX):
            rel = parsed[len(PREFIX) :]
        elif parsed in ("/", ""):
            rel = ""
        else:
            rel = "___missing___"
        dest = (ROOT / rel).resolve()
        try:
            dest.relative_to(ROOT)
        except ValueError:
            return str(ROOT / "___missing___")
        return str(dest)

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/", "/tech-learning"):
            self.send_response(302)
            self.send_header("Location", PREFIX)
            self.end_headers()
            return
        return super().do_GET()


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=4173)
    p.add_argument("--bind", default="127.0.0.1")
    args = p.parse_args()
    httpd = ThreadingHTTPServer((args.bind, args.port), Handler)
    print("serving %s at http://%s:%s%s" % (ROOT, args.bind, args.port, PREFIX), flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
