import { test, expect } from "@playwright/test";

test.describe("About page", () => {
  test("el footer navega a /about", async ({ page }) => {
    await page.goto("/");

    // exact: the hero also has an "About this project" link (substring match
    // would otherwise resolve to 2 elements).
    await page.getByRole("link", { name: "About", exact: true }).click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page.getByRole("heading", { name: "About this project" }),
    ).toBeVisible();
  });

  test("el link del hero navega a /about", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("link", { name: "About this project" })
      .click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page.getByRole("heading", { name: "About this project" }),
    ).toBeVisible();
  });

  test("muestra stack, features, run it locally y about me", async ({ page }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("heading", { name: "About this project" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "About me" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Built with" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "What you can do" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Run it locally" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /linkedin\.com\/in\/julianpitre/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /github\.com\/julianand$/ }),
    ).toBeVisible();
  });
});