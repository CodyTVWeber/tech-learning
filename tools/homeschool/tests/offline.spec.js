import { test, expect } from "@playwright/test";

const BASE = "/tech-learning/homeschool/";

function onErrors(page, bucket) {
  page.on("pageerror", (err) => bucket.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") bucket.push(msg.text());
  });
}

async function waitPrecache(page) {
  await page.waitForFunction(() => window.__HS_PRECACHE_READY === true, null, {
    timeout: 20000,
  });
}

async function assertManifest(page, url) {
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBeTruthy();
  const manifestUrl = new URL(href, page.url()).href;
  const man = await page.evaluate(async (u) => fetch(u).then((r) => r.json()), manifestUrl);
  expect(man.name).toBeTruthy();
  expect(man.short_name).toBeTruthy();
  expect(man.display).toBe("standalone");
  expect(man.start_url).toBeTruthy();
  expect(man.scope).toBeTruthy();
  const sizes = (man.icons || []).map((i) => i.sizes);
  expect(sizes.join(" ")).toMatch(/192/);
  expect(sizes.join(" ")).toMatch(/512/);
  return man;
}

async function assertControlling(page) {
  const ctl = await page.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
  expect(ctl, "service worker should control the page").toBe(true);
}

test("hub and each learner PWA work offline", async ({ page, context }) => {
  const errors = [];
  onErrors(page, errors);

  await page.goto(BASE, { waitUntil: "load" });
  await waitPrecache(page);
  await assertManifest(page, BASE);
  await page.reload({ waitUntil: "load" });
  await waitPrecache(page);
  await assertControlling(page);
  await expect(page.locator("h1")).toContainText("Family learning homes");

  const stages = await page.evaluate(async () => fetch("./stages.json").then((r) => r.json()));
  const appIds = await page.evaluate(async () => {
    const idx = await fetch("./apps-index.json").then((r) => r.json());
    return idx.apps || [];
  });
  expect(appIds.length, "math and reading should exist").toBeGreaterThanOrEqual(2);

  for (const stage of stages.stages) {
    errors.length = 0;
    const home = BASE + encodeURIComponent(stage.folder) + "/";
    await context.setOffline(false);
    await page.goto(home, { waitUntil: "load" });
    await waitPrecache(page);
    await page.reload({ waitUntil: "load" });
    await waitPrecache(page);
    await assertControlling(page);
    const man = await assertManifest(page, home);
    expect(man.name).toContain(stage.displayName);
    expect(man.scope).toMatch(/^\.\//);
    await expect(page.locator("h1")).toContainText(stage.displayName);
    expect(errors, "console errors on " + stage.folder + " home").toEqual([]);

    await context.setOffline(true);
    await page.reload({ waitUntil: "load" });
    await expect(page.locator("h1")).toContainText(stage.displayName);
    await assertControlling(page);
    expect(errors, "offline home " + stage.folder).toEqual([]);

    const linked = Object.entries(stage.subjects || {})
      .filter(([, level]) => level && level !== "none")
      .map(([id]) => id)
      .filter((id) => appIds.includes(id));

    for (const appId of linked) {
      errors.length = 0;
      const play =
        home + "play.html?app=" + encodeURIComponent(appId) + "&band=" + encodeURIComponent(stage.band);
      await page.goto(play, { waitUntil: "load" });
      await page.waitForSelector("#app-root");
      // HS.runApp() fetches index.html and scripts after load. Shell-only apps
      // (singing, bible) have no static text; read innerText only once they render.
      await expect(async () => {
        const text = (await page.locator("#app-root").innerText()).trim();
        expect(text.length, "app " + appId + " for " + stage.folder + " rendered").toBeGreaterThan(8);
      }).toPass();
      await expect(page.locator("#app-root")).not.toHaveText(/Could not open|not on this device/);
      if (appId === "reading" && (stage.band === "toddler" || stage.band === "preschool")) {
        await expect(page.locator("#go-sounds")).toBeVisible();
        await page.locator("#go-sounds").click();
        await expect(page.locator(".garden-sound").first()).toBeVisible();
        await expect(page.locator(".garden-flowers button.is-right")).toHaveCount(0);
        await expect(page.locator(".garden-flowers .garden-letter").first()).toBeHidden();
      }
      await assertControlling(page);
      expect(errors, "offline play " + stage.folder + " " + appId).toEqual([]);
    }
  }
});

test("missing assets.json does not break a home", async ({ page }) => {
  const errors = [];
  const missingAssets = [];
  onErrors(page, errors);
  page.on("response", (res) => {
    if (res.status() === 404 && /\/apps\/[^/]+\/assets\.json$/.test(res.url())) {
      missingAssets.push(res.url());
    }
  });
  await page.goto(BASE + "Joey/", { waitUntil: "load" });
  await waitPrecache(page);
  await expect(page.locator("h1")).toContainText("Joey");
  expect(missingAssets, "home must not GET assets.json for unbuilt apps").toEqual([]);
  expect(errors).toEqual([]);

  await page.goto(BASE + "Joey/play.html?app=presentation&band=upper", { waitUntil: "load" });
  await expect(page.locator("#app-root")).toContainText("not on this device yet");
  expect(missingAssets).toEqual([]);
  expect(errors).toEqual([]);
});

async function fitsViewport(page) {
  const box = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(box.sw, "page wider than the 412px viewport").toBeLessThanOrEqual(box.cw + 1);
}

test("geography pin drop lands on its state seat", async ({ page }) => {
  const errors = [];
  onErrors(page, errors);
  await page.goto(BASE + "Bella/play.html?app=geography&band=early", { waitUntil: "load" });
  await expect(page.locator("#app-root")).toContainText("Expedition");
  await page.getByRole("button", { name: /New England coast/ }).click();
  await page.getByRole("button", { name: "Drop pins" }).click();
  const seat = page.locator('.drop-seat[data-abbr="ME"]');
  await expect(seat).toBeVisible();
  const seatBox = await seat.boundingBox();
  expect(seatBox.height).toBeGreaterThanOrEqual(56);
  expect(seatBox.width).toBeGreaterThanOrEqual(56);
  await seat.scrollIntoViewIfNeeded();
  await page.locator('.pin[data-abbr="ME"]').dragTo(seat);
  await expect(page.locator("#live")).toContainText(/home|Stamp/);
  await fitsViewport(page);
  expect(errors).toEqual([]);
});

test("history and geography fit a 412px screen and keep 56px controls", async ({ page }) => {
  await page.goto(BASE + "Bella/play.html?app=history&band=early", { waitUntil: "load" });
  await expect(page.locator(".station-stop .sign").first()).toBeVisible();
  const sign = await page.locator(".station-stop .sign").first().boundingBox();
  expect(sign.height).toBeGreaterThanOrEqual(56);
  await fitsViewport(page);

  await page.goto(BASE + "apps/history/?band=early", { waitUntil: "load" });
  const historyBtn = await page.locator(".topbar .icon-btn").first().boundingBox();
  expect(historyBtn.height).toBeGreaterThanOrEqual(56);
  expect(historyBtn.width).toBeGreaterThanOrEqual(56);
  await fitsViewport(page);

  await page.goto(BASE + "apps/geography/?band=early", { waitUntil: "load" });
  const geoBtn = await page.locator(".topbar .icon-btn").first().boundingBox();
  expect(geoBtn.height).toBeGreaterThanOrEqual(56);
  expect(geoBtn.width).toBeGreaterThanOrEqual(56);
  await fitsViewport(page);

  await page.goto(BASE + "Bella/play.html?app=geography&band=early", { waitUntil: "load" });
  await fitsViewport(page);
});

test("toddler and preschool open on pictures, and omitted subjects stay closed", async ({ page }) => {
  await page.goto(BASE + "Piper/play.html?app=history&band=preschool", { waitUntil: "load" });
  await expect(page.locator(".picture-ticket").first()).toBeVisible();
  await expect(page.locator(".lede")).toHaveCount(0);
  await expect(page.locator(".station-stop")).toHaveCount(0);

  await page.goto(BASE + "Piper/play.html?app=geography&band=preschool", { waitUntil: "load" });
  await expect(page.locator(".place-card").first()).toBeVisible();
  await expect(page.locator(".flight-btn")).toHaveCount(0);
  await expect(page.locator(".lede")).toHaveCount(0);

  await page.goto(BASE + "Bella/play.html?app=history&band=toddler", { waitUntil: "load" });
  await expect(page.locator(".picture-ticket").nth(2)).toBeVisible();

  await page.goto(BASE + "Bella/play.html?app=geography&band=toddler", { waitUntil: "load" });
  await expect(page.locator(".place-card")).toHaveCount(6);

  for (const kid of ["Hanna", "Shiloh"]) {
    for (const app of ["history", "geography"]) {
      await page.goto(BASE + kid + "/play.html?app=" + app + "&band=toddler", { waitUntil: "load" });
      await expect(page.locator("#app-root")).toContainText("not on this device");
      await expect(page.locator("#app")).toHaveCount(0);
    }
  }
});

test("upper geography drills all 50 capitals and history presidents use the full line", async ({ page }) => {
  await page.goto(BASE + "Joey/play.html?app=geography&band=upper", { waitUntil: "load" });
  await page.getByRole("button", { name: "All 50 capitals" }).click();
  await expect(page.locator("h2")).toContainText("Capital 1 of 50");
  await page.locator(".choice").first().click();

  await page.goto(BASE + "Joey/play.html?app=history&band=upper", { waitUntil: "load" });
  await page.getByRole("button", { name: "Presidents car" }).click();
  await expect(page.locator("#main")).toContainText(/of 47/);
  await expect(page.locator("#main")).toContainText(/president number|What number was/);
  await expect(page.locator(".choice")).toHaveCount(3);
});

test("science speaks a prompt inside play.html for a young band", async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = [];
    function note(u) {
      window.__spoken.push(String((u && (u.text || u.utteranceText)) || ""));
    }
    if (typeof window.SpeechSynthesisUtterance !== "function") {
      window.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(text) {
        this.text = String(text || "");
      };
    }
    const proto = window.SpeechSynthesis && window.SpeechSynthesis.prototype;
    if (proto && typeof proto.speak === "function") {
      proto.speak = function (u) { note(u); };
      proto.cancel = function () {};
    } else {
      window.speechSynthesis = {
        cancel() {},
        speak(u) { note(u); },
        getVoices() { return []; },
        addEventListener() {},
        removeEventListener() {},
      };
    }
  });
  const errors = [];
  onErrors(page, errors);
  await page.goto(BASE + "Piper/play.html?app=science&band=preschool", { waitUntil: "load" });
  await page.waitForFunction(
    () => (window.__spoken || []).some((line) => String(line).length > 8),
    null,
    { timeout: 20000 }
  );
  const spoken = await page.evaluate(() => (window.__spoken || []).join(" "));
  expect(spoken.length).toBeGreaterThan(8);
  expect(spoken).toMatch(/Field expedition/i);
  expect(errors).toEqual([]);
});

