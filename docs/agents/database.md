# Database — Prisma, triggers, seed

> Area rules for the Prisma client, live-DB triggers, and seed/backup. Loaded on demand from the root `AGENTS.md` index when a task touches these areas.

## Prisma client
- The generated client lives at `app/generated/prisma/client` — import from there, not from `@prisma/client`.
- The client requires the `PrismaPg` driver adapter (see `lib/prisma.ts`). Never instantiate `PrismaClient` without it.
- The schema is **introspected from the live Supabase database** (`prisma db pull`, via `npm run prisma:generate`) — the `auth` schema models are Supabase internals; don't edit them. App tables live in the `public` schema and use RLS.
- `favorites` and `carts` are real tables (wishlist / cart features) but are **not** seeded — they hold per-user data.

## Database triggers (managed in Supabase)
These run in the live DB — don't replicate their work in Prisma code:
- `on_auth_user_created` — `AFTER INSERT ON auth.users` → `public.handle_new_user()` (SECURITY DEFINER, `search_path` = `public`) inserts a `public.users` row (`auth_id`, `email`, `firstname`, `lastname`) on every signup. `firstname`/`lastname` are read from `raw_user_meta_data` — the app's sign-up form sends them as `options.data: { firstname, lastname }`. This is why a signup automatically creates the app user (and the `users.auth_id → auth.users` CASCADE is what lets the e2e teardown delete a user in one shot).
- `trg_update_product_ratings` — `AFTER INSERT OR DELETE OR UPDATE ON public.reviews` → recomputes `products.overall_sound_quality`, `overall_build_quality`, `overall_value`, `overall_ease_of_use`, `overall_rating`, and `review_count`. So review mutations (create/edit/delete) must **not** update product aggregates — the trigger runs on `DELETE` too, so removing a review (e.g. the e2e per-test cleanup) restores the aggregates automatically.
- `trg_set_product_slug` — `BEFORE INSERT ON public.products` → auto-generates `products.slug`. Products can't be created from the app yet, but this applies whenever that lands.

## Seed / backup
- `prisma/seed.ts` contains a full snapshot of the production data (users, product_categories, products, reviews).
- It is idempotent: uses `upsert` on every record, so it can be re-run safely without duplicating data.
- After inserting, it resets PostgreSQL sequences so future `autoincrement()` IDs don't collide.
- Configured in `package.json` under `"prisma": { "seed": "tsx prisma/seed.ts" }`.

**To recreate the database from scratch:**
```bash
npx prisma db push   # creates tables from schema.prisma
npx prisma db seed   # inserts all records from the backup
```

**To run the seed against the local .env:**
```bash
npx tsx --env-file=.env prisma/seed.ts
```