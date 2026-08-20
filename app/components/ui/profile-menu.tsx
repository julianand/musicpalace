"use client";

import { useUser } from "@/lib/providers/user.provider";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { RefObject, useEffect, useRef, useState, useTransition } from "react";

function ProfileButton({ ref }: { ref: RefObject<HTMLButtonElement> }) {
  const { user } = useUser();
  const initials = user
    ? `${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase()
    : null;

  return (
    <button
      ref={ref}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #f0a500 0%, #a06e00 100%)",
        color: "#0c0c0e",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {initials ?? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      )}
    </button>
  );
}

type FormErrors = { email?: string; password?: string; server?: string };

function validateForm(email: string, password: string): FormErrors {
  const errs: FormErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errs.email = "Enter a valid email address.";
  }
  if (password.length < 6) {
    errs.password = "Password must be at least 6 characters.";
  }
  return errs;
}

function SignForm() {
  const [mode, setMode] = useState("sign_in");
  const [submitting, startSubmitTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});

  const messages = {
    main: mode === "sign_in" ? "Sign in" : "Sign up",
    opposite: mode === "sign_in" ? "Sign up" : "Sign in",
    bottom:
      mode === "sign_in"
        ? `Don't have an account?`
        : "Already have an account?",
  };

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const auth = createClient().auth;

    const firstname = data.get("signup-firstname") as string;
    const lastname = data.get("signup-lastname") as string;
    const email = data.get("login-email") as string;
    const password = data.get("login-password") as string;

    const errs = validateForm(email, password);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    startSubmitTransition(async () => {
      if (mode === 'sign_up') {
        const {error} = await auth.signUp({
          email,
          password,
          options: {
            data: { firstname, lastname },
          },
        });

        if (error) return;
      }

      const { error } = await auth.signInWithPassword({ email, password });
      if (error) {
        setErrors({ server: "Email or password is incorrect." });
        return;
      }

      console.warn("sucessful login!!");
    });
  }

  return (
    <>
      {/* Header */}
      <div
        className="px-6 pt-6 pb-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: "var(--amber)", fontFamily: "var(--font-dm-sans)" }}
        >
          Welcome
        </p>
        <h2
          className="text-lg font-bold"
          style={{
            color: "var(--foreground)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {messages.main}
        </h2>
      </div>

      {/* Form */}
      <form className="px-6 py-5 flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* First name + Last name (sign up only) */}
        {mode === "sign_up" && (
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="signup-firstname"
                className="text-xs font-medium"
                style={{
                  color: "var(--muted)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                First name
              </label>
              <input
                id="signup-firstname"
                name="signup-firstname"
                type="text"
                placeholder="John"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-dm-sans)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--amber)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="signup-lastname"
                className="text-xs font-medium"
                style={{
                  color: "var(--muted)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Last name
              </label>
              <input
                id="signup-lastname"
                name="signup-lastname"
                type="text"
                placeholder="Doe"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-dm-sans)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--amber)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
            className="text-xs font-medium"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            Email
          </label>
          <input
            id="login-email"
            name="login-email"
            type="email"
            placeholder="you@email.com"
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
            style={{
              background: "var(--surface-2)",
              border: `1px solid ${errors.email ? "#e05252" : "var(--border)"}`,
              color: "var(--foreground)",
              fontFamily: "var(--font-dm-sans)",
            }}
            onChange={() => setErrors((p) => ({ ...p, email: undefined }))}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = errors.email
                ? "#e05252"
                : "var(--amber)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.email
                ? "#e05252"
                : "var(--border)";
            }}
          />
          {errors.email && (
            <span
              className="text-xs"
              style={{ color: "#e05252", fontFamily: "var(--font-dm-sans)" }}
            >
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-password"
            className="text-xs font-medium"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            Password
          </label>
          <input
            id="login-password"
            name="login-password"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
            style={{
              background: "var(--surface-2)",
              border: `1px solid ${errors.password ? "#e05252" : "var(--border)"}`,
              color: "var(--foreground)",
              fontFamily: "var(--font-dm-sans)",
            }}
            onChange={() => setErrors((p) => ({ ...p, password: undefined }))}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = errors.password
                ? "#e05252"
                : "var(--amber)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.password
                ? "#e05252"
                : "var(--border)";
            }}
          />
          {errors.password && (
            <span
              className="text-xs"
              style={{ color: "#e05252", fontFamily: "var(--font-dm-sans)" }}
            >
              {errors.password}
            </span>
          )}
        </div>

        {/* Server error */}
        {errors.server && (
          <p
            className="text-xs text-center rounded-lg px-3 py-2"
            style={{
              color: "#e05252",
              background: "rgba(224,82,82,0.08)",
              border: "1px solid rgba(224,82,82,0.2)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {errors.server}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-75 cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #f0a500 0%, #a06e00 100%)",
            color: "#0c0c0e",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {messages.main}
        </button>
      </form>

      <p
        className="text-xs text-center px-6 pb-5"
        style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
      >
        {messages.bottom + " "}
        <button
          className="font-semibold transition-opacity hover:opacity-80 cursor-pointer"
          style={{ color: "var(--amber)" }}
          onClick={() => setMode(mode === "sign_in" ? "sign_up" : "sign_in")}
        >
          {messages.opposite}
        </button>
      </p>
    </>
  );
}

function ProfileMenuContent() {
  const { user, userLoaded } = useUser();
  const [signingOut, startSignOutTransition] = useTransition();

  const firstname = user?.firstname ?? "";
  const lastname = user?.lastname ?? "";
  const email = user?.email ?? "";
  const initials = `${firstname[0] ?? ""}${lastname[0] ?? ""}`.toUpperCase();

  function handleSignOut() {
    startSignOutTransition(async () => {
      await createClient().auth.signOut();
    });
  }

  const menuItems = [
    { label: "Purchases", href: "/purchases", icon: "🛍" },
    { label: "Wishlist", href: "/wishlist", icon: "♡" },
  ];

  return (
    <>
      {/* User info */}
      <div className="px-5 py-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: "linear-gradient(135deg, #f0a500 0%, #a06e00 100%)",
            color: "#0c0c0e",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-sm font-semibold truncate"
            style={{ color: "var(--foreground)", fontFamily: "var(--font-dm-sans)" }}
          >
            {firstname} {lastname}
          </span>
          <span
            className="text-xs truncate"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            {email}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Nav items */}
      <div className="py-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-dm-sans)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Sign out */}
      <div className="py-2">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors text-left cursor-pointer disabled:opacity-50"
          style={{
            color: "#e05252",
            fontFamily: "var(--font-dm-sans)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(224,82,82,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span>↪</span>
          <span>{signingOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </>
  );
}

function ProfileMenu({ ref }: { ref: RefObject<HTMLDivElement> }) {
  // const [content, setContent] = useState("sign_form");
  const { user } = useUser();
  console.warn(user);

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {!user ? <SignForm /> : <ProfileMenuContent /> }
    </div>
  );
}

export function ProfileContainer() {
  const { userLoaded } = useUser();
  const buttonRef = useRef<HTMLButtonElement>(null!);
  const menuRef = useRef<HTMLDivElement>(null!);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      "click",
      (e) => {
        const path = e.composedPath() as HTMLElement[];
        if (path.includes(menuRef.current)) return;
        if (path.includes(buttonRef.current)) {
          setMenuOpen((p) => !p);
          return;
        }

        setMenuOpen(false);
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, []);

  if (!userLoaded) return <></>;

  return (
    <div className="relative">
      <ProfileButton ref={buttonRef} />
      {menuOpen && <ProfileMenu ref={menuRef} />}
    </div>
  );
}
