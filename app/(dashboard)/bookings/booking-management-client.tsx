"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Info } from "lucide-react"
import { SectionWithTables } from "@/components/section-with-tables"
import { TicketBooking } from "@/components/ticket-booking"
import { ClubLayout } from "@/components/club-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BackButton } from "@/components/back-button"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { FullscreenImageModal } from "@/components/fullscreen-image-modal"
import { AdminCustomerSearch } from '@/components/admin-customer-search'
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LayoutCard } from "@/components/layout-card"
import { SectionCard } from "@/components/section-card"

type Table = {
  id: string
  table_number: string
  capacity: number
  price_in_cents: number
  section_id: string
  description?: string
  status: string
}

type Section = {
  id: string
  name: string
  slug: string
  description: string
  background_image_url?: string
  blueprint_image_url?: string
  capacity: number
  layout_type: string
  tables: Table[]
}

type Complementary = {
  id: string
  name: string
  description: string
  category: string
  price_in_cents: number
  image_url?: string
}

type TicketType = {
  id: string
  ticket_type: string
  price: number
  total_available: number
  remaining: number
  description: string
  is_active: boolean
}

type Props = {
  selectedEvent?: any
  sections: Section[]
  complementaries: Complementary[]
  tableComplementaries?: any[]
  sectionComplementaries?: any[]
  tickets: TicketType[]
  user?: any
  bookableEvents?: any[]
  tableBookings?: any[]
}

const layoutImages = {
  main: "/images/main-guvnor-layout.jpeg",
  back: "/images/main-guvnor-back-layout.jpeg",
  nook: "/images/nook-area-layout.jpeg",
  "40+": "/images/40plus-layout.jpeg",
}

