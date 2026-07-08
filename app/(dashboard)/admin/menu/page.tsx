import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/admin-utils"
import AdminMenuClient from "./admin-menu-client"

export default async function AdminMenuPage() {
  const superadmin = await isSuperAdmin()

  if (!superadmin) {
    redirect("/admin")
  }

  return <AdminMenuClient />
}
