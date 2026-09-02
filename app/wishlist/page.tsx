import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/actions/session.action";
import { getFavoriteProducts } from "@/lib/data/products";
import { WishlistCard } from "./wishlist-card";

export const metadata: Metadata = {
  title: "Your Wishlist | The Music Palace",
};

// Auth check + user-scoped favorites can't be prerendered (needs cookies);
// opt the segment out of instant-navigation validation and allow a blocking
// route — same structure as /purchases.
export const instant = false;

export default async function WishlistPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const products = await getFavoriteProducts();

  return (
    <main
      className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 animate-fade-in-up"
      style={{ background: "var(--background)" }}
    >
      <header className="mb-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--amber)", fontFamily: "var(--font-dm-sans)" }}
        >
          Wishlist
        </p>
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
        >
          Your Wishlist
        </h1>
      </header>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 px-4 text-center rounded-2xl">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--surface-2)" }}
          >
            <svg
              className="w-6 h-6 opacity-30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
          >
            No favorites yet
          </h2>
          <p
            className="text-sm max-w-sm"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            Tap the heart on any product to save it here.
          </p>
          <Link
            href="/"
            className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer"
            style={{
              background: "var(--amber)",
              color: "#0c0c0e",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <WishlistCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}