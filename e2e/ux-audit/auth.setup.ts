import { expect, test as setup } from "@playwright/test";
import { resetFindings } from "./helpers/audit";

const authFile = "ux-audit/.auth/user.json";

const email = process.env.DEMO_EMAIL ?? "zaprill.com@gmail.com";
const password = process.env.DEMO_PASSWORD ?? "Zaprill@Demo";

setup("authenticate demo user", async ({ page, context, request }) => {
  resetFindings();

  // Prefer API sign-in so session cookies are set reliably for storageState.
  const apiResponse = await request.post("/api/auth/sign-in/email", {
    data: { email, password, rememberMe: true },
  });

  if (!apiResponse.ok()) {
    // Fallback to UI sign-in if API route differs by version.
    await page.goto("/sign-in");
    await page.getByPlaceholder("name@example.com").fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page).not.toHaveURL(/sign-in/, { timeout: 20_000 });
  } else {
    const setCookie = apiResponse.headers()["set-cookie"];
    if (setCookie) {
      const cookies = setCookie.split(/,(?=\s*[^;]+=[^;]+)/).map((raw) => {
        const parts = raw.trim().split(";");
        const [nameValue] = parts;
        const [name, ...valueParts] = nameValue.split("=");
        return {
          name: name.trim(),
          value: valueParts.join("=").trim(),
          domain: "localhost",
          path: "/",
          httpOnly: parts.some((p) => p.trim().toLowerCase() === "httponly"),
          secure: parts.some((p) => p.trim().toLowerCase() === "secure"),
          sameSite: "Lax" as const,
        };
      });
      await context.addCookies(cookies);
    }
  }

  await page.goto("/");
  await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/auth/get-session") && resp.status() === 200,
    { timeout: 20_000 },
  );

  const sessionCookies = (await context.cookies()).filter(
    (c) => !c.name.startsWith("_ga"),
  );
  expect(sessionCookies.length).toBeGreaterThan(0);

  await context.storageState({ path: authFile });
});
