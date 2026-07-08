import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/admin-utils"
import LocationContentClient from "./location-content-client"

export default async function LocationContentPage() {
  const superadmin = await isSuperAdmin()

  if (!superadmin) {
    redirect("/admin")
  }

  return <LocationContentClient />
}
