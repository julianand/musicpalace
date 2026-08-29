<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Tech stack

- Next.js 16.3.0 (App Router) — read `node_modules/next/dist/docs/` for breaking changes
- React 19.2.8
- TypeScript
- Tailwind CSS v4
- Prisma ORM 7 (PostgreSQL) with `PrismaPg` driver adapter
- Supabase (Auth + Database, `@supabase/ssr`)

## Scripts (`package.json`)

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — `eslint` (NOT `next lint`)
- `npm run prisma:generate` — `prisma db pull && prisma generate` (regenerate client from the live DB)

## Project conventions

### Navigation
- **Always use `<Link href="...">` from `next/link` for internal app navigation.** Never use a plain `<a href="...">` for internal routes — it triggers a full page reload and bypasses Next.js client-side routing.
- Plain `<a>` is only acceptable for external URLs (e.g. `href="https://..."`) or when intentionally forcing a hard navigation.

### File naming
- Use **kebab-case** for all component files (e.g. `related-scroll.tsx`, `product-card.tsx`). Never use PascalCase filenames.

### Shared UI & a11y
- Shared presentational primitives live in `app/components/ui/` — reuse `StarRating` (uses `useId()` for its SVG gradient), `formatPrice` from `lib/products/format.ts`, and the `ProductPageSkeleton` before duplicating them.
- Global a11y conventions: `:focus-visible` outline in `globals.css`, `@media (prefers-reduced-motion: reduce)` disables custom animations, icon-only buttons carry `aria-label` + `aria-expanded`, and toasts use `role="status"`.

### Documenting architecture changes
- **Any change that affects the architecture must be documented in this `AGENTS.md` as part of the same change — don't wait to be asked.** This covers: data flow / state ownership changes, new or renamed providers, API routes, server actions, hooks, DB tables/columns, file moves between the `lib/` layers, and component architecture changes. Update the relevant section (or add a new one) in the same change.

## Architecture / directory layout

- `app/` — App Router pages, route handlers, and components (grouped per feature/route).
- `app/components/ui/` — client components (buttons, toasts, search bar, etc.).
- `lib/data/` — server-side data access layer (Prisma queries). These return domain types from `@/types`.
- `lib/actions/` — server actions (`"use server"`).
- `lib/providers/` — React context providers (client).
- `lib/ui/services/` — client-side services (e.g. `toast.service.ts` singleton).
- `lib/ui/hooks/` — client-side hooks (e.g. `use-cart-mutation.ts`).
- `lib/products/` — product domain logic (sort options in `filters.ts`, pure `format.ts` with `formatPrice`).
- `lib/supabase/` — Supabase SSR helpers (`client.ts` for browser, `server.ts` for server).
- `types/index.ts` — domain types. They re-export and **augment** the Prisma models (see `Product`/`Review`). Prisma model types are imported from `@/app/generated/prisma/client`.
- Path alias: `@/` → project root (e.g. `@/types`, `@/lib/...`).

## Data layer conventions

- Product queries (`getProducts`, `getProduct` in `lib/data/products.ts`) include the category relation and, when a user is logged in, the user's favorites. They map the raw row through `completeProduct`, exposing `category`, `formattedPrice`, and `favorite` fields. Do not bypass this mapping. `completeProduct` accepts a `CompleteProductRow` (`products & { product_categories, favorites? }`) — the Prisma row shape, not the domain `Product`.
- Any data function that needs the logged-in user calls `getSessionUser()` (from `lib/actions/session.action.ts`). It resolves the Supabase session to the app's `users` row by `auth_id`. It is wrapped in React `cache()`, so repeated calls within a single request dedupe.
- Server caching: use `"use cache"` + `cacheLife(...)` (from `next/cache`) for stable, non-user-scoped queries (`getCategories`, `getProductCount`, `getReviews` → `hours`; `getSearchResults` → `minutes`). Do **not** cache user-scoped queries.
- Money formatting: `formatPrice(value: number)` lives in `lib/products/format.ts` (pure, importable from server **and** client) — never duplicate the dollar-formatting logic.
- **BigInt**: Prisma `BigInt` ids cannot cross the server/client boundary. Serialize them to strings in API routes (`p.id.toString()`) and pass them to client components as props.

