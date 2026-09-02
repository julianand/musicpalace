import { test, expect, type Page } from "@playwright/test";
import { registerCleanup } from "./helpers/cleanup";
import { TEST_USER_INITIALS } from "./helpers/test-user";

// Harmless for the logged-out test (cleanup no-ops when the user is absent);
// needed by the signed-in tests, which can accumulate favorites.
registerCleanup(test);

const FENDER = "fender-player-precision-bass-ffea1";
const FENDER_NAME = "Fender Player Precision Bass";

// The Account menu button renders the user initials only once the UserProvider
// has loaded the session — same gate as favorites.spec.ts.
async function waitForUser(page: Page) {
  await expect(
    page.getByRole("button", { name: "Account menu" }),
  ).toContainText(TEST_USER_INITIALS);
}

test.describe("Wishlist page (sin login)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirige al home", async ({ page }) => {
    await page.goto("/wishlist");

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: /perfect sound starts here/i, level: 1 }),
    ).toBeVisible();
  });
});

test.describe("Wishlist page (con login)", () => {
  test("muestra el estado vacío", async ({ page }) => {
    await page.goto("/wishlist");

    await expect(
      page.getByRole("heading", { name: "Your Wishlist" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No favorites yet" }),
    ).toBeVisible();
  });

  test("agrega un favorito y lo quita desde la wishlist", async ({ page }) => {
    await page.goto(`/product/${FENDER}`);
    await waitForUser(page);

    // Hero wishlist button: wait until the server action resolves (re-enabled).
    await page.getByRole("button", { name: "Add to wishlist" }).click();
    await expect(
      page.getByRole("button", { name: "Remove from wishlist" }),
    ).toBeEnabled();

    await page.goto("/wishlist");
    await expect(
      page.getByRole("heading", { name: FENDER_NAME }),
    ).toBeVisible();

    // Removing from the wishlist page refreshes the list (router.refresh).
    await page.getByRole("button", { name: "Remove from wishlist" }).click();
    await expect(
      page.getByRole("heading", { name: "No favorites yet" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: FENDER_NAME }),
    ).toHaveCount(0);
  });
});