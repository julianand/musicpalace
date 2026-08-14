import type { products, product_categories, reviews, users } from "@/app/generated/prisma/client"

// export type Product = products;
export type ProductCategory = product_categories;
export type Review = reviews;
export type User = users;

export type Product = products & {
  category: ProductCategory;
  formattedPrice: string;
}