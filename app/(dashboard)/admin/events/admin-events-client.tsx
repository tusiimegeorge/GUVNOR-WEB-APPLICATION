"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BackButton } from "@/components/back-button"
import { FileUploader } from "@/components/admin/file-uploader"
import type { Event } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, Plus, Calendar, X, Film } from "lucide-react"

export default function AdminEventsClient({ events: initialEvents = [] }: { events?: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents || [])
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pricingModel, setPricingModel] = useState<"free" | "standard" | "conditional">("standard")
  const [ticketPrice, setTicketPrice] = useState<string>("0")
  const [selectedStatus, setSelectedStatus] = useState<"happening_now" | "upcoming" | "past">("upcoming")
  const { toast } = useToast()
  const [pageLoading, setPageLoading] = useState(true)

  const supabase = createClient()

  // Function to calculate event status based on event_date
  function calculateEventStatus(eventDate: string): "happening_now" | "upcoming" | "past" {
    const eventDateTime = new Date(eventDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    eventDateTime.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((eventDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff < -1) {
      return "past"
    } else if (daysDiff >= -1 && daysDiff <= 1) {
      return "happening_now"
    } else {
      return "upcoming"
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    if (editingEvent) {
      setSelectedStatus(editingEvent.event_status || "upcoming")
      setPricingModel((editingEvent.pricing_model as "free" | "standard" | "conditional") || "standard")
      setTicketPrice(String(editingEvent.ticket_price_in_cents || 0))
    }
  }, [editingEvent])

  async function loadEvents() {
    setPageLoading(true)
    try {
      console.log("[v0] Loading events from admin...")
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false })

      if (error) {
        console.error("[v0] Error loading events:", error.message)
        return
      }

      if (data) {
        console.log("[v0] Successfully loaded events:", data.length)
        setEvents(data as Event[])
      } else {
        console.log("[v0] No events returned from database")
        setEvents([])
      }
    } catch (err: any) {
      console.error("[v0] Exception loading events:", err.message)
      setEvents([])
    } finally {
      setPageLoading(false)
    }
  }

  function handlePricingModelChange(model: string) {
    setPricingModel(model as "free" | "standard" | "conditional")
    if (model === "free") {
      setTicketPrice("0")
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const eventDate = formData.get("event_date") as string
      const calculatedStatus = calculateEventStatus(eventDate)

      const eventData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        event_date: eventDate,
        event_time: (formData.get("event_time") as string) || "",
        venue: formData.get("venue") as string,
        image_url: (formData.get("image_url") as string) || null,
        event_status: calculatedStatus,
        is_featured: calculatedStatus === "happening_now",
        total_tickets: Number.parseInt(formData.get("total_tickets") as string) || 0,
        available_tickets: editingEvent 
          ? editingEvent.available_tickets 
          : Number.parseInt(formData.get("total_tickets") as string) || 0,
        ticket_price_in_cents: Number.parseInt(formData.get("ticket_price") as string) || 0,
        pricing_model: (formData.get("pricing_model") as string) || "standard",
        pricing_notes: (formData.get("pricing_notes") as string) || null,
      }

      console.log("[v0] Creating event with data:", eventData)

      let error
      let createdEventId: string | null = null
      
      if (editingEvent) {
        const result = await supabase.from("events").update(eventData).eq("id", editingEvent.id)
        error = result.error
        createdEventId = editingEvent.id
        console.log("[v0] Update result:", { error })
      } else {
        const result = await supabase.from("events").insert([eventData]).select()
        error = result.error
        if (result.data && result.data.length > 0) {
          createdEventId = result.data[0].id
        }
        console.log("[v0] Insert result:", { error, eventId: createdEventId })
      }

      if (error) {
        console.error("[v0] Event save error:", error)
        toast({
          title: "Error",
          description: `Failed to save event: ${error.message}`,
          variant: "destructive",
        })
      } else {
        // For new events, create VIP member tickets automatically
        if (!editingEvent && createdEventId) {
          console.log("[v0] Creating VIP member tickets for new event:", createdEventId)
          
          // Fetch all VIP members
          const { data: vipMembers } = await supabase
            .from("profiles")
            .select("id, full_name, vip_qr_code")
            .eq("is_vip_member", true)

          if (vipMembers && vipMembers.length > 0) {
            console.log("[v0] Found", vipMembers.length, "VIP members")
            
            // Create tickets for each VIP member using their permanent QR code
            const vipTickets = vipMembers.map((member) => ({
              event_id: createdEventId,
              barcode: member.vip_qr_code,
              ticket_number: 0, // VIP tickets have ticket_number 0
              is_scanned: false,
              scanned_at: null,
              booking_id: null, // VIP tickets don't have bookings
              user_id: member.id,
              is_vip_ticket: true,
            }))

            const { error: ticketError } = await supabase.from("tickets").insert(vipTickets)

            if (ticketError) {
              console.error("[v0] Error creating VIP tickets:", ticketError)
            } else {
              console.log("[v0] Created", vipTickets.length, "VIP member tickets")
              
              // Reduce available tickets by number of VIP members
              const newAvailableTickets = eventData.available_tickets - vipMembers.length
              await supabase
                .from("events")
                .update({ available_tickets: Math.max(0, newAvailableTickets) })
                .eq("id", createdEventId)
              
              console.log("[v0] Reduced available tickets by", vipMembers.length, "for VIP members")
            }
          }
        }
        
        toast({
          title: "Success",
          description: `Event ${editingEvent ? "updated" : "created"} successfully`,
        })
        setDialogOpen(false)
        setEditingEvent(null)
        setSelectedStatus("upcoming")
        loadEvents()
      }
    } catch (err: any) {
      console.error("[v0] Exception during event submit:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to save event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return

    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Event deleted successfully",
      })
      loadEvents()
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="absolute top-4 left-4 z-10">
          <BackButton fallbackUrl="/admin" />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manage Events</h1>
          <p className="text-muted-foreground">Create and edit upcoming events</p>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingEvent(null)
                    setDialogOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(new FormData(e.currentTarget))
                  }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" name="title" defaultValue={editingEvent?.title} required />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingEvent?.description || ""}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_date">Event Date</Label>
                      <Input
                        id="event_date"
                        name="event_date"
                        type="date"
                        defaultValue={editingEvent?.event_date?.split("T")[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="event_time">Event Time</Label>
                      <Input
                        id="event_time"
                        name="event_time"
                        type="time"
                        defaultValue={editingEvent?.event_time || ""}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="venue">Venue</Label>
                      <Input id="venue" name="venue" defaultValue={editingEvent?.venue} required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="total_tickets">Total Tickets</Label>
                    <Input
                      id="total_tickets"
                      name="total_tickets"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="0"
                      defaultValue={editingEvent?.total_tickets || "0"}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricing_model">Pricing Model</Label>
                      <select
                        id="pricing_model"
                        name="pricing_model"
                        value={pricingModel}
                        onChange={(e) => handlePricingModelChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="free" className="text-gray-900">Free Entry</option>
                        <option value="standard" className="text-gray-900">Standard Pricing</option>
                        <option value="conditional" className="text-gray-900">Conditional (Free/Paid Mixed)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="ticket_price">Ticket Price (UGX)</Label>
                      <Input
                        id="ticket_price"
                        name="ticket_price"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        value={ticketPrice}
                        onChange={(e) => setTicketPrice(e.target.value)}
                        disabled={pricingModel === "free"}
                      />
                    </div>
                  </div>

                  {(pricingModel === "conditional" || pricingModel === "free") && (
                    <div>
                      <Label htmlFor="pricing_notes">
                        Pricing Notes {pricingModel === "conditional" ? "(for conditional pricing)" : "(for free entry)"}
                      </Label>
                      <textarea
                        id="pricing_notes"
                        name="pricing_notes"
                        placeholder={
                          pricingModel === "conditional"
                            ? "e.g., Women free, Men 50,000 UGX"
                            : "e.g., Free entry for ladies, RSVP required"
                        }
                        defaultValue={editingEvent?.pricing_notes || ""}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Event Category:</strong> Automatically determined based on event date. Events today/tomorrow are "Happening Now", past events are "Past Events", and future events are "Upcoming Events".
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="image_url">Event Image</Label>
                    <FileUploader
                      value={editingEvent?.image_url || ""}
                      onChange={(url) => {
                        const input = document.getElementById("image_url") as HTMLInputElement
                        if (input) input.value = url
                      }}
                      accept="image/*"
                      folder="events"
                    />
                    <input type="hidden" id="image_url" name="image_url" defaultValue={editingEvent?.image_url || ""} />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={loading}>
                      {editingEvent ? "Update" : "Create"} Event
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false)
                        setEditingEvent(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4">
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No events created yet. Click "Create Event" to add one.</p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        {event.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                      {event.description && <p className="text-sm mt-2">{event.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/events/${event.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Manage media for this event"
                        >
                          <Film className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingEvent(event)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Venue</p>
                      <p className="text-muted-foreground">{event.venue}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Tickets Available</p>
                      <p className="text-muted-foreground">
                        {event.available_tickets}/{event.total_tickets}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
