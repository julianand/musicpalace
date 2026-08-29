import { Review } from "@/types";
import { prisma } from "../prisma";
import { cacheLife } from "next/cache";

export async function getReviews(params?: Partial<Review>): Promise<Review[]> {
  "use cache";
  cacheLife("hours");

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