import Link from "next/link";
import { CartPreview } from "./ui/cart-preview";
import { Product } from "@/types";
import { ProfileContainer } from "./ui/profile-menu";
import { SearchBar } from "./ui/search-bar";

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
          <ProfileContainer />
        </div>
      </div>
    </header>
  );
}
