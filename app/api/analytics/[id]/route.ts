import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params

    // Verify user owns this URL
    const { data: url, error: urlError } = await supabase
      .from("urls")
      .select("id, short_code, original_url, title")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (urlError || !url) {
      return NextResponse.json({ error: "URL not found or access denied" }, { status: 404 })
    }

    // Get click analytics
    const { data: clicks, error: clicksError } = await supabase
      .from("clicks")
      .select("*")
      .eq("url_id", id)
      .order("clicked_at", { ascending: false })

    if (clicksError) {
      console.error("Database error:", clicksError)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    // Process analytics data
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const analytics = {
      url: url,
      total_clicks: clicks?.length || 0,
      unique_ips: new Set(clicks?.map((c) => c.ip_address).filter(Boolean)).size,
      clicks_today: clicks?.filter((c) => new Date(c.clicked_at) >= today).length || 0,
      clicks_this_week: clicks?.filter((c) => new Date(c.clicked_at) >= thisWeek).length || 0,
      clicks_this_month: clicks?.filter((c) => new Date(c.clicked_at) >= thisMonth).length || 0,

      // Top countries
      top_countries: Object.entries(
        clicks?.reduce((acc: Record<string, number>, click) => {
          if (click.country) {
            acc[click.country] = (acc[click.country] || 0) + 1
          }
          return acc
        }, {}) || {},
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([country, count]) => ({ country, count })),

      // Top browsers
      top_browsers: Object.entries(
        clicks?.reduce((acc: Record<string, number>, click) => {
          if (click.browser) {
            acc[click.browser] = (acc[click.browser] || 0) + 1
          }
          return acc
        }, {}) || {},
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([browser, count]) => ({ browser, count })),

      // Daily clicks for the last 30 days
      daily_clicks: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split("T")[0]
        const count = clicks?.filter((c) => c.clicked_at.startsWith(dateStr)).length || 0
        return { date: dateStr, clicks: count }
      }).reverse(),

      recent_clicks:
        clicks?.slice(0, 10).map((click) => ({
          clicked_at: click.clicked_at,
          country: click.country,
          city: click.city,
          browser: click.browser,
          device_type: click.device_type,
          referer: click.referer,
        })) || [],
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
