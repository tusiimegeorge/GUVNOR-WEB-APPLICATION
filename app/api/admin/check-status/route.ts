import { isAdminOrSuperAdmin } from "@/lib/admin-utils"
import { SUPERADMIN_CONFIG } from "@/lib/superadmin-config"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        isAdmin: false,
        userEmail: null,
        authenticated: false
      })
    }
    
    // Check admin status
    const isAdmin = await isAdminOrSuperAdmin()
    
    return NextResponse.json({ 
      isAdmin,
      userEmail: user.email,
      authenticated: true,
      isSuperadmin: user.email === SUPERADMIN_CONFIG.email
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Admin check error:", errorMsg)
    
    return NextResponse.json({ 
      isAdmin: false, 
      authenticated: false,
      error: errorMsg
    }, { status: 200 })
  }
}
