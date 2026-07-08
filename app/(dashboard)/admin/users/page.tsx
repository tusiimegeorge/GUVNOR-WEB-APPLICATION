import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/admin-utils" // Check for superadmin instead of admin
import AdminUsersClient from "./admin-users-client"

export default async function AdminUsersPage() {
  const superadmin = await isSuperAdmin() // Only superadmins can access user management

  if (!superadmin) {
    redirect("/")
  }

  return <AdminUsersClient />
}
