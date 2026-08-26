"use server";

import { prisma } from "../prisma";
import { getSessionUser } from "./session";

export type ToggleFavoriteResult = {
  success: boolean;
  favorite?: boolean;
  error?: "unauthorized" | "not_found";
};

export async function toggleFavorite(
  productId: bigint,
): Promise<ToggleFavoriteResult> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "unauthorized" };

  const product = await prisma.products.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) return { success: false, error: "not_found" };

  const existing = await prisma.favorites.findFirst({
    where: { user_id: user.id, product_id: productId },
    select: { id: true },
  });

  if (existing) {
    await prisma.favorites.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorites.create({
      data: { user_id: user.id, product_id: productId },
    });
  }

  return { success: true, favorite: !existing };
}