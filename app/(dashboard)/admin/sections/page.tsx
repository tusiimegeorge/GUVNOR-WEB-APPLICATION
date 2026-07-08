import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, isSuperAdmin } from "@/lib/admin-utils"
import { SectionsClient } from "./sections-client"

export const dynamic = "force-dynamic"

export default async function AdminSectionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (!isAdmin(profile.role) && !isSuperAdmin(profile.role))) {
    redirect("/")
  }

  const { data: sections } = await supabase.from("club_sections").select("*").order("display_order")

  const { data: complementaries } = await supabase
    .from("complementaries")
    .select("*")
    .eq("is_available", true)
    .order("category, name")

  let sectionComps: any[] = []
  try {
    const { data } = await supabase
      .from("section_complementaries")
      .select("*")
    sectionComps = data || []
  } catch (error) {
    console.log("[v0] Section complementaries not available yet")
  }

  return <SectionsClient sections={sections || []} complementaries={complementaries || []} sectionComplementaries={sectionComps} />
}
