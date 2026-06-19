import { test, expect } from "@playwright/test";

// Authenticated GUI flow. Requires a confirmed QA user provided via secrets:
//   QA_TEST_EMAIL / QA_TEST_PASSWORD
// Skips gracefully when they are not configured (e.g. on forks).

const EMAIL = process.env.QA_TEST_EMAIL;
const PASSWORD = process.env.QA_TEST_PASSWORD;

test.describe("authenticated session", () => {
  test.skip(!EMAIL || !PASSWORD, "QA_TEST_EMAIL/QA_TEST_PASSWORD not set");

  test("login lands on dashboard and protected routes stay accessible", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', EMAIL!);
    await page.fill('input[type="password"]', PASSWORD!);
    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 }),
      page.click('button[type="submit"]'),
    ]);

    // Should not be bounced back to /login.
    await expect(page).not.toHaveURL(/\/login/);

    // Protected routes render with the session instead of redirecting.
    await page.goto("/activity");
    await expect(page).not.toHaveURL(/\/login/);

    await page.goto("/reports");
    await expect(page).not.toHaveURL(/\/login/);
  });
});
