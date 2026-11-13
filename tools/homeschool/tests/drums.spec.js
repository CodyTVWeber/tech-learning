import { test, expect } from "@playwright/test";

const BASE = "/tech-learning/homeschool/";

function onErrors(page, bucket) {
  page.on("pageerror", (err) => bucket.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") bucket.push(msg.text());
  });
}

async function noHorizontalOverflow(page) {
  const box = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    return {
      root: root.scrollWidth <= root.clientWidth + 1,
      body: body.scrollWidth <= body.clientWidth + 1,
      sw: root.scrollWidth,
      cw: root.clientWidth,
    };
  });
  expect(box.root, "scrollWidth " + box.sw + " clientWidth " + box.cw).toBe(true);
  expect(box.body).toBe(true);
}

async function tapPad(page) {
  return page.evaluate(() => {
    const pad = document.getElementById("pad");
    const rect = pad.getBoundingClientRect();
    pad.dispatchEvent(new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      pointerId: 4,
      pointerType: "touch",
      isPrimary: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      buttons: 1,
    }));
    return window.__drums.soundCount();
  });
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.addInitScript(() => {
    try { localStorage.clear(); } catch (e) {}
  });
});

test("drums page loads, judges a pad tap, and stays within the screen", async ({ page }) => {
  const errors = [];
  onErrors(page, errors);

  await page.goto(BASE + "apps/drums/index.html", { waitUntil: "load" });
  await expect(page.locator("h1")).toContainText("Choose a band");
  await expect(page.locator(".untested-banner")).toBeVisible();
  await noHorizontalOverflow(page);

  await page.goto(BASE + "apps/drums/index.html?band=upper", { waitUntil: "load" });
  await expect(page.locator(".untested-banner")).toHaveText(/Untested, awaiting parent test/);
  await expect(page.locator("#pad")).toBeVisible();
  await expect(page.locator("#staff")).toBeVisible();
  await expect(page.locator("h1")).toContainText("Four Steady");
  await noHorizontalOverflow(page);

  await page.locator("#patterns").click();
  await expect(page.locator("h1")).toContainText("Set list");
  await noHorizontalOverflow(page);
  await page.locator('[data-act="lineup"]').click();
  await expect(page.locator("h1")).toContainText("Line up taps");
  await noHorizontalOverflow(page);
  await page.locator("#back").click();

  await page.locator("#start").click();
  await page.waitForFunction(() => window.__drums && window.__drums.playing());
  const judged = await page.evaluate(() => new Promise((resolve, reject) => {
    const started = performance.now();
    function step() {
      const api = window.__drums;
      const now = api.audioNow();
      const note = api.openNoteNear(now);
      if (note) {
        const pad = document.getElementById("pad");
        const rect = pad.getBoundingClientRect();
        pad.dispatchEvent(new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          pointerId: 9,
          pointerType: "touch",
          isPrimary: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + 40,
          buttons: 1,
        }));
        resolve(api.lastJudge());
        return;
      }
      if (performance.now() - started > 12000) reject(new Error("no note window opened"));
      else requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }));
  expect(judged).toMatch(/Perfect|Good/);
  await expect(page.locator(".marker").filter({ hasText: /Perfect|Good/ }).first()).toBeVisible();
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("drums offline reload with ?band=toddler still accepts a tap", async ({ page, context }) => {
  const errors = [];
  const failed = [];
  onErrors(page, errors);
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (/favicon\.ico/.test(url)) return;
    const err = req.failure();
    failed.push(((err && err.errorText) || "failed") + " " + url);
  });

  await page.goto(BASE + "apps/drums/index.html?band=toddler", { waitUntil: "load" });
  await expect(page.locator("#pad")).toBeVisible();
  await page.waitForFunction(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
  await context.setOffline(true);
  let navError = "";
  try {
    await page.reload({ waitUntil: "load" });
  } catch (e) {
    navError = String(e);
  }
  expect(navError, "offline reload of ?band=toddler").not.toMatch(/ERR_FAILED|net::/);
  await expect(page.locator("#pad")).toBeVisible();
  await expect(page.locator("h1")).toContainText("Four Steady");
  const sounds = await tapPad(page);
  expect(sounds).toBeGreaterThan(0);
  await noHorizontalOverflow(page);
  expect(failed.filter((text) => /ERR_FAILED/.test(text))).toEqual([]);
  expect(errors).toEqual([]);
});

test("runner hides the app bar, fits the pad, and kit mute silences the snare", async ({ page }) => {
  const errors = [];
  onErrors(page, errors);
  await page.goto(BASE + "Joey/play.html?app=drums&band=upper", { waitUntil: "load" });
  await expect(page.locator("#pad")).toBeVisible();
  await expect(page.locator(".app-bar")).toBeHidden();
  await expect(page.locator(".hs-banner")).toContainText(/Untested, awaiting parent test/);

  const pad = await page.locator("#pad").boundingBox();
  const staff = await page.locator("#staff").boundingBox();
  const start = await page.locator("#start").boundingBox();
  expect(pad).toBeTruthy();
  expect(staff).toBeTruthy();
  expect(start).toBeTruthy();
  expect(staff.y).toBeGreaterThanOrEqual(0);
  expect(start.y + start.height).toBeLessThanOrEqual(916);
  expect(pad.y + pad.height).toBeLessThanOrEqual(916);
  expect(pad.height).toBeGreaterThanOrEqual(56);
  expect(start.height).toBeGreaterThanOrEqual(56);
  await noHorizontalOverflow(page);

  const before = await tapPad(page);
  expect(before).toBeGreaterThan(0);
  await page.locator("#hs-mute-btn").click();
  const after = await tapPad(page);
  expect(after).toBe(before);
  expect(errors).toEqual([]);
});
