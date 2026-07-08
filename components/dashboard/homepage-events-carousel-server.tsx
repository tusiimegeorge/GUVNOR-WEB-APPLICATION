import { createClient } from "@/lib/supabase/server"
import { EventsCarouselCalendarClient } from './homepage-events-carousel-client'

async function getEvents() {
  const supabase = await createClient()

  let events: any[] = []

  try {
    // Fetch all events
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })

    if (error) {
      console.error("[v0] Supabase error fetching events:", error.message)
      events = []
    } else {
      events = data || []
    }
  } catch (err: any) {
    console.error("[v0] Exception fetching events:", err?.message)
    events = []
  }

  // Categorize events dynamically by current date/time
  const now = new Date()
  const upcomingEvents = []
  const happeningNowEvents = []

  if (events && events.length > 0) {
    for (const event of events) {
      // Parse event date and time to create a full datetime
      const eventDateStr = event.event_date
      const eventTimeStr = event.event_time || "00:00"

      // Create a complete datetime from date and time
      const [hours, minutes] = eventTimeStr.split(":").map(Number)
      const eventDateTime = new Date(eventDateStr)
      eventDateTime.setHours(hours, minutes, 0, 0)

      // Recategorize based on current date and time
      const timeDiff = eventDateTime.getTime() - now.getTime()
      const minutesDiff = Math.floor(timeDiff / (1000 * 60))

      // Assume events last 4 hours (240 minutes)
      const eventDurationMinutes = 240

      if (minutesDiff >= -eventDurationMinutes && minutesDiff <= 0) {
        // Event is currently happening (started, not yet ended)
        happeningNowEvents.push({ ...event, event_status: "happening_now" })
      } else if (minutesDiff > 0) {
        // Event hasn't started yet
        upcomingEvents.push({ ...event, event_status: "upcoming" })
      }
      // Events that ended more than 4 hours ago are not included
    }
  }

  // Combine both categories and sort by date
  const displayEvents = [...happeningNowEvents, ...upcomingEvents].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  )

  return displayEvents
}

export async function EventsCarouselCalendar() {
  const displayEvents = await getEvents()
  return <EventsCarouselCalendarClient events={displayEvents} />
}
