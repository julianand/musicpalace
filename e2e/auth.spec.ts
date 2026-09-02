import { test, expect } from "@playwright/test";

// Logged-out file: override the project's storageState (signed in).
test.use({ storageState: { cookies: [], origins: [] } });

// Auth flows hit live Supabase; serialize to avoid rate-limit/contention flakes.
test.describe.configure({ mode: "serial" });

test.describe("Auth (sin login)", () => {
  test("abre el menú con el form de sign in", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Account menu" }).click();

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("valida el form de sign up", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("button", { name: "Sign up", exact: true }).click();

    await page.getByLabel("First name").fill("J");
    await page.getByLabel("Last name").fill("D");
    // "a@b" passes the native type=email constraint but fails the app's regex
    // (requires a dot in the domain), so the custom validation runs.
    await page.getByLabel("Email").fill("a@b");
    await page.getByLabel("Password").fill("123");
    await page.getByRole("button", { name: "Sign up", exact: true }).click();

    await expect(
      page.getByText("Enter a valid email address.").filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page
        .getByText("Password must be at least 6 characters.")
        .filter({ visible: true }),
    ).toBeVisible();
  });

  test("flujo completo: sign up, sign out, sign in", async ({ page }) => {
    const email = `e2e-auth-${Date.now()}@example.com`;
    const password = "auth-test-password";

    await page.goto("/");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("button", { name: "Sign up", exact: true }).click();

    await page.getByLabel("First name").fill("Ana");
    await page.getByLabel("Last name").fill("Auth");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign up", exact: true }).click();

    // Sign up + auto sign in: initials appear and the profile shows the user
    // (verifies the auth.users → public.users trigger).
    await expect(
      page.getByRole("button", { name: "Account menu" }),
    ).toContainText("AA");
    await expect(page.getByText("Ana Auth").filter({ visible: true })).toBeVisible();
    await expect(page.getByText(email).filter({ visible: true })).toBeVisible();

    // Sign out → back to the sign in form.
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Account menu" }),
    ).not.toContainText("AA");

    // Sign in again with the same credentials.
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(
      page.getByRole("button", { name: "Account menu" }),
    ).toContainText("AA");
  });
});