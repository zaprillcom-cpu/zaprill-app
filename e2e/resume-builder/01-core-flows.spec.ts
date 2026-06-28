import { expect, test } from "@playwright/test";
import {
  ensureResume,
  type ResumeRecord,
  resetResumeToBaseline,
} from "./helpers/resume-api";
import {
  fillBasicsName,
  getPreviewText,
  openResumeEditor,
  openSettings,
  waitForAutoSave,
  waitForEditorReady,
} from "./helpers/resume-editor";

test.describe.configure({ mode: "serial" });

test.describe("Resume builder — core flows", () => {
  let resume: ResumeRecord;

  test.beforeEach(async ({ request }) => {
    resume = await ensureResume(request);
    resume = await resetResumeToBaseline(request, resume);
  });

  test("resumes dashboard loads and links to editor", async ({ page }) => {
    await page.goto("/resumes");
    await expect(page.getByRole("heading", { name: "Resumes" })).toBeVisible({
      timeout: 15_000,
    });

    const editBtn = page.getByRole("button", { name: /Edit Content/i });
    await expect(editBtn).toBeVisible({ timeout: 10_000 });
    await editBtn.click();

    await waitForEditorReady(page);
    await expect(page).toHaveURL(new RegExp(`/resumes/${resume.id}`));
  });

  test("editor loads resume data and shows live preview", async ({ page }) => {
    await openResumeEditor(page, resume.id);

    await expect(page.getByPlaceholder("John Doe")).toHaveValue(
      "E2E Test User",
    );
    await expect(page.getByPlaceholder("john@example.com")).toHaveValue(
      "e2e.test@example.com",
    );

    const previewText = await getPreviewText(page);
    expect(previewText).toContain("E2E Test User");
    expect(previewText).toContain("Software Engineer");
  });

  test("editing name updates preview and auto-saves", async ({ page }) => {
    await openResumeEditor(page, resume.id);

    await fillBasicsName(page, "Updated E2E Name");
    await expect(page.getByText("Unsaved")).toBeVisible({ timeout: 5_000 });

    const previewText = await getPreviewText(page);
    expect(previewText).toContain("Updated E2E Name");

    await waitForAutoSave(page);

    // Reload and verify persistence
    await page.reload();
    await waitForEditorReady(page);
    await expect(page.getByPlaceholder("John Doe")).toHaveValue(
      "Updated E2E Name",
    );
  });

  test("section navigation switches between all content sections", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);

    const sections = [
      "Experience",
      "Education",
      "Skills",
      "Projects",
      "Certifications",
      "Languages",
      "Volunteer",
      "Awards",
      "Publications",
      "References",
    ];

    for (const section of sections) {
      await page.getByRole("button", { name: section, exact: true }).click();
      await expect(
        page.getByRole("heading", { name: section, exact: true }),
      ).toBeVisible();
    }

    // Return to basics
    await page
      .getByRole("button", { name: "Contact Info", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Contact Info", exact: true }),
    ).toBeVisible();
  });

  test("template can be switched in settings", async ({ page }) => {
    await openResumeEditor(page, resume.id);
    await openSettings(page);

    await page.getByRole("button", { name: /Tech Stack/i }).click();
    await waitForAutoSave(page);

    await page.reload();
    await waitForEditorReady(page);
    await openSettings(page);

    const techStackBtn = page.getByRole("button", { name: /Tech Stack/i });
    await expect(techStackBtn).toHaveClass(/border-primary/);
  });

  test("invalid resume id shows not-found state", async ({ page }) => {
    await page.goto("/resumes/nonexistent-id-00000000");
    await expect(page.getByText("Resume not found")).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Back to Resumes" }).click();
    await expect(page).toHaveURL(/\/resumes$/);
  });

  test("title can be edited in header", async ({ page }) => {
    await openResumeEditor(page, resume.id);

    const titleInput = page.locator("header input").first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill("My Custom Resume Title");
    await waitForAutoSave(page);

    await page.reload();
    await waitForEditorReady(page);
    await expect(page.locator("header input").first()).toHaveValue(
      "My Custom Resume Title",
    );
  });
});
