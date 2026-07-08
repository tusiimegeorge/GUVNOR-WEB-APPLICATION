"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DayPicker } from "react-day-picker"
import { parseISO, isSameDay, isToday } from "date-fns"
import { EventCarousel } from "./event-carousel"
import "react-day-picker/dist/style.css"

interface Event {
  id: string
  title: string
  event_date: string
  event_time?: string
  location?: string
  description?: string
  event_status?: string
  image_url?: string
}

export function EventsCarouselCalendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEventIndex, setSelectedEventIndex] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("event_date", { ascending: true })

        if (error) throw error

        // Categorize events dynamically by current date/time (matching events page logic)
        const now = new Date()
        const upcomingEvents: Event[] = []
        const happeningNowEvents: Event[] = []

        if (data && Array.isArray(data)) {
          for (const event of data) {
            // Parse event date and time
            const eventDateStr = event.event_date
            const eventTimeStr = event.event_time || "00:00"

            const [hours, minutes] = eventTimeStr.split(":").map(Number)
            const eventDateTime = new Date(eventDateStr)
            eventDateTime.setHours(hours, minutes, 0, 0)

            // Calculate time difference
            const timeDiff = eventDateTime.getTime() - now.getTime()
            const minutesDiff = Math.floor(timeDiff / (1000 * 60))
            const eventDurationMinutes = 240 // 4 hours

            if (minutesDiff >= -eventDurationMinutes && minutesDiff <= 0) {
              // Event is currently happening
              happeningNowEvents.push({ ...event, event_status: "happening_now" })
            } else if (minutesDiff > 0) {
              // Event hasn't started yet
              upcomingEvents.push({ ...event, event_status: "upcoming" })
            }
            // Events that ended more than 4 hours ago are filtered out
          }
        }

        // Combine and sort by date
        const displayEvents = [...happeningNowEvents, ...upcomingEvents].sort(
          (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        )

        setEvents(displayEvents)
      } catch (err) {
        console.error("[v0] Failed to fetch events:", err)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [supabase])

  if (isLoading) {
    return (
      <section className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 md:p-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </section>
    )
  }

  // Get event dates for calendar highlighting
  const eventDates = events.map((e) => parseISO(e.event_date))

  const eventMatcher = (date: Date) => {
    return eventDates.some((eventDate) => isSameDay(date, eventDate))
  }

  const todayMatcher = (date: Date) => isToday(date)

  // Calendar month changes based on selected event, or shows current month if no events
  const calendarMonth = events.length > 0 
    ? parseISO(events[selectedEventIndex].event_date)
    : new Date()

  return (
    <section 
      className="relative overflow-hidden rounded-3xl border border-border p-6 md:p-10 w-full"
      style={{
        backgroundImage: "url('/images/nightlife-bg.png')",
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="flex flex-row gap-8 items-start">
        {/* Left Side - Calendar (Always Visible) */}
        <div className="w-2/5 flex-shrink-0">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white text-center">
              EVENT CALENDAR
            </h3>

            <div className="rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10">
              <DayPicker
                mode="single"
                selected={events.length > 0 ? parseISO(events[selectedEventIndex].event_date) : new Date()}
                month={calendarMonth}
                onMonthChange={() => {}}
                disabled={(date) => events.length > 0 ? (!eventMatcher(date) && !todayMatcher(date)) : false}
                modifiers={{
                  event: eventMatcher,
                  today: todayMatcher,
                }}
                modifiersStyles={{
                  event: {
                    backgroundColor: "#FF1B6D",
                    color: "white",
                    fontWeight: "bold",
                  },
                  today: {
                    border: "2px solid #FF1B6D",
                    fontWeight: "bold",
                  },
                }}
                classNames={{
                  months: "flex flex-col gap-2",
                  month: "space-y-2",
                  caption: "text-center font-semibold text-white mb-4 text-sm",
                  head_row: "flex justify-between mb-2",
                  head_cell: "w-10 text-xs font-bold text-white/80 text-center",
                  row: "flex justify-between w-full",
                  cell: "w-10 h-10",
                  day: "w-10 h-10 p-0 font-semibold text-sm rounded-lg hover:bg-white/20 transition-colors text-white/90",
                  day_selected: "!bg-pink-500 !text-white",
                  day_disabled: "opacity-20 text-white/40",
                }}
              />
            </div>

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-sm text-white/80">
                {events.length > 0 ? (
                  <>
                    <span className="font-bold text-white">{events.length}</span> events
                    scheduled
                  </>
                ) : (
                  "No upcoming events"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Event Carousel (Auto-scrolling) */}
        <div className="w-3/5 flex-1">
          {events.length > 0 ? (
            <EventCarousel 
              events={events} 
              autoPlay={true} 
              autoPlayInterval={5000}
              onEventChange={setSelectedEventIndex}
            />
          ) : (
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-6 text-center text-white/70 min-h-96 flex items-center justify-center">
              <p>No upcoming events at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