export function BookingManagementClient({ selectedEvent, sections, complementaries, tableComplementaries = [], sectionComplementaries = [], tickets, user, bookableEvents = [], tableBookings = [] }: Props) {
  const event = selectedEvent
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; title: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showBookingTypeModal, setShowBookingTypeModal] = useState(false)
  const [showCustomerSelector, setShowCustomerSelector] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  
  // Handle returning from login with pending payment
  useEffect(() => {
    const paymentType = searchParams.get("payment")
    if (paymentType === "ticket") {
      // Ticket payment flow - TicketBooking component will auto-open payment dialog
      // Scroll to ticket booking section after a brief delay to ensure render
      setTimeout(() => {
        const ticketElement = document.querySelector('[data-ticket-booking]')
        if (ticketElement) {
          ticketElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 500)
    } else if (paymentType === "table") {
      const pendingBooking = sessionStorage.getItem("pendingTableBooking")
      if (pendingBooking) {
        try {
          const booking = JSON.parse(pendingBooking)
          // Clear the sessionStorage
          sessionStorage.removeItem("pendingTableBooking")
          // Navigate directly to the booking page
          if (booking.sectionId && booking.tableId) {
            router.push(`/bookings/${booking.sectionId}/${booking.tableId}`)
          }
        } catch (error) {
          console.error("[v0] Error parsing pending table booking:", error)
        }
      }
    }
  }, [searchParams, sections])
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        setIsAdmin(profile?.role === "admin" || profile?.role === "superadmin")
      } catch (error) {
        console.log("[v0] Could not check admin status")
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user, supabase])



  const handleTableSelect = (table: Table, section: Section) => {
    // Check if user is logged in - if not, save booking and redirect to login
    if (!user) {
      const bookingData = {
        tableId: table.id,
        sectionId: section.id,
        eventId: event?.id,
      }
      sessionStorage.setItem("pendingTableBooking", JSON.stringify(bookingData))
            router.push(`/auth/login?returnTo=/bookings/${section.id}/${table.id}`)
      return
    }

    // User is logged in - navigate to booking form page
            router.push(`/bookings/${section.id}/${table.id}`)
  }




  // Filter sections based on whether event is selected
  // When event is selected, only show sections that have tables for that event
  const filteredSections = event
    ? sections.filter((s) => s.tables && s.tables.length > 0)
    : sections

  const mainSections = filteredSections.filter((s) => s.layout_type === "main")
  const backSections = filteredSections.filter((s) => s.layout_type === "back")
  const nookSections = filteredSections.filter((s) => s.layout_type === "nook")
  const fortyPlusSections = filteredSections.filter((s) => s.layout_type === "40+")

  // Check which layouts have sections with tables
  const hasMainSections = mainSections.length > 0
  const hasBackSections = backSections.length > 0
  const hasNookSections = nookSections.length > 0
  const hasFortyPlusSections = fortyPlusSections.length > 0

  // Render section content - show event selector if no event, otherwise show tables
  const renderSectionContent = (section: Section) => {
    if (!event) {
      // No event selected - check if there are bookable events
      if (bookableEvents.length > 0) {
        return (
          <div className="p-8 text-center space-y-4 bg-background/50 rounded-lg border border-dashed">
            <h3 className="text-lg font-semibold">Select an event to book a table in {section.name}</h3>
            <div className="max-w-sm mx-auto">
              <Select onValueChange={(eventId) => {
                router.push(`/bookings?event=${eventId}`)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {bookableEvents.map((evt: any) => (
                    <SelectItem key={evt.id} value={evt.id}>
                      {evt.title} - {new Date(evt.event_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      } else {
        return (
          <SectionCard
            title={section.name}
            description={section.description}
            backgroundImageUrl={section.background_image_url}
          >
            <div className="flex items-center justify-center min-h-[150px]">
              <p className="text-white text-center text-lg">
                No events available for booking in this section at this time.
              </p>
            </div>
          </SectionCard>
        )
      }
    }

    // Event selected - show tables
    if (!section.tables || section.tables.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground bg-background/50 rounded-lg border border-dashed">
          <p>No tables available in this section for the selected event.</p>
        </div>
      )
    }

    // Always show layout view with section component
    return (
      <SectionWithTables
        sections={[section]}
        complementaries={complementaries}
        tableComplementaries={tableComplementaries}
        sectionComplementaries={sectionComplementaries}
        tableBookings={tableBookings}
        user={user}
        isAdmin={isAdmin}
        onTableSelect={(selectedSection, table) => {
          handleTableSelect(table, selectedSection)
        }}
        eventTicketPrice={event?.ticket_price_in_cents || 0}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      <div className="absolute top-4 left-4 z-10">
        <BackButton fallbackUrl="/" />
      </div>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Book Your Experience</h1>
        <p className="text-muted-foreground text-lg">
          Reserve a table or purchase entry tickets for an unforgettable night at Club Guvnor
        </p>
      </div>

      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Browse our club layout and sections below. Click on any available table to book or scroll down to purchase
          entry tickets.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="main" className="w-full">
        <TabsList className="grid w-full mb-8 gap-0" style={{gridTemplateColumns: `repeat(${[hasMainSections, hasBackSections, hasNookSections, hasFortyPlusSections].filter(Boolean).length}, 1fr)`}}>
          {hasMainSections && (
            <TabsTrigger value="main" className="gap-2">
              <MapPin className="w-4 h-4" />
              Main Guvnor
            </TabsTrigger>
          )}
          {hasBackSections && (
            <TabsTrigger value="back" className="gap-2">
              <MapPin className="w-4 h-4" />
              Back Area
            </TabsTrigger>
          )}
          {hasNookSections && (
            <TabsTrigger value="nook" className="gap-2">
              <MapPin className="w-4 h-4" />
              Nook Area
            </TabsTrigger>
          )}
          {hasFortyPlusSections && (
            <TabsTrigger value="40plus" className="gap-2">
              <MapPin className="w-4 h-4" />
              40+ Area
            </TabsTrigger>
          )}
        </TabsList>

        {hasMainSections && (
          <TabsContent value="main" className="space-y-8">
            <div className="mb-8">
              <LayoutCard
                title="Main Guvnor Layout"
                imageUrl={mainSections[0]?.blueprint_image_url || layoutImages.main}
                onZoom={() => {
                  const blueprintUrl = mainSections[0]?.blueprint_image_url
                  if (blueprintUrl) {
                    setFullscreenImage({ url: blueprintUrl, title: "Main Guvnor Layout" })
                  }
                }}
              />
            </div>

            {mainSections.map((section) => (
              <div key={section.id} className="space-y-4">
                <h3 className="text-xl font-semibold">{section.name}</h3>
                {renderSectionContent(section)}
              </div>
            ))}
          </TabsContent>
        )}

        {hasBackSections && (
          <TabsContent value="back" className="space-y-8">
            <div className="mb-8">
              <LayoutCard
                title="Main Guvnor Back Area Layout"
                imageUrl={backSections[0]?.blueprint_image_url || layoutImages.back}
                onZoom={() => {
                  const blueprintUrl = backSections[0]?.blueprint_image_url
                  if (blueprintUrl) {
                    setFullscreenImage({ url: blueprintUrl, title: "Main Guvnor Back Area Layout" })
                  }
                }}
              />
            </div>

            {backSections.map((section) => (
              <div key={section.id} className="space-y-4">
                <h3 className="text-xl font-semibold">{section.name}</h3>
                {renderSectionContent(section)}
              </div>
            ))}
          </TabsContent>
        )}

        {hasNookSections && (
          <TabsContent value="nook" className="space-y-8">
            <div className="mb-8">
              <LayoutCard
                title="Nook Area Layout"
                imageUrl={nookSections[0]?.blueprint_image_url || layoutImages.nook}
                onZoom={() => {
                  const blueprintUrl = nookSections[0]?.blueprint_image_url
                  if (blueprintUrl) {
                    setFullscreenImage({ url: blueprintUrl, title: "Nook Area Layout" })
                  }
                }}
              />
            </div>

            {nookSections.map((section) => (
              <div key={section.id} className="space-y-4">
                <h3 className="text-xl font-semibold">{section.name}</h3>
                {renderSectionContent(section)}
              </div>
            ))}
          </TabsContent>
        )}

        {hasFortyPlusSections && (
          <TabsContent value="40plus" className="space-y-8">
            <div className="mb-8">
              <LayoutCard
                title="40+ Area Layout"
                imageUrl={fortyPlusSections[0]?.blueprint_image_url || layoutImages["40+"]}
                onZoom={() => {
                  const blueprintUrl = fortyPlusSections[0]?.blueprint_image_url
                  if (blueprintUrl) {
                    setFullscreenImage({ url: blueprintUrl, title: "40+ Area Layout" })
                  }
                }}
              />
            </div>

            {fortyPlusSections.map((section) => (
              <div key={section.id} className="space-y-4">
                <h3 className="text-xl font-semibold">{section.name}</h3>
                {renderSectionContent(section)}
              </div>
            ))}
          </TabsContent>
        )}
      </Tabs>

      {event && event.pricing_model !== "free" && (
        <div data-ticket-booking>
          <TicketBooking event={event} hideAlternativeMessage={searchParams.get("payment") === "ticket"} user={user} />
        </div>
      )}

      {fullscreenImage && (
        <FullscreenImageModal
          isOpen={!!fullscreenImage}
          imageUrl={fullscreenImage.url}
          title={fullscreenImage.title}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </div>
  )
}
