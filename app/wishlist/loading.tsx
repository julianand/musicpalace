export default function Loading() {
  return (
    <main
      className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 animate-pulse"
      style={{ background: "var(--background)" }}
    >
      <header className="mb-10">
        <div
          className="h-3 w-16 rounded-full mb-2"
          style={{ background: "var(--surface-2)" }}
        />
        <div className="h-8 w-56 rounded-xl" style={{ background: "var(--surface-2)" }} />
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl shrink-0"
                  style={{ background: "var(--surface-2)" }}
                />
                <div className="h-4 flex-1 rounded-full" style={{ background: "var(--surface-2)" }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 rounded-full" style={{ background: "var(--surface-2)" }} />
                <div className="h-4 w-12 rounded-full" style={{ background: "var(--surface-2)" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}