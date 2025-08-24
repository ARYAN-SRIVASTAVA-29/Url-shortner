import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { OverallAnalytics } from "@/components/overall-analytics"
import { TopUrls } from "@/components/top-urls"
import { ClickTrends } from "@/components/click-trends"
import { GeographicData } from "@/components/geographic-data"

export default async function AnalyticsPage() {
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
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif">Analytics Overview</h1>
            <p className="text-muted-foreground mt-2">Comprehensive insights into your URL performance</p>
          </div>

          {/* Overall Stats */}
          <OverallAnalytics />

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            <ClickTrends />
            <GeographicData />
          </div>

          {/* Top URLs */}
          <TopUrls />
        </div>
      </main>
    </div>
  )
}
