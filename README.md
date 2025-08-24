# LinkShort — Minimal URL Shortener

LinkShort is a small, clean URL shortener built with **Next.js** and **Supabase**.  
It focuses on the basics: create short links, redirect fast, and (optionally) record simple analytics.

---

## What’s inside

- **Next.js (App Router, TypeScript, Tailwind)**
- **Supabase (PostgreSQL + Auth + RLS)**
- Optional **Redis** cache (for hot slugs)
- API routes for shortening, listing, and analytics

---

## Architecture (high level)

```

┌───────────────┐    ┌────────────────┐    ┌────────────────┐
│   Web / CDN   │───▶│  Next.js App   │───▶│  Supabase (DB) │
└───────────────┘    └────────────────┘    └────────────────┘
│
(optional)
▼
┌────────┐
│ Redis  │
└────────┘

````

- **/api/shorten** creates a record in `urls`.
- **/:slug** looks up the long URL (cache → DB), optionally logs a click, and issues a redirect.

---

## Quick start

### Prerequisites
- Node.js 18+
- Supabase project (free is fine)

### 1) Install
```bash
# clone your repo, then
npm install   # or pnpm install / yarn
````

### 2) Environment

Create **`.env.local`**:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # optional (admin tasks only)
NEXT_PUBLIC_SITE_URL=http://localhost:3000        # used in auth + link generation
```

### 3) Database

Open the Supabase SQL editor and run the scripts in **scripts/** in order:

1. `001_create_tables.sql` – core tables (`urls`, `clicks`, etc.)
2. `002_create_rls_policies.sql` – Row-Level Security
3. `003_create_functions.sql` – helpers/triggers
4. `004_seed_sample_data.sql` – optional

> Ensure there is a **unique index** on `urls.slug`.

### 4) Auth (magic links)

Supabase Dashboard → **Authentication → URL Configuration**

* **Site URL:** `http://localhost:3000`
* **Redirect URLs:** `http://localhost:3000/auth/callback`

### 5) Run

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

---

## Features

* **Shorten URLs** with a simple form and API (`POST /api/shorten`)
* **Fast redirects** from `/:slug` (302/307)
* **Basic analytics** (optional): store click time, referrer, UA, IP (as per your policy)
* **Auth & dashboard** (optional): sign in with email magic links, view/manage your links
* **RLS** to keep user data isolated (or allow anonymous create—your choice)

---

## API (short version)

### Create short link

`POST /api/shorten`

```json
{ "longUrl": "https://example.com/a?x=1#sec" }
```

**Response**

```json
{
  "id": "uuid",
  "slug": "kBvEJQ",
  "longUrl": "https://example.com/a?x=1#sec",
  "shortUrl": "http://localhost:3000/kBvEJQ"
}
```

### List my URLs (if you keep dashboards)

`GET /api/urls` → returns the authenticated user’s links.

### Update / delete

`PATCH /api/urls/[id]`
`DELETE /api/urls/[id]`

### Analytics

`GET /api/analytics/[id]` – stats for a single URL
`GET /api/analytics/overview` – account-level summary

### Redirect

`GET /:slug` → 30x redirect to the original URL (fragment `#...` preserved)

---

## Database & security

* **Tables**: `urls` (owner\_id, slug, long\_url, created\_at, …), `clicks` (url\_id, ts, ua, referrer, ip\_hash, …).
* **RLS**:

  * If you want anonymous link creation, allow `insert` on `urls` with tight validation.
  * If you want account-scoped links only, require `authenticated` and filter by `owner_id = auth.uid()`.
* **Validation**: Accept only `http://` or `https://` schemes. Reject `javascript:`, `data:`, etc.
* **Uniqueness**: `urls.slug` must be unique.

---

## Performance & scaling

* **Cache** hot slugs in Redis (TTL minutes/hours).
* **Indexes** on `urls.slug`, `urls.owner_id`, `clicks.url_id`.
* **Avoid re-encoding** URLs; store exactly what users gave (after validation).

---

## Production notes

* Use any Node-compatible host (Docker, a Node server, or your preferred platform).
* Set environment variables for your **public site URL** (e.g., `https://yourdomain.com`) so generated links are correct.
* Add **rate limiting** to `/api/shorten` (IP-based) to prevent abuse.
* Consider a small **moderation** step (blocklists, phishing checks) if you plan to open this publicly.

---

## Testing ideas

* Valid/invalid URLs, scheme checks, very long URLs, Unicode domains.
* Duplicate long URL behavior (dedupe vs new slug).
* Redirect preserves query + fragment.
* Non-existent slug returns 404 (or custom page).
* Auth flows: magic link callback (`/auth/callback`) sets session cookies correctly.

---

## Environment variables (recap)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...     # optional
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Why this project

This repo is meant to be a solid, readable reference for:

* simple **Full-stack Next.js** patterns,
* **Supabase Auth + RLS** basics,
* clean **API design** and validation,
* and a straightforward **system design** you can explain in interviews.

---

## Contributing

Issues and PRs that improve clarity, tests, or educational value are welcome.

## License

MIT


