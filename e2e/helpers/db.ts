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