import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/admin-utils"
import NavigationMenuClient from "./navigation-menu-client"

export default async function NavigationMenuPage() {
  const superadmin = await isSuperAdmin()

  if (!superadmin) {
    redirect("/admin")
  }

  return <NavigationMenuClient />
}
