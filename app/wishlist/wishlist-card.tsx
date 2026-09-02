"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FavoriteButton } from "@/app/components/ui/favorite-button";
import { StarRating } from "@/app/components/ui/star-rating";
import type { Product } from "@/types";

export function WishlistCard({ product }: { product: Product }) {
  const router = useRouter();

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col gap-4 p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/product/${product.slug}`}
          className="flex items-center gap-3 min-w-0 flex-1"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: product.category.background_color }}
          >
            <span
              className="text-sm font-black uppercase"
              style={{
                color: product.category.accent_color,
                fontFamily: "var(--font-playfair)",
                opacity: 0.85,
              }}
            >
              {product.name
                .split(" ")
                .slice(0, 2)
                .map((w: string) => w[0])
                .join("")}
            </span>
          </div>
          <h2
            className="text-base font-bold leading-snug line-clamp-2 transition-colors group-hover:text-(--amber)"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--foreground)",
            }}
          >
            {product.name}
          </h2>
        </Link>

        <FavoriteButton
          productId={product.id}
          favorite={product.favorite ?? false}
          className="p-2 rounded-lg inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
          onToggle={() => router.refresh()}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span
            className="text-xs"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            {product.category.name}
          </span>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
          >
            {product.formattedPrice}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <StarRating rating={product.overall_rating!} size="sm" />
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            {product.overall_rating}
          </span>
        </div>
      </div>
    </div>
  );
}