import { createClient } from "../../../lib/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API route called")

  try {
    // Check environment variables first
    console.log("[v0] Environment check:", {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
      nodeEnv: process.env.NODE_ENV,
    })

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[v0] Missing environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error - missing environment variables",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Creating Supabase client...")
    const supabase = await createClient()
    console.log("[v0] Supabase client created successfully")

    console.log("[v0] Parsing request body...")
    const body = await request.json()
    const { original_url, title, description } = body
    console.log("[v0] Request data:", { original_url, title, description })

    if (!original_url) {
      return NextResponse.json({ error: "Original URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(original_url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    console.log("[v0] Getting user...")
    // Get user (optional - can create anonymous URLs)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.log("[v0] User error (non-fatal):", userError)
    }
    console.log("[v0] User:", user?.id ? "authenticated" : "anonymous")

    // Generate unique short code
    let shortCode: string
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    console.log("[v0] Generating short code...")
    while (!isUnique && attempts < maxAttempts) {
      // Generate 6-character short code
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      shortCode = ""
      for (let i = 0; i < 6; i++) {
        shortCode += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      console.log("[v0] Checking uniqueness for:", shortCode)
      // Check if short code already exists
      const { data: existing, error: checkError } = await supabase
        .from("urls")
        .select("id")
        .eq("short_code", shortCode)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "not found" which is what we want
        console.error("[v0] Error checking uniqueness:", checkError)
        return NextResponse.json({ error: "Database error during uniqueness check" }, { status: 500 })
      }

      if (!existing) {
        isUnique = true
        console.log("[v0] Found unique short code:", shortCode)
      }
      attempts++
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate unique short code" }, { status: 500 })
    }

    console.log("[v0] Inserting URL into database...")
    // Insert URL
    const { data: url, error } = await supabase
      .from("urls")
      .insert({
        short_code: shortCode!,
        original_url,
        user_id: user?.id || null,
        title: title || null,
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database insert error:", error)
      return NextResponse.json({ error: "Failed to create short URL: " + error.message }, { status: 500 })
    }

    console.log("[v0] URL created successfully:", url.short_code)
    return NextResponse.json({
      id: url.id,
      short_code: url.short_code,
      original_url: url.original_url,
      short_url: `${request.nextUrl.origin}/${url.short_code}`,
      created_at: url.created_at,
    })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}