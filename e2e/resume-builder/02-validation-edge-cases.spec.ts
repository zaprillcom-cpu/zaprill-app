import { expect, test } from "@playwright/test";
import {
  ensureResume,
  patchResume,
  type ResumeRecord,
  resetResumeToBaseline,
  VALID_BASELINE_DATA,
  VALID_BASELINE_METADATA,
} from "./helpers/resume-api";
import {
  addSocialProfile,
  addWorkExperience,
  dismissValidationDialog,
  expectValidationDialog,
  expectValidationFeedback,
  fillBasicsEmail,
  fillBasicsName,
  fillPersonalWebsite,
  fillSocialProfileUrl,
  fillWorkPosition,
  fillWorkStartDate,
  openResumeEditor,
  triggerServerSave,
  waitForAutoSave,
  waitForEditorReady,
  waitForSaveComplete,
} from "./helpers/resume-editor";

test.describe("Resume builder — validation edge cases (UI)", () => {
  test.describe.configure({ mode: "serial" });

  let resume: ResumeRecord;

  test.beforeEach(async ({ request }) => {
    resume = await ensureResume(request);
    resume = await resetResumeToBaseline(request, resume);
  });

  test("rejects empty name on save", async ({ page }) => {
    await openResumeEditor(page, resume.id);

    const nameInput = page.getByPlaceholder("John Doe");
    await nameInput.clear();
    await expect(page.getByText("Unsaved")).toBeVisible({ timeout: 5_000 });

    await triggerServerSave(page);

    // Client-side (RHF/Zod) and/or server validation dialog
    const dialog = page.getByRole("alertdialog");
    const clientError = page.getByText("Name is required");
    await expect(dialog.or(clientError)).toBeVisible({ timeout: 15_000 });

    if (await dialog.isVisible()) {
      await dismissValidationDialog(page);
    }
  });

  test("rejects invalid email format", async ({ page }) => {
    await openResumeEditor(page, resume.id);

    await fillBasicsEmail(page, "not-an-email");
    await triggerServerSave(page);

    const kind = await expectValidationFeedback(page, /Invalid email/i);
    if (kind === "dialog") {
      await dismissValidationDialog(page);
    }
  });

  test("rejects malformed personal website URL", async ({ page }) => {
    await openResumeEditor(page, resume.id);

    await fillPersonalWebsite(page, "not a valid url!!!");
    await triggerServerSave(page);

    const kind = await expectValidationFeedback(page, /Invalid URL/i);
    if (kind === "dialog") {
      await dismissValidationDialog(page);
    }
  });

  test("bare domain URL is accepted in the editor without validation errors", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);

    await fillPersonalWebsite(page, "example.com");
    await triggerServerSave(page);
    await expect(page.getByRole("alertdialog")).toBeHidden({ timeout: 5_000 });
    await expect(page.getByText(/Invalid URL/i)).toBeHidden();
  });

  test("rejects invalid social profile URL", async ({ page }) => {
    await openResumeEditor(page, resume.id);

    await addSocialProfile(page);
    await fillSocialProfileUrl(page, "not a valid url!!!");
    await triggerServerSave(page);

    const kind = await expectValidationFeedback(page, /Invalid URL/i);
    if (kind === "dialog") {
      await dismissValidationDialog(page);
    }
  });

  test("rejects work experience with empty required fields", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);
    await addWorkExperience(page);

    // Leave company and position empty
    await triggerServerSave(page);

    const kind = await expectValidationFeedback(
      page,
      /Company is required|Position is required|Experience/i,
    );
    if (kind === "dialog") {
      await dismissValidationDialog(page);
    }
  });

  test("rejects invalid work start date format", async ({ page }) => {
    await openResumeEditor(page, resume.id);
    await addWorkExperience(page);

    await fillWorkPosition(page, 0, "Engineer", "Acme Corp");
    await fillWorkStartDate(page, 0, "01/2020");
    await triggerServerSave(page);

    const kind = await expectValidationFeedback(page, /YYYY/i);
    if (kind === "dialog") {
      await dismissValidationDialog(page);
    }
  });

  test("accepts valid work experience with ISO date formats", async ({
    page,
    request,
  }) => {
    await openResumeEditor(page, resume.id);
    await addWorkExperience(page);

    await fillWorkPosition(page, 0, "Staff Engineer", "Example Inc");
    await fillWorkStartDate(page, 0, "2020-06");
    await triggerServerSave(page);
    await waitForAutoSave(page);
    await expect(page.getByRole("alertdialog")).toBeHidden({ timeout: 5_000 });

    const updated = await request.get(`/api/resumes/${resume.id}`);
    const { resume: saved } = await updated.json();
    expect(saved.data.work).toHaveLength(1);
    expect(saved.data.work[0].position).toBe("Staff Engineer");
    expect(saved.data.work[0].startDate).toBe("2020-06");
  });

  test("handles special characters and unicode in name field", async ({
    page,
    request,
  }) => {
    await openResumeEditor(page, resume.id);

    const specialName = "José O'Brien-Smith 李明";
    await fillBasicsName(page, specialName);
    await waitForAutoSave(page);

    const updated = await request.get(`/api/resumes/${resume.id}`);
    const { resume: saved } = await updated.json();
    expect(saved.data.basics.name).toBe(specialName);

    await page.reload();
    await waitForEditorReady(page);
    await expect(page.getByPlaceholder("John Doe")).toHaveValue(specialName);
  });

  test("handles extremely long name at validation boundary", async ({
    page,
    request,
  }) => {
    await openResumeEditor(page, resume.id);

    const longName = "A".repeat(101);
    await fillBasicsName(page, longName);
    await triggerServerSave(page);

    const kind = await expectValidationFeedback(
      page,
      /too big|at most 100|Name is required/i,
    );
    if (kind === "dialog") {
      await dismissValidationDialog(page);
    }

    // 100 chars should succeed
    const validName = "A".repeat(100);
    await fillBasicsName(page, validName);
    await triggerServerSave(page);
    await expect(page.getByRole("alertdialog")).toBeHidden({ timeout: 15_000 });

    const updated = await request.get(`/api/resumes/${resume.id}`);
    const { resume: saved } = await updated.json();
    expect(saved.data.basics.name).toHaveLength(100);
  });

  test("empty email string is allowed", async ({ page, request }) => {
    await openResumeEditor(page, resume.id);

    await page.getByPlaceholder("john@example.com").clear();
    await triggerServerSave(page);
    await waitForAutoSave(page);
    await expect(page.getByRole("alertdialog")).toBeHidden({ timeout: 5_000 });

    const updated = await request.get(`/api/resumes/${resume.id}`);
    const { resume: saved } = await updated.json();
    expect(saved.data.basics.email).toBe("");
  });
});

