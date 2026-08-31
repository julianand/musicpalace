# Auth — session, favorites, refresh proxy

> Area rules for Supabase auth, favorites, and the session-refresh proxy. Loaded on demand from the root `AGENTS.md` index when a task touches these areas.

## Auth & favorites

- Auth is Supabase SSR. `getSessionUser()` is the single source of truth for the current user on the server; `UserProvider` (`lib/providers/user.provider.tsx`) hydrates it on the client and listens to `onAuthStateChange`, calling `router.refresh()` on sign in/out.

### Session refresh proxy (`proxy.ts`)
- Next.js 16 renamed `middleware.ts` → `proxy.ts`. The root-level `proxy.ts` refreshes the Supabase session on every matched request — it is a **session-refresh layer only, never an auth gate**: it never blocks, redirects, or 401s. Every auth consumer (`getSessionUser`, server actions, `/api/cart`) keeps its own internal checks — per the Next docs, proxy alone must never be relied on to protect server functions.
- `lib/supabase/proxy.ts` exposes `hasAuthCookies(request)` (guards on `sb-` cookies) and `updateSession(request)`, a `createServerClient` factory scoped to the proxy that works off `request.cookies`/`NextResponse.next({ request })` (never `next/headers` — keep render-scoped imports out of the proxy bundle). It calls `supabase.auth.getUser()`, which validates the access token server-side and rotates expired tokens via `setAll`.
- Matcher (in `proxy.ts`): `/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/search).*)` — covers all pages, `/api/cart`, and server-action POSTs, but **excludes `/api/search`** (lean, unauthenticated, per-keystroke). Early return when no `sb-` cookies exist → zero Auth round-trips for anonymous traffic.
- `getSessionUser()` uses `supabase.auth.getUser()` (not `getSession()`) so it returns a server-validated user; the proxy runs first and persists any cookie rotation (server components/actions cannot set cookies — see the swallowed `setAll` in `lib/supabase/server.ts`).
- Favorites: `toggleFavorite(productId: bigint)` in `lib/actions/favorites.action.ts` is a server action that returns a typed result (`{ success, favorite?, error? }`). The client `FavoriteButton` does optimistic updates and reports errors/notifications through the toast service.
- Toast service: `lib/ui/services/toast.service.ts` is a singleton (subscribe/notify). `<ToastContainer />` is rendered once inside `AppProvider`.