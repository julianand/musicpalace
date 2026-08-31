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
- **Any change that affects the architecture must be documented in the relevant `docs/agents/*.md` area file as part of the same change — don't wait to be asked.** This covers: data flow / state ownership changes, new or renamed providers, API routes, server actions, hooks, DB tables/columns, file moves between the `lib/` layers, and component architecture changes. Update the relevant area file (or add a new section) in the same change.

## Architecture / directory layout

- `app/` — App Router pages, route handlers, and components (grouped per feature/route).
- `app/components/ui/` — client components (buttons, toasts, search bar, etc.).
- `lib/data/` — server-side data access layer (Prisma queries). These return domain types from `@/types`.
- `lib/actions/` — server actions (`"use server"`).
- `lib/providers/` — React context providers (client).
- `lib/ui/services/` — client-side services (e.g. `toast.service.ts` singleton).
- `lib/ui/hooks/` — client-side hooks (e.g. `use-cart-mutation.ts`).
- `lib/products/` — product domain logic (sort options in `filters.ts`, pure `format.ts` with `formatPrice`).
- `lib/supabase/` — Supabase SSR helpers (`client.ts` for browser, `server.ts` for server, `proxy.ts` for the session-refresh proxy).
- `types/index.ts` — domain types. They re-export and **augment** the Prisma models (see `Product`/`Review`). Prisma model types are imported from `@/app/generated/prisma/client`.
- Path alias: `@/` → project root (e.g. `@/types`, `@/lib/...`).

## On-demand rules

CRITICAL: When working on a task, use your Read tool to load ONLY the area
file(s) matching the task. Do NOT preemptively load all of them. Treat a
loaded file as mandatory instructions for that area.

- Products / data layer / caching / search / home filters → `docs/agents/products.md`
- Auth / session / proxy (`getSessionUser`, `proxy.ts`, `lib/supabase/`) → `docs/agents/auth.md`
- Cart / purchases (`CartProvider`, `/api/cart`, checkout, `app/purchases`) → `docs/agents/cart.md`
- Reviews (`upsertReview`, `getReviews`, `ReviewForm`) → `docs/agents/reviews.md`
- Prisma / DB triggers / seed → `docs/agents/database.md`