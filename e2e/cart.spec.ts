import { test, expect, type Page } from "@playwright/test";
import { registerCleanup } from "./helpers/cleanup";

// Signed-in file (project storageState). Writes to the shared test user's
// cart; the suite runs with workers: 1 so tests never overlap.
registerCleanup(test);

const FENDER = "fender-player-precision-bass-ffea1"; // $849
const SM7B = "shure-sm7b-26300"; // $399
const AKG = "akg-k240-studio-d448e"; // $69
const AT2020 = "audio-technica-at2020-b3862"; // $99

const FENDER_NAME = "Fender Player Precision Bass";
const SM7B_NAME = "Shure SM7B";
const AKG_NAME = "AKG K240 Studio";
const AT2020_NAME = "Audio-Technica AT2020";

// The header is outside the product page's Suspense boundary, so the cart
// panel is never duplicated by the S:1 streaming artifact. Scope to the
// relative wrapper that holds the toggle + dropdown to avoid matching the
// hero price ($849 etc.) or page content.
function cartPanel(page: Page) {
  return page.locator("div.relative").filter({
    has: page.getByRole("button", { name: "Open cart" }),
  });
}

function cartTotal(page: Page) {
  return cartPanel(page)
    .getByText("Total", { exact: true })
    .locator("xpath=following-sibling::span[1]");
}

// Logged-in product pages have TWO "+ Add to Cart" buttons: the hero one and
// another in the review form (rendered when logged in and not purchased).
// Scope to the hero section that contains the product's h1.
function heroAddToCart(page: Page, productName: string) {
  return page
    .getByRole("heading", { name: productName, level: 1 })
    .locator("xpath=ancestor::section")
    .getByRole("button", { name: "+ Add to Cart" });
}

function openCart(page: Page) {
  return page.getByRole("button", { name: "Open cart" }).click();
}

// The toast only fires once the POST /api/cart resolves — waiting on it
// guarantees the optimistic state is persisted before navigating/reloading
// (otherwise the in-flight fetch is aborted and the row never lands).
function expectAddToast(page: Page) {
  return expect(
    page.getByRole("status").filter({ hasText: "Added to cart" }),
  ).toBeVisible();
}

// Cart mutations are optimistic: the UI updates instantly, but the POST can
// still be in flight when a test ends. If the test closes the page mid-request
// the server is left behind the UI (or a late request re-creates a row AFTER
// the afterEach DELETE). Never finish a cart test until the server reflects
// the expected state — poll /api/cart (shares the page's session cookies).
async function expectServerCartEmpty(page: Page) {
  await expect
    .poll(
      async () => {
        const res = await page.request.get("/api/cart");
        return ((await res.json()) as unknown[]).length;
      },
      { timeout: 10_000 },
    )
    .toBe(0);
}

test.describe("Cart (con login)", () => {
  // Retry locally: the optimistic POST /api/cart can race the page teardown
  // (see the optimistic-UI race in docs/agents/e2e.md), which flakes these
  // tests intermittently. Retry is safe — afterEach cleanup + workers: 1
  // leave each attempt with a clean cart.
  test.describe.configure({ retries: 2 });

  test("agrega al carrito → toast, badge y preview", async ({ page }) => {
    await page.goto(`/product/${FENDER}`);

    await heroAddToCart(page, FENDER_NAME).click();

    await expect(page.getByRole("status")).toContainText("Added to cart");
    await expect(
      page.getByRole("button", { name: "Open cart" }).getByText("1"),
    ).toBeVisible();

    await openCart(page);

    await expect(
      cartPanel(page).getByText(FENDER_NAME, { exact: true }),
    ).toBeVisible();
    await expect(cartPanel(page).getByText("×1", { exact: true })).toBeVisible();
    await expect(cartTotal(page)).toHaveText("$849");
  });

  test("+/− en el preview ajusta cantidad y total", async ({ page }) => {
    await page.goto(`/product/${SM7B}`);

    await heroAddToCart(page, SM7B_NAME).click();
    await heroAddToCart(page, SM7B_NAME).click();
    await expect(
      page.getByRole("button", { name: "Open cart" }).getByText("2"),
    ).toBeVisible();

    await openCart(page);

    await expect(
      cartPanel(page).getByText(SM7B_NAME, { exact: true }),
    ).toBeVisible();
    await expect(cartPanel(page).getByText("×2", { exact: true })).toBeVisible();
    await expect(cartTotal(page)).toHaveText("$798");

    await page.getByRole("button", { name: "Add one Shure SM7B" }).click();
    await expect(cartPanel(page).getByText("×3", { exact: true })).toBeVisible();
    await expect(cartTotal(page)).toHaveText("$1,197");

    await page.getByRole("button", { name: "Remove one Shure SM7B" }).click();
    await expect(cartPanel(page).getByText("×2", { exact: true })).toBeVisible();
    await expect(cartTotal(page)).toHaveText("$798");

    await page.getByRole("button", { name: "Remove one Shure SM7B" }).click();
    await expect(cartPanel(page).getByText("×1", { exact: true })).toBeVisible();
    await expect(cartTotal(page)).toHaveText("$399");

    await page.getByRole("button", { name: "Remove one Shure SM7B" }).click();
    await expect(
      cartPanel(page).getByText("Your cart is empty"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open cart" }).getByText("2"),
    ).toHaveCount(0);
    await expect(
      cartPanel(page).getByRole("button", { name: "Purchase" }),
    ).toHaveCount(0);

    await expectServerCartEmpty(page);
  });

  test("el carrito persiste tras recargar", async ({ page }) => {
    await page.goto(`/product/${AKG}`);

    await heroAddToCart(page, AKG_NAME).click();
    await expectAddToast(page);

    await page.reload();
    await openCart(page);

    await expect(
      cartPanel(page).getByText(AKG_NAME, { exact: true }),
    ).toBeVisible();
    await expect(cartPanel(page).getByText("×1", { exact: true })).toBeVisible();
  });

  test("checkout crea el purchase y vacía el carrito", async ({ page }) => {
    await page.goto(`/product/${FENDER}`);
    await heroAddToCart(page, FENDER_NAME).click();
    await expectAddToast(page);

    await page.goto(`/product/${AT2020}`);
    await heroAddToCart(page, AT2020_NAME).click();
    await expectAddToast(page);

    await openCart(page);
    await expect(
      cartPanel(page).getByText(FENDER_NAME, { exact: true }),
    ).toBeVisible();
    await expect(
      cartPanel(page).getByText(AT2020_NAME, { exact: true }),
    ).toBeVisible();

    await cartPanel(page).getByRole("button", { name: "Purchase" }).click();

    await expect(page).toHaveURL(/\/purchases$/);
    await expect(
      page.getByRole("heading", { name: "Your Purchases" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: FENDER_NAME }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: AT2020_NAME })).toBeVisible();
    await expect(page.getByText("$948").filter({ visible: true })).toBeVisible();

    await page.goto("/");
    await openCart(page);
    await expect(
      cartPanel(page).getByText("Your cart is empty"),
    ).toBeVisible();

    await expectServerCartEmpty(page);
  });
});