test("standalone reading reloads offline with band query", async ({ page, context }) => {
  const failed = [];
  page.on("requestfailed", (req) => {
    const err = req.failure();
    failed.push((err && err.errorText) || req.url());
  });
  await page.goto(BASE + "apps/reading/index.html?band=toddler", { waitUntil: "load" });
  await expect(page.locator("h1")).toContainText(/Garden sounds/);
  await page.waitForFunction(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
  await context.setOffline(true);
  let navError = "";
  try {
    await page.reload({ waitUntil: "load" });
  } catch (e) {
    navError = String(e);
  }
  expect(navError, "offline reload of ?band=toddler").not.toMatch(/ERR_FAILED|net::/);
  await expect(page.locator("h1")).toContainText(/Garden sounds/);
  await page.locator("#go-sounds").click();
  await expect(page.locator(".garden-sound").first()).toBeVisible();
  expect(failed.filter((text) => /ERR_FAILED/.test(text))).toEqual([]);
});

test("standalone reading without a band shows the picker", async ({ page }) => {
  await page.goto(BASE + "apps/reading/index.html", { waitUntil: "load" });
  await page.evaluate(() => localStorage.removeItem("hs.band"));
  await page.goto(BASE + "apps/reading/index.html", { waitUntil: "load" });
  await expect(page.locator("h1")).toContainText(/Pick a band/);
  await expect(page.locator("h1")).not.toContainText(/Blends and teams/);
});

test("runner baby band does not fetch missing reading json", async ({ page }) => {
  const babyHits = [];
  const errors = [];
  page.on("response", (res) => {
    if (res.url().includes("/apps/reading/data/baby.json")) babyHits.push(res.status());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.goto(BASE + "Shiloh/play.html?app=reading&band=baby", { waitUntil: "load" });
  await expect(page.locator("#app-root")).toContainText(/No garden lessons/);
  expect(babyHits, "data/baby.json should not be requested").toEqual([]);
  expect(errors.join("\n")).not.toMatch(/JSON|Unexpected token|no data/);
});

test("standalone math and reading show a visible untested banner", async ({ page }) => {
  for (const app of ["math", "reading"]) {
    await page.goto(BASE + "apps/" + app + "/", { waitUntil: "load" });
    const banner = page.locator(".untested-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toHaveText(/Untested, awaiting parent test/);
  }
});
