import { redirect } from "next/navigation"
import { isAdmin, isSuperAdmin } from "@/lib/admin-utils"
import HomeContentClient from "./home-content-client"

export default async function HomeContentPage() {
  const admin = await isAdmin()
  const superadmin = await isSuperAdmin()

  if (!admin && !superadmin) {
    redirect("/")
  }

  return <HomeContentClient />
}
