import { expect, test } from "@playwright/test";
import {
  assertPageLoaded,
  captureScreen,
  getPrimaryHeadings,
  getVisibleNavLinks,
  recordFinding,
  waitForAuthenticatedHome,
} from "./helpers/audit";

const CORE_ROUTES = [
  { path: "/", name: "Dashboard", primaryAction: /analyze|start|new/i },
  {
    path: "/analyze",
    name: "Analyze",
    primaryAction: /upload|paste|job|analyze/i,
  },
  { path: "/jobs", name: "Jobs", primaryAction: /job|search|save/i },
  { path: "/resumes", name: "Resumes", primaryAction: /resume|upload|create/i },
  {
    path: "/history",
    name: "History",
    primaryAction: /history|analysis|view/i,
  },
  { path: "/profile", name: "Profile", primaryAction: /profile|save|update/i },
  {
    path: "/billing",
    name: "Billing",
    primaryAction: /plan|upgrade|pro|subscribe/i,
  },
  {
    path: "/referrals",
    name: "Referrals",
    primaryAction: /refer|invite|share/i,
  },
];

test.describe("Authenticated journeys — core workflows", () => {
  test("dashboard orients returning users", async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);
    await captureScreen(page, "04-dashboard", "desktop");

    const headings = await getPrimaryHeadings(page);
    const bodyText = await page.locator("body").innerText();
    const hasAnalysisCTA =
      /start new analysis|start.*analysis|new analysis|analyze|gap analysis/i.test(
        bodyText,
      );

    const hasWelcome = headings.some((h) => /welcome/i.test(h));

    if (!hasAnalysisCTA) {
      recordFinding({
        severity: "P0",
        route: "/",
        title: "No obvious 'start analysis' action on dashboard",
        description:
          "Returning users should see a primary CTA to begin or continue job analysis.",
        heuristic: "Recognition rather than recall",
        viewport: "desktop",
      });
    }

    if (!hasWelcome && headings.length === 0) {
      recordFinding({
        severity: "P1",
        route: "/",
        title: "Dashboard lacks orientation headings",
        description: "No h1/h2 headings found to orient the user.",
        heuristic: "Visibility of system status",
        viewport: "desktop",
      });
    }
  });

  for (const route of CORE_ROUTES) {
    test(`${route.name} page (${route.path}) loads and is usable`, async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      await page.goto(route.path);
      await assertPageLoaded(page);

      const onSignIn = page.url().includes("sign-in");
      if (onSignIn) {
        recordFinding({
          severity: "P0",
          route: route.path,
          title: `${route.name} redirects to sign-in while authenticated`,
          description:
            "Session may not persist or route is incorrectly protected.",
          viewport: "desktop",
        });
        return;
      }

      await captureScreen(page, `05-${route.name.toLowerCase()}`, "desktop");

      const headings = await getPrimaryHeadings(page);
      if (headings.length === 0) {
        recordFinding({
          severity: "P1",
          route: route.path,
          title: `${route.name} has no visible page heading`,
          description: "Users cannot tell where they are in the app.",
          heuristic: "Visibility of system status",
          viewport: "desktop",
        });
      }

      const bodyText = await page.locator("main, body").first().innerText();
      const hasRelevantContent = route.primaryAction.test(bodyText);
      if (!hasRelevantContent && route.path !== "/") {
        recordFinding({
          severity: "P1",
          route: route.path,
          title: `${route.name} page purpose unclear from content`,
          description: `Expected content matching ${route.primaryAction}. Headings: ${headings.join(" | ")}`,
          heuristic: "Match between system and the real world",
          viewport: "desktop",
        });
      }

      if (consoleErrors.length > 0) {
        recordFinding({
          severity: "P2",
          route: route.path,
          title: `Console errors on ${route.name}`,
          description: consoleErrors.slice(0, 3).join("; "),
          viewport: "desktop",
        });
      }
    });
  }

  test("analyze flow entry is reachable from dashboard", async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);

    const startBtn = page.getByRole("button", {
      name: /start new analysis|complete your onboarding|get started/i,
    });
    const visible = await startBtn
      .first()
      .isVisible()
      .catch(() => false);

    if (!visible) {
      recordFinding({
        severity: "P0",
        route: "/",
        title: "Logged-in user cannot find how to start analysis from home",
        description:
          "Home shows neither 'Start New Analysis' nor onboarding CTA. New users are stuck.",
        heuristic: "Recognition rather than recall",
        viewport: "desktop",
      });
      return;
    }

    await startBtn.first().click();
    await assertPageLoaded(page);
    await captureScreen(page, "06-analyze-from-dashboard", "desktop");
  });

  test("user menu exposes account features", async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);

    const userMenu = page.getByRole("button", { name: "User menu" });
    await expect(userMenu).toBeVisible();
    await userMenu.click();

    const menuItems = await page.getByRole("menuitem").allTextContents();
    await captureScreen(page, "07-user-menu-open", "desktop");

    const expectedItems = ["Profile", "Billing", "Insights", "My Jobs"];
    for (const item of expectedItems) {
      if (!menuItems.some((m) => m.includes(item))) {
        recordFinding({
          severity: "P2",
          route: "/",
          title: `User menu missing "${item}"`,
          description: `Menu items found: ${menuItems.join(", ")}`,
          heuristic: "Consistency and standards",
          viewport: "desktop",
        });
      }
    }
  });
});
