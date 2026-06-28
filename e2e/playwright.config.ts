import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  reporter: [
    ["html", { open: "never", outputFolder: "../playwright-report" }],
    ["json", { outputFile: "ux-audit/report/results.json" }],
    ["list"],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "off",
    video: "off",
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "guest",
      use: {
        ...devices["Desktop Chrome"],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: /01-guest-experience\.spec\.ts/,
    },
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "ux-audit/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: /ux-audit\/(02|03)-.*\.spec\.ts/,
      testIgnore: /03-mobile-navigation\.spec\.ts/,
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
        storageState: "ux-audit/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: /ux-audit\/03-mobile-navigation\.spec\.ts/,
    },
    {
      name: "visual",
      use: {
        ...devices["Desktop Chrome"],
        storageState: { cookies: [], origins: [] },
      },
      testMatch: /visual\/.*\.spec\.ts/,
    },
    {
      name: "resume-builder",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "ux-audit/.auth/user.json",
        viewport: { width: 1280, height: 900 },
      },
      dependencies: ["setup"],
      testMatch: /resume-builder\/.*\.spec\.ts/,
      timeout: 60_000,
    },
  ],
});
