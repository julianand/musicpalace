import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | The Music Palace",
  description:
    "A demo storefront for music gear reviews, built with Next.js, Supabase and Prisma.",
};

const STACK = [
  { name: "Next.js", detail: "App Router, Server Components, caching", color: "#E5E7EB" },
  { name: "React", detail: "19, Server & Client Components", color: "#61DAFB" },
  { name: "TypeScript", detail: "Typed data layer and UI", color: "#3178C6" },
  { name: "Tailwind CSS", detail: "v4 utility styling", color: "#38BDF8" },
  { name: "Supabase", detail: "Auth + PostgreSQL (hosted)", color: "#3ECF8E" },
  { name: "Prisma ORM", detail: "v7, typed data access", color: "#8B5CF6" },
  { name: "Playwright", detail: "End-to-end test suite", color: "#2EAD33" },
];

const FEATURES = [
  "Catalog with 50 products, category filters, sorting and pagination",
  "Search bar with autocomplete suggestions",
  "Product pages with reviews, rating breakdown and related products",
  "Sign up / sign in / sign out with Supabase Auth",
  "Shopping cart with optimistic UI, quantity controls and persistence",
  "Checkout flow with a purchase history page",
  "Wishlist with one-click favorite toggles",
];

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full" style={{ background: "var(--amber)" }} />
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <main
      className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 animate-fade-in-up"
      style={{ background: "var(--background)" }}
    >
      <header className="mb-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--amber)", fontFamily: "var(--font-dm-sans)" }}
        >
          About
        </p>
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--foreground)" }}
        >
          About this project
        </h1>
        <p
          className="mt-4 text-sm leading-relaxed max-w-xl"
          style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
        >
          The Music Palace is a demo storefront for music gear reviews — a small
          e-commerce experience where you can browse instruments and studio
          gear, read and write reviews, save favorites, and go through a full
          cart-to-checkout flow. It runs on sample data, so feel free to create
          an account and explore — and since it&apos;s open source, you can also run
          it locally or deploy your own copy.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <SectionCard title="About me">
          <div className="flex flex-col gap-3 text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}>
            <h3
              className="text-xl font-black leading-tight"
              style={{
                background: "linear-gradient(90deg, #f0a500, #fcd34d)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Hi 👋, my name is Julian Pitre
            </h3>
            <p className="leading-relaxed">
              I'm a developer with 7+ years of experience building web applications.
              I hope you enjoy this site, feel free to fork it if you want to review it deeply or use it to test another feature.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com/julianand"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-(--amber)"
                style={{ color: "var(--foreground)" }}
              >
                GitHub — github.com/julianand
              </a>
              <a
                href="https://linkedin.com/in/julianpitre"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-(--amber)"
                style={{ color: "var(--foreground)" }}
              >
                LinkedIn — linkedin.com/in/julianpitre
              </a>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Built with">
          <div className="flex flex-wrap gap-2">
            {STACK.map((item) => (
              <div
                key={item.name}
                className="tool-card rounded-xl px-3.5 py-2 flex flex-col gap-0.5"
                style={{ "--tool-color": item.color } as React.CSSProperties}
              >
                <span
                  className="tool-card-name text-xs font-semibold"
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {item.name}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
                >
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="What you can do">
          <ul className="flex flex-col gap-2">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="text-sm flex items-start gap-2"
                style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
              >
                <span style={{ color: "var(--amber)" }}>♪</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Run it locally">
          <div className="flex flex-col gap-3 text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}>
            <p className="leading-relaxed">
              Want your own copy? Clone the repo, create a Supabase project, add
              your keys and database URL to a <code style={{ color: "var(--foreground)" }}>.env</code> file, push
              the schema, seed the sample data and you&apos;re running in a few
              minutes.
            </p>
            <div
              className="rounded-xl px-4 py-3 flex flex-col gap-1"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                Quick start
              </span>
              <span style={{ color: "var(--muted)" }}>
                git clone · npm install · cp .env.example .env · npx prisma db push · npx prisma db seed · npm run dev
              </span>
            </div>
            <p className="leading-relaxed">
              Full instructions live in the README.
            </p>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}