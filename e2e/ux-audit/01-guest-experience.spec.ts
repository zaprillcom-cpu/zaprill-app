import { expect, test } from "@playwright/test";
import {
  assertPageLoaded,
  captureScreen,
  countVisibleCTAs,
  getPrimaryHeadings,
  recordFinding,
} from "./helpers/audit";

test.describe("Guest experience — first impressions", () => {
  test("landing page communicates value and next step", async ({ page }) => {
    await page.goto("/");
    await assertPageLoaded(page);
    await captureScreen(page, "01-guest-landing", "desktop");

    const headings = await getPrimaryHeadings(page);
    const signInVisible = await page
      .getByRole("link", { name: "Sign In" })
      .isVisible()
      .catch(() => false);

    if (!signInVisible) {
      recordFinding({
        severity: "P0",
        route: "/",
        title: "Sign In not visible on landing",
        description:
          "Guest users cannot find how to log in from the primary viewport.",
        heuristic: "Visibility of system status",
        viewport: "desktop",
      });
    }

    const hasClearHeadline = headings.some((h) => h.length > 10);
    if (!hasClearHeadline) {
      recordFinding({
        severity: "P1",
        route: "/",
        title: "Landing lacks a clear headline",
        description: `Headings found: ${headings.join(" | ") || "none"}`,
        heuristic: "Recognition rather than recall",
        viewport: "desktop",
      });
    }

    const ctas = await countVisibleCTAs(page);
    if (ctas.visibleButtons + ctas.visibleLinks > 8) {
      recordFinding({
        severity: "P1",
        route: "/",
        title: "Landing page has too many visible actions",
        description: `${ctas.visibleButtons} buttons and ${ctas.visibleLinks} links compete for attention.`,
        heuristic: "Aesthetic and minimalist design",
        viewport: "desktop",
      });
    }
  });

  test("sign-in page is straightforward", async ({ page }) => {
    await page.goto("/sign-in");
    await assertPageLoaded(page);
    await captureScreen(page, "02-sign-in", "desktop");

    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign In", exact: true }),
    ).toBeVisible();
  });

  test("sign-up path is discoverable from sign-in", async ({ page }) => {
    await page.goto("/sign-in");
    const signUpLink = page.getByRole("link", { name: "Sign up" });
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();
    await expect(page).toHaveURL(/sign-up/);
    await captureScreen(page, "03-sign-up", "desktop");
  });
});
