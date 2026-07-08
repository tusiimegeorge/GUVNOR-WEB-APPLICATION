import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const returnTo = requestUrl.searchParams.get("returnTo") || "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log("[v0] OAuth callback successful, redirecting to:", returnTo)
      return NextResponse.redirect(new URL(returnTo, request.url))
    }

    console.error("[v0] OAuth callback error:", error.message)
  }

  // Return to auth page on error
  return NextResponse.redirect(new URL("/auth/login", request.url))
}
