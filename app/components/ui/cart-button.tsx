"use client";

import { useUser } from "@/lib/providers/user.provider";
import { useCartActions } from "@/lib/providers/cart.provider";
import { useCartMutation } from "@/lib/ui/hooks/use-cart-mutation";
import { toastService } from "@/lib/ui/services/toast.service";
import { Product } from "@/types";

type CartButtonProps = {
  productId: bigint;
  label: string;
  delta?: number;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  product?: Product;
  showSuccessToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  unauthorizedMessage?: string;
};

export function CartButton({
  productId,
  label,
  delta = 1,
  className,
  style,
  ariaLabel,
  product,
  showSuccessToast = false,
  successMessage = "Added to cart",
  errorMessage = "Could not update cart",
  unauthorizedMessage = "Sign in to manage your cart",
}: CartButtonProps) {
  const { user } = useUser();
  const { dispatch, reload } = useCartActions();
  const { mutate } = useCartMutation(productId, {
    errorMessage,
    unauthorizedMessage,
    ...(showSuccessToast ? { successMessage } : {}),
    onSynced: reload,
  });

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toastService.showToast(unauthorizedMessage, "info");
      return;
    }

    dispatch({ type: "adjustQuantity", productId, delta, product });
    mutate(delta);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      {label}
    </button>
  );
}