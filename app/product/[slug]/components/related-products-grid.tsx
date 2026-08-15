import { getProducts } from "@/lib/data/products";
import { Product } from "@/types";
import Link from "next/link";
import { HorizontalScroll } from "./ui/horizontal-scroll";

function RelatedCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="rounded-xl overflow-hidden flex flex-col group shrink-0 w-56 transition-transform duration-200 hover:-translate-y-1"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="h-32 flex items-center justify-center relative" style={{ background: product.category.background_color }}>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform duration-500"
          style={{ background: `${product.category.accent_color}15`, border: `1px solid ${product.category.accent_color}30` }}
        >
          <span
            className="text-sm font-black uppercase"
            style={{ color: product.category.accent_color, fontFamily: "var(--font-playfair)", opacity: 0.85 }}
          >
            {product.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("")}
          </span>
        </div>
        <span
          className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide"
          style={{ background: product.category.background_color, color: product.category.accent_color, fontFamily: "var(--font-dm-sans)" }}
        >
          {product.category.name}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-1.5">
        <h3
          className="text-sm font-bold leading-snug group-hover:text-(--amber) transition-colors duration-200 line-clamp-2"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
        >
          {product.name}
        </h3>
        <p className="text-base font-bold" style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}>
          {product.formattedPrice}
        </p>
      </div>
    </Link>
  );
}

export async function RelatedProductsGrid({ product }: { product: Product }) {
  const relatedProducts = await getProducts({ category_id: product.category_id });
  if (!relatedProducts.length) return;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full" style={{ background: "var(--amber)" }} />
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
        >
          More in {product.category.name}
        </h2>
      </div>
      <HorizontalScroll>
        {relatedProducts.map((p) => (
          <RelatedCard key={p.id} product={p} />
        ))}
      </HorizontalScroll>
    </section>
  )
}