import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin-utils"
import AdminEventsClient from "./admin-events-client"

export default async function AdminEventsPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  return <AdminEventsClient />
}
