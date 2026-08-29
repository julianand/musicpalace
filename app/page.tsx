import { getCategories } from "@/lib/data/categories";
import { CategoryFilters } from "./components/ui/category-filters";
import { HeroDescription } from "./components/hero-description";
import { ProductsSection } from "./components/products-section";
import { Suspense } from "react";

function CategoryFiltersSkeleton() {
  return (
    <div className="px-6 flex gap-2 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-9 w-24 rounded-xl"
          style={{ background: "var(--surface-2)" }}
        />
      ))}
    </div>
  );
}

function ProductsSectionSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
      <div
        className="h-4 w-40 mb-8 rounded-full animate-pulse"
        style={{ background: "var(--surface-2)" }}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="h-52 animate-pulse" style={{ background: "var(--surface-2)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Home(props: PageProps<"/">) {
  const categories = await getCategories();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <HeroDescription />
      <Suspense fallback={<CategoryFiltersSkeleton />}>
        <CategoryFilters categories={categories} />
      </Suspense>
      <Suspense fallback={<ProductsSectionSkeleton />}>
        <ProductsSection pageProps={props} />
      </Suspense>
    </div>
  );
}
