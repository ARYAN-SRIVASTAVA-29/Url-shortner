import type { Metadata } from "next";
import Link from "next/link";
import {UrlShortenerForm} from "@/components/url-shortener-form";

export const metadata: Metadata = {
  title: "LinkShort — Minimal URL Shortener",
  description: "Shorten links. Measure impact. No clutter.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto w-full max-w-2xl px-4 py-20 md:py-28">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
          Shorten links. <span className="text-zinc-600">Measure impact.</span>
        </h1>
        <p className="mt-3 text-base md:text-lg text-zinc-600">
          Clean, fast URL shortening with basic analytics.
        </p>

        <div className="mt-8">
          <UrlShortenerForm />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            Get started
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          Privacy-first • 99.9% uptime • Open source friendly
        </p>
      </section>
    </main>
  );
}

