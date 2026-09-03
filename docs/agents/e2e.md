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

## Wishlist specifics

- `/wishlist` has a `loading.tsx` (skeleton), so it streams an S:1 hidden copy during `next dev`. All current wishlist assertions are `getByRole`-based (headings/buttons), which are immune to `display:none`; any future **text** assertion there needs `.filter({ visible: true })` (see the product-page gotcha). Logged-out visit → `redirect("/")` (assert home hero), same pattern as `/purchases`.
- Add a favorite first on the product page (wait for the hero button to re-enable, the `toBeEnabled()` server-sync point from the favorites rules), then `/wishlist` shows the card (`getByRole("heading", { name })`).
- **Remove-from-wishlist**: the card's `FavoriteButton` fires `onToggle → router.refresh()` after the server action resolves, so the removed card disappears and the "No favorites yet" empty state replaces it — no reload needed in the test.

## About specifics

- `/about` is a public static page (no `loading.tsx`, no auth) — plain `getByRole` assertions, no S:1 handling needed. `about.spec.ts` covers the footer `About` link (root layout, `Link href="/about"`) and the home hero `About this project` link navigating to the page, plus the page's "About me"/stack/features/"Run it locally" rendering.
- **Name collision**: the hero link "About this project" is a substring match for `getByRole("link", { name: "About" })` (default is substring) — always target the footer link with `{ name: "About", exact: true }`, and the hero link with the full name. The only external links left on the page live in the first "About me" card (GitHub profile, LinkedIn) and are asserted by accessible name regex, not `href`; the GitHub link (`github.com/julianand`) uses a trailing `$` so it can't match a longer GitHub URL.

## Favorites specifics

- `FavoriteButton` (product hero `showLabel`, home/related cards icon-only) exposes the state as `aria-pressed` and flips its accessible name `Add to wishlist` ↔ `Remove from wishlist` — locate with `getByRole("button", { name: /wishlist/i })` so the same locator survives the toggle. Related cards on the product page have **no** heart, so the hero button is unique there; on the home grid scope to the card: `getByRole("heading", { name }).locator("xpath=ancestor::article")`.
- **User-load gate**: `FavoriteButton` reads `useUser()` client-side; clicking before the session loads shows the "Sign in to save favorites" toast instead of toggling. The same provider feeds the "Account menu" button its initials, so wait `toContainText(TEST_USER_INITIALS)` before clicking hearts (and after any `reload` that precedes an interaction).
- **Server sync point**: favorites mutate via a server action (no `/api/favorites` to poll). The button is `disabled={pending}` while the action is in flight — wait `toBeEnabled()` after the click; once enabled the row is committed. `favorites.spec.ts` additionally polls `getUserFavoriteIds` (helpers/db.ts) for the add/remove assertion.
- Persistence works because `getFavoriteIds` is React `cache()` (per-request) applied *outside* the `"use cache"` products fetch — a reload re-reads favorites even though the product rows are cached.

## Reviews specifics

- **Purchase gate**: `ReviewForm` renders disabled (radios, comment, submit) with "You must purchase this product to leave a review." until the user has a `purchase_items` row for the product (server-driven via `getReviewState`). When not purchased the form also renders its own `+ Add to Cart`, so the logged-in product page shows **two** `+ Add to Cart` buttons (hero + form) → `toHaveCount(2)`; after purchasing, `1`.
- **Form scope**: the review form is the only `<form>` on the product page, but the S:1 hidden copy duplicates it, so a bare `page.locator("form")` resolves to 2. Scope with `page.locator("form").filter({ visible: true })` before chaining `getByRole`/`getByLabel`.
- **Hydration gate**: the radios need React handlers attached, so gate interactions on the Account-menu initials (`waitForUser`) — same as favorites.
- **Sync point**: submit fires the `upsertReview` server action inside a `useTransition`, then shows a toast ("Review posted"/"Review updated") and calls `router.refresh()`. Wait on the toast + the heading flip (`Leave a review` → `Your review`) / button flip (`Post review` → `Update review`); the list reflects the change via `updateTag("reviews")` + refresh. No REST endpoint to poll — the DB assertion (`getUserReview`) is belt-and-suspenders after the UI settles.
- **Fixtures (helpers/db.ts)**: the "purchased" state is seeded with `ensurePurchaseForUser` (idempotent `purchases` + `purchase_items` insert; `total`/`unit_price` from `products.price`) and the edit path with `insertReviewForUser` (`reviews.overall` is a DB-generated column, so it computes on insert). Cleanup's `DELETE FROM reviews` restores product aggregates via the trigger.
- **List assertions** (author name `E2E Test`, comment wrapped in curly quotes) need `.filter({ visible: true })` — the product page streams into S:1.

