import Link from "next/link";
import { CartPreview } from "./ui/cart-preview";
import { Product } from "@/types";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "var(--amber)" }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0c0c0e">
          <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
        </svg>
      </div>
      <span
        className="text-lg font-bold tracking-tight leading-none"
        style={{
          fontFamily: "var(--font-playfair)",
          color: "var(--foreground)",
        }}
      >
        The Music Palace
      </span>
    </Link>
  );
}

function SearchBar() {
  return (
    <div className="flex-1 max-w-xl mx-auto">
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
      >
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search instruments, interfaces, monitors..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-(--muted)"
          style={{
            color: "var(--foreground)",
            fontFamily: "var(--font-dm-sans)",
          }}
        />
        <kbd
          className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
          style={{ background: "var(--border)", color: "var(--muted)" }}
        >
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

export function Header() {
  const cartProducts: Product[] = [];
  return (
    <header
      className="sticky top-0 z-50 animate-slide-down"
      style={{
        background: "color-mix(in srgb, var(--background) 85%, transparent)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
        <Logo />
        <SearchBar />

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <CartPreview cartProducts={cartProducts} />

          {/* Profile */}
          <Link
            href="/profile"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #f0a500 0%, #a06e00 100%)",
              color: "#0c0c0e",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            JP
          </Link>
        </div>
      </div>
    </header>
  );
}
