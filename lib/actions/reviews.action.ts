"use server";

import { updateTag } from "next/cache";
import { prisma } from "../prisma";
import { getSessionUser } from "./session.action";

export type UpsertReviewResult = {
  success: boolean;
  error?: "unauthorized" | "not_found" | "not_purchased" | "invalid_input";
};

export type UpsertReviewInput = {
  productId: bigint;
  soundQuality: number;
  buildQuality: number;
  value: number;
  easeOfUse: number;
  comment?: string;
};

const COMMENT_MAX_LENGTH = 500;

function isValidRating(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export async function upsertReview(
  input: UpsertReviewInput,
): Promise<UpsertReviewResult> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "unauthorized" };

  const { productId, soundQuality, buildQuality, value, easeOfUse, comment } =
    input;

  if (
    !isValidRating(soundQuality) ||
    !isValidRating(buildQuality) ||
    !isValidRating(value) ||
    !isValidRating(easeOfUse)
  ) {
    return { success: false, error: "invalid_input" };
  }

  const trimmedComment = comment?.trim() || null;
  if (trimmedComment && trimmedComment.length > COMMENT_MAX_LENGTH) {
    return { success: false, error: "invalid_input" };
  }

  // const product = await prisma.products.findUnique({
  //   where: { id: productId },
  //   select: { id: true },
  // });
  // if (!product) return { success: false, error: "not_found" };

  const purchased = await prisma.purchase_items.findFirst({
    where: {
      product_id: productId,
      purchases: { is: { user_id: user.id } },
    },
    select: { id: true },
    take: 1,
  });
  if (!purchased) return { success: false, error: "not_purchased" };

  const data = {
    sound_quality: soundQuality,
    build_quality: buildQuality,
    value,
    ease_of_use: easeOfUse,
    comment: trimmedComment,
  };

  await prisma.$transaction(async (tx) => {
    const existing = await tx.reviews.findFirst({
      where: { user_id: user.id, product_id: productId },
      select: { id: true },
    });

    if (existing) {
      await tx.reviews.update({ where: { id: existing.id }, data });
    } else {
      await tx.reviews.create({
        data: { ...data, user_id: user.id, product_id: productId },
      });
    }
  });

  updateTag("reviews");

  return { success: true };
}