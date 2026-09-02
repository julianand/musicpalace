import { Client } from "pg";

try {
  process.loadEnvFile(".env");
} catch {
  // .env optional: CI can provide DATABASE_URL directly.
}

export async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function findUserIdByEmail(email: string): Promise<bigint | null> {
  return withClient(async (c) => {
    const { rows } = await c.query("SELECT id FROM public.users WHERE email = $1", [email]);
    return rows.length ? rows[0].id : null;
  });
}

export async function deleteAuthUser(email: string): Promise<void> {
  await withClient(async (c) => {
    await c.query("DELETE FROM auth.users WHERE email = $1", [email]);
  });
}

export async function deleteUsersByPrefix(prefix: string): Promise<void> {
  await withClient(async (c) => {
    await c.query("DELETE FROM auth.users WHERE email LIKE $1", [`${prefix}%`]);
  });
}

export async function getProductIdBySlug(slug: string): Promise<bigint | null> {
  return withClient(async (c) => {
    const { rows } = await c.query("SELECT id FROM public.products WHERE slug = $1", [slug]);
    return rows.length ? rows[0].id : null;
  });
}

export async function getUserFavoriteIds(email: string): Promise<bigint[]> {
  const userId = await findUserIdByEmail(email);
  if (userId === null) return [];

  return withClient(async (c) => {
    const { rows } = await c.query(
      "SELECT product_id FROM public.favorites WHERE user_id = $1",
      [userId],
    );
    return rows.map((r) => r.product_id);
  });
}

type ReviewFixture = {
  soundQuality: number;
  buildQuality: number;
  value: number;
  easeOfUse: number;
  comment?: string;
};

export async function cleanupUserData(email: string): Promise<void> {
  const userId = await findUserIdByEmail(email);
  if (userId === null) return;

  await withClient(async (c) => {
    await c.query("DELETE FROM public.favorites WHERE user_id = $1", [userId]);
    await c.query("DELETE FROM public.carts WHERE user_id = $1", [userId]);
    // purchases cascades to purchase_items (FK ON DELETE CASCADE).
    await c.query("DELETE FROM public.purchases WHERE user_id = $1", [userId]);
    // Deleting reviews recomputes product aggregates via the DB trigger.
    await c.query("DELETE FROM public.reviews WHERE user_id = $1", [userId]);
  });
}

// Fixture: give the user a real purchase_items row for the product, which is
// what the review gate (`getReviewState` / `upsertReview`) checks. Idempotent.
export async function ensurePurchaseForUser(
  email: string,
  slug: string,
): Promise<void> {
  const userId = await findUserIdByEmail(email);
  const productId = await getProductIdBySlug(slug);
  if (userId === null || productId === null) return;

  await withClient(async (c) => {
    const existing = await c.query(
      `SELECT pi.id
         FROM public.purchase_items pi
         JOIN public.purchases p ON p.id = pi.purchase_id
        WHERE p.user_id = $1 AND pi.product_id = $2`,
      [userId, productId],
    );
    if (existing.rows.length) return;

    const { rows: [priceRow] } = await c.query(
      "SELECT price FROM public.products WHERE id = $1",
      [productId],
    );
    const { rows: [purchase] } = await c.query(
      "INSERT INTO public.purchases (user_id, total) VALUES ($1, $2) RETURNING id",
      [userId, priceRow.price],
    );
    await c.query(
      `INSERT INTO public.purchase_items
         (purchase_id, product_id, quantity, unit_price)
       VALUES ($1, $2, 1, $3)`,
      [purchase.id, productId, priceRow.price],
    );
  });
}

// Fixture: seed an existing review so the form loads in edit mode. `overall`
// is a DB-generated column (default expression), so it computes on insert.
export async function insertReviewForUser(
  email: string,
  slug: string,
  ratings: ReviewFixture,
): Promise<void> {
  const userId = await findUserIdByEmail(email);
  const productId = await getProductIdBySlug(slug);
  if (userId === null || productId === null) return;

  await withClient(async (c) => {
    await c.query(
      `INSERT INTO public.reviews
         (user_id, product_id, sound_quality, build_quality, value, ease_of_use, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        productId,
        ratings.soundQuality,
        ratings.buildQuality,
        ratings.value,
        ratings.easeOfUse,
        ratings.comment ?? null,
      ],
    );
  });
}

export async function getUserReview(
  email: string,
  slug: string,
): Promise<{
  sound_quality: number;
  build_quality: number;
  value: number;
  ease_of_use: number;
  comment: string | null;
} | null> {
  return withClient(async (c) => {
    const { rows } = await c.query(
      `SELECT r.sound_quality, r.build_quality, r.value, r.ease_of_use, r.comment
         FROM public.reviews r
         JOIN public.users u ON u.id = r.user_id
         JOIN public.products p ON p.id = r.product_id
        WHERE u.email = $1 AND p.slug = $2`,
      [email, slug],
    );
    return rows.length ? rows[0] : null;
  });
}