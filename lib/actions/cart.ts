"use server";

import { prisma } from "../prisma";
import { getSessionUser } from "./session";

export type AddToCartResult = {
  success: boolean;
  error?: "unauthorized" | "not_found";
};

export async function addToCart(
  productId: bigint,
): Promise<AddToCartResult> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "unauthorized" };

  const product = await prisma.products.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) return { success: false, error: "not_found" };

  const existing = await prisma.carts.findFirst({
    where: { user_id: user.id, product_id: productId },
    select: { id: true, quantity: true },
  });

  if (existing) {
    await prisma.carts.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + 1 },
    });
  } else {
    await prisma.carts.create({
      data: { user_id: user.id, product_id: productId, quantity: 1 },
    });
  }

  return { success: true };
}