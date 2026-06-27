import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

export type FindingSeverity = "P0" | "P1" | "P2";

export interface UxFinding {
  severity: FindingSeverity;
  route: string;
  title: string;
  description: string;
  heuristic?: string;
  viewport?: "desktop" | "mobile";
}

const REPORT_DIR = path.join(process.cwd(), "ux-audit/report");
const FINDINGS_FILE = path.join(REPORT_DIR, "findings.json");

function ensureReportDir() {
  fs.mkdirSync(path.join(REPORT_DIR, "screenshots"), { recursive: true });
}

export function recordFinding(finding: UxFinding) {
  ensureReportDir();
  const existing: UxFinding[] = fs.existsSync(FINDINGS_FILE)
    ? JSON.parse(fs.readFileSync(FINDINGS_FILE, "utf8"))
    : [];
  existing.push({ ...finding, route: finding.route || "unknown" });
  fs.writeFileSync(FINDINGS_FILE, JSON.stringify(existing, null, 2));
}

export function resetFindings() {
  ensureReportDir();
  fs.writeFileSync(FINDINGS_FILE, "[]");
}

export async function captureScreen(
  page: Page,
  slug: string,
  viewport: "desktop" | "mobile" = "desktop",
) {
  ensureReportDir();
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const filePath = path.join(
    REPORT_DIR,
    "screenshots",
    `${viewport}-${safeSlug}.png`,
  );
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

export async function getVisibleNavLinks(page: Page) {
  return page.locator("nav a, nav button").allTextContents();
}

export async function getPrimaryHeadings(page: Page) {
  return page.locator("h1, h2").allTextContents();
}

export async function countVisibleCTAs(page: Page) {
  const buttons = page.getByRole("button");
  const links = page.getByRole("link");
  const buttonCount = await buttons.count();
  let visibleButtons = 0;
  for (let i = 0; i < buttonCount; i++) {
    if (await buttons.nth(i).isVisible()) visibleButtons++;
  }
  const linkCount = await links.count();
  let visibleLinks = 0;
  for (let i = 0; i < linkCount; i++) {
    if (await links.nth(i).isVisible()) visibleLinks++;
  }
  return { visibleButtons, visibleLinks };
}

export async function waitForAuthenticatedHome(page: Page) {
  await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/auth/get-session") && resp.status() === 200,
    { timeout: 20_000 },
  );
  // Dashboard (onboarded) or onboarding hero (logged in, not yet onboarded)
  await page
    .locator("text=/welcome back|complete your onboarding|personal dashboard/i")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 });
}

export async function assertPageLoaded(page: Page, timeout = 15_000) {
  await page.waitForLoadState("domcontentloaded", { timeout });
  await page.waitForTimeout(500);
}

export async function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

export async function isElementInViewport(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    });
}
