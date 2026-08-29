"use client";

import { useRef } from "react";
import { toastService } from "@/lib/ui/services/toast.service";

type CartMutationOptions = {
  errorMessage?: string;
  unauthorizedMessage?: string;
  successMessage?: string;
  onSettled?: () => void;
  onSynced?: () => void;
};

export function useCartMutation(
  productId: bigint,
  {
    errorMessage = "Could not update cart",
    unauthorizedMessage = "Sign in to manage your cart",
    successMessage,
    onSettled,
    onSynced,
  }: CartMutationOptions = {},
) {
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
        onSettled?.();
        if (!res.ok) {
          toastService.showToast(
            data.error === "unauthorized" ? unauthorizedMessage : errorMessage,
            data.error === "unauthorized" ? "info" : "error",
          );
          onSynced?.();
          return;
        }
        if (successMessage) toastService.showToast(successMessage, "info");
        if (deltaRef.current !== 0) {
          sendPending();
        }
      })
      .catch(() => {
        inFlightRef.current = false;
        onSettled?.();
        onSynced?.();
      });
  }

  function mutate(amount: number) {
    deltaRef.current += amount;
    sendPending();
  }

  return { mutate };
}