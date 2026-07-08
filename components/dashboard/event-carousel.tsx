"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { ChevronUp, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface Event {
  id: string
  title: string
  event_date: string
  event_time?: string
  location?: string
  description?: string
  event_status: string
  image_url?: string
  ticket_price_in_cents?: number
  pricing_model?: string
}

interface EventCarouselProps {
  events: Event[]
  autoPlay?: boolean
  autoPlayInterval?: number
  onEventChange?: (index: number) => void
}

export function EventCarousel({
  events,
  autoPlay = true,
  autoPlayInterval = 5000,
  onEventChange,
}: EventCarouselProps) {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false)

  // Notify parent when event changes
  useEffect(() => {
    onEventChange?.(selectedIndex)
  }, [selectedIndex, onEventChange])

  // Auto-scroll carousel every 5 seconds (unless paused)
  useEffect(() => {
    if (!autoPlay || !events.length || isAutoPlayPaused) return

    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % events.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, events.length, isAutoPlayPaused])

  const scrollPrev = () => {
    setIsAutoPlayPaused(true)
    setSelectedIndex((prev) => (prev - 1 + events.length) % events.length)
  }

  const scrollNext = () => {
    setIsAutoPlayPaused(true)
    setSelectedIndex((prev) => (prev + 1) % events.length)
  }

  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-b from-primary/20 to-accent/20 p-6 text-center text-muted-foreground">
        No upcoming events available
      </div>
    )
  }

  const currentEvent = events[selectedIndex]

  return (
    <div className="space-y-4">
      {/* Current Event Display */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border">
        {/* Event Image */}
        {currentEvent.image_url && (
          <div className="relative w-full h-48 md:h-56 overflow-hidden">
            <img
              src={currentEvent.image_url}
              alt={currentEvent.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              {currentEvent.event_status === "happening_now" ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  HAPPENING NOW
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                  UPCOMING
                </div>
              )}
            </div>

            {/* Event Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {currentEvent.title}
              </h3>
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className="p-6 space-y-4">
          {!currentEvent.image_url && (
            <h3 className="text-xl font-bold text-foreground">{currentEvent.title}</h3>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <span>
                {format(parseISO(currentEvent.event_date), "EEEE, MMM d")}
              </span>
              {currentEvent.event_time && (
                <>
                  <span>•</span>
                  <span>{currentEvent.event_time}</span>
                </>
              )}
            </div>

            {currentEvent.location && (
              <div className="text-muted-foreground">
                📍 {currentEvent.location}
              </div>
            )}
          </div>

          {currentEvent.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentEvent.description}
            </p>
          )}

          {/* Pricing and CTA Section */}
          <div className="space-y-3 pt-2">
            {currentEvent.pricing_model === "free" || currentEvent.ticket_price_in_cents === 0 ? (
              <div className="text-center py-2 px-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Free Entry
                </p>
              </div>
            ) : (
              <>
                {currentEvent.ticket_price_in_cents && currentEvent.ticket_price_in_cents > 0 && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">
                      UGX {currentEvent.ticket_price_in_cents.toLocaleString()}
                    </p>
                  </div>
                )}
                <button 
                  onClick={() => {
                    setIsAutoPlayPaused(true)
                    router.push(`/events?eventId=${currentEvent.id}`)
                  }}
                  className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Get Tickets
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
      {events.length > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={scrollPrev}
            aria-label="Previous event"
            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <ChevronUp className="w-5 h-5 text-primary" />
          </button>

          <div className="text-center">
            <div className="text-sm font-semibold text-muted-foreground">
              {selectedIndex + 1} of {events.length}
            </div>
            <div className="flex gap-1 mt-2 justify-center">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlayPaused(true)
                    setSelectedIndex(index)
                  }}
                  aria-label={`Go to event ${index + 1}`}
                  className={`transition-all ${
                    index === selectedIndex
                      ? "w-6 h-2 bg-primary"
                      : "w-2 h-2 bg-primary/30 hover:bg-primary/50"
                  } rounded-full`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={scrollNext}
            aria-label="Next event"
            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-primary" />
          </button>
        </div>
      )}
    </div>
  )
}
