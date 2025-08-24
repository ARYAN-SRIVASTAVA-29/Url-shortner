import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    const supabase = await createClient()
    const { shortCode } = params

    // Find the URL by short code
    const { data: url, error } = await supabase
      .from("urls")
      .select("*")
      .eq("short_code", shortCode)
      .eq("is_active", true)
      .single()

    if (error || !url) {
      return NextResponse.json({ error: "Short URL not found" }, { status: 404 })
    }

    // Check if URL has expired
    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      return NextResponse.json({ error: "Short URL has expired" }, { status: 410 })
    }

    // Extract analytics data from request
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""
    const forwardedFor = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "127.0.0.1"

    // Simple browser detection
    let browser = "Unknown"
    if (userAgent.includes("Chrome")) browser = "Chrome"
    else if (userAgent.includes("Firefox")) browser = "Firefox"
    else if (userAgent.includes("Safari")) browser = "Safari"
    else if (userAgent.includes("Edge")) browser = "Edge"

    // Simple device detection
    let deviceType = "Desktop"
    if (userAgent.includes("Mobile")) deviceType = "Mobile"
    else if (userAgent.includes("Tablet")) deviceType = "Tablet"

    // Record the click (async, don't wait for it)
    supabase
      .from("clicks")
      .insert({
        url_id: url.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        referer: referer || null,
        browser: browser,
        device_type: deviceType,
        // Note: In a real system, you'd use a geolocation service for country/city
        country: null,
        city: null,
      })
      .then(({ error: clickError }) => {
        if (clickError) {
          console.error("Failed to record click:", clickError)
        }
      })

    // Redirect to original URL
    return NextResponse.redirect(url.original_url, { status: 302 })
  } catch (error) {
    console.error("Redirect error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
