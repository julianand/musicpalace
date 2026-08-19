"use client";

import { PRODUCTS_MAIN_RECORD_PAGINATION } from "@/lib/products/filters";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { startTransition, useOptimistic } from "react";

const pagination = PRODUCTS_MAIN_RECORD_PAGINATION;

export function ResultCount({ productCount }: { productCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPage = Number(searchParams.get("page") ?? "1");
  const [activePage, setActivePage] = useOptimistic(urlPage);

  const totalPages = Math.ceil(productCount / pagination);
  const restOfProducts = productCount - (activePage - 1) * pagination;
  const productsInViewport = Math.min(restOfProducts, pagination);

  // Build fixed 7-slot layout: [1] [...] [p-1] [p] [p+1] [...] [last]
  type Slot = number | "dots-left" | "dots-right";
  function buildSlots(): Slot[] {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const showLeftDots = activePage > 3;
    const showRightDots = activePage < totalPages - 2;

    if (!showLeftDots) {
      // near start: [1] [2] [3] [4] [5] [...] [last]
      return [1, 2, 3, 4, 5, "dots-right", totalPages];
    }
    if (!showRightDots) {
      // near end: [1] [...] [last-4] [last-3] [last-2] [last-1] [last]
      return [
        1,
        "dots-left",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    // middle: [1] [...] [p-1] [p] [p+1] [...] [last]
    return [
      1,
      "dots-left",
      activePage - 1,
      activePage,
      activePage + 1,
      "dots-right",
      totalPages,
    ];
  }

  const slots = buildSlots();

  function goToPage(page: number) {
    startTransition(() => {
      setActivePage(page);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`/?${params}`, { scroll: false });
    });
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <p
        className="text-sm"
        style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
      >
        Showing{" "}
        <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
          {productsInViewport}
        </span>{" "}
        products
      </p>

      {/* Pagination */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          className="p-2 rounded-lg transition-colors cursor-pointer"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}
          onClick={() => goToPage(Math.max(activePage - 1, 1))}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Pages */}
        {slots.map((slot, i) =>
          slot === "dots-left" || slot === "dots-right" ? (
            <span
              key={slot}
              className="w-8 h-8 flex items-center justify-center text-xs"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              ...
            </span>
          ) : (
            <button
              key={i}
              className="w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              style={{
                background:
                  slot === activePage ? "var(--amber)" : "var(--surface)",
                color: slot === activePage ? "#0c0c0e" : "var(--muted)",
                border:
                  slot === activePage ? "none" : "1px solid var(--border)",
                fontFamily: "var(--font-dm-sans)",
              }}
              onClick={() => goToPage(slot)}
            >
              {slot}
            </button>
          ),
        )}

        {/* Next */}
        <button
          className="p-2 rounded-lg transition-colors cursor-pointer"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}
          onClick={() => goToPage(Math.min(activePage + 1, totalPages))}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
