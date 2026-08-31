import type { NextRequest } from "next/server";
import { hasAuthCookies, updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (!hasAuthCookies(request)) return;

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/search).*)",
  ],
};