test.describe("Resume builder — validation edge cases (API)", () => {
  let resume: ResumeRecord;

  test.beforeEach(async ({ request }) => {
    resume = await ensureResume(request);
    resume = await resetResumeToBaseline(request, resume);
  });

  test("normalizes bare domain to https on save via API", async ({
    request,
  }) => {
    const res = await patchResume(request, resume.id, {
      version: resume.version,
      data: {
        ...VALID_BASELINE_DATA,
        basics: { ...VALID_BASELINE_DATA.basics, url: "example.com" },
      },
    });

    expect(res.ok()).toBeTruthy();
    const { resume: saved } = await res.json();
    expect(saved.data.basics.url).toBe("https://example.com");
  });

  test("returns 400 for invalid metadata hex color", async ({ request }) => {
    const res = await patchResume(request, resume.id, {
      version: resume.version,
      metadata: {
        ...VALID_BASELINE_METADATA,
        theme: {
          primary: "not-a-hex-color",
          background: "#ffffff",
          text: "#333333",
          accent: "#4a6cf7",
        },
      },
    });

    expect(res.status()).toBe(400);
  });

  test("returns 409 on optimistic locking version conflict", async ({
    request,
  }) => {
    const staleVersion = Math.max(1, resume.version - 1);
    const res = await patchResume(request, resume.id, {
      version:
        staleVersion === resume.version ? resume.version + 999 : staleVersion,
      title: "Conflict Test",
      data: VALID_BASELINE_DATA,
    });

    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("Version conflict");
    expect(body.currentVersion).toBe(resume.version);
  });

  test("returns 404 for non-existent resume id", async ({ request }) => {
    const res = await request.get("/api/resumes/does-not-exist-xyz");
    expect(res.status()).toBe(404);
  });

  test("returns 401 for unauthenticated resume access", async ({
    playwright,
  }) => {
    const unauth = await playwright.request.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const res = await unauth.get("/api/resumes");
    expect(res.status()).toBe(401);
    await unauth.dispose();
  });

  test("rejects work item missing company via API", async ({ request }) => {
    const res = await patchResume(request, resume.id, {
      version: resume.version,
      data: {
        ...VALID_BASELINE_DATA,
        work: [
          {
            id: "edge-work-1",
            company: "",
            position: "Engineer",
            website: "",
            startDate: "2022-01",
            endDate: null,
            summary: "",
            highlights: [],
            location: "",
          },
        ],
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
    expect(body.issues?.length).toBeGreaterThan(0);
  });

  test("rejects invalid education date via API", async ({ request }) => {
    const res = await patchResume(request, resume.id, {
      version: resume.version,
      data: {
        ...VALID_BASELINE_DATA,
        education: [
          {
            id: "edge-edu-1",
            institution: "Test University",
            url: "",
            area: "Computer Science",
            studyType: "Bachelor",
            startDate: "2020/09",
            endDate: "2024-05",
            score: "3.8",
            courses: [],
          },
        ],
      },
    });

    expect(res.status()).toBe(400);
  });

  test("rejects title longer than 255 characters", async ({ request }) => {
    const res = await patchResume(request, resume.id, {
      version: resume.version,
      title: "T".repeat(256),
    });

    expect(res.status()).toBe(400);
  });

  test("duplicate resume creates a copy with reset stats", async ({
    request,
  }) => {
    const dupRes = await request.post(`/api/resumes/${resume.id}/duplicate`);
    expect(dupRes.status()).toBe(201);

    const { resume: copy } = await dupRes.json();
    expect(copy.title).toMatch(/^Copy of /);
    expect(copy.viewCount).toBe(0);
    expect(copy.downloadCount).toBe(0);
    expect(copy.version).toBe(1);

    // Cleanup duplicate to preserve one-resume UX invariant
    await request.delete(`/api/resumes/${copy.id}`);
  });
});
