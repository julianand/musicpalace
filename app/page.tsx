import { Suspense } from "react";
import { CategoryFilters } from "./components/category-filters";
import { HeroDescription } from "./components/hero-description";
import { ProductsGrid } from "./components/ui/products-grid";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <HeroDescription />
      <CategoryFilters />
      <Suspense>
        <ProductsGrid />
      </Suspense>
    </div>
  );
}
