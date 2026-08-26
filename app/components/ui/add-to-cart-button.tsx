"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/providers/user.provider";
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
  const deltaRef = useRef(0);
  const inFlightRef = useRef(false);

  function sendPending() {
    if (inFlightRef.current || deltaRef.current === 0) return;

    const toSend = deltaRef.current;
    deltaRef.current = 0;
    inFlightRef.current = true;

    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: productId.toString(),
        quantity: toSend,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        inFlightRef.current = false;
        if (!res.ok) {
          toastService.showToast(
            data.error === "unauthorized"
              ? "Sign in to add items to your cart"
              : "Could not add to cart",
            data.error === "unauthorized" ? "info" : "error",
          );
          router.refresh();
          return;
        }
        toastService.showToast("Added to cart", "info");
        if (deltaRef.current !== 0) {
          sendPending();
        } else {
          router.refresh();
        }
      })
      .catch(() => {
        inFlightRef.current = false;
        router.refresh();
      });
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toastService.showToast("Sign in to add items to your cart", "info");
      return;
    }

    deltaRef.current += 1;
    sendPending();
  }

  return (
    <button type="button" onClick={handleClick} className={className} style={style}>
      {label}
    </button>
  );
}