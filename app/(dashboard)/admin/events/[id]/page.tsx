import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import EventMediaClient from "./event-media-client"

export default async function EventMediaPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !event) {
    redirect("/admin/events")
  }

  return <EventMediaClient event={event} />
}
