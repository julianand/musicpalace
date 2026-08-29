import { Product, ProductCategory } from "@/types";
import type { products } from "@/app/generated/prisma/client";
import { prisma } from "../prisma";
import { cacheLife } from "next/cache";
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

export async function getProducts(
  params?: Parameters<typeof prisma.products.findMany>[0],
): Promise<Product[]> {
  const user = await getSessionUser();

  const res = await prisma.products.findMany({
    include: {
      product_categories: true,
      ...(user
        ? {
            favorites: {
              where: { user_id: user.id },
              select: { id: true },
              take: 1,
            },
          }
        : {}),
    },
    ...params,
  });

  return res.map((p) => completeProduct(p as CompleteProductRow));
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
  const user = await getSessionUser();

  const res = await prisma.products.findUnique({
    include: {
      product_categories: true,
      ...(user
        ? {
            favorites: {
              where: { user_id: user.id },
              select: { id: true },
              take: 1,
            },
          }
        : {}),
    },
    where: params as never,
  });

  if (!res) return null;

  return completeProduct(res as CompleteProductRow);
}
