export function Footer() {
  return (
    <footer
      className="mt-auto py-8"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div
        className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
        style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: "var(--amber)" }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#0c0c0e">
              <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
            </svg>
          </div>
          <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
            The Music Palace
          </span>
          <span>© 2026</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-foreground transition-colors">
            About
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Contact
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
