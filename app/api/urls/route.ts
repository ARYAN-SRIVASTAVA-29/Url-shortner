import { createClient } from "@/lib/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
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

    // Get user's URLs with click counts
    const { data: urls, error } = await supabase
      .from("urls")
      .select(`
        id,
        short_code,
        original_url,
        title,
        description,
        created_at,
        updated_at,
        expires_at,
        is_active,
        clicks:clicks(count)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch URLs" }, { status: 500 })
    }

    // Transform data to include click counts and short URLs
    const transformedUrls =
      urls?.map((url) => ({
        ...url,
        short_url: `${request.nextUrl.origin}/${url.short_code}`,
        click_count: url.clicks?.length || 0,
        clicks: undefined, // Remove the raw clicks data
      })) || []

    return NextResponse.json({ urls: transformedUrls })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
