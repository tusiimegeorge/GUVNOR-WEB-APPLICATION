import { redirect } from "next/navigation"
import { isAdmin, isSuperAdmin } from "@/lib/admin-utils"
import EventsContentClient from "./events-content-client"

export default async function EventsContentPage() {
  const admin = await isAdmin()
  const superadmin = await isSuperAdmin()

  if (!admin && !superadmin) {
    redirect("/")
  }

  return <EventsContentClient />
}
