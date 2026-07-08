import { redirect } from "next/navigation"
import { isAdmin, isSuperAdmin } from "@/lib/admin-utils"
import AdminCommentsClient from "./admin-comments-client"

export default async function AdminCommentsPage() {
  const admin = await isAdmin()
  const superadmin = await isSuperAdmin()

  if (!admin && !superadmin) {
    redirect("/")
  }

  return <AdminCommentsClient />
}
