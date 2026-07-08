import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    )

    // Fetch from v_public_slides view (same as GUVNOR)
    const { data: slides, error } = await supabase
      .from("v_public_slides")
      .select("*")

    if (error) {
      console.error("[v0] Error fetching slides from view:", error)
      return NextResponse.json(
        { slides: [], error: error.message },
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    return NextResponse.json(
      { slides: slides || [] },
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[v0] Exception in slides route:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { slides: [], error: "Internal server error" },
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }
}
