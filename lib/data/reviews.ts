import { Review } from "@/types";
import { prisma } from "../prisma";
import { getSessionUser } from "../actions/session.action";
import { cacheLife, cacheTag } from "next/cache";

export async function getReviews(params?: Partial<Review>): Promise<Review[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("reviews");

  const res = await prisma.reviews.findMany({
    ...(params && { where: params }),
    include: { users: true },
    orderBy: { created_at: "desc" },
  });

  return res.map(r => ({
    ...r,
    users: undefined,
    user: r.users,
  }))
}

export type SerializedReview = {
  id: string;
  sound_quality: number;
  build_quality: number;
  value: number;
  ease_of_use: number;
  comment: string | null;
};

export type ReviewState = {
  purchased: boolean;
  review: SerializedReview | null;
};

export async function getReviewState(
  productId: bigint,
): Promise<ReviewState | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const [purchased, review] = await Promise.all([
    prisma.purchase_items.findFirst({
      where: {
        product_id: productId,
        purchases: { is: { user_id: user.id } },
      },
      select: { id: true },
      take: 1,
    }),
    prisma.reviews.findFirst({
      where: { user_id: user.id, product_id: productId },
    }),
  ]);

  return {
    purchased: purchased !== null,
    review: review
      ? {
          id: review.id.toString(),
          sound_quality: review.sound_quality,
          build_quality: review.build_quality,
          value: review.value,
          ease_of_use: review.ease_of_use,
          comment: review.comment,
        }
      : null,
  };
}