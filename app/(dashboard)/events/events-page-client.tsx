"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, ImageIcon, Video, Eye, Ticket, Table2 } from "lucide-react"
import { VideoCarousel } from "@/components/video-carousel"
import { EventMediaModal } from "@/components/event-media-modal"
import { BackButton } from "@/components/back-button"
import { TicketBooking } from "@/components/ticket-booking"
import type { EventWithMedia } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface EventsPageClientProps {
  events: {
    upcoming: EventWithMedia[]
    happening_now: EventWithMedia[]
    past: EventWithMedia[]
  }
  user?: any
}

export function EventsPageClient({ events, user }: EventsPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean
    type: "videos" | "photos" | "all"
    eventId: string | null
  }>({
    isOpen: false,
    type: "all",
    eventId: null,
  })

  const [bookingModalOpen, setBookingModalOpen] = React.useState(false)
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null)
  const [ticketBookingOpen, setTicketBookingOpen] = React.useState(false)
  const [ticketEventId, setTicketEventId] = React.useState<string | null>(null)

  const getEventById = (eventId: string) => {
    const allEvents = [...events.upcoming, ...events.happening_now, ...events.past]
    return allEvents.find((e) => e.id === eventId)
  }

  // Handle eventId query parameter from home page
  useEffect(() => {
    const eventId = searchParams.get("eventId")
    if (eventId) {
      const event = getEventById(eventId)
      if (event) {
        setSelectedEventId(eventId)
        setBookingModalOpen(true)
        // Clean up query parameter
        window.history.replaceState({}, "", "/events")
      }
    }
  }, [searchParams])

  const openModal = (type: "videos" | "photos" | "all", eventId: string) => {
    setModalState({ isOpen: true, type, eventId })
  }

  const closeModal = () => {
    setModalState({ isOpen: false, type: "all", eventId: null })
  }

  const openBookingModal = (eventId: string) => {
    setSelectedEventId(eventId)
    setBookingModalOpen(true)
  }

  const handleBookingTypeSelect = (type: "ticket" | "table") => {
    const event = getEventById(selectedEventId!)
    
    // For free events, redirect to comments section
    if (event && event.ticket_price_in_cents === 0 && event.pricing_model === "free") {
      setBookingModalOpen(false)
      // Use window.location.href for instant navigation with hash
      window.location.href = "/#comments-section"
      return
    }

    // For standard pricing and conditional pricing
    if (type === "ticket") {
      // Open ticket booking payment dialog directly
      setTicketEventId(selectedEventId)
      setTicketBookingOpen(true)
    } else {
      // Table reservations
      if (event && event.pricing_model === "conditional") {
        // For conditional, tables through comments
        setBookingModalOpen(false)
        // Use window.location.href for instant navigation with hash
        window.location.href = "/#comments-section"
      } else {
        // For standard pricing, go to booking page
        router.push(`/bookings?event=${selectedEventId}`)
      }
    }
    setBookingModalOpen(false)
  }

  const currentEvent = modalState.eventId ? getEventById(modalState.eventId) : null

  const trackEventView = async (eventId: string, category: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      await fetch("/api/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event",
          eventId: eventId,
          eventCategory: category,
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
    } catch (error: any) {
      // Silently ignore abort errors and network errors for tracking
      if (error?.name === "AbortError") {
        console.log("[v0] Event view tracking request timed out")
      } else {
        console.log("[v0] Failed to track event view:", error?.message)
      }
    }
  }

  const renderEventSection = (
    title: string,
    sectionEvents: EventWithMedia[],
    badgeVariant: "default" | "secondary" | "outline",
    category: string,
    description?: string,
    showIfEmpty: boolean = true, // If false, only show if events have media
  ) => {
    // Check if any events have media
    const eventsWithMedia = sectionEvents.filter((event) => {
      const shortVideos = event.videos?.filter((v) => v.video_type === "short") || []
      const longVideos = event.videos?.filter((v) => v.video_type === "long") || []
      const photos = event.photos || []
      return shortVideos.length > 0 || longVideos.length > 0 || photos.length > 0
    })

    // If showIfEmpty is false and no events have media, don't show this section
    if (!showIfEmpty && eventsWithMedia.length === 0) {
      return null
    }

    return (
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            {title}
            <Badge variant={badgeVariant}>{sectionEvents.length}</Badge>
          </h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {sectionEvents.length === 0 ? (
          <p className="text-muted-foreground">No events in this category.</p>
        ) : (
          <div className="space-y-1">
            {sectionEvents.map((event) => {
              const shortVideos = event.videos?.filter((v) => v.video_type === "short") || []
              const longVideos = event.videos?.filter((v) => v.video_type === "long") || []
              const photos = event.photos || []
              const hasMedia = shortVideos.length > 0 || longVideos.length > 0 || photos.length > 0

              return (
                <Card 
                  key={event.id} 
                  onMouseEnter={() => trackEventView(event.id, category)} 
                  className="overflow-hidden relative h-[180px] group !bg-transparent !border-0 !p-0 !shadow-none !gap-0"
                >
                  <div className="flex w-full h-full">
                    {/* Event Image - Left Side (50%) - Fills card fully */}
                    <div className="w-1/2 flex-shrink-0 overflow-hidden h-full">
                    {event.image_url ? (
                      <img 
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Event Content - Right Side (50%) - Shows page background through backdrop blur */}
                  <div className="w-1/2 flex flex-col relative z-10 h-full p-4 backdrop-blur-md bg-black/30">
                    <div className="flex-1 flex flex-col min-w-0">
                      {/* Event Title and Action Button */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">{event.title}</h3>
                        {event.event_status !== "past" && (event.ticket_price_in_cents ?? 0) > 0 && (
                          <Button
                            onClick={() => {
                              setSelectedEventId(event.id)
                              setBookingModalOpen(true)
                            }}
                            className="text-xs h-6 px-2 flex-shrink-0"
                            variant="default"
                            size="sm"
                          >
                            Get Tickets
                          </Button>
                        )}
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="space-y-0.5 text-xs text-gray-200 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {new Date(event.event_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          {event.event_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                              <span className="line-clamp-1">{event.event_time}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="line-clamp-1 text-xs">{event.venue}</span>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-300 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Gallery & Actions - Justified layout */}
                    <div className="mt-auto w-full space-y-2">
                      {/* Pricing Info */}
                      {event.pricing_model === "free" || event.ticket_price_in_cents === 0 ? (
                        <div className="text-xs font-semibold text-green-300">
                          Free Entry
                        </div>
                      ) : (
                        <>
                          {event.ticket_price_in_cents && event.ticket_price_in_cents > 0 && (
                            <div className="text-xs font-semibold text-yellow-300">
                              Ticket: UGX {event.ticket_price_in_cents.toLocaleString()}
                            </div>
                          )}
                        </>
                      )}
                      
                      {hasMedia ? (
                        <button
                          onClick={() => openModal("all", event.id)}
                          className="w-full group cursor-pointer flex items-center justify-between gap-2 py-2 px-0 rounded text-xs hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3 text-gray-300 flex-shrink-0" />
                            <span className="text-gray-300 group-hover:text-white transition-colors">
                              Gallery
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {(shortVideos.length > 0 || longVideos.length > 0) && (
                              <Badge variant="outline" className="text-xs py-0 px-1 h-4 text-gray-300">
                                <Video className="h-2 w-2" />
                              </Badge>
                            )}
                            {photos.length > 0 && (
                              <Badge variant="outline" className="text-xs py-0 px-1 h-4 text-gray-300">
                                <ImageIcon className="h-2 w-2" />
                              </Badge>
                            )}
                            <span className="text-xs text-gray-300 font-semibold">
                              {(shortVideos.length + longVideos.length) + photos.length}
                            </span>
                          </div>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 py-2 px-0 text-xs text-gray-400">
                          <ImageIcon className="h-2.5 w-2.5 flex-shrink-0" />
                          <span className="italic text-xs">No media</span>
                        </div>
                      )}


                    </div>
                  </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="absolute top-4 left-4 z-10">
        <BackButton fallbackUrl="/" />
      </div>
      <div className="px-4 py-12 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Guvnor Events</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Experience the best nightlife with unforgettable events, world-class DJs, and incredible vibes
          </p>
        </div>

        {/* Happening Now Section - Always show */}
        {renderEventSection(
          "Happening Now",
          events.happening_now,
          "default",
          "happening_now",
          "Currently happening at Club Guvnor. Join the live action and experience the energy firsthand.",
          true
        )}

        {/* Upcoming Events Section - Always show */}
        {renderEventSection(
          "Upcoming Events",
          events.upcoming,
          "secondary",
          "upcoming",
          "Don't miss these exciting events coming soon. Reserve your spot now to secure your place.",
          true
        )}

        {/* Past Events Section - Always show */}
        {renderEventSection(
          "Past Events",
          events.past,
          "outline",
          "past",
          "Relive the magic of previous events. Check out photos and videos from amazing nights at Club Guvnor.",
          true
        )}
      </div>

      {/* Media Modal */}
      <EventMediaModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        videos={currentEvent?.videos}
        photos={currentEvent?.photos}
        eventId={modalState.eventId || undefined}
      />

      {/* Booking Selection Dialog */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEventId && getEventById(selectedEventId)?.pricing_model === "free" 
                ? "Reserve a Table" 
                : "How would you like to book?"}
            </DialogTitle>
            <DialogDescription>
              {selectedEventId && getEventById(selectedEventId)?.pricing_model === "free"
                ? "This is a free entry event. You can reserve a VIP table for premium seating."
                : "Select whether you want to book event tickets or reserve a VIP table"}
            </DialogDescription>
          </DialogHeader>
          
          {/* Pricing Information */}
          {selectedEventId && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              {getEventById(selectedEventId)?.pricing_model !== "free" && getEventById(selectedEventId)?.ticket_price_in_cents && getEventById(selectedEventId)?.ticket_price_in_cents > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Entry Ticket:</span>
                  <span className="font-semibold text-primary">
                    UGX {(getEventById(selectedEventId)?.ticket_price_in_cents || 0).toLocaleString()}
                  </span>
                </div>
              )}
              {getEventById(selectedEventId)?.pricing_model === "free" && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Entry:</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
              )}
            </div>
          )}
          
          <div className={selectedEventId && getEventById(selectedEventId)?.pricing_model === "free" ? "flex justify-center" : "grid grid-cols-2 gap-4"}>
            {selectedEventId && getEventById(selectedEventId)?.pricing_model !== "free" && (
              <Button
                onClick={() => handleBookingTypeSelect("ticket")}
                variant="outline"
                className="h-auto flex flex-col items-center justify-center gap-2 p-6"
              >
                <Ticket className="w-8 h-8" />
                <span className="text-center">Book Ticket</span>
              </Button>
            )}
            <Button
              onClick={() => handleBookingTypeSelect("table")}
              variant="outline"
              className="h-auto flex flex-col items-center justify-center gap-2 p-6"
            >
              <Table2 className="w-8 h-8" />
              <span className="text-center">Reserve Table</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Booking Payment Dialog */}
      <Dialog open={ticketBookingOpen} onOpenChange={setTicketBookingOpen}>
        <DialogContent className="max-w-2xl">
          <TicketBooking 
            event={ticketEventId ? getEventById(ticketEventId) : undefined} 
            hideAlternativeMessage={true}
            user={user}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
