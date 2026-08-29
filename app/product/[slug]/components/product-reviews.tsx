import { getReviews, getReviewState } from "@/lib/data/reviews";
import { Product, Review } from "@/types";
import { Suspense } from "react";
import { ReviewForm } from "./review-form";

function ReviewItemsSkeleton() {
  return (
    <div
      className="flex flex-col divide-y"
      style={{ borderColor: "var(--border)" }}
    >
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-5 flex flex-col gap-3 first:pt-0 last:pb-0 animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full"
                style={{ background: "var(--surface-2)" }}
              />
              <div
                className="h-3.5 w-28 rounded-full"
                style={{ background: "var(--surface-2)" }}
              />
            </div>
            <div
              className="h-5 w-10 rounded-full"
              style={{ background: "var(--surface-2)" }}
            />
          </div>

          {/* Sub-ratings */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div
                  className="h-2.5 w-14 rounded-full"
                  style={{ background: "var(--surface-2)" }}
                />
                <div
                  className="h-2.5 w-6 rounded-full"
                  style={{ background: "var(--surface-2)" }}
                />
              </div>
            ))}
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <div
              className="h-2.5 w-full rounded-full"
              style={{ background: "var(--surface-2)" }}
            />
            <div
              className="h-2.5 w-4/5 rounded-full"
              style={{ background: "var(--surface-2)" }}
            />
          </div>

          {/* Date */}
          <div
            className="h-2 w-20 rounded-full"
            style={{ background: "var(--surface-2)" }}
          />
        </div>
      ))}
    </div>
  );
}

async function ReviewItems({ product }: { product: Product }) {
  const reviews = await getReviews({ product_id: product.id });
  return (
    <div
      className="flex flex-col divide-y"
      style={{ borderColor: "var(--border)" }}
    >
      {reviews.map((review: Review) => (
        <div
          key={String(review.id)}
          className="py-5 flex flex-col gap-3 first:pt-0 last:pb-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase"
                style={{
                  background: `${product.category.accent_color}20`,
                  color: product.category.accent_color,
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {review.user.firstname[0]}
                {review.user.lastname[0]}
              </div>
              <span
                className="text-sm font-semibold"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {review.user.firstname} {review.user.lastname}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-black"
                style={{
                  color: product.category.accent_color,
                  fontFamily: "var(--font-playfair)",
                }}
              >
                {Number(review.overall).toFixed(1)}
              </span>
              <span
                className="text-xs"
                style={{
                  color: "var(--muted)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                /5
              </span>
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
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span
                  className="text-xs"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {item.label}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {item.value}/5
                </span>
              </div>
            ))}
          </div>

          {/* Comment */}
          {review.comment && (
            <p
              className="text-sm leading-relaxed"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              &ldquo;{review.comment}&rdquo;
            </p>
          )}

          {/* Date */}
          <span
            className="text-xs"
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {new Date(review.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

export async function ProductReviews({ product }: { product: Product }) {
  const reviewState = await getReviewState(product.id);

  return (
    <div
      className="lg:col-span-2 rounded-2xl p-8 flex flex-col gap-6"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-6 rounded-full"
          style={{ background: product.category.accent_color }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            fontFamily: "var(--font-playfair)",
            color: "var(--foreground)",
          }}
        >
          Reviews
        </h2>
        <span
          className="text-sm px-2 py-0.5 rounded-full"
          style={{
            background: "var(--surface-2)",
            color: "var(--muted)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {product.review_count}
        </span>
      </div>

      <ReviewForm
        productId={product.id.toString()}
        accentColor={product.category.accent_color}
        state={reviewState}
      />

      <div style={{ height: "1px", background: "var(--border)" }} />

      {!product.review_count ? (
        <p
          className="text-sm"
          style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
        >
          No reviews yet.
        </p>
      ) : (
        <Suspense fallback={<ReviewItemsSkeleton/>}>
          <ReviewItems product={product} />
        </Suspense>
      )}
    </div>
  );
}
