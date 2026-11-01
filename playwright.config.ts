import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.TEST_BROWSER_PORT || 4317);
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: origin,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npm run test:browser:serve -- --port ${port}`,
    url: origin,
    reuseExistingServer: false,
  },
});
