"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Wine, X, CreditCard, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Table {
  id: string
  table_number: string
  capacity: number
  price_in_cents: number
  section_id: string
  status: string
  description?: string
}

interface Section {
  id: string
  name: string
  description: string
  background_image_url?: string
  tables: Table[]
}

interface Complementary {
  id: string
  name: string
  price_in_cents: number
}

interface TableBooking {
  id: string
  table_id: string
  user_id: string
  payment_status: string
  guest_name: string
  booking_type: string
}

export function SectionWithTables({ 
  sections,
  complementaries = [], 
  tableComplementaries = [], 
  sectionComplementaries = [],
  tableBookings = [],
  user,
  isAdmin = false,
  onTableSelect,
  eventTicketPrice = 0
}: { 
  sections?: Section[]
  complementaries?: Complementary[]
  tableComplementaries?: any[]
  sectionComplementaries?: any[]
  tableBookings?: TableBooking[]
  user?: any
  isAdmin?: boolean
  onTableSelect?: (section: Section, table: Table) => void
  eventTicketPrice?: number
}) {
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)
  const router = useRouter()

  const sectionsToRender = sections || []
  
  if (sectionsToRender.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No sections available
      </div>
    )
  }

  // Find booking for a table
  const getTableBooking = (tableId: string): TableBooking | undefined => {
    return tableBookings.find(b => b.table_id === tableId)
  }

  // Check if user can interact with a booked table
  const canAccessBookedTable = (booking: TableBooking): boolean => {
    if (!user) return false
    if (isAdmin) return true
    return booking.user_id === user.id
  }

  // Handle table click
  const handleTableClick = (table: Table, sectionForTable: Section) => {
    const booking = getTableBooking(table.id)

    if (!booking) {
      // Available table - proceed to booking form
      if (onTableSelect) {
        onTableSelect(sectionForTable, table)
      }
      return
    }

    // Reserved (pending) table - toggle action panel for authorized users
    if (booking.payment_status === "pending" && canAccessBookedTable(booking)) {
      setExpandedTableId(expandedTableId === table.id ? null : table.id)
      return
    }

    // Paid table or unauthorized - do nothing
  }

  // Handle pay now for reserved table
  const handlePayNow = (bookingId: string) => {
    router.push(`/payment?booking=${bookingId}`)
  }

  // Handle revoke reservation
  const handleRevoke = async (bookingId: string) => {
    if (!confirm("Are you sure you want to revoke this reservation? This action cannot be undone.")) return
    
    setIsRevoking(true)
    try {
      const res = await fetch("/api/bookings/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        // Refresh the page to show updated table status
        router.refresh()
        setExpandedTableId(null)
      }
    } catch {
      alert("Failed to revoke reservation. Please try again.")
    } finally {
      setIsRevoking(false)
    }
  }

  const getTableComplementaries = (tableId: string) => {
    return tableComplementaries
      .filter((tc: any) => tc.table_id === tableId)
      .map((tc: any) => {
        const comp = complementaries.find((c) => c.id === tc.complementary_id)
        return comp
      })
      .filter(Boolean)
  }

  const getSectionComplementaries = (sectionId: string) => {
    return sectionComplementaries
      .filter((sc: any) => sc.section_id === sectionId)
      .map((sc: any) => {
        const comp = complementaries.find((c) => c.id === sc.complementary_id)
        return comp
      })
      .filter(Boolean)
  }

  // Get color classes based on booking status
  const getTableColors = (booking: TableBooking | undefined) => {
    if (!booking) {
      // Available - green
      return {
        bg: "bg-green-500/80 border-green-600 hover:bg-green-600/90",
        status: "text-green-100",
        label: "Available",
      }
    }
    if (booking.payment_status === "paid") {
      // Paid - magenta
      return {
        bg: "bg-fuchsia-600/80 border-fuchsia-700",
        status: "text-fuchsia-100",
        label: "Booked",
      }
    }
    // Pending / Reserved - gray
    return {
      bg: "bg-gray-500/80 border-gray-600",
      status: "text-gray-100",
      label: "Reserved",
    }
  }

  // Check if table is clickable
  const isTableClickable = (table: Table) => {
    const booking = getTableBooking(table.id)
    if (!booking) return true // available
    if (booking.payment_status === "paid") return false // fully paid, not clickable
    if (booking.payment_status === "pending" && canAccessBookedTable(booking)) return true // owner/admin can click
    return false // other users can't click reserved tables
  }

  return (
    <>
      {sectionsToRender.map((currentSection) => (
        <div key={currentSection.id} className="mb-8">
          <div className="mb-4">
            <h3 className="text-2xl font-bold">{currentSection.name}</h3>
            <p className="text-muted-foreground">{currentSection.description}</p>
          </div>

          <Card 
            className="relative overflow-hidden min-h-[350px] p-8 border-0 shadow-lg bg-gradient-to-br from-slate-800 via-slate-900 to-black"
            style={currentSection.background_image_url ? {
              backgroundImage: `url('${currentSection.background_image_url}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'scroll',
            } : {}}
          >
            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50" />

            <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentSection.tables?.map((table) => {
                const tableComps = getTableComplementaries(table.id)
                const sectionComps = getSectionComplementaries(currentSection.id)
                const displayComps = tableComps.length > 0 ? tableComps : sectionComps
                const tablePrice = table.price_in_cents || 0
                const compsTotal = displayComps.reduce((sum: number, comp: any) => sum + (comp?.price_in_cents || 0), 0)
                const totalPrice = tablePrice + (eventTicketPrice * table.capacity) + compsTotal
                
                const booking = getTableBooking(table.id)
                const colors = getTableColors(booking)
                const clickable = isTableClickable(table)
                const isExpanded = expandedTableId === table.id
                
                return (
                  <div key={table.id} className="flex flex-col gap-1">
                    <button
                      onClick={() => handleTableClick(table, currentSection)}
                      disabled={!clickable}
                      className={`transition-all ${clickable ? "hover:scale-105 cursor-pointer" : "cursor-not-allowed opacity-80"}`}
                    >
                      <div className={`px-3 py-2 rounded-lg border-2 backdrop-blur-sm ${colors.bg}`}>
                        <div className="space-y-1">
                          <div className="font-bold text-white text-sm">{table.table_number}</div>
                          <div className="text-xs text-white flex items-center gap-1 justify-center">
                            <Users className="h-3 w-3" />
                            {table.capacity}
                          </div>
                          <div className="text-xs text-white font-semibold">
                            UGX {totalPrice.toLocaleString()}
                          </div>
                          {displayComps.length > 0 && (
                            <div
                              className="text-[10px] text-white/80 truncate max-w-[120px]"
                              title={displayComps.map((c: any) => c?.name).filter(Boolean).join(", ")}
                            >
                              +{displayComps.length} incl.
                            </div>
                          )}
                          <div className={`text-xs font-medium ${colors.status}`}>
                            {colors.label}
                          </div>
                          {booking?.payment_status === "pending" && booking.guest_name && (
                            <div className="text-[10px] text-white/70 truncate">
                              by {booking.guest_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Inline action panel for reserved tables */}
                    {isExpanded && booking?.payment_status === "pending" && (
                      <div className="bg-background border rounded-lg p-2 space-y-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold">Actions</span>
                          <button
                            onClick={() => setExpandedTableId(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <Button
                          size="sm"
                          className="w-full text-xs h-7 bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                          onClick={() => handlePayNow(booking.id)}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Pay Now
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full text-xs h-7"
                          onClick={() => handleRevoke(booking.id)}
                          disabled={isRevoking}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          {isRevoking ? "Revoking..." : "Revoke Reservation"}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      ))}
    </>
  )
}
