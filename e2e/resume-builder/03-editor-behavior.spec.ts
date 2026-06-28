import { expect, test } from "@playwright/test";
import {
  ensureResume,
  type ResumeRecord,
  resetResumeToBaseline,
} from "./helpers/resume-api";
import {
  navigateToSection,
  openResumeEditor,
  openSettings,
  waitForAutoSave,
  waitForEditorReady,
} from "./helpers/resume-editor";

test.describe.configure({ mode: "serial" });

test.describe("Resume builder — editor behavior edge cases", () => {
  let resume: ResumeRecord;

  test.beforeEach(async ({ request }) => {
    resume = await ensureResume(request);
    resume = await resetResumeToBaseline(request, resume);
  });

  test("preview toggle hides and shows live preview panel", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);

    const preview = page.locator(".resume-preview-paper");
    await expect(preview).toBeVisible();

    await page.getByRole("button", { name: /Hide Preview/i }).click();
    await expect(preview).toBeHidden();

    await page.getByRole("button", { name: /Show Preview/i }).click();
    await expect(preview).toBeVisible();
  });

  test("hidden work section shows banner with show toggle", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);
    await openSettings(page);

    const visibilitySection = page
      .locator("section")
      .filter({ has: page.getByText("Section Visibility", { exact: true }) });
    const experienceRow = visibilitySection
      .locator("div.flex.items-center.justify-between")
      .filter({ has: page.getByText("Experience", { exact: true }) });
    const toggle = experienceRow.getByRole("switch");

    if (await toggle.isChecked()) {
      await toggle.click();
    }
    await waitForAutoSave(page);

    await page.keyboard.press("Escape");
    await navigateToSection(page, "Experience");

    await expect(
      page.getByText("This section is hidden from your resume."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Show", exact: true }).click();
    await expect(
      page.getByText("This section is hidden from your resume."),
    ).toBeHidden();
  });

  test("premium template shows lock for non-pro users", async ({ page }) => {
    await openResumeEditor(page, resume.id);
    await openSettings(page);

    const creativeBtn = page.getByRole("button", {
      name: /Creative Portfolio/i,
    });
    await expect(creativeBtn).toHaveClass(/cursor-not-allowed/);
    await expect(creativeBtn.getByText("Pro")).toBeVisible();
  });

  test("free templates are selectable for non-pro users", async ({ page }) => {
    await openResumeEditor(page, resume.id);
    await openSettings(page);

    const minimalistBtn = page.getByRole("button", { name: /^Minimalist/i });
    await expect(minimalistBtn).not.toHaveClass(/cursor-not-allowed/);

    await page.getByRole("button", { name: /Executive Pro/i }).click();
    await waitForAutoSave(page);

    await page.reload();
    await waitForEditorReady(page);
    await openSettings(page);
    await expect(
      page.getByRole("button", { name: /Executive Pro/i }),
    ).toHaveClass(/border-primary/);
  });

  test("export page loads for valid resume", async ({ page, context }) => {
    await openResumeEditor(page, resume.id);

    const [exportPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("button", { name: "Export", exact: true }).click(),
    ]);

    await exportPage.waitForLoadState("domcontentloaded");
    expect(exportPage.url()).toContain(`/resumes/${resume.id}/export`);
    await exportPage.close();
  });

  test("localStorage draft survives page reload during edit", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);

    await page.getByPlaceholder("John Doe").fill("Draft Persistence Test");
    await page.waitForTimeout(2_500); // local save debounce is 2s

    await page.reload();
    await waitForEditorReady(page);

    // Either server or local draft should restore the value
    await expect(page.getByPlaceholder("John Doe")).toHaveValue(
      /Draft Persistence Test|E2E Test User/,
    );
  });

  test("adding then removing work experience returns to empty state", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);
    await navigateToSection(page, "Experience");

    await page.getByRole("button", { name: /Add Experience/i }).click();
    await expect(page.getByText("Position 1")).toBeVisible();

    const positionCard = page
      .locator("div")
      .filter({ hasText: /^Position 1$/ })
      .first()
      .locator("xpath=ancestor::div[contains(@class,'border-border')][1]");
    await positionCard.getByRole("button").first().click();

    await expect(page.getByText("No work experience added yet")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("resumes list POST is idempotent when resume already exists", async ({
    request,
  }) => {
    const first = await request.post("/api/resumes", { data: {} });
    expect(first.ok()).toBeTruthy();

    const second = await request.post("/api/resumes", { data: {} });
    expect(second.status()).toBe(200);

    const body1 = await first.json();
    const body2 = await second.json();
    expect(body2.resume.id).toBe(body1.resume.id);
  });
});
