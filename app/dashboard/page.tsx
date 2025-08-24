import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { UrlList } from "@/components/url-list"
import { DashboardStats } from "@/components/dashboard-stats"
import { QuickShorten } from "@/components/quick-shorten"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your shortened URLs and view analytics</p>
          </div>

          {/* Quick Shorten */}
          <QuickShorten />

          {/* Stats Overview */}
          <DashboardStats />

          {/* URL List */}
          <UrlList />
        </div>
      </main>
    </div>
  )
}
