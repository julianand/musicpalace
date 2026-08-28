import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/actions/session.action";
import { getPurchases } from "@/lib/data/purchases";
import { PurchaseWithItems } from "@/lib/data/purchases";

function formatPrice(value: number): string {
  const rounded = Math.round(value);
  return "$" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function PurchaseCard({ purchase }: { purchase: PurchaseWithItems }) {
  return (
    <article
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex flex-col">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--amber)", fontFamily: "var(--font-dm-sans)" }}
          >
            Purchase
          </span>
          <span
            className="text-sm mt-0.5"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            {formatDate(purchase.created_at)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span
            className="text-xs"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            Total
          </span>
          <span
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--foreground)",
            }}
          >
            {formatPrice(purchase.total)}
          </span>
        </div>
      </div>

      {/* Items */}
      <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
        {purchase.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 px-6 py-4">
            {/* Color swatch */}
            <Link
              href={`/product/${item.product.slug}`}
              className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center transition-transform hover:scale-105"
              style={{ background: item.product.category.background_color }}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill={item.product.category.accent_color}
                opacity="0.8"
              >
                <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
              </svg>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/product/${item.product.slug}`}
                className="text-sm font-semibold truncate leading-snug transition-colors hover:text-(--amber)"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-playfair)",
                }}
              >
                {item.product.name}
              </Link>
              <p
                className="text-xs mt-0.5"
                style={{
                  color: "var(--muted)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {item.product.category.name} · {item.quantity} ×{" "}
                {formatPrice(item.unit_price)}
              </p>
            </div>

            {/* Line total */}
            <span
              className="text-sm font-bold shrink-0"
              style={{
                color: "var(--amber)",
                fontFamily: "var(--font-playfair)",
              }}
            >
              {formatPrice(item.quantity * item.unit_price)}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default async function PurchasesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");

  const purchases = await getPurchases();

  return (
    <main
      className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 animate-fade-in-up"
      style={{ background: "var(--background)" }}
    >
      <header className="mb-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--amber)", fontFamily: "var(--font-dm-sans)" }}
        >
          History
        </p>
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
        >
          Your Purchases
        </h1>
      </header>

      {purchases.length === 0 ? (
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
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
          >
            No purchases yet
          </h2>
          <p
            className="text-sm max-w-sm"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            When you buy something from your cart, it will show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {purchases.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </main>
  );
}