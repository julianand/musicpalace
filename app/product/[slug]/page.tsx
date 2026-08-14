import { notFound } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types";
import { getProduct, getProducts } from "@/lib/data/products";
import RelatedScroll from "@/app/components/related-scroll";
import { getReviews, ReviewWithUser } from "@/lib/data/reviews";

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

function RelatedCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="rounded-xl overflow-hidden flex flex-col group shrink-0 w-56 transition-transform duration-200 hover:-translate-y-1"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="h-32 flex items-center justify-center relative" style={{ background: product.category.background_color }}>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform duration-500"
          style={{ background: `${product.category.accent_color}15`, border: `1px solid ${product.category.accent_color}30` }}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill={product.category.accent_color} opacity="0.8">
            <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
          </svg>
        </div>
        <span
          className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide"
          style={{ background: product.category.background_color, color: product.category.accent_color, fontFamily: "var(--font-dm-sans)" }}
        >
          {product.category.name}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-1.5">
        <h3
          className="text-sm font-bold leading-snug group-hover:text-(--amber) transition-colors duration-200 line-clamp-2"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
        >
          {product.name}
        </h3>
        <p className="text-base font-bold" style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}>
          {product.formattedPrice}
        </p>
      </div>
    </Link>
  );
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct({ slug });

  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getProducts({ category_id: product.category_id }),
    getReviews({ product_id: product.id }),
  ]);

  // Simulated rating breakdown based on overall rating
  const ratingBreakdown = [
    { label: "Sound Quality", value: product.overall_sound_quality },
    { label: "Build Quality", value: product.overall_build_quality },
    { label: "Value", value: product.overall_value },
    { label: "Ease of Use", value: product.overall_ease_of_use },
  ];

  return (
    <main
      className="min-h-screen animate-fade-in-up"
      style={{ background: "var(--background)" }}
    >
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

        {/* Hero — 2 columns */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* Left: Visual panel */}
          <div
            className="relative rounded-3xl overflow-hidden flex items-center justify-center"
            style={{ background: product.category.background_color, minHeight: "380px" }}
          >
            {/* Subtle radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${product.category.accent_color}18 0%, transparent 70%)`,
              }}
            />

            {/* Category badge */}
            <span
              className="absolute top-5 left-5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-widest uppercase"
              style={{
                background: product.category.background_color,
                color: product.category.accent_color,
                fontFamily: "var(--font-dm-sans)",
                border: `1px solid ${product.category.accent_color}40`,
              }}
            >
              {product.category.name}
            </span>

            {/* Wishlist */}
            <button
              className="absolute top-5 right-5 p-2.5 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                background: "rgba(12,12,14,0.65)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Main icon */}
            <div
              className="w-36 h-36 rounded-3xl flex items-center justify-center"
              style={{
                background: `${product.category.accent_color}12`,
                border: `1.5px solid ${product.category.accent_color}35`,
                boxShadow: `0 0 60px ${product.category.accent_color}25`,
              }}
            >
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill={product.category.accent_color} opacity="0.85">
                <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
              </svg>
            </div>

            {/* Score pill */}
            <div
              className="absolute bottom-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: "rgba(12,12,14,0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#f0a500">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-dm-sans)" }}
              >
                {product.overall_rating} / 5
              </span>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col justify-center gap-6">
            <div className="flex flex-col gap-3">
              <h1
                className="text-4xl font-bold leading-tight"
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
              className="text-sm leading-relaxed"
              style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
            >
              {product.description}
            </p>

            <div style={{ height: "1px", background: "var(--border)" }} />

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
              <button
                className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background: product.category.accent_color,
                  color: "#0c0c0e",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                + Add to Cart
              </button>
              <button
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Wishlist
              </button>
            </div>
          </div>
        </section>

        {/* Review + Rating breakdown — 2 columns */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

          {/* User reviews list */}
          <div
            className="lg:col-span-2 rounded-2xl p-8 flex flex-col gap-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-6 rounded-full"
                style={{ background: product.category.accent_color }}
              />
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
              >
                Reviews
              </h2>
              <span
                className="text-sm px-2 py-0.5 rounded-full"
                style={{ background: "var(--surface-2)", color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
              >
                {reviews.length}
              </span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}>
                No reviews yet.
              </p>
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
                {reviews.map((review: ReviewWithUser) => (
                  <div key={String(review.id)} className="py-5 flex flex-col gap-3 first:pt-0 last:pb-0">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase"
                          style={{ background: `${product.category.accent_color}20`, color: product.category.accent_color, fontFamily: "var(--font-dm-sans)" }}
                        >
                          {review.users.firstname[0]}{review.users.lastname[0]}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "var(--foreground)", fontFamily: "var(--font-dm-sans)" }}>
                          {review.users.firstname} {review.users.lastname}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-lg font-black"
                          style={{ color: product.category.accent_color, fontFamily: "var(--font-playfair)" }}
                        >
                          {Number(review.overall).toFixed(1)}
                        </span>
                        <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}>/5</span>
                      </div>
                    </div>

                    {/* Sub-ratings */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {[
                        { label: "Sound", value: review.sound_quality },
                        { label: "Build", value: review.build_quality },
                        { label: "Value", value: review.value },
                        { label: "Ease of use", value: review.ease_of_use },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}>{item.label}</span>
                          <span className="text-xs font-semibold" style={{ color: "var(--foreground)", fontFamily: "var(--font-dm-sans)" }}>{item.value}/5</span>
                        </div>
                      ))}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}>
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}

                    {/* Date */}
                    <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}>
                      {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rating breakdown */}
          <div
            className="rounded-2xl p-8 flex flex-col gap-6"
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
        {related.length > 0 && (
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full" style={{ background: "var(--amber)" }} />
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
              >
                More in {product.category.name}
              </h2>
            </div>
            <RelatedScroll>
              {related.map((p) => (
                <RelatedCard key={p.id} product={p} />
              ))}
            </RelatedScroll>
          </section>
        )}

      </div>
    </main>
  );
}
