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

## DB cleanup conventions

- FKs were changed in Supabase to `ON DELETE CASCADE`: `favorites/carts/purchases/reviews → users(id)` and `purchase_items → purchases(id)`; `users.auth_id → auth.users` was already CASCADE. So deleting an `auth.users` row removes everything in one shot.
- `trg_update_product_ratings` was modified to also fire on `DELETE`, so removing a test review recomputes product aggregates automatically (no manual recompute in cleanup).
- Per-test cleanup (`helpers/db.ts` `cleanupUserData`) deletes only `favorites/carts/purchases/reviews` for the user by email — it must **not** delete the user row, or the session breaks mid-run.

## Gotchas

- **`next dev` Suspense duplicate**: routes with a `loading.tsx` (product, purchases) stream a hidden copy of the page inside `div#S:1` (`display: none`) until hydration finishes. `getByText` can then match 2 elements → flaky strict-mode failures. Fix: `.filter({ visible: true })` on text locators for those pages, or use `getByRole` (immune). Home has no `loading.tsx` and is unaffected. CI alternative: run against `npm run build && npm run start`.
- **Live DB drifts from the seed** (review counts/aggregates are recomputed by triggers). Assert with regex/robust locators, not exact seed values.
- Selectors: prefer `getByRole`/`getByLabel`; the sort `<select>` and the search `<input>` are both `role="combobox"` — disambiguate with `page.locator('select')` and `getByPlaceholder(...)`.

## Running

```bash
npx playwright test            # full suite (setup project runs first)
npx playwright test <spec>     # single spec (setup still runs as a dependency)
```