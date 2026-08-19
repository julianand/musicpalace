import { ProductCategory } from "@/types";
import { prisma } from "../prisma";
import { cacheLife } from "next/cache";

export async function getCategories(): Promise<ProductCategory[]> {
  "use cache";
  cacheLife('hours');

  const res = await prisma.product_categories.findMany();
  return res;
}