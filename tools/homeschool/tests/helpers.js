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
  // Wait until THIS app's worker is active before navigating again.
  // A reload that starts while install is still running is not controlled,
  // and clients.claim() can miss the document that appears in that gap.
  try {
    await page.waitForFunction(
      (id) =>
        navigator.serviceWorker.getRegistrations().then(function (regs) {
          return regs.some(function (r) {
            return r.scope.indexOf("/apps/" + id + "/") !== -1 && !!r.active;
          });
        }),
      appId,
      { timeout: 20000 }
    );
  } catch (err) {
    const info = await swInfo(page);
    throw new Error(appId + " sw not active " + JSON.stringify(info) + " " + err);
  }
  await page.reload({ waitUntil: "load" });
  try {
    await page.waitForFunction(
      (id) => {
        const c = navigator.serviceWorker && navigator.serviceWorker.controller;
        return !!(c && c.scriptURL.indexOf("/apps/" + id + "/") !== -1);
      },
      appId,
      { timeout: 10000 }
    );
  } catch (err) {
    const info = await swInfo(page);
    throw new Error(appId + " sw not controlling " + JSON.stringify(info) + " " + err);
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
