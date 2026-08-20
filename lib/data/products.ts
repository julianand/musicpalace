import { Product, ProductCategory } from "@/types";
import { prisma } from "../prisma";
import { cacheLife } from "next/cache";

function formatPrice(value: number): string {
  const rounded = Math.round(value);
  return "$" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const completeProduct = (
  product: Product & { product_categories: ProductCategory },
) => {
  return {
    ...product,
    product_categories: undefined,
    category: {
      ...product.product_categories,
    },
    formattedPrice: formatPrice(product.price),
  };
};

export async function getProducts(
  params?: Parameters<typeof prisma.products.findMany>[0],
): Promise<Product[]> {
  const res = await prisma.products.findMany({
    include: { product_categories: true },
    ...params,
  });

  return res.map((p) => completeProduct(p as never));
}

export async function getProductCount(
  params?: Parameters<typeof prisma.products.count>[0],
): Promise<number> {
  "use cache";
  cacheLife("hours");

  return prisma.products.count({ ...params });
}

export async function getProduct(params: Partial<Product>): Promise<Product> {
  "use cache";
  cacheLife("hours");

  const res = await prisma.products.findUnique({
    include: { product_categories: true },
    where: params as never,
  });

  return completeProduct(res as never);
}
