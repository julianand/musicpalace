"use client";

import { Product } from "@/types";
import { useRouter } from "next/navigation";

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const partial = rating % 1;
  const empty = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <svg
          key={`f-${i}`}
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="#f0a500"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {partial > 0 && (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`partial-${rating}`}>
              <stop offset={`${partial * 100}%`} stopColor="#f0a500" />
              <stop offset={`${partial * 100}%`} stopColor="#2a2a32" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={`url(#partial-${rating})`}
          />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg
          key={`e-${i}`}
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="#2a2a32"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const router = useRouter();
  return (
    <article
      className={`animate-fade-in-up card-delay-${index + 1} rounded-2xl overflow-hidden flex flex-col group cursor-pointer`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
      onClick={() => router.push(`product/${product.slug}`)}
    >
      {/* Product Image Area */}
      <div
        className="relative h-52 flex items-center justify-center overflow-hidden"
        style={{ background: product.category.background_color }}
      >
        {/* Category badge */}
        <span
          className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase"
          style={{
            background: product.category.background_color,
            color: product.category.accent_color,
            fontFamily: "var(--font-dm-sans)",
            border: `1px solid ${product.category.accent_color}30`,
          }}
        >
          {product.category.name}
        </span>

        {/* Wishlist button */}
        <button
          className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 cursor-pointer"
          style={{
            background: "rgba(12,12,14,0.6)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Product icon / placeholder visual */}
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform duration-500"
          style={{
            background: `${product.category.accent_color}15`,
            border: `1px solid ${product.category.accent_color}30`,
          }}
        >
          <svg
            className="w-10 h-10"
            viewBox="0 0 24 24"
            fill={product.category.accent_color}
            opacity="0.7"
          >
            <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
          </svg>
        </div>

        {/* Score badge */}
        <div
          className="absolute bottom-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-lg"
          style={{
            background: "rgba(12,12,14,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#f0a500">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span
            className="text-xs font-bold"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {product.overall_rating}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Name */}
        <h2
          className="text-base font-bold leading-snug group-hover:text-(--amber) transition-colors duration-200"
          style={{
            fontFamily: "var(--font-playfair)",
            color: "var(--foreground)",
          }}
        >
          {product.name}
        </h2>

        {/* Rating row */}
        <div className="flex items-center gap-2">
          <StarRating rating={product.overall_rating!} />
          <span
            className="text-xs"
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            ({product.review_count!.toLocaleString("en-US")} reviews)
          </span>
        </div>

        {/* Excerpt */}
        <p
          className="text-sm leading-relaxed line-clamp-3 flex-1"
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {product.description}
        </p>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border)" }} />

        {/* Price + Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-xs"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Price
            </p>
            <p
              className="text-xl font-bold"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--foreground)",
              }}
            >
              {product.formattedPrice}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Read review
            </button>
            <button
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
              style={{
                background: "var(--amber)",
                color: "#0c0c0e",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              + Cart
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
