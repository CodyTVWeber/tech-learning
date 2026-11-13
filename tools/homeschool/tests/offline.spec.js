import { test, expect } from "@playwright/test";
import { BASE, assertNoHorizontalOverflow, offlineReloadToddler, trackErrFailed } from "./helpers.js";

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
      const duplicateChrome = await page
        .locator("#app-root .untested-banner, #app-root header.top, #app-root header.topbar, #app-root header.mast")
        .evaluateAll((els) => els.filter((el) => getComputedStyle(el).display !== "none").length);
      expect(duplicateChrome, "second header or banner " + stage.folder + " " + appId).toBe(0);
      await expect(page.locator("#hs-chrome .hs-banner")).toBeVisible();
      expect(errors, "offline play " + stage.folder + " " + appId).toEqual([]);
    }
  }
});

test("subject marked none shows the quiet home page and prefetches nothing", async ({ page }) => {
  const errors = [];
  const appHits = [];
  onErrors(page, errors);
  page.on("request", (req) => {
    if (/\/apps\/(reading|movement)\//.test(req.url())) appHits.push(req.url());
  });
  await page.goto(BASE + "Shiloh/", { waitUntil: "load" });
  await waitPrecache(page);
  await expect(page.locator("h1")).toContainText("Shiloh");
  const homeLinks = await page.locator("#home-root a").evaluateAll((els) =>
    els.map((a) => a.getAttribute("href") || "")
  );
  expect(homeLinks.join("\n"), "none subjects stay off the home").not.toMatch(/app=reading/);
  appHits.length = 0;
  errors.length = 0;
  await page.goto(BASE + "Shiloh/play.html?app=reading&band=baby", { waitUntil: "load" });
  await expect(page.locator(".hs-empty")).toContainText(
    "Not on this home. This is a quiet page for care time."
  );
  await expect(page.locator("#hs-chrome .hs-banner")).toBeVisible();
  expect(appHits, "reading must not be fetched when the level is none").toEqual([]);
  expect(errors).toEqual([]);

  appHits.length = 0;
  await page.goto(BASE + "Joey/play.html?app=movement", { waitUntil: "load" });
  await expect(page.locator(".hs-empty")).toContainText(
    "Not on this home. This is a quiet page for care time."
  );
  expect(appHits, "movement must not be fetched when the level is none").toEqual([]);
  expect(errors).toEqual([]);
});

test("standalone toddler apps reload offline and fit 412px", async ({ page, context }) => {
  test.setTimeout(180000);
  const failed = [];
  trackErrFailed(page, failed);
  await page.goto(BASE, { waitUntil: "load" });
  const appIds = await page.evaluate(async () => {
    const idx = await fetch("./apps-index.json").then((r) => r.json());
    return idx.apps || [];
  });
  expect(appIds.length).toBeGreaterThan(0);
  for (const appId of appIds) {
    await offlineReloadToddler(page, context, appId, failed);
  }
  await assertNoHorizontalOverflow(page);
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

test("index.html is the learner home and progress keys include the folder", async ({ page }) => {
  await page.goto(BASE + "Joey/index.html", { waitUntil: "load" });
  await expect(page.locator("h1")).toContainText("Joey");
  await expect(page.locator("#home-root")).not.toContainText("Unknown home");
  const joey = await page.evaluate(() => HS.progressKey("bible"));
  expect(joey).toBe("hs.progress.Joey.bible");

  await page.evaluate(() => {
    localStorage.setItem(HS.progressKey("bible"), JSON.stringify({ sheep: ["joey-flock"] }));
  });
  await page.goto(BASE + "Bella/", { waitUntil: "load" });
  await expect(page.locator("h1")).toContainText("Bella");
  const split = await page.evaluate(() => ({
    bella: HS.progressKey("bible"),
    bellaFlock: localStorage.getItem(HS.progressKey("bible")),
    joeyFlock: localStorage.getItem("hs.progress.Joey.bible"),
  }));
  expect(split.bella).toBe("hs.progress.Bella.bible");
  expect(split.bellaFlock || "").not.toContain("joey-flock");
  expect(split.joeyFlock).toContain("joey-flock");
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
  await page.goto(BASE + "Joey/play.html?app=reading&band=baby", { waitUntil: "load" });
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
