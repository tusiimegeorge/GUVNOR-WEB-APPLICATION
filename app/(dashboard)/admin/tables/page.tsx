import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, isSuperAdmin } from "@/lib/admin-utils"
import { TablesClient } from "./tables-client"

export const dynamic = "force-dynamic"

export default async function AdminTablesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (!isAdmin(profile.role) && !isSuperAdmin(profile.role))) {
    redirect("/")
  }

  const { data: tables } = await supabase.from("tables").select("*, club_sections(*)").order("section_id").order("table_number")

  const { data: sections } = await supabase.from("club_sections").select("*")

  const { data: complementaries } = await supabase
    .from("complementaries")
    .select("*")
    .eq("is_available", true)
    .order("category, name")

  // Get today's date at midnight for comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date")
    .gte("event_date", today.toISOString())
    .order("event_date", { ascending: true })

  let tableComps: any[] = []
  try {
    const { data } = await supabase
      .from("table_complementaries")
      .select("*")
    tableComps = data || []
  } catch (error) {
    console.log("[v0] Table complementaries not available yet")
  }

  return <TablesClient tables={tables || []} sections={sections || []} complementaries={complementaries || []} events={events || []} tableComplementaries={tableComps} />
}
