'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import type { Event } from '@/lib/types'
import { Ticket, AlertCircle, CheckCircle } from 'lucide-react'

interface TicketBookingFormProps {
  event: Event
  onBookingSuccess?: () => void
}

export function TicketBookingForm({ event, onBookingSuccess }: TicketBookingFormProps) {
  const [open, setOpen] = useState(false)
  const [numberOfTickets, setNumberOfTickets] = useState(1)
  const [loading, setLoading] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const { toast } = useToast()

  const availableTickets = event.available_tickets || 0
  const isOutOfStock = availableTickets <= 0

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Call booking API
      const response = await fetch('/api/bookings/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          number_of_guests: numberOfTickets,
          booking_type: 'event',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      toast({
        title: 'Success',
        description: `${numberOfTickets} ticket(s) booked successfully! Check your email for details and barcode.`,
      })

      setOpen(false)
      setGuestName('')
      setGuestEmail('')
      setGuestPhone('')
      setNumberOfTickets(1)
      onBookingSuccess?.()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to book tickets',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          disabled={isOutOfStock}
          className="w-full md:w-auto"
        >
          <Ticket className="w-5 h-5 mr-2" />
          Book Tickets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Tickets for {event.title}</DialogTitle>
        </DialogHeader>

        {isOutOfStock ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-center text-muted-foreground">
              Sorry, this event is sold out. No tickets available.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {availableTickets} <span className="text-sm text-muted-foreground">tickets available</span>
                </p>
              </CardContent>
            </Card>

            <div>
              <Label htmlFor="guest_name">Your Name *</Label>
              <Input
                id="guest_name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="guest_email">Email Address *</Label>
              <Input
                id="guest_email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your ticket barcode will be sent here
              </p>
            </div>

            <div>
              <Label htmlFor="guest_phone">Phone Number (Optional)</Label>
              <Input
                id="guest_phone"
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+256..."
              />
            </div>

            <div>
              <Label htmlFor="number_of_tickets">Number of Tickets *</Label>
              <div className="flex gap-2 items-center mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNumberOfTickets(Math.max(1, numberOfTickets - 1))}
                >
                  −
                </Button>
                <Input
                  id="number_of_tickets"
                  type="number"
                  min="1"
                  max={availableTickets}
                  value={numberOfTickets}
                  onChange={(e) => setNumberOfTickets(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center w-20"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNumberOfTickets(Math.min(availableTickets, numberOfTickets + 1))}
                >
                  +
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum {availableTickets} ticket(s) available
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : `Complete Booking (${numberOfTickets} ticket${numberOfTickets !== 1 ? 's' : ''})`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function TicketAvailabilityBadge({ event }: { event: Event }) {
  const available = event.available_tickets || 0
  const total = event.total_tickets || 0

  if (available <= 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
        <AlertCircle className="w-4 h-4" />
        Sold Out
      </div>
    )
  }

  if (available < total * 0.2) {
    // Less than 20% available - show warning
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
        <AlertCircle className="w-4 h-4" />
        Only {available} left!
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
      <CheckCircle className="w-4 h-4" />
      {available} Available
    </div>
  )
}
