import { Product, ProductCategory } from "@/types";
import { prisma } from "../prisma";
import { cacheLife } from "next/cache";
import { getSessionUser } from "../actions/session.action";

function formatPrice(value: number): string {
  const rounded = Math.round(value);
  return "$" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const completeProduct = (
  product: Product & {
    product_categories: ProductCategory;
    favorites?: { id: bigint }[];
  },
) => {
  const { favorites, product_categories, ...rest } = product;
  return {
    ...rest,
    product_categories: undefined,
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

  const res = (await prisma.products.findMany({
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
  })) as (Product & {
    favorites?: { id: bigint }[];
  })[];

  return res.map((p) => completeProduct(p as never));
}

export async function getProductCount(
  params?: Parameters<typeof prisma.products.count>[0],
): Promise<number> {
  "use cache";
  cacheLife("hours");

  return prisma.products.count({ ...params });
}

export async function getProduct(
  params: Partial<Product>,
): Promise<Product | null> {
  const user = await getSessionUser();

  const res = (await prisma.products.findUnique({
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
  })) as (Product & {
    favorites?: { id: bigint }[];
  }) | null;

  if (!res) return null;

  return completeProduct(res as never);
}
