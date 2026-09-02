import { test, expect, type Page } from "@playwright/test";
import { registerCleanup } from "./helpers/cleanup";
import {
  ensurePurchaseForUser,
  getUserReview,
  insertReviewForUser,
} from "./helpers/db";
import { TEST_USER_EMAIL, TEST_USER_INITIALS } from "./helpers/test-user";

// Signed-in file (project storageState). Writes to the shared test user's
// purchases + reviews; the suite runs with workers: 1 so tests never overlap.
registerCleanup(test);

const FENDER = "fender-player-precision-bass-ffea1";

// The Account menu button renders the user initials only once the UserProvider
// has loaded the session — a hydration gate before interacting with the radios
// (which need React event handlers attached).
async function waitForUser(page: Page) {
  await expect(
    page.getByRole("button", { name: "Account menu" }),
  ).toContainText(TEST_USER_INITIALS);
}

// The review form is the only <form> on the product page, but the S:1 hidden
// streaming copy also contains one. getByRole is immune to display:none, yet
// the outer CSS locator would resolve to 2 elements — filter to the visible
// form so the chain stays unambiguous.
function reviewForm(page: Page) {
  return page.locator("form").filter({ visible: true });
}

function radio(page: Page, label: string, stars: number) {
  return reviewForm(page).getByRole("radio", {
    name: `${label}: ${stars} of 5 stars`,
  });
}

function expectAddToCartCount(page: Page, count: number) {
  return expect(
    page.getByRole("button", { name: "+ Add to Cart" }),
  ).toHaveCount(count);
}

async function expectRatingsChecked(page: Page, ratings: number[]) {
  for (const [i, stars] of ratings.entries()) {
    const label = ["Sound", "Build", "Value", "Ease of use"][i];
    await expect(radio(page, label, stars)).toBeChecked();
  }
}

test.describe("Reviews (con login)", () => {
  test("gate por compra: form deshabilitado sin haber comprado", async ({
    page,
  }) => {
    await page.goto(`/product/${FENDER}`);
    await waitForUser(page);

    await expect(
      page
        .getByText("You must purchase this product to leave a review.")
        .filter({ visible: true }),
    ).toBeVisible();

    await expect(radio(page, "Sound", 4)).toBeDisabled();
    await expect(
      reviewForm(page).getByLabel("Your review comment"),
    ).toBeDisabled();
    await expect(
      reviewForm(page).getByRole("button", { name: "Post review" }),
    ).toBeDisabled();

    // The review form renders its own "+ Add to Cart" next to the hero one.
    await expectAddToCartCount(page, 2);
  });

  test("post: comprado → crea la review y aparece en la lista", async ({
    page,
  }) => {
    await ensurePurchaseForUser(TEST_USER_EMAIL, FENDER);

    await page.goto(`/product/${FENDER}`);
    await waitForUser(page);

    await expect(
      page.getByRole("heading", { name: "Leave a review" }),
    ).toBeVisible();
    await expect(radio(page, "Sound", 4)).toBeEnabled();
    // Purchased: the form's own Add to Cart is gone, only the hero one remains.
    await expectAddToCartCount(page, 1);

    await radio(page, "Sound", 4).click();
    await radio(page, "Build", 5).click();
    await radio(page, "Value", 4).click();
    await radio(page, "Ease of use", 3).click();
    await reviewForm(page)
      .getByLabel("Your review comment")
      .fill("Great bass for the money");

    await reviewForm(page)
      .getByRole("button", { name: "Post review" })
      .click();

    await expect(page.getByRole("status")).toContainText("Review posted");
    await expect(
      page.getByRole("heading", { name: "Your review" }),
    ).toBeVisible();
    await expect(
      reviewForm(page).getByRole("button", { name: "Update review" }),
    ).toBeVisible();
    await expectRatingsChecked(page, [4, 5, 4, 3]);

    await expect(
      page.getByText("E2E Test").filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page
        .locator("p")
        .filter({ hasText: "Great bass for the money" })
        .filter({ visible: true }),
    ).toBeVisible();

    const review = await getUserReview(TEST_USER_EMAIL, FENDER);
    expect(review).toEqual({
      sound_quality: 4,
      build_quality: 5,
      value: 4,
      ease_of_use: 3,
      comment: "Great bass for the money",
    });
  });

  test("edición: form pre-llenado → actualiza la review", async ({ page }) => {
    await ensurePurchaseForUser(TEST_USER_EMAIL, FENDER);
    await insertReviewForUser(TEST_USER_EMAIL, FENDER, {
      soundQuality: 4,
      buildQuality: 4,
      value: 4,
      easeOfUse: 4,
      comment: "Initial review",
    });

    await page.goto(`/product/${FENDER}`);
    await waitForUser(page);

    await expect(
      page.getByRole("heading", { name: "Your review" }),
    ).toBeVisible();
    await expectRatingsChecked(page, [4, 4, 4, 4]);
    await expect(
      reviewForm(page).getByLabel("Your review comment"),
    ).toHaveValue("Initial review");

    await radio(page, "Sound", 5).click();
    await reviewForm(page)
      .getByLabel("Your review comment")
      .fill("Updated after more time with it");

    await reviewForm(page)
      .getByRole("button", { name: "Update review" })
      .click();

    await expect(page.getByRole("status")).toContainText("Review updated");
    await expectRatingsChecked(page, [5, 4, 4, 4]);

    await expect(
      page
        .locator("p")
        .filter({ hasText: "Updated after more time with it" })
        .filter({ visible: true }),
    ).toBeVisible();

    const review = await getUserReview(TEST_USER_EMAIL, FENDER);
    expect(review).toEqual({
      sound_quality: 5,
      build_quality: 4,
      value: 4,
      ease_of_use: 4,
      comment: "Updated after more time with it",
    });
  });
});