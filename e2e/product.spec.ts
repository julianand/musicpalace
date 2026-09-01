import { test, expect } from "@playwright/test";

// Logged-out file: override the project's storageState (signed in).
test.use({ storageState: { cookies: [], origins: [] } });

const PRODUCT_SLUG = "fender-player-precision-bass-ffea1";

test.describe("Product page (sin login)", () => {
  test("renderiza el producto", async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);

    await expect(
      page.getByRole("heading", { name: "Fender Player Precision Bass" }),
    ).toBeVisible();
    await expect(page.getByText("$849").filter({ visible: true })).toBeVisible();
    await expect(
      page.getByText(/4\.8 · \d+ reviews/).filter({ visible: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "More in Instrument" }),
    ).toBeVisible();
  });

  test("muestra las reviews del seed", async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);

    await expect(page.getByRole("heading", { name: "Reviews" })).toBeVisible();
    await expect(
      page.getByText("Andres Torres").filter({ visible: true }),
    ).toBeVisible();
  });

  test("sin login: add to cart muestra toast de sign-in", async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);

    await page.getByRole("button", { name: "+ Add to Cart" }).click();

    await expect(page.getByRole("status")).toContainText(
      "Sign in to add items to your cart",
    );
  });

  test("sin login: favorito muestra toast de sign-in", async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);

    await page.getByRole("button", { name: "Add to wishlist" }).click();

    await expect(page.getByRole("status")).toContainText(
      "Sign in to save favorites",
    );
  });

  test("sin login: el form de review está deshabilitado", async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`);

    await expect(
      page
        .locator("main")
        .getByText("Sign in to leave a review for this product.")
        .filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Sound: 1 of 5 stars" }),
    ).toBeDisabled();
    await expect(page.getByRole("button", { name: "Post review" })).toBeDisabled();
  });
});