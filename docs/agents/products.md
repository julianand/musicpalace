# Products — data layer, search, home filters

> Area rules for catalog, caching, and search. Loaded on demand from the root `AGENTS.md` index when a task touches these areas.

## Data layer conventions

- Product queries (`getProducts`, `getProduct` in `lib/data/products.ts`) expose `category`, `formattedPrice`, and `favorite` fields via `completeProduct`. They are **split** into a cached base query + a per-user favorites overlay:
  - `getProductsBase`/`getProductBase` (module-private) run the product query with the `product_categories` relation only — **no session, no favorites** — under `"use cache"` + `cacheLife("hours")`, tagged `cacheTag("products", "reviews")`. The `reviews` tag ties product reads to review mutations: `upsertReview` already calls `updateTag("reviews")`, so the DB-trigger-computed rating aggregates (`overall_*`, `review_count`) refresh immediately. Future product mutations should `updateTag("products")`.
  - The `favorite` flag is an overlay: `getFavoriteIds(userId)` (module-private) reads the user's favorites wrapped in React `cache()` — **request-scoped dedupe only, never a server cache** — and `getProducts`/`getProduct` set `favorite: true` for ids in that set. Logged-out users get `favorite: false` with no extra query. This is why the split: a `"use cache"` function cannot read `cookies()`, and caching the user-scoped part would leak one user's favorites into the shared cache (see the "Do not cache user-scoped queries" rule below).
- Any data function that needs the logged-in user calls `getSessionUser()` (from `lib/actions/session.action.ts`). It resolves the Supabase session to the app's `users` row by `auth_id`. It is wrapped in React `cache()`, so repeated calls within a single request dedupe.
- Server caching: use `"use cache"` + `cacheLife(...)` (from `next/cache`) for stable, non-user-scoped queries (`getCategories`, `getProductCount`, `getProductsBase`/`getProductBase` → `hours`; `getSearchResults` → `minutes`). Do **not** server-cache user-scoped queries — favorites/cart/review-state stay fresh per request; at most wrap them in React `cache()` for within-request dedupe.
- Money formatting: `formatPrice(value: number)` lives in `lib/products/format.ts` (pure, importable from server **and** client) — never duplicate the dollar-formatting logic.
- **BigInt**: Prisma `BigInt` ids cannot cross the server/client boundary. Serialize them to strings in API routes (`p.id.toString()`) and pass them to client components as props.

## Search

- `app/api/search/route.ts` — GET endpoint, reads `?q=`, returns up to 8 matching products serialized for the client (BigInt ids → string). Used by the search bar.
- The route uses `getSearchResults(query)` in `lib/data/products.ts` — a **lean, cached** query (`"use cache"` + `cacheLife("minutes")`) that selects only the fields the dropdown needs and performs **no session lookup / favorites include** (unlike `getProducts`), so the per-keystroke search never hits Supabase auth.

## Home page filters & pagination

- The home page reads `?category`, `?sort`, and `?page` search params.
- Sort options and `PRODUCTS_MAIN_RECORD_PAGINATION` (= 9) live in `lib/products/filters.ts`. New options must be added there.