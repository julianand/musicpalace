"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { startTransition, useOptimistic } from "react";

export function ResultCount({
  productCount,
  recordPagination,
}: {
  productCount: number;
  recordPagination: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPage = Number(searchParams.get("page") ?? "1");
  const [activePage, setActivePage] = useOptimistic(urlPage);

  const totalPages = Math.ceil(productCount / recordPagination);
  const restOfProducts = productCount - (activePage - 1) * recordPagination;
  const productsInViewport = Math.min(restOfProducts, recordPagination);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .map((v) => {
      if ([1, totalPages].includes(v)) return v;
      if (v >= activePage - 1 && v <= activePage + 1) return v;
      return undefined;
    })
    .filter((v, i, arr) => !!(arr[i] || arr[i - 1]));

  function goToPage(page: number) {
    startTransition(() => {
      setActivePage(page);
      router.push(`/?page=${page}`, { scroll: false });
    })
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
          style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
          onClick={() => goToPage(Math.max(activePage - 1, 1))}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Pages */}
        {pageNumbers.map((page, i) =>
          page ? (
            <button
              key={i}
              className="w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              style={{
                background: page === activePage ? "var(--amber)" : "var(--surface)",
                color: page === activePage ? "#0c0c0e" : "var(--muted)",
                border: page === activePage ? "none" : "1px solid var(--border)",
                fontFamily: "var(--font-dm-sans)",
              }}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ) : (
            <span
              key={i}
              className="text-xs px-1"
              style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
            >
              ...
            </span>
          )
        )}

        {/* Next */}
        <button
          className="p-2 rounded-lg transition-colors cursor-pointer"
          style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
          onClick={() => goToPage(Math.min(activePage + 1, totalPages))}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
