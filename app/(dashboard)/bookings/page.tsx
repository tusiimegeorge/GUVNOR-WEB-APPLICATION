import { createClient } from "@/lib/supabase/server"
import { BookingManagementClient } from './booking-management-client'
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Book a Table - Guvnor",
}

export default async function BookTablePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ event?: string }> 
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Get authenticated user (optional - don't redirect if not logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all sections with their tables
  const { data: sections } = await supabase
    .from("club_sections")
    .select("*, tables(*)")
    .order("name")

  // Fetch all complementaries
  const { data: complementaries } = await supabase.from("complementaries").select("*").order("name")

  // Fetch table complementaries
  const { data: tableComplementaries } = await supabase.from("table_complementaries").select("*")

  // Fetch section complementaries
  const { data: sectionComplementaries } = await supabase.from("section_complementaries").select("*")

  // Fetch events for selection dropdown
  const { data: bookableEvents } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })

  let selectedEvent = null
  let sectionsWithTables = sections || []
  let tickets: any[] = []
  let tableBookings: any[] = []

  // If event is selected, filter tables by event
  if (params.event) {
    const eventId = params.event

    // Fetch selected event
    const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single()
    selectedEvent = event

    // Fetch tickets for this event
    const { data: eventTickets } = await supabase
      .from("tickets")
      .select("*")
      .eq("event_id", eventId)
    tickets = eventTickets || []

    // Fetch table_events for this event to see which tables are available
    const { data: tableEvents } = await supabase
      .from("table_events")
      .select("*, tables(*, club_sections(*))")
      .eq("event_id", eventId)
      .eq("is_active", true)

    // Fetch active bookings for tables in this event
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, table_id, user_id, payment_status, guest_name, booking_type")
      .eq("event_id", eventId)
      .eq("booking_type", "table")
      .in("payment_status", ["pending", "paid"])
    tableBookings = bookings || []

    if (tableEvents && tableEvents.length > 0) {
      // Deduplicate tables by ID to prevent duplicates
      const allTables = tableEvents.map((te) => te.tables).filter(Boolean)
      const uniqueTableMap = new Map()
      allTables.forEach((table: any) => {
        if (table && !uniqueTableMap.has(table.id)) {
          uniqueTableMap.set(table.id, table)
        }
      })
      const tablesForEvent = Array.from(uniqueTableMap.values())

      // Group tables by section
      const sectionMap = new Map()
      tablesForEvent.forEach((table: any) => {
        const section = table.club_sections
        if (section) {
          if (!sectionMap.has(section.id)) {
            sectionMap.set(section.id, {
              ...section,
              tables: [],
            })
          }
          sectionMap.get(section.id).tables.push(table)
        }
      })

      sectionsWithTables = Array.from(sectionMap.values())
    } else {
      sectionsWithTables = []
    }
  }

  return (
    <>
      <div className="min-h-screen pb-20">
        <BookingManagementClient
          selectedEvent={selectedEvent}
          sections={sectionsWithTables}
          complementaries={complementaries || []}
          tableComplementaries={tableComplementaries || []}
          sectionComplementaries={sectionComplementaries || []}
          tickets={tickets}
          user={user}
          bookableEvents={bookableEvents || []}
          tableBookings={tableBookings}
        />
      </div>
      <Footer />
    </>
  )
}
