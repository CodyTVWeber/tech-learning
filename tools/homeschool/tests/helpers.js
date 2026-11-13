import { expect } from "@playwright/test";

export const BASE = "/tech-learning/homeschool/";

export function trackErrFailed(page, bucket) {
  page.on("requestfailed", (req) => {
    const err = req.failure();
    const text = (err && err.errorText) || "";
    if (text.includes("ERR_FAILED")) bucket.push(req.url() + " " + text);
  });
}

export async function assertNoHorizontalOverflow(page) {
  const box = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    box.scrollWidth,
    "scrollWidth " + box.scrollWidth + " <= clientWidth " + box.clientWidth + " at 412px"
  ).toBeLessThanOrEqual(box.clientWidth);
}

async function swInfo(page) {
  return page.evaluate(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    return {
      href: location.href,
      controller: navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL,
      regs: regs.map(function (r) {
        return r.scope + " active=" + !!(r.active);
      }),
    };
  });
}

export async function offlineReloadToddler(page, context, appId, failed) {
  await context.setOffline(false);
  const url = BASE + "apps/" + encodeURIComponent(appId) + "/?band=toddler";
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(async (id) => {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter(function (r) {
          return r.scope.indexOf("/apps/" + id + "/") === -1;
        })
        .map(function (r) {
          return r.unregister();
        })
    );
  }, appId);
  const controlledByApp = (id) => {
    const c = navigator.serviceWorker && navigator.serviceWorker.controller;
    return !!(c && c.scriptURL.indexOf("/apps/" + id + "/") !== -1);
  };
  // clients.claim() attaches the worker without another navigation. Reloading
  // while install is still running drops that claim and leaves controller null.
  try {
    await page.waitForFunction(controlledByApp, appId, { timeout: 20000 });
  } catch (err) {
    await page.reload({ waitUntil: "load" });
    try {
      await page.waitForFunction(controlledByApp, appId, { timeout: 10000 });
    } catch (err2) {
      const info = await swInfo(page);
      throw new Error(appId + " sw not controlling " + JSON.stringify(info) + " " + err2);
    }
  }
  failed.length = 0;
  await context.setOffline(true);
  let response = null;
  try {
    response = await page.reload({ waitUntil: "load" });
  } catch (err) {
    failed.push(appId + " " + String(err));
  }
  expect(response, appId + " offline reload").toBeTruthy();
  expect(failed, appId + " ERR_FAILED").toEqual([]);
  await assertNoHorizontalOverflow(page);
  await context.setOffline(false);
}

/** Click the kit Sound button and assert the app reports quiet. */
export async function clickKitMuteExpectQuiet(page) {
  const btn = page.locator("#hs-mute-btn");
  await expect(btn).toBeVisible();
  await page.evaluate(() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      window.__hsMuteProbe = ctx.__hsMuteGain || null;
    }
    if (window.HS && HS.setMuted) HS.setMuted(false);
  });
  await expect(page.locator("html")).toHaveAttribute("data-app-quiet", "0");
  await expect(btn).toHaveAttribute("aria-pressed", "false");
  const before = await page.evaluate(() => (window.HS && HS.speechSuppressed ? HS.speechSuppressed() : 0));
  await btn.click();
  await expect(btn).toHaveAttribute("aria-pressed", "true");
  await expect(btn).toHaveText("Sound off");
  await expect(page.locator("html")).toHaveAttribute("data-app-quiet", "1");
  const quiet = await page.evaluate((prev) => {
    const probe = window.__hsMuteProbe;
    if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("quiet check"));
    }
    if (window.HS && HS.speak) HS.speak("quiet check");
    return {
      muted: !!(window.HS && HS.muted && HS.muted()),
      storage: localStorage.getItem("hs.mute"),
      sink: probe ? probe.gain.value : null,
      suppressed: window.HS && HS.speechSuppressed ? HS.speechSuppressed() : prev,
      engineQuiet: window.HSAudio && "quiet" in window.HSAudio ? !!window.HSAudio.quiet : null,
    };
  }, before);
  expect(quiet.muted, "HS.muted()").toBe(true);
  expect(quiet.storage, "hs.mute").toBe("1");
  expect(quiet.sink, "WebAudio bus after kit mute").toBe(0);
  expect(quiet.suppressed, "speechSynthesis blocked while muted").toBeGreaterThan(before);
  if (quiet.engineQuiet !== null) expect(quiet.engineQuiet, "app engine reports quiet").toBe(true);
}
