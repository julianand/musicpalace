import { test, expect } from "@playwright/test";

// Logged-out file: override the project's storageState (signed in).
test.use({ storageState: { cookies: [], origins: [] } });

const SEARCH_INPUT = "Search instruments, interfaces, monitors...";

test.describe("Home page", () => {
  test("renderiza el hero", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /perfect sound starts here/i, level: 1 }),
    ).toBeVisible();
  });

  test("filtra por categoría", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Instrument" }).click();

    await expect(page).toHaveURL(/category=instrument/);
    await expect(
      page.getByRole("heading", { name: "Fender Player Precision Bass" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Shure SM7B" })).toHaveCount(
      0,
    );

    await page.getByRole("button", { name: "All" }).click();
    await expect(page).toHaveURL(/category=all/);
  });

  test("ordena por precio ascendente", async ({ page }) => {
    await page.goto("/");

    await page.locator("select").selectOption("price_asc");

    await expect(page).toHaveURL(/sort=price_asc/);
    await expect(page.locator("article h2").first()).toHaveText(
      "AKG K240 Studio",
    );
  });

  test("pagina el listado", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Fender Player Precision Bass" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "2", exact: true }).click();

    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText("Showing 9 products")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fender Player Precision Bass" }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Previous page" }).click();
    await expect(page).toHaveURL(/page=1/);
    await expect(
      page.getByRole("heading", { name: "Fender Player Precision Bass" }),
    ).toBeVisible();
  });

  test("la última página muestra el resto", async ({ page }) => {
    await page.goto("/?page=6");

    await expect(page.getByText("Showing 5 products")).toBeVisible();
  });

  test("busca y navega al resultado", async ({ page }) => {
    await page.goto("/");

    const search = page.getByPlaceholder(SEARCH_INPUT);
    await search.fill("Shure");

    await expect(page.getByRole("option", { name: /Shure SM7B/ })).toBeVisible();
    await page.getByRole("option", { name: /Shure SM7B/ }).click();

    await expect(page).toHaveURL(/product\/shure-sm7b-26300/);
    await expect(
      page.getByRole("heading", { name: "Shure SM7B", level: 1 }),
    ).toBeVisible();
  });

  test("sin resultados muestra el estado vacío", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder(SEARCH_INPUT).fill("zzzzzz");

    await expect(page.getByText("No se encontraron resultados")).toBeVisible();
  });

  test("cierra el dropdown con Escape y click fuera", async ({ page }) => {
    await page.goto("/");

    const search = page.getByPlaceholder(SEARCH_INPUT);
    await search.fill("Shure");
    await expect(page.getByRole("listbox")).toBeVisible();

    await search.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);

    await search.fill("Shure");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page
      .getByRole("heading", { name: /perfect sound starts here/i, level: 1 })
      .click();
    await expect(page.getByRole("listbox")).toHaveCount(0);
  });
});