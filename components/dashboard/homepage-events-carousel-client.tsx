"use client"

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
  event_status: string
  image_url?: string
}

interface EventsCarouselCalendarClientProps {
  events: Event[]
}

export function EventsCarouselCalendarClient({ events }: EventsCarouselCalendarClientProps) {
  if (events.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 md:p-12">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground text-center">
            No upcoming events at the moment. Check back soon!
          </p>
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

  // Fixed to current month
  const currentMonth = new Date()

  return (
    <section className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 md:p-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Get Your Tickets</h2>
        <p className="text-muted-foreground">
          Select a date to view events and secure your spot.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Event Carousel (Auto-scrolling) */}
        <div className="flex-1">
          <EventCarousel events={events} autoPlay={true} autoPlayInterval={5000} />
        </div>

        {/* Right Side - Calendar (Fixed) */}
        <div className="w-full lg:w-80">
          <div className="rounded-2xl bg-background p-6">
            <h3 className="text-lg font-bold text-foreground text-center mb-4">
              EVENT CALENDAR
            </h3>

            <DayPicker
              mode="single"
              month={currentMonth}
              onMonthChange={() => {}}
              disabled={(date) => !eventMatcher(date) && !todayMatcher(date)}
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
                caption: "text-center font-semibold text-foreground mb-4 text-sm",
                head_row: "flex justify-between mb-2",
                head_cell: "w-8 text-xs font-bold text-muted-foreground text-center",
                row: "flex justify-between w-full",
                cell: "w-8 h-8",
                day: "w-8 h-8 p-0 font-semibold text-sm rounded-lg hover:bg-primary/10 transition-colors",
                day_selected: "!bg-primary !text-white",
                day_disabled: "opacity-30",
              }}
            />

            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{events.length}</span>{" "}
                events scheduled
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
