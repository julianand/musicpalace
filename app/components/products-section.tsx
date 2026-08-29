import { Product } from "@/types";
import { getProductCount, getProducts } from "@/lib/data/products";
import Link from "next/link";
import { Suspense } from "react";
import { ResultCount } from "./ui/result-count";
import { PRODUCTS_MAIN_RECORD_PAGINATION, ProductSort } from "@/lib/products/filters";
import { FavoriteButton } from "./ui/favorite-button";
import { CartButton } from "./ui/cart-button";
import { StarRating } from "./ui/star-rating";

type FilterProps = Pick<NonNullable<Parameters<typeof getProducts>[0]>, "where" | "orderBy">;

function getFilterProps(
  searchParams: Record<string, string | undefined>,
): FilterProps {
  const activeCategory = searchParams.category ?? "all";
  const activeSort = searchParams.sort as ProductSort ?? "rating";

  const where: FilterProps['where'] = {};
  const orderBy: FilterProps['orderBy'] = {};

  if (activeCategory !== 'all') where.product_categories = { slug: activeCategory };

  if (activeSort === 'rating') orderBy.overall_rating = 'desc';
  if (activeSort === 'recent') orderBy.created_at = 'desc';
  if (activeSort === 'price_asc') orderBy.price = 'asc';
  if (activeSort === 'price_desc') orderBy.price = 'desc';

  return {
    ...(Object.keys(where).length && { where }),
    orderBy,
  };
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <Link href={`/product/${product.slug}`}>
      <article
        className={`animate-fade-in-up card-delay-${index + 1} rounded-2xl overflow-hidden flex flex-col group cursor-pointer`}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Product Image Area */}
        <div
          className="relative h-52 flex items-center justify-center overflow-hidden"
          style={{ background: product.category.background_color }}
        >
          {/* Category badge */}
          <span
            className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase"
            style={{
              background: product.category.background_color,
              color: product.category.accent_color,
              fontFamily: "var(--font-dm-sans)",
              border: `1px solid ${product.category.accent_color}30`,
            }}
          >
            {product.category.name}
          </span>

          {/* Wishlist button */}
          <FavoriteButton
            productId={product.id}
            favorite={product.favorite ?? false}
            className="absolute top-4 right-4 p-2 rounded-lg inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50"
            style={{
              background: "rgba(12,12,14,0.6)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--muted)",
            }}
          />

          {/* Product icon / placeholder visual */}
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform duration-500"
            style={{
              background: `${product.category.accent_color}15`,
              border: `1px solid ${product.category.accent_color}30`,
            }}
          >
            <span
              className="text-2xl font-black uppercase"
              style={{
                color: product.category.accent_color,
                fontFamily: "var(--font-playfair)",
                opacity: 0.85,
              }}
            >
              {product.name
                .split(" ")
                .slice(0, 2)
                .map((w: string) => w[0])
                .join("")}
            </span>
          </div>

          {/* Score badge */}
          <div
            className="absolute bottom-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{
              background: "rgba(12,12,14,0.75)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#f0a500">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span
              className="text-xs font-bold"
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {product.overall_rating}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          {/* Name */}
          <h2
            className="text-base font-bold leading-snug group-hover:text-(--amber) transition-colors duration-200"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--foreground)",
            }}
          >
            {product.name}
          </h2>

          {/* Rating row */}
          <div className="flex items-center gap-2">
            <StarRating rating={product.overall_rating!} size="sm" />
            <span
              className="text-xs"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              ({product.review_count!.toLocaleString("en-US")} reviews)
            </span>
          </div>

          {/* Excerpt */}
          <p
            className="text-sm leading-relaxed line-clamp-3 flex-1"
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {product.description}
          </p>

          {/* Divider */}
          <div style={{ height: "1px", background: "var(--border)" }} />

          {/* Price + Actions */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs"
                style={{
                  color: "var(--muted)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Price
              </p>
              <p
                className="text-xl font-bold"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "var(--foreground)",
                }}
              >
                {product.formattedPrice}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Read review
              </button>
              <CartButton
                productId={product.id}
                product={product}
                label="+ Cart"
                showSuccessToast
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background: "var(--amber)",
                  color: "#0c0c0e",
                  fontFamily: "var(--font-dm-sans)",
                }}
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="h-52 animate-pulse" style={{ background: "var(--surface-2)" }} />
          <div className="p-5 flex flex-col gap-3">
            <div className="h-4 w-3/4 rounded-full animate-pulse" style={{ background: "var(--surface-2)" }} />
            <div className="h-3 w-1/2 rounded-full animate-pulse" style={{ background: "var(--surface-2)" }} />
            <div className="h-3 w-full rounded-full animate-pulse" style={{ background: "var(--surface-2)" }} />
            <div className="h-6 w-20 rounded-lg animate-pulse" style={{ background: "var(--surface-2)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

async function Grid({ pageProps }: { pageProps: PageProps<"/"> }) {
  const searchParams = (await pageProps.searchParams) as Record<
    string,
    string | undefined
  >;

  const filter = getFilterProps(searchParams);
  const activePage = Number(searchParams.page || "1");
  const products: Product[] = await getProducts({
    orderBy: { overall_rating: "desc" },
    take: PRODUCTS_MAIN_RECORD_PAGINATION,
    skip: (activePage - 1) * PRODUCTS_MAIN_RECORD_PAGINATION,
    ...filter,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}

export async function ProductsSection({
  pageProps,
}: {
  pageProps: PageProps<"/">;
}) {
  const searchParams = (await pageProps.searchParams) as Record<
    string,
    string | undefined
  >;

  const filter = getFilterProps(searchParams);
  const productCount = await getProductCount({ ...filter });

  return (
    <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
      <Suspense fallback={<div className="h-4 w-40 mb-8 rounded-full animate-pulse" style={{ background: "var(--surface-2)" }} />}>
        <ResultCount productCount={productCount} />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <Grid pageProps={pageProps} />
      </Suspense>
    </main>
  );
}
