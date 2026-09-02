import { test, expect } from "@playwright/test";
import { registerCleanup } from "./helpers/cleanup";

// Harmless for the logged-out test (cleanup no-ops when the user is absent);
// needed by the signed-in test, which can accumulate rows.
registerCleanup(test);

test.describe("Purchases page (sin login)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirige al home", async ({ page }) => {
    await page.goto("/purchases");

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: /perfect sound starts here/i, level: 1 }),
    ).toBeVisible();
  });
});

test.describe("Purchases page (con login)", () => {
  test("muestra el estado vacío", async ({ page }) => {
    await page.goto("/purchases");

    await expect(
      page.getByRole("heading", { name: "Your Purchases" }),
    ).toBeVisible();
    // /purchases has a loading.tsx: filter the S:1 hidden streaming copy.
    await expect(
      page.getByText("No purchases yet").filter({ visible: true }),
    ).toBeVisible();
  });
});