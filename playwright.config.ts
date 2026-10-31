import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4317",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run test:browser:serve",
    url: "http://127.0.0.1:4317",
    reuseExistingServer: false,
  },
});
