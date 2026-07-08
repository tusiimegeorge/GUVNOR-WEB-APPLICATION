import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin, isSuperAdmin } from "@/lib/admin-utils"
import { LayoutImagesClient } from "./layouts-client"

export const dynamic = "force-dynamic"

export default async function AdminLayoutsPage() {
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

  // Fetch all sections with their images
  const { data: sections } = await supabase
    .from("club_sections")
    .select("id, name, layout_type, blueprint_image_url, background_image_url")
    .order("layout_type")
    .order("name")

  // Group sections by layout type
  const sectionsByLayout: Record<string, any[]> = {}
  const layoutImages: Record<string, any> = {}
  const layoutTypes = ["main", "back", "nook", "40+"]

  layoutTypes.forEach((layoutType) => {
    const layoutSections = sections?.filter((s) => s.layout_type === layoutType) || []
    sectionsByLayout[layoutType] = layoutSections
    
    const sectionWithBlueprint = layoutSections.find((s) => s.blueprint_image_url)
    layoutImages[layoutType] = {
      layout_type: layoutType,
      blueprint_image_url: sectionWithBlueprint?.blueprint_image_url || null,
    }
  })

  return <LayoutImagesClient layoutImages={layoutImages} sectionsByLayout={sectionsByLayout} />
}
