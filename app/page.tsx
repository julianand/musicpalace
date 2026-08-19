import { getCategories } from "@/lib/data/categories";
import { CategoryFilters } from "./components/ui/category-filters";
import { HeroDescription } from "./components/hero-description";
import { ProductsSection } from "./components/products-section";
import { Suspense } from "react";

export default async function Home(props: PageProps<"/">) {
  const categories = await getCategories();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <HeroDescription />
      <Suspense>
        <CategoryFilters categories={categories} />
      </Suspense>
      <Suspense>
        <ProductsSection pageProps={props} />
      </Suspense>
    </div>
  );
}
