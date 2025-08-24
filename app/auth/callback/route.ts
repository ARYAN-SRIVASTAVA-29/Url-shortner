import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectedFrom = url.searchParams.get("redirectedFrom") || "/";

  // We’ll redirect here after exchanging the code
  const response = NextResponse.redirect(new URL(redirectedFrom, url.origin));

  // Supabase client wired to read cookies from the request
  // and write cookies onto the response (so the session is stored)
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

  if (code) {
    // 🔑 Exchange the magic-link code for a session and set cookies on `response`
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
