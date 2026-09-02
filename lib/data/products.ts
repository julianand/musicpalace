import { Product, ProductCategory } from "@/types";
import type { products } from "@/app/generated/prisma/client";
import { prisma } from "../prisma";
import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { getSessionUser } from "../actions/session.action";
import { formatPrice } from "@/lib/products/format";

export type CompleteProductRow = products & {
  product_categories: ProductCategory;
  favorites?: { id: bigint }[];
};

export const completeProduct = (product: CompleteProductRow) => {
  const { favorites, product_categories, ...rest } = product;
  return {
    ...rest,
    category: {
      ...product_categories,
    },
    formattedPrice: formatPrice(rest.price),
    favorite: (favorites?.length ?? 0) > 0,
  };
};

async function getProductsBase(
  params?: Parameters<typeof prisma.products.findMany>[0],
) {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "reviews");

  return prisma.products.findMany({
    include: {
      product_categories: true,
    },
    ...params,
  });
}

async function getProductBase(params: Partial<Product>) {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "reviews");

  return prisma.products.findUnique({
    include: {
      product_categories: true,
    },
    where: params as never,
  });
}

const getFavoriteIds = cache(async (userId: bigint): Promise<bigint[]> => {
  const favs = await prisma.favorites.findMany({
    where: { user_id: userId },
    select: { product_id: true },
  });
  return favs.map((f) => f.product_id);
});

// Wishlist page: the logged-in user's favorited products. Follows the split
// convention — cached base query + per-user favorites overlay (favorite: true).
export async function getFavoriteProducts(): Promise<Product[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const favIds = await getFavoriteIds(user.id);
  if (favIds.length === 0) return [];

  const favSet = new Set(favIds);
  const rows = await getProductsBase({
    where: { id: { in: favIds } },
  });

  return rows.map((p) => ({
    ...completeProduct(p as CompleteProductRow),
    favorite: favSet.has(p.id),
  }));
}

export async function getProducts(
  params?: Parameters<typeof prisma.products.findMany>[0],
): Promise<Product[]> {
  const [user, rows] = await Promise.all([
    getSessionUser(),
    getProductsBase(params),
  ]);

  const products = rows.map((p) => completeProduct(p as CompleteProductRow));
  if (!user) return products;

  const favIds = new Set(await getFavoriteIds(user.id));
  return products.map((p) => (favIds.has(p.id) ? { ...p, favorite: true } : p));
}

export async function getProductCount(
  params?: Parameters<typeof prisma.products.count>[0],
): Promise<number> {
  "use cache";
  cacheLife("hours");

  return prisma.products.count({ ...params });
}

export async function getSearchResults(query: string) {
  "use cache";
  cacheLife("minutes");

  return prisma.products.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      product_categories: {
        select: {
          id: true,
          name: true,
          accent_color: true,
          background_color: true,
        },
      },
    },
    take: 8,
  });
}

export async function getProduct(
  params: Partial<Product>,
): Promise<Product | null> {
  const [user, res] = await Promise.all([
    getSessionUser(),
    getProductBase(params),
  ]);

  if (!res) return null;

  const product = completeProduct(res as CompleteProductRow);
  if (!user) return product;

  const favIds = new Set(await getFavoriteIds(user.id));
  return favIds.has(product.id) ? { ...product, favorite: true } : product;
}
