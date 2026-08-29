import type { CartProduct } from "@/lib/data/cart";

export type SerializedCartProduct = Omit<
  CartProduct,
  "id" | "category_id" | "review_count" | "category"
> & {
  id: string;
  category_id: string;
  review_count: string | null;
  category: Omit<CartProduct["category"], "id"> & { id: string };
};

export function serialize(p: CartProduct): SerializedCartProduct {
  return {
    ...p,
    id: p.id.toString(),
    category_id: p.category_id.toString(),
    review_count: p.review_count === null ? null : p.review_count.toString(),
    category: { ...p.category, id: p.category.id.toString() },
  };
}

export function deserialize(raw: SerializedCartProduct): CartProduct {
  return {
    ...raw,
    id: BigInt(raw.id),
    category_id: BigInt(raw.category_id),
    review_count: raw.review_count === null ? null : BigInt(raw.review_count),
    category: { ...raw.category, id: BigInt(raw.category.id) },
  };
}