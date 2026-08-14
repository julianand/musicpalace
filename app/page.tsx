import { CategoryFilters } from "./components/category-filters";
import { HeroDescription } from "./components/hero-description";
import { ProductsGrid } from "./components/products-grid";

export default async function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <HeroDescription />
      <CategoryFilters />
      <ProductsGrid />
    </div>
  );
}
