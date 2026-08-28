import { Product, Purchase, PurchaseItem } from "@/types";
import { prisma } from "../prisma";
import { getSessionUser } from "../actions/session.action";
import { completeProduct } from "./products";

export type PurchaseWithItems = Purchase & {
  items: (PurchaseItem & { product: Product })[];
};

export async function getPurchases(): Promise<PurchaseWithItems[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.purchases.findMany({
    where: { user_id: user.id },
    include: {
      purchase_items: {
        include: {
          products: {
            include: { product_categories: true },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return rows.map(({ purchase_items, ...purchase }) => ({
    ...purchase,
    items: purchase_items.map((item) => ({
      ...item,
      product: completeProduct(item.products as never),
    })),
  }));
}