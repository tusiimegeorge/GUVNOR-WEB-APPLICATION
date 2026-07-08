import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin-utils"
import { createClient } from "@/lib/supabase/server"
import AdminMediaClient from "./admin-media-client"

export default async function AdminMediaPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const supabase = await createClient()

  // Fetch all events for the dropdown
  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date")
    .order("event_date", { ascending: false })

  return <AdminMediaClient events={events || []} />
}
