"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MobileMoneyPayment } from "@/components/payment/mobile-money-payment"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Event } from "@/lib/types"

export function TicketBooking({ event, hideAlternativeMessage, user }: { event?: Event; hideAlternativeMessage?: boolean; user?: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingId, setBookingId] = useState<string>("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Auto-open payment dialog if user returned from login with a pending ticket booking
  useEffect(() => {
    const paymentType = searchParams.get("payment")
    if (paymentType !== "ticket" || !event || !user) return

    const pendingBooking = sessionStorage.getItem("pendingTicketBooking")
    if (!pendingBooking) return

    // User is logged in and has a pending ticket booking - open payment directly
    setShowPayment(true)
    // Clean up the URL
    window.history.replaceState({}, "", `/book-table?event=${event.id}`)
  }, [searchParams, event, user])

  // Hide section if no event selected or event is free
  if (!event || event.ticket_price_in_cents === 0) {
    return null
  }

  const handleBuyTicket = async () => {
    setIsLoading(true)

    if (!user) {
      // Store booking details in sessionStorage for after login
      sessionStorage.setItem(
        "pendingTicketBooking",
        JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          price: event.ticket_price_in_cents,
        })
      )
      // Redirect to login with return URL - properly encode the return URL
      const returnUrl = `/book-table?event=${event.id}&payment=ticket`
      router.push(`/auth/login?returnTo=${encodeURIComponent(returnUrl)}`)
      setIsLoading(false)
      return
    }

    // User is logged in - proceed to payment directly
    setShowPayment(true)
    setIsLoading(false)
  }

  const handlePaymentSuccess = async (transactionId: string) => {
    const supabase = createClient()

    if (!user) {
      router.push(`/book-table`)
      return
    }

    // Create booking after successful payment
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        event_id: event.id,
        booking_type: "event",
        transaction_type: "purchase",
        guest_name: user.user_metadata?.full_name || "",
        guest_email: user.email || "",
        number_of_guests: 1,
        total_price_in_cents: event.ticket_price_in_cents,
        payment_status: "paid",
        transaction_id: transactionId,
        booking_date: new Date().toISOString(),
      })

    if (!error && booking) {
      // Clear pending booking from session
      sessionStorage.removeItem("pendingTicketBooking")
    }

    setShowPayment(false)
    router.push(`/book-table`)
  }

  const priceInUGX = event.ticket_price_in_cents
  const availableTickets = event.available_tickets || 0

  return (
    <>
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Entry Tickets
          </CardTitle>
          <CardDescription>Purchase general entry tickets for {event.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Alternative ticket option message - only show if not coming from direct ticket purchase */}
            {!hideAlternativeMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Can't afford a table?</strong> You can purchase an entry ticket instead and enjoy the event without a reserved table.
                </p>
              </div>
            )}

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">General Entry</h3>
                <p className="text-sm text-muted-foreground mt-1">Access to the event</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">UGX {priceInUGX.toLocaleString()}</p>
                <div className="mt-2 flex gap-2 flex-col">
                  <Badge variant={availableTickets > 0 ? "default" : "secondary"}>
                    {availableTickets > 0 ? `${availableTickets} Available` : "Sold Out"}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              onClick={handleBuyTicket}
              disabled={isLoading || availableTickets === 0}
              className="w-full"
              size="lg"
            >
              <Ticket className="w-4 h-4 mr-2" />
              {availableTickets === 0 ? "Sold Out" : isLoading ? "Processing..." : "Buy Ticket"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Pay UGX {priceInUGX.toLocaleString()} for entry to {event.title}
            </DialogDescription>
          </DialogHeader>
          <MobileMoneyPayment
            amount={priceInUGX}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPayment(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
