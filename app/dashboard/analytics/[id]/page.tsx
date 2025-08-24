import { createClient } from "@/lib/server"
import { redirect, notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { UrlAnalyticsDetail } from "@/components/url-analytics-detail"

interface PageProps {
  params: { id: string }
}

export default async function UrlAnalyticsPage({ params }: PageProps) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Verify user owns this URL
  const { data: url, error: urlError } = await supabase
    .from("urls")
    .select("id, short_code, original_url, title, created_at")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (urlError || !url) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UrlAnalyticsDetail urlId={params.id} url={url} />
      </main>
    </div>
  )
}
