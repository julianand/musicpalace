import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct } from "@/lib/data/products";
import { RelatedProductsGrid } from './components/related-products-grid';
import { Suspense } from "react";
import { ProductReviews } from "./components/product-reviews";
import { FavoriteButton } from "@/app/components/ui/favorite-button";
import { CartButton } from "@/app/components/ui/cart-button";

function ProductPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-10">
        <div className="h-3 w-10 rounded-full" style={{ background: "var(--surface-2)" }} />
        <div className="h-3 w-3 rounded-full" style={{ background: "var(--surface-2)" }} />
        <div className="h-3 w-20 rounded-full" style={{ background: "var(--surface-2)" }} />
        <div className="h-3 w-3 rounded-full" style={{ background: "var(--surface-2)" }} />
        <div className="h-3 w-32 rounded-full" style={{ background: "var(--surface-2)" }} />
      </div>
      {/* Hero */}
      <section className="flex flex-col gap-6 mb-16">
        <div className="h-6 w-24 rounded-lg" style={{ background: "var(--surface-2)" }} />
        <div className="flex flex-col gap-3">
          <div className="h-12 w-96 rounded-xl" style={{ background: "var(--surface-2)" }} />
          <div className="h-5 w-48 rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-full max-w-2xl rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="h-3 w-4/5 max-w-2xl rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="h-3 w-3/5 max-w-2xl rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
        <div style={{ height: "1px", background: "var(--border)" }} />
        <div className="flex items-center gap-6">
          <div className="h-12 w-40 rounded-xl" style={{ background: "var(--surface-2)" }} />
          <div className="flex gap-3">
            <div className="h-12 w-36 rounded-2xl" style={{ background: "var(--surface-2)" }} />
            <div className="h-12 w-28 rounded-2xl" style={{ background: "var(--surface-2)" }} />
          </div>
        </div>
      </section>
      {/* Reviews + Rating grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl p-8 h-96" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
        <div className="rounded-2xl p-8 h-64" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
      </section>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const partial = rating % 1;
  const empty = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f-${i}`} className="w-5 h-5" viewBox="0 0 24 24" fill="#f0a500">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {partial > 0 && (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`partial-detail-${rating}`}>
              <stop offset={`${partial * 100}%`} stopColor="#f0a500" />
              <stop offset={`${partial * 100}%`} stopColor="#2a2a32" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={`url(#partial-detail-${rating})`}
          />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e-${i}`} className="w-5 h-5" viewBox="0 0 24 24" fill="#2a2a32">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function RatingBar({ label, value, accentColor }: { label: string; value: number, accentColor: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs w-24 shrink-0"
        style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / 5) * 100}%`, background: accentColor }}
        />
      </div>
      <span
        className="text-xs w-6 text-right shrink-0 font-semibold"
        style={{ color: "var(--foreground)", fontFamily: "var(--font-dm-sans)" }}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}

async function ProductContent({ params }: { params: PageProps<"/product/[slug]">["params"] }) {
  const { slug } = await params;
  const product = await getProduct({ slug });

  if (!product) notFound();

  // Simulated rating breakdown based on overall rating
  const ratingBreakdown = [
    { label: "Sound Quality", value: product.overall_sound_quality },
    { label: "Build Quality", value: product.overall_build_quality },
    { label: "Value", value: product.overall_value },
    { label: "Ease of Use", value: product.overall_ease_of_use },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-10 text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
          <Link href="/" className="transition-colors duration-150" style={{ color: "var(--muted)" }}>
            Home
          </Link>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span style={{ color: "var(--muted)" }}>{product.category.name}</span>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="line-clamp-1" style={{ color: "var(--foreground)" }}>{product.name}</span>
        </nav>

        {/* Hero — 1 column */}
        <section className="flex flex-col gap-6 mb-16">
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-widest uppercase"
              style={{
                background: `${product.category.accent_color}18`,
                color: product.category.accent_color,
                fontFamily: "var(--font-dm-sans)",
                border: `1px solid ${product.category.accent_color}40`,
              }}
            >
              {product.category.name}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h1
              className="text-5xl font-bold leading-tight"
              style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
            >
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              <StarRating rating={product.overall_rating!} />
              <span
                className="text-sm"
                style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
              >
                {product.overall_rating} · {product.review_count!.toLocaleString("en-US")} reviews
              </span>
            </div>
          </div>

          <p
            className="text-sm leading-relaxed max-w-2xl"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            {product.description}
          </p>

          <div style={{ height: "1px", background: "var(--border)" }} />

          <div className="flex items-center gap-6">
            <div className="flex items-end gap-1">
              <span
                className="text-xs mb-1"
                style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
              >
                Price
              </span>
              <span
                className="text-5xl font-bold leading-none ml-2"
                style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
              >
                {product.formattedPrice}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <CartButton
                productId={product.id}
                product={product}
                label="+ Add to Cart"
                showSuccessToast
                errorMessage="Could not add to cart"
                unauthorizedMessage="Sign in to add items to your cart"
                className="px-8 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background: product.category.accent_color,
                  color: "#0c0c0e",
                  fontFamily: "var(--font-dm-sans)",
                }}
              />
              <FavoriteButton
                productId={product.id}
                favorite={product.favorite ?? false}
                showLabel
                className="px-8 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              />
            </div>
          </div>
        </section>

        {/* Review + Rating breakdown — 2 columns */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

          {/* User reviews list */}
          <ProductReviews product={product} />

          {/* Rating breakdown */}
          <div
            className="rounded-2xl p-8 flex flex-col gap-6 self-start"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full" style={{ background: product.category.accent_color }} />
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
              >
                Rating
              </h2>
            </div>

            {/* Big score */}
            <div className="flex items-baseline gap-2">
              <span
                className="text-6xl font-black"
                style={{ fontFamily: "var(--font-playfair)", color: product.category.accent_color }}
              >
                {product.overall_rating}
              </span>
              <span
                className="text-lg"
                style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
              >
                / 5
              </span>
            </div>

            <div style={{ height: "1px", background: "var(--border)" }} />

            <div className="flex flex-col gap-4">
              {ratingBreakdown.map((item) => (
                <RatingBar
                  key={item.label}
                  label={item.label}
                  value={item.value!}
                  accentColor={product.category.accent_color}
                />
              ))}
            </div>

            <p
              className="text-xs"
              style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
            >
              Based on {product.review_count!.toLocaleString("en-US")} reviews
            </p>
          </div>
        </section>

        {/* Related products */}
        <Suspense>
          <RelatedProductsGrid product={product}></RelatedProductsGrid>
        </Suspense>
      </div>
  );
}

export default function ProductPage(props: PageProps<"/product/[slug]">) {
  return (
    <main
      className="min-h-screen animate-fade-in-up"
      style={{ background: "var(--background)" }}
    >
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductContent params={props.params} />
      </Suspense>
    </main>
  );
}