"use server";

import { prisma } from "../prisma";
import { getSessionUser } from "./session.action";

export type CreatePurchaseResult = {
  success: boolean;
  error?: "unauthorized" | "empty_cart";
};

export async function createPurchase(): Promise<CreatePurchaseResult> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "unauthorized" };

  const cart = await prisma.carts.findMany({
    where: { user_id: user.id },
    include: { products: { select: { price: true } } },
  });
  if (cart.length === 0) return { success: false, error: "empty_cart" };

  const total = cart.reduce((sum, row) => sum + row.quantity * row.products.price, 0);

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchases.create({
      data: { user_id: user.id, total },
    });

    await tx.purchase_items.createMany({
      data: cart.map((row) => ({
        purchase_id: purchase.id,
        product_id: row.product_id,
        quantity: row.quantity,
        unit_price: row.products.price,
      })),
    });

    await tx.carts.deleteMany({ where: { user_id: user.id } });
  });

  return { success: true };
}