## Auth & favorites

- Auth is Supabase SSR. `getSessionUser()` is the single source of truth for the current user on the server; `UserProvider` (`lib/providers/user.provider.tsx`) hydrates it on the client and listens to `onAuthStateChange`, calling `router.refresh()` on sign in/out.
- Favorites: `toggleFavorite(productId: bigint)` in `lib/actions/favorites.action.ts` is a server action that returns a typed result (`{ success, favorite?, error? }`). The client `FavoriteButton` does optimistic updates and reports errors/notifications through the toast service.
- Toast service: `lib/ui/services/toast.service.ts` is a singleton (subscribe/notify). `<ToastContainer />` is rendered once inside `AppProvider`.

## Cart

The cart is **100% client-driven** — there is no server-rendered cart badge (it starts empty and fills after the client fetch), and mutations reconcile via a `reload()`, not `router.refresh()`.

- DB: the `carts` table (`schema.prisma`) is keyed by `user_id` + `product_id` with a `quantity` column (no unique constraint — the logic handles it). Not seeded; holds per-user data.
- Data access: `getCartProducts()` and the `CartProduct` type (`Product & { quantity: number }`) live in `lib/data/cart.ts`. Server-side only, used by the API route.
- API: `app/api/cart/route.ts` (authenticates with `getSessionUser()`):
  - `GET /api/cart` — returns the current user's cart serialized for JSON (all BigInt ids → string: `id`, `category_id`, `review_count`, `category.id`). No session → `[]` (200).
  - `POST /api/cart` — body `{ productId: string, quantity: number }` with **delta semantics** (clamped to ±99): positive adds, negative removes, resulting `quantity <= 0` deletes the row. The write is **atomic**: `updateMany` with `quantity: { increment: delta }` (no read-then-write race), guarded `create` when no row exists. Errors: `401` unauthorized, `400` invalid body/params, `404` product not found.
