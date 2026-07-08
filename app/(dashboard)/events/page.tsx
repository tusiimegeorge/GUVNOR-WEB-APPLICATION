import { createClient } from "@/lib/supabase/server"
import { EventsPageClient } from "./events-page-client"
import { Footer } from "@/components/footer"
import type { EventWithMedia } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function EventsPage() {
  const supabase = await createClient()

  // Get current user
  let user: any = null
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    if (!error && authUser) {
      user = authUser
    }
  } catch (err) {
    console.log("[v0] Could not fetch user")
  }

  let events: any[] = []

  try {
    console.log("[v0] Starting to fetch events...")
    // Fetch events with their status
    const result = await supabase.from("events").select("*").order("event_date", { ascending: false })
    
    const { data, error } = result

    if (error) {
      console.error("[v0] Supabase error fetching events:", {
        message: error.message,
        code: error.code,
        status: error.status,
      })
      events = []
    } else if (data && Array.isArray(data)) {
      console.log("[v0] Successfully fetched events:", data.length)
      events = data
    } else {
      console.log("[v0] No data returned from events query")
      events = []
    }
  } catch (err: any) {
    console.error("[v0] Exception fetching events:", {
      message: err?.message,
      name: err?.name,
      stack: err?.stack?.split("\n")[0],
    })
    events = []
  }

  console.log("[v0] Successfully fetched events:", events?.length || 0)

  // Categorize events by status
  const now = new Date()
  const categorizedEvents: {
    upcoming: EventWithMedia[]
    happening_now: EventWithMedia[]
    past: EventWithMedia[]
  } = {
    upcoming: [],
    happening_now: [],
    past: [],
  }

  if (events && events.length > 0) {
    for (const event of events) {
      // Parse event date and time to create a full datetime
      const eventDateStr = event.event_date
      const eventTimeStr = event.event_time || "00:00"
      
      // Create a complete datetime from date and time
      const [hours, minutes] = eventTimeStr.split(":").map(Number)
      const eventDateTime = new Date(eventDateStr)
      eventDateTime.setHours(hours, minutes, 0, 0)
      
      const eventWithMedia: EventWithMedia = {
        ...event,
        event_status: event.event_status || "upcoming",
      }

      // Recategorize based on current date and time (dynamic)
      const timeDiff = eventDateTime.getTime() - now.getTime()
      const minutesDiff = Math.floor(timeDiff / (1000 * 60))
      
      // Assume events last 4 hours (240 minutes)
      const eventDurationMinutes = 240
      
      if (minutesDiff < -eventDurationMinutes) {
        // Event ended more than 4 hours ago
        eventWithMedia.event_status = "past"
      } else if (minutesDiff >= -eventDurationMinutes && minutesDiff <= 0) {
        // Event is currently happening (started, not yet ended)
        eventWithMedia.event_status = "happening_now"
      } else {
        // Event hasn't started yet
        eventWithMedia.event_status = "upcoming"
      }

      // Fetch videos for this event
      let videos: any[] = []
      try {
        const videosResult = await supabase
          .from("event_videos")
          .select("*")
          .eq("event_id", event.id)
          .order("display_order", { ascending: true })
        
        if (videosResult.data && Array.isArray(videosResult.data)) {
          videos = videosResult.data
        }
      } catch (err) {
        console.log("[v0] Could not fetch videos for event", event.id)
      }

      // Fetch photos for this event
      let photos: any[] = []
      try {
        const photosResult = await supabase
          .from("event_photos")
          .select("*")
          .eq("event_id", event.id)
          .order("display_order", { ascending: true })
        
        if (photosResult.data && Array.isArray(photosResult.data)) {
          photos = photosResult.data
        }
      } catch (err) {
        console.log("[v0] Could not fetch photos for event", event.id)
      }

      eventWithMedia.videos = videos
      eventWithMedia.photos = photos

      categorizedEvents[eventWithMedia.event_status].push(eventWithMedia)
    }
  }

  console.log("[v0] Categorized events:", {
    upcoming: categorizedEvents.upcoming.length,
    happening_now: categorizedEvents.happening_now.length,
    past: categorizedEvents.past.length,
  })

  return (
    <>
      <EventsPageClient events={categorizedEvents} user={user} />
      <Footer />
    </>
  )
}
