import { expect, test } from "@playwright/test";
import {
  stabilizePageForScreenshot,
  VISUAL_SCREENSHOT_OPTS,
} from "./helpers/stabilize-page";

test.describe("Auth pages — desktop dark", () => {
  test.use({
    colorScheme: "dark",
    viewport: { width: 1280, height: 800 },
    storageState: { cookies: [], origins: [] },
  });

  test("sign-in auth card matches baseline", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByText("Welcome back").waitFor({ state: "visible" });

    const card = page.getByTestId("auth-card");
    await stabilizePageForScreenshot(page);
    await expect(card).toHaveScreenshot("sign-in-card-dark.png", {
      ...VISUAL_SCREENSHOT_OPTS,
    });
  });

  test("sign-in Google OAuth button matches baseline", async ({ page }) => {
    await page.goto("/sign-in");
    const googleBtn = page.getByRole("button", {
      name: /sign in with google/i,
    });
    await googleBtn.waitFor({ state: "visible" });
    await stabilizePageForScreenshot(page);
    await expect(googleBtn).toHaveScreenshot("sign-in-google-button-dark.png", {
      ...VISUAL_SCREENSHOT_OPTS,
    });
  });

  test("sign-up auth card matches baseline", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByText("Create an account").waitFor({ state: "visible" });

    const card = page.getByTestId("auth-card");
    await stabilizePageForScreenshot(page);
    await expect(card).toHaveScreenshot("sign-up-card-dark.png", {
      ...VISUAL_SCREENSHOT_OPTS,
    });
  });
});

test.describe("Auth pages — desktop light", () => {
  test.use({
    colorScheme: "light",
    viewport: { width: 1280, height: 800 },
    storageState: { cookies: [], origins: [] },
  });

  test("sign-in auth card matches baseline", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByText("Welcome back").waitFor({ state: "visible" });

    const card = page.getByTestId("auth-card");
    await stabilizePageForScreenshot(page);
    await expect(card).toHaveScreenshot("sign-in-card-light.png", {
      ...VISUAL_SCREENSHOT_OPTS,
    });
  });

  test("sign-in Google OAuth button matches baseline", async ({ page }) => {
    await page.goto("/sign-in");
    const googleBtn = page.getByRole("button", {
      name: /sign in with google/i,
    });
    await googleBtn.waitFor({ state: "visible" });
    await stabilizePageForScreenshot(page);
    await expect(googleBtn).toHaveScreenshot(
      "sign-in-google-button-light.png",
      {
        ...VISUAL_SCREENSHOT_OPTS,
      },
    );
  });
});

test.describe("Auth pages — mobile dark", () => {
  test.use({
    colorScheme: "dark",
    viewport: { width: 390, height: 844 },
    storageState: { cookies: [], origins: [] },
    isMobile: true,
    hasTouch: true,
  });

  test("sign-in auth card matches baseline", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByText("Welcome back").waitFor({ state: "visible" });

    const card = page.getByTestId("auth-card");
    await stabilizePageForScreenshot(page);
    await expect(card).toHaveScreenshot("sign-in-card-mobile-dark.png", {
      ...VISUAL_SCREENSHOT_OPTS,
    });
  });
});
