// /middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Run on everything EXCEPT static assets/images/favicon
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

// Public routes (no auth required)
const PUBLIC_PREFIXES = ["/", "/login", "/auth", "/auth/callback", "/reset-password"];

function isPublicPath(path: string) {
  if (PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) return true;

  // Always allow API routes to pass (JSON should never be redirected)
  if (path.startsWith("/api")) return true;

  // Make short links public:
  //  - "/abc123"   (root slug)
  //  - "/r/abc123" (prefixed slug)
  if (/^\/[A-Za-z0-9_-]{3,32}$/.test(path)) return true;
  if (/^\/r\/[A-Za-z0-9_-]{3,32}$/.test(path)) return true;

  return false;
}

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public? let it through
  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  // Protected path → require auth
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectedFrom", path);
    return NextResponse.redirect(url);
  }

  return response;
}
