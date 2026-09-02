# E2E tests — Playwright

> Area rules for the Playwright suite. Loaded on demand from the root `AGENTS.md` index when a task touches `e2e/`, `playwright.config.ts`, or test infrastructure.

## Layout

- `e2e/*.spec.ts` — flow-oriented specs, one per feature area.
- `e2e/auth.setup.ts` — setup project: signs up the e2e test user once per run and saves `playwright/.auth/user.json` (storageState).
- `e2e/global-teardown.ts` — deletes every `e2e-%` user in `auth.users` at the end of the run (cascades to `public.users` and all children via the FK `ON DELETE CASCADE` chain).
- `e2e/helpers/` — `db.ts` (pg client + user/data cleanup), `cleanup.ts` (`registerCleanup` per-test afterEach), `test-user.ts` (constant test-user credentials).

## Test user lifecycle

- The suite authenticates with a **self-provisioned user**: `e2e-test@example.com` / `e2e-test-password` (constants in `e2e/helpers/test-user.ts`).
- `auth.setup.ts` first deletes any leftover `auth.users` row for that email (recovers from interrupted runs), then signs up via the real UI. This exercises the app's signup → `auth.users` → `public.users` trigger → session flow.
- `global-teardown.ts` deletes all `auth.users` rows with email `LIKE 'e2e-%'`, so the setup user and any signup-throwaway users from `auth.spec.ts` are swept after every run (even aborted ones, on the next run's setup reset).
- Requires **"Confirm email" disabled** on the Supabase project, since the app signs up then immediately signs in.

## Sign-in strategy in specs

- Project `chromium` uses `storageState: 'playwright/.auth/user.json'` (signed in as the test user).
- Specs that must run **logged out** (`home.spec.ts`, `product.spec.ts`, `auth.spec.ts`) override at file level:
  `test.use({ storageState: { cookies: [], origins: [] } })`.
- Specs that write data (cart/purchases/favorites/reviews) call `registerCleanup(test)` so their `afterEach` deletes the test user's rows for that test.
- **The suite runs with `workers: 1`** (config). All specs share the single test user, and write specs mutate the same rows (`cleanupUserData` deletes *everything* of the user in `afterEach`, and the checkout flow deletes all of the user's cart rows). Serial execution makes badge/total assertions deterministic and keeps one test's cleanup from clobbering a concurrent test. `auth.spec.ts` keeps `test.describe.configure({ mode: 'serial' })` as intent documentation for when workers are raised again.

## DB cleanup conventions

- FKs were changed in Supabase to `ON DELETE CASCADE`: `favorites/carts/purchases/reviews → users(id)` and `purchase_items → purchases(id)`; `users.auth_id → auth.users` was already CASCADE. So deleting an `auth.users` row removes everything in one shot.
- `trg_update_product_ratings` was modified to also fire on `DELETE`, so removing a test review recomputes product aggregates automatically (no manual recompute in cleanup).
- Per-test cleanup (`helpers/db.ts` `cleanupUserData`) deletes only `favorites/carts/purchases/reviews` for the user by email — it must **not** delete the user row, or the session breaks mid-run.

## Gotchas

- **`next dev` Suspense duplicate**: routes with a `loading.tsx` (product, purchases) stream a hidden copy of the page inside `div#S:1` (`display: none`) until hydration finishes. `getByText` can then match 2 elements → flaky strict-mode failures. Fix: `.filter({ visible: true })` on text locators for those pages, or use `getByRole` (immune). **Home is also affected**: its product grid streams inside a Suspense boundary, so `getByText("Showing … products")` / `getByText("No se encontraron resultados")` need the filter too. CI alternative: run against `npm run build && npm run start`.
- **Live DB drifts from the seed** (review counts/aggregates are recomputed by triggers). Assert with regex/robust locators, not exact seed values.
- Selectors: prefer `getByRole`/`getByLabel`; the sort `<select>` and the search `<input>` are both `role="combobox"` — disambiguate with `page.locator('select')` and `getByPlaceholder(...)`.

## Cart & purchases specifics

- **Distinct product per test** (fixed DB prices → deterministic totals). Slugs/prices: `fender-player-precision-bass-ffea1` $849, `shure-sm7b-26300` $399, `akg-k240-studio-d448e` $69, `audio-technica-at2020-b3862` $99.
- The cart header lives in the **root layout, outside** the product page's Suspense boundary → the preview panel is never duplicated by `S:1`. Scope panel assertions with `page.locator("div.relative").filter({ has: openCartButton })` to avoid matching the hero price / page content (e.g. the hero shows the same `$849` as the preview total).
- Total: read via `getByText("Total", { exact: true }).locator("xpath=following-sibling::span[1]")` — the item price and the total can be identical strings (single-item cart), so don't assert a bare price inside the panel.
- Checkout (`Purchase` in the preview) calls `createPurchase`, which **deletes all of the user's cart rows**, then `router.push('/purchases')`. `registerCleanup` afterEach then deletes the created purchase, so the signed-in `purchases.spec` empty-state stays deterministic (files run alphabetically: `cart` before `purchases`).
- `/purchases` asserts (headings, `$948` total) need `.filter({ visible: true })` because the page has a `loading.tsx`.
- **Optimistic-UI race (the cart mutation bug)**: cart mutations update the UI instantly but the POST can still be in flight when a test ends. Closing the page mid-request leaves the server behind the UI, and a late request can re-create a row *after* the afterEach DELETE. Rule: never end a cart test until the server reflects the final state — poll `page.request.get('/api/cart')` (shares the page session) until it matches (see `expectServerCartEmpty`). The add case is covered by waiting for the "Added to cart" toast (fires only once the POST resolves) before navigating/reloading.
- **App finding (out of e2e scope)**: `/api/cart` POST's `findFirst → create` guard is a TOCTOU race — concurrent +1 requests for the same product can create duplicate rows (observed as two `product_id` rows at quantity 0 after an aborted run). The tests now drain the queue before cleanup, so it doesn't flake the suite, but the guard is worth revisiting (e.g., a unique constraint + `onConflictDoNothing`).
- **App fix (found by e2e)**: a slow *initial* cart GET (`CartProvider` mount `load()`) could resolve **after** a user click and clobber the optimistic update with a stale/empty snapshot — the `loadIdRef` guard couldn't see optimistic dispatches, so it accepted the `[]`. Fix: `cart.provider.tsx` now exposes a wrapped `dispatch` that bumps `loadIdRef.current` on every mutation, so any in-flight load is discarded ("the latest operation wins"). No server re-sync on success — the optimistic state is already correct, and re-syncing caused a flicker when adding products in quick succession (the reload of item A saw B still in flight). `use-cart-mutation`'s `onSynced` remains error/catch-only. Specs trust the "Added to cart" toast + badge.

## Running

```bash
npx playwright test            # full suite (setup project runs first)
npx playwright test <spec>     # single spec (setup still runs as a dependency)
```