"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackButton } from "@/components/back-button"
import { createClient } from "@/lib/supabase/client"
import { ShoppingCart, Ticket, Calendar, CheckCircle2, TrendingUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BookingRecord {
  id: string
  user_id: string
  event_id: string
  booking_type: "event" | "table"
  guest_name: string
  guest_email: string
  guest_phone: string | null
  number_of_guests: number
  total_price_in_cents: number
  payment_status: string
  booking_date: string
  events?: { title: string; event_date: string }
}

interface Event {
  id: string
  title: string
  event_date: string
  status: string
  total_tickets: number
  available_tickets: number
}

interface ScanStats {
  total_tickets: number
  scanned_tickets: number
  unscanned_tickets: number
  scan_percentage: number
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [scanStats, setScanStats] = useState<ScanStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const supabase = createClient()
  
  // Filter bookings by selected event
  const filteredBookings = selectedEventId && selectedEventId !== "all" 
    ? bookings.filter(b => b.event_id === selectedEventId)
    : bookings
  
  const ticketPurchases = filteredBookings.filter((b) => b.booking_type === "event" && b.payment_status === "paid")
  const tablePurchases = filteredBookings.filter((b) => b.booking_type === "table" && b.payment_status === "paid")
  const ticketBookings = filteredBookings.filter((b) => b.booking_type === "event" && b.payment_status !== "paid")
  const tableBookings = filteredBookings.filter((b) => b.booking_type === "table" && b.payment_status !== "paid")

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log("[v0] Starting to fetch bookings...")
        setLoading(true)
        setError(null)
        
        const { data, error: fetchError } = await supabase
          .from("bookings")
          .select("id, user_id, event_id, booking_type, guest_name, guest_email, guest_phone, number_of_guests, total_price_in_cents, payment_status, booking_date, events(title, event_date)")
          .order("booking_date", { ascending: false })

        if (fetchError) {
          console.error("[v0] Error from Supabase:", fetchError)
          throw fetchError
        }
        
        console.log("[v0] Fetched bookings:", data?.length || 0)
        setBookings((data || []) as BookingRecord[])
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error("[v0] Error fetching bookings:", errorMsg)
        setError(errorMsg)
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [supabase])

  // Fetch all events for dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("events")
          .select("id, title, event_date, status")
          .order("event_date", { ascending: false })

        if (fetchError) {
          console.error("[v0] Error fetching events:", fetchError.message, fetchError.code, fetchError.details)
          return
        }

        // Map to Event type with defaults for optional fields
        const mapped = (data || []).map((e: any) => ({
          ...e,
          total_tickets: e.total_tickets ?? 0,
          available_tickets: e.available_tickets ?? 0,
        }))
        setEvents(mapped as Event[])
        setSelectedEventId("all")
      } catch (err) {
        console.error("[v0] Error loading events:", err instanceof Error ? err.message : err)
      }
    }

    fetchEvents()
  }, [supabase])

  // Fetch scan statistics for selected event
  useEffect(() => {
    if (!selectedEventId || selectedEventId === "all") {
      setScanStats(null)
      return
    }

    const fetchScanStats = async () => {
      setLoadingStats(true)
      try {
        const { data, error: fetchError } = await supabase
          .from("tickets")
          .select("id, is_scanned")
          .eq("event_id", selectedEventId)

        if (fetchError) {
          console.error("[v0] Error fetching scan stats:", fetchError)
          setScanStats(null)
          return
        }

        const totalTickets = data?.length || 0
        const scannedTickets = data?.filter((t) => t.is_scanned).length || 0
        const unscannedTickets = totalTickets - scannedTickets
        const scanPercentage = totalTickets > 0 ? Math.round((scannedTickets / totalTickets) * 100) : 0

        setScanStats({
          total_tickets: totalTickets,
          scanned_tickets: scannedTickets,
          unscanned_tickets: unscannedTickets,
          scan_percentage: scanPercentage,
        })

        console.log("[v0] Scan stats for event:", {
          eventId: selectedEventId,
          totalTickets,
          scannedTickets,
          scanPercentage,
        })
      } catch (err) {
        console.error("[v0] Error calculating scan stats:", err)
        setScanStats(null)
      } finally {
        setLoadingStats(false)
      }
    }

    fetchScanStats()
  }, [selectedEventId, supabase])

  const BookingTable = ({ items }: { items: BookingRecord[] }) => (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest Name</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No bookings found
              </TableCell>
            </TableRow>
          ) : (
            items.map((booking) => (
              <TableRow key={booking.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{booking.guest_name}</TableCell>
                <TableCell>{booking.events?.title || "N/A"}</TableCell>
                <TableCell>
                  {booking.events?.event_date
                    ? format(new Date(booking.events.event_date), "MMM d, yyyy")
                    : "N/A"}
                </TableCell>
                <TableCell>{booking.number_of_guests}</TableCell>
                <TableCell>UGX {(booking.total_price_in_cents).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={booking.payment_status === "paid" ? "default" : "secondary"}
                  >
                    {booking.payment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{booking.guest_email}</p>
                    {booking.guest_phone && <p className="text-muted-foreground">{booking.guest_phone}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <BackButton fallbackUrl="/admin" />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Booking Status Management</h1>
          <p className="text-muted-foreground">
            View and manage all ticket and table bookings and purchases
          </p>
        </div>

        {/* Event Selector */}
        {!loading && !error && events.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Filter by Event
              </CardTitle>
              <CardDescription>
                Select an event to view its specific bookings and ticket scan statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-semibold mb-2 block">Select Event</Label>
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      {events.map((event) => {
                        const eventDate = new Date(event.event_date)
                        const isPast = eventDate < new Date()
                        const isToday = eventDate.toDateString() === new Date().toDateString()
                        const statusLabel = isPast ? "Past" : isToday ? "Happening Now" : "Upcoming"

                        return (
                          <SelectItem key={event.id} value={event.id}>
                            <div className="flex items-center gap-2">
                              <span>{event.title}</span>
                              <Badge
                                variant={isToday ? "default" : isPast ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {statusLabel}
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                {selectedEventId && selectedEventId !== "all" && (
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <p className="text-xs text-muted-foreground mb-1">Event Selected</p>
                    <p className="font-semibold text-purple-700">
                      {events.find((e) => e.id === selectedEventId)?.title || "Unknown"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading bookings...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <p className="text-red-500 font-semibold mb-2">Error Loading Bookings</p>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="ticket-bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="ticket-bookings" className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span className="hidden sm:inline">Ticket Bookings</span>
                <span className="sm:hidden">Tickets</span>
                <Badge variant="secondary" className="ml-1">{ticketBookings.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="table-bookings" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Table Bookings</span>
                <span className="sm:hidden">Reserved</span>
                <Badge variant="secondary" className="ml-1">{tableBookings.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="ticket-purchases" className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span className="hidden sm:inline">Ticket Purchases</span>
                <span className="sm:hidden">Bookings</span>
                <Badge variant="secondary" className="ml-1">{ticketPurchases.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="table-purchases" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Table Purchases</span>
                <span className="sm:hidden">Tables</span>
                <Badge variant="secondary" className="ml-1">{tablePurchases.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="scanned-tickets" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Scanned Tickets</span>
                <span className="sm:hidden">Scanned</span>
                <Badge variant="secondary" className="ml-1">
                  {scanStats ? scanStats.scanned_tickets : 0}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ticket-bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Bookings ({ticketBookings.length})</CardTitle>
                  <CardDescription>All event ticket reservations</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingTable items={ticketBookings} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table-bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Table Bookings ({tableBookings.length})</CardTitle>
                  <CardDescription>All VIP table reservations</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingTable items={tableBookings} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ticket-purchases">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Purchases ({ticketPurchases.length})</CardTitle>
                  <CardDescription>All confirmed ticket purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingTable items={ticketPurchases} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table-purchases">
              <Card>
                <CardHeader>
                  <CardTitle>Table Purchases ({tablePurchases.length})</CardTitle>
                  <CardDescription>All confirmed VIP table purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingTable items={tablePurchases} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scanned-tickets">
              <Card>
                <CardHeader>
                  <CardTitle>Scanned Tickets Tracking</CardTitle>
                  <CardDescription>
                    {selectedEventId === "all" 
                      ? "Please select a specific event above to view scan statistics"
                      : "Real-time ticket scanning statistics for the selected event"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedEventId === "all" ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-lg font-semibold mb-2">Select an Event</p>
                      <p className="text-muted-foreground">
                        Use the event selector above to view ticket scan statistics for a specific event
                      </p>
                    </div>
                  ) : loadingStats ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading scan data...</p>
                    </div>
                  ) : scanStats ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-purple-200">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-2">Total Tickets</p>
                              <p className="text-4xl font-bold text-purple-600">{scanStats.total_tickets}</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-green-200">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-2">Scanned</p>
                              <p className="text-4xl font-bold text-green-600 flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-8 h-8" />
                                {scanStats.scanned_tickets}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-slate-200">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-2">Pending</p>
                              <p className="text-4xl font-bold text-slate-600">{scanStats.unscanned_tickets}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-lg font-semibold">Scan Progress</p>
                            <p className="text-3xl font-bold text-purple-700">{scanStats.scan_percentage}%</p>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${scanStats.scan_percentage}%` }}
                            >
                              {scanStats.scan_percentage > 15 && (
                                <TrendingUp className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No ticket data available for this event</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Booking Details Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl">
            {selectedBooking && (
              <>
                <DialogHeader>
                  <DialogTitle>Booking Details</DialogTitle>
                  <DialogDescription>{selectedBooking.id}</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Guest Name</label>
                      <p className="text-lg font-medium">{selectedBooking.guest_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Email</label>
                      <p className="text-lg font-medium">{selectedBooking.guest_email}</p>
                    </div>
                    {selectedBooking.guest_phone && (
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                        <p className="text-lg font-medium">{selectedBooking.guest_phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Booking Type</label>
                      <p className="text-lg font-medium capitalize">
                        {selectedBooking.booking_type}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Event</label>
                      <p className="text-lg font-medium">{selectedBooking.events?.title || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Quantity</label>
                      <p className="text-lg font-medium">{selectedBooking.number_of_guests}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Total Price</label>
                      <p className="text-lg font-medium">
                        UGX {(selectedBooking.total_price_in_cents).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Payment Status</label>
                      <Badge
                        variant={selectedBooking.payment_status === "paid" ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {selectedBooking.payment_status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Booking Date</label>
                      <p className="text-lg font-medium">
                        {format(new Date(selectedBooking.booking_date), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
