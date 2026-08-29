"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { useCart } from "@/lib/providers/cart.provider";
import { useUser } from "@/lib/providers/user.provider";
import { createPurchase } from "@/lib/actions/purchases.action";
import { toastService } from "@/lib/ui/services/toast.service";

export function CartCheckoutButton() {
  const { user } = useUser();
  const { products, reload } = useCart();
  const [purchasing, startPurchaseTransition] = useTransition();
  const inFlightRef = useRef(false);
  const router = useRouter();

  if (!user || products.length === 0) return null;

  function handlePurchase() {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    startPurchaseTransition(async () => {
      try {
        const result = await createPurchase();

        if (!result.success) {
          if (result.error === "unauthorized") {
            toastService.showToast("Sign in to purchase", "info");
          } else {
            toastService.showToast("Could not complete purchase", "error");
          }
          return;
        }

        reload();
        router.push("/purchases");
      } finally {
        inFlightRef.current = false;
      }
    });
  }

  return (
    <>
      {purchasing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: "rgba(12,12,14,0.7)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <svg
              className="w-10 h-10 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--amber)"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span
              className="text-sm font-medium"
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Processing purchase...
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handlePurchase}
        disabled={purchasing}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #f0a500 0%, #a06e00 100%)",
          color: "#0c0c0e",
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        Purchase
      </button>
    </>
  );
}