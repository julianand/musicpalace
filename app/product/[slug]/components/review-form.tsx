"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertReview } from "@/lib/actions/reviews.action";
import { toastService } from "@/lib/ui/services/toast.service";
import { CartButton } from "@/app/components/ui/cart-button";
import type { ReviewState } from "@/lib/data/reviews";

type Ratings = {
  sound_quality: number;
  build_quality: number;
  value: number;
  ease_of_use: number;
};

const RATING_FIELDS: { key: keyof Ratings; label: string }[] = [
  { key: "sound_quality", label: "Sound" },
  { key: "build_quality", label: "Build" },
  { key: "value", label: "Value" },
  { key: "ease_of_use", label: "Ease of use" },
];

function StarInput({
  label,
  value,
  onChange,
  accentColor,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  accentColor: string;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-xs"
        style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${label}: ${star} of 5 stars`}
            disabled={disabled}
            onClick={() => onChange(star)}
            className="p-0.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 transition-transform duration-150 hover:scale-110"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill={star <= value ? accentColor : "#2a2a32"}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

type ReviewFormProps = {
  productId: string;
  accentColor: string;
  state: ReviewState | null;
};

export function ReviewForm({ productId, accentColor, state }: ReviewFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const inFlightRef = useRef(false);

  const existing = state?.review ?? null;
  const [ratings, setRatings] = useState<Ratings>({
    sound_quality: existing?.sound_quality ?? 0,
    build_quality: existing?.build_quality ?? 0,
    value: existing?.value ?? 0,
    ease_of_use: existing?.ease_of_use ?? 0,
  });
  const [comment, setComment] = useState(existing?.comment ?? "");

  const isLoggedIn = state !== null;
  const purchased = state?.purchased ?? false;
  const canReview = isLoggedIn && purchased;
  const disabled = !canReview || pending;
  const hasAllRatings = RATING_FIELDS.every((f) => ratings[f.key] >= 1);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    startTransition(async () => {
      try {
        const result = await upsertReview({
          productId: BigInt(productId),
          soundQuality: ratings.sound_quality,
          buildQuality: ratings.build_quality,
          value: ratings.value,
          easeOfUse: ratings.ease_of_use,
          comment: comment || undefined,
        });

        if (!result.success) {
          if (result.error === "unauthorized") {
            toastService.showToast("Sign in to leave a review", "info");
          } else if (result.error === "not_purchased") {
            toastService.showToast(
              "You must purchase this product to review it",
              "error",
            );
          } else if (result.error === "not_found") {
            toastService.showToast("Product not found", "error");
          } else {
            toastService.showToast("Could not save your review", "error");
          }
          return;
        }

        toastService.showToast(
          existing ? "Review updated" : "Review posted",
          "info",
        );
        router.refresh();
      } finally {
        inFlightRef.current = false;
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-6 rounded-full"
          style={{ background: accentColor }}
        />
        <h3
          className="text-lg font-bold"
          style={{
            fontFamily: "var(--font-playfair)",
            color: "var(--foreground)",
          }}
        >
          {existing ? "Your review" : "Leave a review"}
        </h3>
      </div>

      {!canReview && (
        <p
          className="text-sm"
          style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
        >
          {!isLoggedIn
            ? "Sign in to leave a review for this product."
            : "You must purchase this product to leave a review."}
        </p>
      )}

      {isLoggedIn && !purchased && (
        <CartButton
          productId={BigInt(productId)}
          label="+ Add to Cart"
          showSuccessToast
          className="self-start px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{
            background: accentColor,
            color: "#0c0c0e",
            fontFamily: "var(--font-dm-sans)",
          }}
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {RATING_FIELDS.map((field) => (
            <StarInput
              key={field.key}
              label={field.label}
              accentColor={accentColor}
              value={ratings[field.key]}
              disabled={disabled}
              onChange={(value) =>
                setRatings((prev) => ({ ...prev, [field.key]: value }))
              }
            />
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          rows={3}
          maxLength={500}
          disabled={disabled}
          aria-label="Your review comment"
          className="w-full rounded-xl px-4 py-3 text-sm resize-none disabled:cursor-not-allowed"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            fontFamily: "var(--font-dm-sans)",
            outline: "none",
          }}
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={disabled || !hasAllRatings}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: accentColor,
              color: "#0c0c0e",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {pending
              ? "Saving..."
              : existing
                ? "Update review"
                : "Post review"}
          </button>
          {existing && (
            <span
              className="text-xs"
              style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
            >
              You can update your review at any time.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}