'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import JsBarcode from 'jsbarcode'
import html2canvas from 'html2canvas'
import type { Booking, Ticket } from '@/lib/types'

interface TicketData {
  ticket_id: string
  booking_id: string
  event_id: string
  barcode: string
  ticket_number: number
  user_email: string
  user_name: string
  event_title: string
  event_date: string
}

/**
 * Generate a unique barcode for a ticket
 */
export function generateBarcode(): string {
  // Format: EVENT_BOOKING_TICKET_TIMESTAMP_RANDOM
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TICKET-${timestamp}-${random}`
}

/**
 * Create tickets in the database for a confirmed booking
 */
export async function createTicketsForBooking(
  booking: Booking,
  eventId: string,
  numberOfTickets: number
): Promise<Ticket[]> {
  const supabase = createClient()
  const tickets: Ticket[] = []

  try {
    // Fetch table and section info if this is a table booking
    let tableInfo = null
    if (booking.table_id) {
      const { data: table } = await supabase
        .from('tables')
        .select('id, table_number, club_sections(name, layout_type)')
        .eq('id', booking.table_id)
        .single()
      
      if (table) {
        tableInfo = {
          table_id: table.id,
          table_number: table.table_number,
          section_name: table.club_sections?.name || null,
          layout_type: table.club_sections?.layout_type || null,
        }
        console.log('[v0] Table booking detected - adding table info to tickets:', tableInfo)
      }
    }

    for (let i = 1; i <= numberOfTickets; i++) {
      const barcode = generateBarcode()
      
      const ticketData: any = {
        booking_id: booking.id,
        event_id: eventId,
        barcode,
        ticket_number: i,
        is_scanned: false,
        scanned_at: null,
        barcode_image_url: null,
      }

      // Add table information if this is a table booking
      if (tableInfo) {
        ticketData.table_id = tableInfo.table_id
        ticketData.table_number = tableInfo.table_number
        ticketData.section_name = tableInfo.section_name
        ticketData.layout_type = tableInfo.layout_type
      }

      const { data, error } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
        .single()

      if (error) {
        console.error('[v0] Error creating ticket:', error)
      } else if (data) {
        tickets.push(data as Ticket)
      }
    }

    console.log('[v0] Created', tickets.length, 'tickets for booking', booking.id, tableInfo ? 'with table info' : 'without table info')
    return tickets
  } catch (err) {
    console.error('[v0] Exception creating tickets:', err)
    return []
  }
}

/**
 * Update available tickets when a booking is confirmed as paid
 */
export async function reduceAvailableTickets(eventId: string, quantity: number): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('available_tickets')
      .eq('id', eventId)
      .single()

    if (fetchError) {
      console.error('[v0] Error fetching event:', fetchError)
      return false
    }

    const newAvailable = Math.max(0, (event?.available_tickets || 0) - quantity)

    const { error: updateError } = await supabase
      .from('events')
      .update({ available_tickets: newAvailable })
      .eq('id', eventId)

    if (updateError) {
      console.error('[v0] Error updating available tickets:', updateError)
      return false
    }

    console.log('[v0] Reduced available tickets by', quantity, 'for event', eventId)
    return true
  } catch (err) {
    console.error('[v0] Exception reducing tickets:', err)
    return false
  }
}

/**
 * Generate barcode image for a ticket
 */
export async function generateBarcodeImage(barcode: string): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas')
    JsBarcode(canvas, barcode, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true,
    })

    return canvas.toDataURL('image/png')
  } catch (err) {
    console.error('[v0] Error generating barcode image:', err)
    return null
  }
}

/**
 * Mark a ticket as scanned with event validation
 */
export async function scanTicket(barcode: string, eventId?: string): Promise<{ success: boolean; ticket?: Ticket; message: string }> {
  const supabase = createClient()

  try {
    // Find ticket by barcode
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('*')
      .eq('barcode', barcode)
      .single()

    if (fetchError || !ticket) {
      return { success: false, message: 'Ticket not found' }
    }

    // Validate that ticket belongs to the specified event
    if (eventId && ticket.event_id !== eventId) {
      return { success: false, message: 'Ticket is not valid for this event', ticket }
    }

    if (ticket.is_scanned) {
      return { success: false, message: 'Ticket already scanned', ticket }
    }

    // Mark as scanned
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ is_scanned: true, scanned_at: new Date().toISOString() })
      .eq('id', ticket.id)

    if (updateError) {
      return { success: false, message: 'Failed to scan ticket' }
    }

    console.log('[v0] Ticket scanned successfully:', barcode)
    return { success: true, ticket, message: 'Ticket scanned successfully' }
  } catch (err) {
    console.error('[v0] Exception scanning ticket:', err)
    return { success: false, message: 'Error scanning ticket' }
  }
}

/**
 * Get all tickets for a booking
 */
export async function getBookingTickets(bookingId: string): Promise<Ticket[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('booking_id', bookingId)
      .order('ticket_number', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching tickets:', error)
      return []
    }

    return (data || []) as Ticket[]
  } catch (err) {
    console.error('[v0] Exception fetching tickets:', err)
    return []
  }
}

/**
 * Check if barcode is already used
 */
export async function isBarcodeUsed(barcode: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('id')
      .eq('barcode', barcode)
      .limit(1)

    if (error) {
      console.error('[v0] Error checking barcode:', error)
      return false
    }

    return (data?.length || 0) > 0
  } catch (err) {
    console.error('[v0] Exception checking barcode:', err)
    return false
  }
}

/**
 * Regenerate barcode for a ticket (for late comers)
 */
export async function regenerateTicketBarcode(ticketId: string): Promise<{ success: boolean; newBarcode?: string; message: string }> {
  const supabase = createClient()

  try {
    const newBarcode = generateBarcode()

    const { error } = await supabase
      .from('tickets')
      .update({ barcode: newBarcode, is_scanned: false, scanned_at: null })
      .eq('id', ticketId)

    if (error) {
      return { success: false, message: 'Failed to regenerate barcode' }
    }

    console.log('[v0] Barcode regenerated for ticket:', ticketId)
    return { success: true, newBarcode, message: 'Barcode regenerated successfully' }
  } catch (err) {
    console.error('[v0] Exception regenerating barcode:', err)
    return { success: false, message: 'Error regenerating barcode' }
  }
}
