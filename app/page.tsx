import { CategoryFilters } from "./components/category-filters";
import { HeroDescription } from "./components/hero-description";
import { ProductsSection } from "./components/products-section";

export default async function Home(props: PageProps<"/">) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <HeroDescription />
      <CategoryFilters />
      <ProductsSection pageProps={props} />
    </div>
  );
}
