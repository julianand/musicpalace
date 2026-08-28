import { Product } from "@/types";
import { prisma } from "../prisma";
import { getSessionUser } from "../actions/session.action";
import { completeProduct } from "./products";

export type CartProduct = Product & {
  quantity: number;
};

export async function getCartProducts(): Promise<CartProduct[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.carts.findMany({
    where: { user_id: user.id },
    include: {
      products: {
        include: { product_categories: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return rows.map((row) => ({
    ...completeProduct(row.products as never),
    quantity: row.quantity,
  }));
}