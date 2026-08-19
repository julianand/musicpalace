"use client";

import { productSortOptions } from "@/lib/products/filters";
import { ProductCategory } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useOptimistic } from "react";

const allOption = { name: "All", id: "all", slug: "all" };

export function CategoryFilters({
  categories,
}: {
  categories: ProductCategory[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCategory = searchParams.get("category") ?? "all";
  const urlSort = searchParams.get("sort") ?? "rating";
  const [activeCategory, setActiveCategory] = useOptimistic(urlCategory);
  const [activeSort, setActiveSort] = useOptimistic(urlSort);

  const allCategories = [allOption].concat(
    categories.map((c) => ({
      name: c.name,
      id: c.id + "",
      slug: c.slug,
    })),
  );

  function handleChange(action: 'sort' | 'category', value: string) {
    startTransition(() => {
      const dispatchFn = action === 'category' ? setActiveCategory : setActiveSort;
      dispatchFn(value);
  
      const params = new URLSearchParams(searchParams.toString());
      params.set(action, value);
      params.delete("page");
      router.push(`/?${params}`, { scroll: false });
    })
  }

  return (
    <section
      className="sticky top-16 z-40"
      style={{
        background: "rgba(12, 12, 14, 0.9)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {allCategories.map((cat) => (
          <button
            onClick={() => handleChange('category', cat.slug)}
            key={cat.id}
            className="shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap"
            style={
              cat.slug === activeCategory
                ? {
                    background: "var(--amber)",
                    color: "#0c0c0e",
                    fontFamily: "var(--font-dm-sans)",
                  }
                : {
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-dm-sans)",
                  }
            }
          >
            {cat.name}
          </button>
        ))}

        <div className="ml-auto shrink-0 flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            Sort by:
          </span>
          <select
            value={activeSort}
            className="text-xs py-1.5 px-3 rounded-lg outline-none cursor-pointer"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              fontFamily: "var(--font-dm-sans)",
            }}
            onChange={(e) => handleChange('sort', e.target.value)}
          >
            {productSortOptions.map((o, i) => (
              <option key={i} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
