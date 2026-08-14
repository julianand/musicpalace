export function CategoryFilters() {
  return (
    <section
      className="sticky top-16 z-40"
      style={{
        background: "rgba(12, 12, 14, 0.9)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { label: "All", active: true },
          { label: "Instruments", active: false },
          { label: "Interfaces", active: false },
          { label: "Monitors", active: false },
          { label: "Microphones", active: false },
          { label: "Drum Machines", active: false },
          { label: "Headphones", active: false },
          { label: "Effects", active: false },
        ].map((cat) => (
          <button
            key={cat.label}
            className="shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap"
            style={
              cat.active
                ? {
                    background: "var(--amber)",
                    color: "#0c0c0e",
                    fontFamily: "var(--font-dm-sans)",
                  }
                : {
                    background: "var(--surface-2)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-dm-sans)",
                  }
            }
          >
            {cat.label}
          </button>
        ))}

        <div className="ml-auto shrink-0 flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            Sort by:
          </span>
          <select
            className="text-xs py-1.5 px-3 rounded-lg outline-none cursor-pointer"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            <option>Top rated</option>
            <option>Most recent</option>
            <option>Price: low to high</option>
            <option>Price: high to low</option>
          </select>
        </div>
      </div>
    </section>
  );
}
