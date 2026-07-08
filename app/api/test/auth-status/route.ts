import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SUPERADMIN_CONFIG } from "@/lib/superadmin-config"
import { isAdminOrSuperAdmin, getUserRole } from "@/lib/admin-utils"

/**
 * This endpoint is for debugging authentication issues.
 * It shows detailed information about the current authentication state.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    const diagnostics = {
      authenticated: !!user,
      userEmail: user?.email || null,
      userId: user?.id || null,
      expectedSuperadminEmail: SUPERADMIN_CONFIG.email,
      emailsMatch: user?.email === SUPERADMIN_CONFIG.email,
      emailMatchCaseInsensitive: user?.email?.toLowerCase() === SUPERADMIN_CONFIG.email?.toLowerCase(),
      userError: userError?.message || null,
    }

    // Only check role if authenticated
    let roleInfo = null
    if (user) {
      try {
        const isAdmin = await isAdminOrSuperAdmin()
        const role = await getUserRole()
        roleInfo = {
          isAdmin,
          role,
        }
      } catch (error) {
        roleInfo = {
          error: error instanceof Error ? error.message : "Failed to check role",
        }
      }
    }

    return NextResponse.json({
      status: "ok",
      diagnostics,
      roleInfo,
      instructions: {
        message: "Authentication Diagnostic Info",
        details: [
          "1. If 'authenticated' is false, user is not logged in",
          "2. If authenticated is true but 'emailsMatch' is false, superadmin email must match config",
          "3. Update SUPERADMIN_CONFIG.email in /lib/superadmin-config.ts to match your admin email",
          `4. Current expected superadmin email: ${SUPERADMIN_CONFIG.email}`,
          "5. Login with the correct email to enable admin access",
        ],
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
