#!/usr/bin/env python3
"""Load once, go offline, reload, play. Also checks the untested banner is visible."""
from __future__ import annotations

import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        return


def serve():
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd, "http://127.0.0.1:%s/index.html" % httpd.server_address[1]


def main() -> int:
    httpd, start = serve()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(start + "?band=early", wait_until="networkidle")
        page.wait_for_selector("#view-camp.on, #view-baby.on, #view-picker.on")
        banner = page.get_by_text("Untested, awaiting parent test.").first
        banner.wait_for()
        box = banner.bounding_box()
        if not box or box["width"] < 80 or box["height"] < 12:
            raise SystemExit("untested banner is not visibly laid out: %s" % box)
        hidden = banner.evaluate(
            """el => {
              const s = getComputedStyle(el);
              const tiny = s.width === '1px' || s.height === '1px';
              return s.clip === 'rect(0px, 0px, 0px, 0px)' || (s.position === 'absolute' && tiny)
                || s.display === 'none' || s.visibility === 'hidden';
            }"""
        )
        if hidden:
            raise SystemExit("untested banner is screen-reader-only or hidden")
        try:
            page.evaluate("() => navigator.serviceWorker.ready")
        except Exception as e:
            errors.append("sw ready: %s" % e)
        page.wait_for_timeout(800)
        context.set_offline(True)
        page.reload(wait_until="domcontentloaded")
        page.wait_for_selector("#view-camp.on, #view-baby.on")
        title = page.locator("h1").first.text_content() or ""
        if "Field Expedition" not in title:
            raise SystemExit("title missing offline: %s" % title)
        page.locator(".tabs button[data-id='habitats']").click()
        page.wait_for_selector("#view-habitats.on")
        page.locator("#habitat-grid button.card").first.click()
        page.wait_for_selector("#view-habitat.on")
        page.locator(".tabs button[data-id='lab']").click()
        page.wait_for_selector("#view-lab.on")
        lab_count = page.locator("#lab-grid button.card").count()
        if lab_count < 3:
            raise SystemExit("expected labs offline, got %s" % lab_count)
        page.locator(".tabs button[data-id='journal']").click()
        page.wait_for_selector("#view-journal.on")
        if errors:
            print("page errors:", "\n".join(errors))
        print("OFFLINE_OK", {"title": title.strip(), "labs": lab_count, "errors": len(errors), "banner": box})
        browser.close()
    httpd.shutdown()
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
