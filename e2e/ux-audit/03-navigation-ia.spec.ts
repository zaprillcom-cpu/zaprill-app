import { expect, test } from "@playwright/test";
import {
  assertPageLoaded,
  captureScreen,
  getVisibleNavLinks,
  recordFinding,
  waitForAuthenticatedHome,
} from "./helpers/audit";

test.describe("Navigation & information architecture", () => {
  test("top nav exposes core features on desktop", async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);
    await expect(page.getByRole("button", { name: "User menu" })).toBeVisible();

    const navLinks = await getVisibleNavLinks(page);
    await captureScreen(page, "08-nav-desktop", "desktop");

    const expectedInNav = ["Resume Architect", "Insights", "My Jobs"];
    for (const label of expectedInNav) {
      if (!navLinks.some((l) => l.includes(label))) {
        recordFinding({
          severity: "P1",
          route: "/",
          title: `Nav missing "${label}" on desktop`,
          description: `Visible nav items: ${navLinks.filter(Boolean).join(", ") || "none"}`,
          heuristic: "Consistency and standards",
          viewport: "desktop",
        });
      }
    }

    const analyzeInNav = navLinks.some((l) => /analyze/i.test(l));
    if (!analyzeInNav) {
      recordFinding({
        severity: "P0",
        route: "/",
        title: "Analyze is not in the main navigation",
        description:
          "The core product action (job/resume analysis) is absent from persistent nav. Users must discover it from dashboard cards or footer.",
        heuristic: "Recognition rather than recall",
        viewport: "desktop",
      });
    }
  });

  test("nav labels match page purpose (Insights vs History)", async ({
    page,
  }) => {
    await page.goto("/history");
    await assertPageLoaded(page);
    await captureScreen(page, "09-history-page", "desktop");

    const headings = await page.locator("h1, h2").allTextContents();
    const usesHistoryLabel = headings.some((h) => /history|insights/i.test(h));

    if (!usesHistoryLabel) {
      recordFinding({
        severity: "P1",
        route: "/history",
        title: "History page title doesn't match nav label 'Insights'",
        description: `Nav says 'Insights' but page headings are: ${headings.join(" | ") || "none"}. Mismatched mental models confuse users.`,
        heuristic: "Match between system and the real world",
        viewport: "desktop",
      });
    }
  });

  test("back navigation works from sub-pages", async ({ page }) => {
    await page.goto("/analyze");
    await assertPageLoaded(page);

    const backButton = page.getByRole("button", { name: /back/i });
    const backCount = await backButton.count();

    if (backCount === 0) {
      recordFinding({
        severity: "P1",
        route: "/analyze",
        title: "No back button on analyze page",
        description: "Users may feel trapped without clear way to return home.",
        heuristic: "User control and freedom",
        viewport: "desktop",
      });
      return;
    }

    await backButton.first().click();
    await assertPageLoaded(page);
    await expect(page).toHaveURL("/");
  });

  test("duplicate nav paths (nav bar vs user menu)", async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);
    await expect(page.getByRole("button", { name: "User menu" })).toBeVisible();

    const navLinks = await getVisibleNavLinks(page);
    await page.getByRole("button", { name: "User menu" }).click();
    const menuItems = await page.getByRole("menuitem").allTextContents();
    await captureScreen(page, "10-duplicate-nav", "desktop");

    const duplicates = ["Resume Architect", "Insights", "My Jobs"].filter(
      (label) =>
        navLinks.some((n) => n.includes(label)) &&
        menuItems.some((m) => m.includes(label)),
    );

    if (duplicates.length >= 2) {
      recordFinding({
        severity: "P2",
        route: "/",
        title: "Navigation items duplicated in nav bar and user menu",
        description: `Duplicated: ${duplicates.join(", ")}. Consider one canonical location per feature.`,
        heuristic: "Aesthetic and minimalist design",
        viewport: "desktop",
      });
    }
  });

  test("footer links are not the only path to key features", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);

    const footerHistory = page.locator("footer").getByRole("link", {
      name: "History",
    });
    const footerProfile = page.locator("footer").getByRole("link", {
      name: "Profile",
    });

    const historyInFooter = (await footerHistory.count()) > 0;
    const profileInFooterVisible = (await footerProfile.count()) > 0;

    if (historyInFooter || profileInFooterVisible) {
      recordFinding({
        severity: "P1",
        route: "/",
        title: "Key features only linked from footer",
        description:
          "History and Profile appear in the page footer but not in primary nav. Footer links are easy to miss.",
        heuristic: "Visibility of system status",
        viewport: "desktop",
      });
    }
  });
});
