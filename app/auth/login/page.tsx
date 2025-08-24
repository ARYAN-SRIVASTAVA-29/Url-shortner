// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function getBaseURL() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending magic link…");

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getBaseURL()}/auth/callback`, // 👈 must match the route above
        shouldCreateUser: true,
      },
    });

    setStatus(error ? `Error: ${error.message}` : "Check your email and open the link in this browser.");
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={handleMagicLink} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" className="px-4 py-2 rounded bg-emerald-600 text-white">
          Send magic link
        </button>
      </form>
      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}
