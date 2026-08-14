import { Product } from "@/types";
import { ProductCard } from "./ui/product-card";
import { getProducts } from "@/lib/data/products";

export async function ProductsGrid() {
  const products: Product[] = await getProducts();

  return (
    <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
      {/* Results count */}
      <div className="flex items-center justify-between mb-8">
        <p
          className="text-sm"
          style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
        >
          Showing{" "}
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
            {products.length}
          </span>{" "}
          products
        </p>
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--amber)"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ border: "1px solid transparent" }}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </main>
  );
}
