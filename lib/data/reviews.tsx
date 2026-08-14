import { Review } from "@/types";
import { prisma } from "../prisma";

export type ReviewWithUser = Review & {
  users: {
    firstname: string;
    lastname: string;
  };
};

export async function getReviews(params?: Partial<Review>): Promise<ReviewWithUser[]> {
  return prisma.reviews.findMany({
    ...(params && { where: params }),
    include: { users: { select: { firstname: true, lastname: true } } },
    orderBy: { created_at: "desc" },
  });
}