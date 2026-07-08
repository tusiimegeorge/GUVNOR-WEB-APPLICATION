import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/admin-utils"
import { createClient } from "@/lib/supabase/server"
import { SocialMediaClient } from "./social-media-client"

export default async function SocialMediaPage() {
  const superadmin = await isSuperAdmin()

  if (!superadmin) {
    redirect("/admin")
  }

  const supabase = await createClient()

  // Fetch social links
  const { data } = await supabase
    .from("site_settings")
    .select("setting_value")
    .eq("setting_key", "social_media_links")
    .single()

  let socialLinks: any[] = []
  if (data?.setting_value) {
    socialLinks = Array.isArray(data.setting_value) ? data.setting_value : []
  }

  // Fetch payment configs
  const { data: paymentData } = await supabase
    .from("payment_configs")
    .select("id, provider, merchant_code, endpoint, is_production, is_active")
    .order("provider")

  return (
    <SocialMediaClient
      initialLinks={socialLinks}
      initialPaymentConfigs={paymentData || []}
    />
  )
}
