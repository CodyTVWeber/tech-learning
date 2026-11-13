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
      await expect(page.locator("#app-root")).not.toHaveText(/Could not open|not on this device/);
      const text = (await page.locator("#app-root").innerText()).trim();
      expect(text.length, "app " + appId + " for " + stage.folder + " rendered").toBeGreaterThan(8);
      if (appId === "reading" && (stage.band === "toddler" || stage.band === "preschool")) {
        const beds = page.locator("#go-sounds");
        if (await beds.count()) await beds.click();
        await expect(page.locator(".garden-letter").first()).toBeVisible();
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

  await page.goto(BASE + "Joey/play.html?app=history&band=upper", { waitUntil: "load" });
  await expect(page.locator("#app-root")).toContainText("not on this device yet");
  expect(missingAssets).toEqual([]);
  expect(errors).toEqual([]);
});

test("standalone math and reading show a visible untested banner", async ({ page }) => {
  for (const app of ["math", "reading"]) {
    await page.goto(BASE + "apps/" + app + "/", { waitUntil: "load" });
    const banner = page.locator(".untested-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toHaveText(/Untested, awaiting parent test/);
  }
});
