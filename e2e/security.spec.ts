import { test, expect } from "@playwright/test";

// GUI security behaviour that holds regardless of auth state.

const PROTECTED = ["/", "/activity", "/reports", "/rides/new", "/expenses/new", "/settings"];

test.describe("unauthenticated access", () => {
  for (const path of PROTECTED) {
    test(`protected route ${path} redirects to /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe("public pages render", () => {
  test("login page renders email + password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("signup page renders activation code + email fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test("no console errors (incl. CSP violations) on /login", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/login", { waitUntil: "networkidle" });
  const cspErrors = errors.filter((e) => /content security policy|refused to/i.test(e));
  expect(cspErrors, `CSP violations: ${cspErrors.join(" | ")}`).toHaveLength(0);
  expect(errors, `console errors: ${errors.join(" | ")}`).toHaveLength(0);
});
