"use client";

import { useState } from "react";
import { useUser } from "@/lib/providers/user.provider";
import { toggleFavorite } from "@/lib/actions/favorites";
import { toastService } from "@/lib/ui/services/toast.service";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      viewBox="0 0 24 24"
      fill={filled ? "var(--amber)" : "none"}
      stroke={filled ? "var(--amber)" : "currentColor"}
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

type FavoriteButtonProps = {
  productId: bigint;
  favorite: boolean;
  showLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function FavoriteButton({
  productId,
  favorite,
  showLabel = false,
  className,
  style,
}: FavoriteButtonProps) {
  const { user } = useUser();
  const [isFavorite, setIsFavorite] = useState(favorite);
  const [prevFavorite, setPrevFavorite] = useState(favorite);
  const [pending, setPending] = useState(false);

  if (prevFavorite !== favorite) {
    setPrevFavorite(favorite);
    setIsFavorite(favorite);
  }

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toastService.showToast("Sign in to save favorites", "info");
      return;
    }

    const next = !isFavorite;
    setIsFavorite(next);
    setPending(true);

    const result = await toggleFavorite(productId);

    if (!result.success) {
      setIsFavorite(favorite);
      setPending(false);
      if (result.error === "unauthorized") {
        toastService.showToast("Sign in to save favorites", "info");
      } else {
        toastService.showToast("Could not update favorite", "error");
      }
      return;
    }

    setIsFavorite(result.favorite ?? false);
    setPending(false);
  }

  const label = showLabel
    ? isFavorite
      ? "Remove from wishlist"
      : "Add to wishlist"
    : undefined;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isFavorite}
      aria-label={showLabel ? undefined : isFavorite ? "Remove from wishlist" : "Add to wishlist"}
      disabled={pending}
      className={className}
      style={style}
    >
      <HeartIcon filled={isFavorite} />
      {label && (
        <span
          className="text-sm font-medium"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {label}
        </span>
      )}
    </button>
  );
}