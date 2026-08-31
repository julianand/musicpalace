export default function Loading() {
  return (
    <main
      className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 animate-pulse"
      style={{ background: "var(--background)" }}
    >
      <header className="mb-10">
        <div
          className="h-3 w-16 rounded-full mb-2"
          style={{ background: "var(--surface-2)" }}
        />
        <div className="h-8 w-56 rounded-xl" style={{ background: "var(--surface-2)" }} />
      </header>
      <div className="flex flex-col gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="h-24" style={{ background: "var(--surface-2)" }} />
          </div>
        ))}
      </div>
    </main>
  );
}