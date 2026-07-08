import { createClient } from "@/lib/supabase/server"
import { getServiceRoleClient } from "@/lib/supabase/service-role"
import { SUPERADMIN_CONFIG } from "./superadmin-config"
import { unstable_rethrow } from "next/navigation"

/**
 * Core helper: gets the current user and their role using a SINGLE auth client
 * call, then uses the service-role client for DB reads. This avoids the
 * LockManager contention that happens when multiple functions each call
 * `createClient()` independently.
 */
async function getCurrentUserWithRole(): Promise<{ user: any; role: string } | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Superadmin hardcoded by email - check FIRST and always return if matched
    if (user.email === SUPERADMIN_CONFIG.email) {
      return { user, role: "superadmin" }
    }

    // Use service-role client for DB read to avoid a second auth lock
    try {
      const db = getServiceRoleClient()
      const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single()
      const dbRole = profile?.role || "user"
      
      // If profile explicitly sets role to superadmin, use that
      if (dbRole === "superadmin") {
        return { user, role: "superadmin" }
      }
      
      return { user, role: dbRole }
    } catch (innerError) {
      // Don't swallow Next.js's internal dynamic-rendering / redirect / notFound
      // signals — only real DB errors should fall through to the fallback below.
      unstable_rethrow(innerError)
      return { user, role: user.email === SUPERADMIN_CONFIG.email ? "superadmin" : "user" }
    }
  } catch (error) {
    // Next.js throws a special internal error here when `cookies()` (used inside
    // createClient()) is called during static generation, so it can mark the
    // route as dynamic. If we swallow that like a normal error, the build will
    // instead try to fully prerender the page and crash on whatever auth check
    // runs next (e.g. requireAdmin throwing "Unauthorized"). Rethrow it so
    // Next.js can handle it correctly; only genuine errors get logged below.
    unstable_rethrow(error)
    console.error("[v0] getCurrentUserWithRole error:", error)
    return null
  }
}

export async function isAdmin() {
  const result = await getCurrentUserWithRole()
  if (!result) return false
  return result.role === "admin" || result.role === "superadmin"
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error("Unauthorized: Admin access required")
  }
  return true
}

export async function isSuperAdmin() {
  const result = await getCurrentUserWithRole()
  if (!result) return false
  return result.role === "superadmin"
}

export async function isAdminOrSuperAdmin() {
  const result = await getCurrentUserWithRole()
  if (!result) return false
  return result.role === "admin" || result.role === "superadmin"
}

export async function getUserRole() {
  const result = await getCurrentUserWithRole()
  return result?.role || "user"
}

export async function requireSuperAdmin() {
  const superadmin = await isSuperAdmin()
  if (!superadmin) {
    throw new Error("Unauthorized: Superadmin access required")
  }
  return true
}

export async function hasPermission(permission: string): Promise<boolean> {
  const role = await getUserRole()
  if (!role) return false

  const { ADMIN_PERMISSIONS } = await import("./superadmin-config")

  if (role === "superadmin") {
    return ADMIN_PERMISSIONS.superadmin.includes(permission)
  }

  if (role === "admin") {
    return ADMIN_PERMISSIONS.admin.includes(permission)
  }

  return false
}
