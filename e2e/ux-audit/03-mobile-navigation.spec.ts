import { test } from "@playwright/test";
import {
  assertPageLoaded,
  captureScreen,
  getVisibleNavLinks,
  recordFinding,
  waitForAuthenticatedHome,
} from "./helpers/audit";

test.describe("Mobile navigation", () => {
  test("core nav items hidden on mobile viewport", async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);
    await captureScreen(page, "11-mobile-dashboard", "mobile");

    const navLinks = await getVisibleNavLinks(page);
    const desktopOnlyItems = ["Resume Architect", "Insights", "My Jobs"];
    const visibleDesktopItems = desktopOnlyItems.filter((label) =>
      navLinks.some((l) => l.includes(label)),
    );

    if (visibleDesktopItems.length === 0) {
      recordFinding({
        severity: "P0",
        route: "/",
        title: "Main nav items hidden on mobile — no hamburger menu",
        description:
          "Resume Architect, Insights, and My Jobs use `hidden sm:inline-flex` and are only in the avatar dropdown. Mobile users must discover features via the user menu.",
        heuristic: "Flexibility and efficiency of use",
        viewport: "mobile",
      });
    }

    const userMenu = page.getByRole("button", { name: "User menu" });
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await captureScreen(page, "12-mobile-user-menu", "mobile");
    }
  });

  test("mobile dashboard still exposes primary action", async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);

    const bodyText = await page.locator("body").innerText();
    const hasPrimaryAction =
      /start new analysis|start.*analysis|new analysis|analyze|gap analysis/i.test(
        bodyText,
      );

    if (!hasPrimaryAction) {
      recordFinding({
        severity: "P0",
        route: "/",
        title: "No primary action visible on mobile dashboard",
        description:
          "Mobile users cannot easily start the core analysis workflow.",
        heuristic: "Recognition rather than recall",
        viewport: "mobile",
      });
    }
  });
});
