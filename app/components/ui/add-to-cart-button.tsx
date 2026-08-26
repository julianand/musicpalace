"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/providers/user.provider";
import { addToCart } from "@/lib/actions/cart";
import { toastService } from "@/lib/ui/services/toast.service";

type AddToCartButtonProps = {
  productId: bigint;
  label: string;
  className?: string;
  style?: React.CSSProperties;
};

export function AddToCartButton({
  productId,
  label,
  className,
  style,
}: AddToCartButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toastService.showToast("Sign in to add items to your cart", "info");
      return;
    }

    setPending(true);

    const result = await addToCart(productId);

    if (!result.success) {
      setPending(false);
      if (result.error === "unauthorized") {
        toastService.showToast("Sign in to add items to your cart", "info");
      } else {
        toastService.showToast("Could not add to cart", "error");
      }
      return;
    }

    toastService.showToast("Added to cart", "info");
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={className}
      style={style}
    >
      {label}
    </button>
  );
}