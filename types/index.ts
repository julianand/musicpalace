import type { products, product_categories, reviews, users, favorites, purchases, purchase_items } from "@/app/generated/prisma/client"

// export type Product = products;
export type ProductCategory = product_categories;
// export type Review = reviews;
export type User = users;
export type Favorite = favorites;
export type Purchase = purchases;
export type PurchaseItem = purchase_items;

export type Product = products & {
  category: ProductCategory;
  formattedPrice: string;
  favorite?: boolean;
}

export type Review = reviews & {
  user: User;
}