- Serialization: `lib/cart-serialization.ts` exports the `SerializedCartProduct` type + pure `serialize`/`deserialize` (BigInt → string → BigInt), shared by the API route (server) and `CartProvider` (client). `import type` keeps prisma out of the client bundle.
- State: `CartProvider` (`lib/providers/cart.provider.tsx`) is the single client source of truth. It loads its own data on mount **and** on `onAuthStateChange` (`SIGNED_IN`/`SIGNED_OUT`) via `fetch("/api/cart")`, deserializing BigInt strings back to `BigInt` (out-of-order responses are ignored via a counter ref). It uses `useReducer` — actions: `set` (replace with server data from `reload()`) and `adjustQuantity` (**delta** semantics: adjusts the product's quantity, removes it when `<= 0`, appends from `product` when not present). Because `useReducer` applies sequential dispatches to the latest state, rapid clicks self-accumulate with no client-side ref. It exposes **two contexts**: `CartStateContext` (`{ products, loaded }` via `useCartState()`) and `CartActionsContext` (`{ dispatch, reload }` via `useCartActions()`), so action-only consumers like `CartButton` don't re-render on every cart change. `useCart()` merges both for convenience.
- Mutations: `useCartMutation(productId, { errorMessage?, unauthorizedMessage?, successMessage?, onSettled?, onSynced? })` in `lib/ui/hooks/use-cart-mutation.ts` — **single in-flight request with net-delta coalescing** (`deltaRef` + `inFlightRef`): rapid clicks never disable the button and are summed into one batch. When a batch settles it calls `onSynced` (the provider's `reload`).
- UI: `CartButton` (`app/components/ui/cart-button.tsx`) is the single unified add/quantity button, used on product cards, the product page, and the preview rows. It reads `useCartActions()` only. Props: `productId`, `label`, `delta?` (default `1`), `product?` (full `Product` for optimistic append when it isn't in the cart yet), `showSuccessToast?`, and message overrides. Optimistic updates dispatch `adjustQuantity` (delta); the session guard toasts "Sign in…" when logged out.
- `CartPreview` (`app/components/ui/cart-preview.tsx`): badge (`CartToggleButton`) + dropdown list (`CartPreviewList` / `CartPreviewListItem`), all reading the cart state context. The dropdown closes on outside click, `Escape`, or route change, and shows a **total** + `CartCheckoutButton` in the footer. The **whole cart lives in this preview** — there is no `/cart` page (the "Go to cart" footer link was removed).
- `completeProduct` (`lib/data/products.ts`) is exported and reused to map cart rows.

## Purchases

Purchases snapshot the cart at checkout time. The server is the source of truth — the client never sends product payloads.

- DB: `purchases` (id, `created_at`, `user_id`, `total`) + `purchase_items` (id, `product_id`, `purchase_id`, `quantity`, `unit_price`) — already introspected tables, not seeded. `total`/`unit_price` are stored `Int` cents-less prices.
- Server action: `createPurchase()` in `lib/actions/purchases.action.ts` — `"use server"`, returns a typed result `{ success, error? }` (`"unauthorized"` / `"empty_cart"`). It reads the user's `carts` rows, then in one `prisma.$transaction` creates the `purchases` row (total = Σ `quantity × products.price`), `createMany`s the `purchase_items`, and `carts.deleteMany` for the user.
- Data access: `getPurchases()` in `lib/data/purchases.ts` returns `PurchaseWithItems[]` (`purchase & { items: (purchase_item & { product: Product })[] }`), mapping each item's product through `completeProduct`. Ordered `created_at: desc`.
- Checkout UI: `CartCheckoutButton` (`app/components/ui/cart-checkout-button.tsx`) renders in the `CartPreviewList` footer, only when the cart has items **and** a user is logged in. On click it runs `createPurchase()` in a `useTransition` (guarded by an in-flight ref so double-clicks can't create duplicate purchases); while pending it shows a **full-screen fixed overlay** (`z-[100]`) that blocks the whole page. On success it calls `reload()` (clears the client cart) then `router.push("/purchases")`; on failure it toasts and stays put.
- Page: `app/purchases/page.tsx` is a server component that `redirect("/")`s when unauthenticated and renders the user's purchases (date, total, items with quantity × unit price).

## Search

- `app/api/search/route.ts` — GET endpoint, reads `?q=`, returns up to 8 matching products serialized for the client (BigInt ids → string). Used by the search bar.
- The route uses `getSearchResults(query)` in `lib/data/products.ts` — a **lean, cached** query (`"use cache"` + `cacheLife("minutes")`) that selects only the fields the dropdown needs and performs **no session lookup / favorites include** (unlike `getProducts`), so the per-keystroke search never hits Supabase auth.

## Home page filters & pagination

- The home page reads `?category`, `?sort`, and `?page` search params.
- Sort options and `PRODUCTS_MAIN_RECORD_PAGINATION` (= 9) live in `lib/products/filters.ts`. New options must be added there.

## Database

### Prisma client
- The generated client lives at `app/generated/prisma/client` — import from there, not from `@prisma/client`.
- The client requires the `PrismaPg` driver adapter (see `lib/prisma.ts`). Never instantiate `PrismaClient` without it.
- The schema is **introspected from the live Supabase database** (`prisma db pull`, via `npm run prisma:generate`) — the `auth` schema models are Supabase internals; don't edit them. App tables live in the `public` schema and use RLS.
- `favorites` and `carts` are real tables (wishlist / cart features) but are **not** seeded — they hold per-user data.

### Seed / backup
- `prisma/seed.ts` contains a full snapshot of the production data (users, product_categories, products, reviews).
- It is idempotent: uses `upsert` on every record, so it can be re-run safely without duplicating data.
- After inserting, it resets PostgreSQL sequences so future `autoincrement()` IDs don't collide.
- Configured in `package.json` under `"prisma": { "seed": "tsx prisma/seed.ts" }`.

> **Known, expected build error:** `next build` / `tsc` fails in `prisma/seed.ts` with `TS2737: BigInt literals are not available when targeting lower than ES2020` (the `tsconfig.json` `target` is `ES2017`). This is **normal** — do not fix it and do not flag it as a regression. Skip `prisma/seed.ts` when validating type checks/builds unless explicitly asked to address it.

**To recreate the database from scratch:**
```bash
npx prisma db push   # creates tables from schema.prisma
npx prisma db seed   # inserts all records from the backup
```

**To run the seed against the local .env:**
```bash
npx tsx --env-file=.env prisma/seed.ts
```
