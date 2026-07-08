import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.toLowerCase() || ""

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const supabase = await createClient()

    // Search menu items
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id, name, description, category, price")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5)

    // Search events
    const { data: events } = await supabase
      .from("events")
      .select("id, title, description, date, location")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5)

    // Search gallery
    const { data: gallery } = await supabase
      .from("gallery_media")
      .select("id, title, description, image_url")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5)

    const results = [
      ...(menuItems || []).map((item) => ({
        id: item.id,
        type: "menu",
        title: item.name,
        description: item.description,
        subtitle: item.category,
        metadata: { price: item.price },
      })),
      ...(events || []).map((event) => ({
        id: event.id,
        type: "event",
        title: event.title,
        description: event.description,
        subtitle: event.location,
        metadata: { date: event.date },
      })),
      ...(gallery || []).map((item) => ({
        id: item.id,
        type: "gallery",
        title: item.title,
        description: item.description,
        subtitle: "Gallery",
        metadata: { image: item.image_url },
      })),
    ]

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json([], { status: 500 })
  }
}
