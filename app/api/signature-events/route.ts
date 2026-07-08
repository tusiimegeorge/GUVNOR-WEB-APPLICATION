import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Fetching signature events...")

    const supabase = await createClient()

    const { data: events, error } = await supabase
      .from("signature_events")
      .select("*")
      .order("order_position", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching signature events:", {
        message: error.message,
        code: error.code,
      })
      return NextResponse.json(
        { events: [], error: error.message },
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    console.log("[v0] Successfully fetched signature events:", events?.length || 0)
    return NextResponse.json(
      { events: events || [] },
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[v0] Exception in signature events route:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { events: [], error: "Internal server error" },
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }
}
