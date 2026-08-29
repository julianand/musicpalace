export function ProductPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-10">
        <div className="h-3 w-10 rounded-full" style={{ background: "var(--surface-2)" }} />
        <div className="h-3 w-3 rounded-full" style={{ background: "var(--surface-2)" }} />
        <div className="h-3 w-20 rounded-full" style={{ background: "var(--surface-2)" }} />
        <div className="h-3 w-3 rounded-full" style={{ background: "var(--surface-2)" }} />
        <div className="h-3 w-32 rounded-full" style={{ background: "var(--surface-2)" }} />
      </div>
      {/* Hero */}
      <section className="flex flex-col gap-6 mb-16">
        <div className="h-6 w-24 rounded-lg" style={{ background: "var(--surface-2)" }} />
        <div className="flex flex-col gap-3">
          <div className="h-12 w-96 rounded-xl" style={{ background: "var(--surface-2)" }} />
          <div className="h-5 w-48 rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-full max-w-2xl rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="h-3 w-4/5 max-w-2xl rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="h-3 w-3/5 max-w-2xl rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
        <div style={{ height: "1px", background: "var(--border)" }} />
        <div className="flex items-center gap-6">
          <div className="h-12 w-40 rounded-xl" style={{ background: "var(--surface-2)" }} />
          <div className="flex gap-3">
            <div className="h-12 w-36 rounded-2xl" style={{ background: "var(--surface-2)" }} />
            <div className="h-12 w-28 rounded-2xl" style={{ background: "var(--surface-2)" }} />
          </div>
        </div>
      </section>
      {/* Reviews + Rating grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl p-8 h-96" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
        <div className="rounded-2xl p-8 h-64" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
      </section>
    </div>
  );
}