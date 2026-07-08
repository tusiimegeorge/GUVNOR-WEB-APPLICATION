"use server"

import { createClient } from "@/lib/supabase/server"
import { getServiceRoleClient } from "@/lib/supabase/service-role"

export async function setSuperAdminRole() {
  try {
    // Get the current authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        success: false, 
        error: "Not authenticated" 
      }
    }

    // Use service-role client to update the profile
    const db = getServiceRoleClient()
    const { error: updateError } = await db
      .from("profiles")
      .update({ role: "superadmin" })
      .eq("id", user.id)

    if (updateError) {
      return { 
        success: false, 
        error: updateError.message 
      }
    }

    return { 
      success: true, 
      message: `Successfully set ${user.email} as superadmin` 
    }
  } catch (error) {
    console.error("[v0] setSuperAdminRole error:", error)
    return { 
      success: false, 
      error: "Failed to set superadmin role" 
    }
  }
}
