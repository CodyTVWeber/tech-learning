#!/usr/bin/env python3
"""Load once, go offline, reload, play — Harbor Studio."""
from __future__ import annotations

import http.server
import socketserver
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
PORT = 8766


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        pass


def main() -> None:
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    url = f"http://127.0.0.1:{PORT}/index.html?band=early"
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_function("() => navigator.serviceWorker.ready", timeout=60000)
        page.reload(wait_until="domcontentloaded", timeout=60000)
        page.wait_for_function("() => navigator.serviceWorker && navigator.serviceWorker.controller", timeout=60000)
        assert page.get_by_role("heading", name="Harbor Studio").is_visible()
        banner = page.locator(".untested-banner")
        assert banner.is_visible()
        assert "untested, awaiting parent test" in banner.inner_text().lower()
        box = banner.bounding_box()
        assert box and box["height"] >= 16
        context.set_offline(True)
        page.reload(wait_until="domcontentloaded")
        assert page.get_by_role("heading", name="Harbor Studio").is_visible()
        assert page.locator(".untested-banner").is_visible()
        page.get_by_role("button", name="Open Canvas").click()
        canvas = page.locator("#paint")
        box = canvas.bounding_box()
        assert box
        page.mouse.move(box["x"] + 40, box["y"] + 40)
        page.mouse.down()
        page.mouse.move(box["x"] + 120, box["y"] + 90)
        page.mouse.up()
        print("OFFLINE_OK art")
        browser.close()
    httpd.shutdown()


if __name__ == "__main__":
    main()
