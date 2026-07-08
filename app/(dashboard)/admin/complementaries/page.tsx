import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, isSuperAdmin } from "@/lib/admin-utils"
import { ComplementariesClient } from "./complementaries-client"

export const dynamic = "force-dynamic"

export default async function AdminComplementariesPage() {
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

  const { data: complementaries } = await supabase.from("complementaries").select("*").order("category, name")

  const { data: sections } = await supabase.from("club_sections").select("*").order("name")

  const { data: sectionComps } = await supabase
    .from("section_complementaries")
    .select("*, complementaries(*)")
    .order("section_id")

  const { data: tables } = await supabase
    .from("tables")
    .select("*, club_sections(name)")
    .order("table_number")

  const { data: tableComps } = await supabase
    .from("table_complementaries")
    .select("*, complementaries(*)")
    .order("table_id")

  return (
    <ComplementariesClient
      complementaries={complementaries || []}
      sections={sections || []}
      sectionComplementaries={sectionComps || []}
      tables={tables || []}
      tableComplementaries={tableComps || []}
    />
  )
}
