import { redirect } from "next/navigation"
import { isAdmin, isSuperAdmin } from "@/lib/admin-utils"
import BookingsContentClient from "./bookings-content-client"

export default async function BookingsContentPage() {
  const admin = await isAdmin()
  const superadmin = await isSuperAdmin()

  if (!admin && !superadmin) {
    redirect("/")
  }

  return <BookingsContentClient />
}
