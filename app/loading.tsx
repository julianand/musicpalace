export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Hero skeleton */}
      <section className="px-6 pt-12 pb-8 animate-pulse">
        <div className="h-10 w-64 rounded-xl" style={{ background: "var(--surface-2)" }} />
        <div className="h-4 w-96 mt-3 rounded-full" style={{ background: "var(--surface-2)" }} />
        <div className="h-4 w-80 mt-2 rounded-full" style={{ background: "var(--surface-2)" }} />
      </section>

      {/* Category filters skeleton */}
      <div className="px-6 flex gap-2 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 rounded-xl" style={{ background: "var(--surface-2)" }} />
        ))}
      </div>

      {/* Product grid skeleton */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="h-4 w-40 mb-8 rounded-full animate-pulse" style={{ background: "var(--surface-2)" }} />
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
      </main>
    </div>
  );
}