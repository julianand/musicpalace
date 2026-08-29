import { ProductPageSkeleton } from "@/app/components/ui/product-page-skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <ProductPageSkeleton />
    </main>
  );
}