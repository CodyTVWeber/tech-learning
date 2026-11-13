import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    viewport: { width: 412, height: 915 },
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: "python3 serve.py --port 4173 --bind 127.0.0.1",
    url: "http://127.0.0.1:4173/tech-learning/homeschool/",
    timeout: 30000,
    reuseExistingServer: !process.env.CI,
  },
});