## Cart & purchases specifics

- **Local retries**: `cart.spec.ts` sets `test.describe.configure({ retries: 2 })` on the whole `Cart (con login)` describe, overriding the config's local `retries: 0` (CI keeps its global `2`). Reason: the optimistic `POST /api/cart` can race the page teardown (see the optimistic-UI race below) and flake these tests intermittently. Safe because afterEach cleanup + `workers: 1` leave each attempt with a clean cart; `trace: 'on-first-retry'` captures the failed attempt.
- **Distinct product per test** (fixed DB prices → deterministic totals). Slugs/prices: `fender-player-precision-bass-ffea1` $849, `shure-sm7b-26300` $399, `akg-k240-studio-d448e` $69, `audio-technica-at2020-b3862` $99.
- The cart header lives in the **root layout, outside** the product page's Suspense boundary → the preview panel is never duplicated by `S:1`. Scope panel assertions with `page.locator("div.relative").filter({ has: openCartButton })` to avoid matching the hero price / page content (e.g. the hero shows the same `$849` as the preview total).
- Total: read via `getByText("Total", { exact: true }).locator("xpath=following-sibling::span[1]")` — the item price and the total can be identical strings (single-item cart), so don't assert a bare price inside the panel.
- Checkout (`Purchase` in the preview) calls `createPurchase`, which **deletes all of the user's cart rows**, then `router.push('/purchases')`. `registerCleanup` afterEach then deletes the created purchase, so the signed-in `purchases.spec` empty-state stays deterministic (files run alphabetically: `cart` before `purchases`).
- `/purchases` asserts (headings, `$948` total) need `.filter({ visible: true })` because the page has a `loading.tsx`.
- **Optimistic-UI race (the cart mutation bug)**: cart mutations update the UI instantly but the POST can still be in flight when a test ends. Closing the page mid-request leaves the server behind the UI, and a late request can re-create a row *after* the afterEach DELETE. Rule: never end a cart test until the server reflects the final state — poll `page.request.get('/api/cart')` (shares the page session) until it matches (see `expectServerCartEmpty`). The add case is covered by waiting for the "Added to cart" toast (fires only once the POST resolves) before navigating/reloading.
- **App finding (out of e2e scope)**: `/api/cart` POST's `findFirst → create` guard is a TOCTOU race — concurrent +1 requests for the same product can create duplicate rows (observed as two `product_id` rows at quantity 0 after an aborted run). The tests now drain the queue before cleanup, so it doesn't flake the suite, but the guard is worth revisiting (e.g., a unique constraint + `onConflictDoNothing`).
- **App fix (found by e2e)**: a slow *initial* cart GET (`CartProvider` mount `load()`) could resolve **after** a user click and clobber the optimistic update with a stale/empty snapshot — the `loadIdRef` guard couldn't see optimistic dispatches, so it accepted the `[]`. Fix: `cart.provider.tsx` now exposes a wrapped `dispatch` that bumps `loadIdRef.current` on every mutation, so any in-flight load is discarded ("the latest operation wins"). No server re-sync on success — the optimistic state is already correct, and re-syncing caused a flicker when adding products in quick succession (the reload of item A saw B still in flight). `use-cart-mutation`'s `onSynced` remains error/catch-only. Specs trust the "Added to cart" toast + badge.

## Deterministic seed data (for assertions)

- 50 products, pagination of 9 → 6 pages; the last page shows "Showing 5 products".
- Cheapest product: AKG K240 Studio ($69) → first card with `sort=price_asc`.
- Top-rated instrument: Fender Player Precision Bass (4.8) → on page 1, off page 2.
- Search "Shure" → Shure SM7B / Shure SM58; "zzzzzz" → "No se encontraron resultados".
- Product for product-page tests: `fender-player-precision-bass-ffea1` (Instrument, $849, 4.8 · 6 reviews).
- The live DB can drift from the seed (review aggregates recomputed by triggers). Assert with regex/robust locators, not exact seed values.

## Running

```bash
npx playwright test            # full suite (setup project runs first)
npx playwright test <spec>     # single spec (setup still runs as a dependency)
```