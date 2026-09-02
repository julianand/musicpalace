import { test, expect, type Page, type Locator } from "@playwright/test";
import { registerCleanup } from "./helpers/cleanup";
import { getProductIdBySlug, getUserFavoriteIds } from "./helpers/db";
import { TEST_USER_EMAIL, TEST_USER_INITIALS } from "./helpers/test-user";

// Signed-in file (project storageState). Writes to the shared test user's
// favorites; the suite runs with workers: 1 so tests never overlap.
registerCleanup(test);

const FENDER = "fender-player-precision-bass-ffea1";
const FENDER_NAME = "Fender Player Precision Bass";

// The Account menu button renders the user initials only once the UserProvider
// has loaded the session. FavoriteButton reads the same provider, so waiting on
// the initials guarantees a click toggles the favorite instead of showing the
// "Sign in to save favorites" toast.
async function waitForUser(page: Page) {
  await expect(
    page.getByRole("button", { name: "Account menu" }),
  ).toContainText(TEST_USER_INITIALS);
}

// Product page hero favorite (showLabel). It is the only /wishlist/ button on
// the page (related cards have no heart); getByRole is immune to the S:1
// hidden streaming copy. Scoped to the hero section for consistency with the
// cart spec's heroAddToCart.
function heroFavorite(page: Page) {
  return page
    .getByRole("heading", { name: FENDER_NAME, level: 1 })
    .locator("xpath=ancestor::section")
    .getByRole("button", { name: /wishlist/i });
}

// Homepage card heart (icon-only, aria-label). Scoped to the card's article to
// disambiguate the 9 hearts on the page.
function cardHeart(page: Page, productName: string) {
  return page
    .getByRole("heading", { name: productName })
    .locator("xpath=ancestor::article")
    .getByRole("button", { name: /wishlist/i });
}

// Favorites mutate through a server action (no /api endpoint to poll). The
// button is disabled={pending} while the action is in flight, so waiting for
// it to be re-enabled is the server sync point — once enabled the row is
// committed (same guarantee the "Added to cart" toast gives the cart spec).
async function toggleFavorite(button: Locator) {
  await button.click();
  await expect(button).toBeEnabled();
}

test.describe("Favorites (con login)", () => {
  test("toggle en product page (add y remove)", async ({ page }) => {
    const productId = await getProductIdBySlug(FENDER);
    expect(productId).not.toBeNull();

    await page.goto(`/product/${FENDER}`);
    await waitForUser(page);

    const fav = heroFavorite(page);
    await expect(fav).toHaveAttribute("aria-pressed", "false");
    await expect(fav).toHaveAccessibleName("Add to wishlist");

    await toggleFavorite(fav);
    await expect(heroFavorite(page)).toHaveAttribute("aria-pressed", "true");
    await expect(heroFavorite(page)).toHaveAccessibleName(
      "Remove from wishlist",
    );
    await expect
      .poll(async () => getUserFavoriteIds(TEST_USER_EMAIL))
      .toContain(productId!);

    await toggleFavorite(heroFavorite(page));
    await expect(heroFavorite(page)).toHaveAttribute("aria-pressed", "false");
    await expect(heroFavorite(page)).toHaveAccessibleName("Add to wishlist");
    await expect
      .poll(async () => getUserFavoriteIds(TEST_USER_EMAIL))
      .not.toContain(productId!);
  });

  test("heart en homepage se marca y persiste tras recargar", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForUser(page);

    const heart = cardHeart(page, FENDER_NAME);
    await expect(heart).toHaveAttribute("aria-pressed", "false");
    await expect(heart).toHaveAccessibleName("Add to wishlist");

    await toggleFavorite(heart);
    await expect(cardHeart(page, FENDER_NAME)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(cardHeart(page, FENDER_NAME)).toHaveAccessibleName(
      "Remove from wishlist",
    );

    // Persistence: the server re-renders favorite=true (getFavoriteIds is
    // per-request, outside the cached products fetch).
    await page.reload();
    await expect(cardHeart(page, FENDER_NAME)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(cardHeart(page, FENDER_NAME)).toHaveAccessibleName(
      "Remove from wishlist",
    );
  });

  test("persistencia en product page tras recarga", async ({ page }) => {
    await page.goto(`/product/${FENDER}`);
    await waitForUser(page);

    await toggleFavorite(heroFavorite(page));
    await expect(heroFavorite(page)).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await waitForUser(page);
    await expect(heroFavorite(page)).toHaveAttribute("aria-pressed", "true");
    await expect(heroFavorite(page)).toHaveAccessibleName(
      "Remove from wishlist",
    );

    await toggleFavorite(heroFavorite(page));
    await expect(heroFavorite(page)).toHaveAttribute("aria-pressed", "false");
    await expect(heroFavorite(page)).toHaveAccessibleName("Add to wishlist");
  });
});