export function HeroDescription() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(240,165,0,0.12) 0%, transparent 70%), var(--background)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
        <p
          className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
          style={{ color: "var(--amber)", fontFamily: "var(--font-dm-sans)" }}
        >
          Professional audio gear reviews
        </p>
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6"
          style={{
            fontFamily: "var(--font-playfair)",
            color: "var(--foreground)",
          }}
        >
          The{" "}
          <span
            className="italic"
            style={{
              background: "linear-gradient(90deg, #f0a500, #fcd34d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            perfect sound
          </span>
          <br />
          starts here.
        </h1>
        <p
          className="max-w-xl mx-auto text-base leading-relaxed"
          style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
        >
          Honest, in-depth reviews of instruments, audio interfaces, monitors,
          microphones and more — written by musicians and producers.
        </p>
      </div>
    </section>
  );
}
