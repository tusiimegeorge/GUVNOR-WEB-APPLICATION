import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    )

    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "social_media_links")
      .single()

    if (error) {
      console.error("[v0] Error fetching social media links:", error)
      return NextResponse.json({ links: [] }, { status: 200 })
    }

    if (data && data.setting_value) {
      const value = typeof data.setting_value === "string" ? JSON.parse(data.setting_value) : data.setting_value
      const links = Array.isArray(value) ? value : Object.values(value || {})
      return NextResponse.json({ links }, { status: 200 })
    }

    return NextResponse.json({ links: [] }, { status: 200 })
  } catch (error) {
    console.error("[v0] Exception in social media links route:", error)
    return NextResponse.json({ links: [] }, { status: 200 })
  }
}
