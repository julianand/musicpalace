# The Music Palace 🎸

A demo storefront for music gear reviews — browse instruments and studio gear, read and write reviews, save favorites, and go through a full cart-to-checkout flow.

<p>
  <a href="https://musicpalace.vercel.app" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/live%20demo-vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live demo"></a>
  <a href="https://github.com/julianand/musicpalace" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/source%20code-github-181717?style=for-the-badge&logo=github&logoColor=white" alt="Source code"></a>
</p>

---

## Tech stack

![Next.js](https://img.shields.io/badge/Next.js%2016-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%20v4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?logo=prisma&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)

- **Next.js 16** (App Router) — Server Components, `use cache`/Cache Components, streaming + Suspense
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Auth (with `@supabase/ssr`) + PostgreSQL
- **Prisma ORM 7** — typed data access over the `PrismaPg` driver adapter
- **Playwright** — end-to-end test suite

## What the app does

- **Catalog** — 50 products across instruments and studio gear, with category filters, multiple sort orders and pagination
- **Search** — live autocomplete that navigates straight to a product
- **Product pages** — star ratings, a rating breakdown, written reviews and related products
- **Reviews** — purchase-gated: only users who bought the product can review it, one editable review per product
- **Auth** — sign up / sign in / sign out with Supabase Auth
- **Cart** — optimistic UI with a live preview panel, quantity controls and persistence across reloads
- **Checkout** — one-click purchase that creates an order and lands on a purchase-history page
- **Wishlist** — one-click favorite toggles anywhere, plus a dedicated wishlist page

## Project structure

```
app/                    # App Router pages, route handlers and components
  about/                # About page
  product/[slug]/       # Product page + related products + review form
  purchases/            # Purchase history
  wishlist/             # Wishlist page
  components/           # Shared UI primitives (cart, favorites, profile menu…)
lib/
  actions/              # Server actions (toggleFavorite, upsertReview, createPurchase…)
  data/                 # Server-side data layer (Prisma queries → domain types)
  providers/            # React context providers (auth session, cart)
  products/             # Product domain logic (filters, formatting)
  supabase/             # Supabase SSR helpers
e2e/                    # Playwright specs + helpers
prisma/                 # Schema + seed
```

## Getting started

**Requirements:** Node.js ≥ 20.12

1. **Clone & install**

   ```bash
   git clone https://github.com/julianand/musicpalace.git
   cd musicpalace
   npm install
   ```

2. **Set up the environment**

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase project credentials and database URL:

   ```env
   DATABASE_URL=...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   ```

3. **Create the schema and seed sample data**

   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Run it**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Pull the schema from the DB and regenerate the Prisma client |
| `npx prisma db seed` | Load the sample/seed data |
| `npx playwright test` | Run the end-to-end suite |

## Testing

The repo ships a Playwright suite (`e2e/`) that exercises the app end-to-end against a live database: auth, catalog browsing, cart, checkout, purchases, favorites, reviews and the wishlist. The suite self-provisions a throwaway test user and cleans up after itself.

```bash
npx playwright test
```

## Purpose

This is a personal learning project and a portfolio piece — a playground for exploring Next.js App Router patterns, server caching, Supabase auth, Prisma and end-to-end testing on a realistic product. You're welcome to use it, fork it or poke at it for your own testing.

Deployed on [Vercel](https://musicpalace.vercel.app) · Source on [GitHub](https://github.com/julianand/musicpalace).