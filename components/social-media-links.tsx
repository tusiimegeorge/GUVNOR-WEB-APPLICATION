"use client"

import { Instagram, Facebook, Globe, Youtube, Music2, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface SocialMediaLinksProps {
  variant?: "horizontal" | "vertical"
  size?: "default" | "lg"
  showLabels?: boolean
}

type SocialLink = {
  id: string
  platform: string
  url: string
  icon?: string
}

export function SocialMediaLinks({
  variant = "horizontal",
  size = "default",
  showLabels = false,
}: SocialMediaLinksProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchSocialLinks() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("site_settings")
          .select("setting_value")
          .eq("setting_key", "social_media_links")
          .single()

        if (!isMounted) return

        if (error) {
          console.log("[v0] Social links fetch error:", error.message)
          setSocialLinks([])
        } else if (data?.setting_value) {
          console.log("[v0] Social links fetched:", data.setting_value)
          const value = data.setting_value
          // Handle both array format and old flat object format
          if (Array.isArray(value)) {
            setSocialLinks(value as SocialLink[])
          } else if (typeof value === 'object' && value !== null) {
            // Convert flat object format {instagram: "url", ...} to array format
            const converted: SocialLink[] = Object.entries(value)
              .filter(([_, url]) => url && typeof url === 'string' && url.trim() !== '')
              .map(([platform, url], index) => ({
                id: `legacy-${platform}`,
                platform,
                url: url as string,
              }))
            console.log("[v0] Converted legacy format:", converted)
            setSocialLinks(converted)
          } else {
            setSocialLinks([])
          }
        } else {
          console.log("[v0] No social links data found")
          setSocialLinks([])
        }
      } catch (err) {
        // Silently fail - social links are not critical
        if (isMounted) {
          setSocialLinks([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSocialLinks()

    return () => {
      isMounted = false
    }
  }, [])

  // Dynamic icon size using CSS clamp - scales with viewport
  const iconClass = "w-[clamp(12px,1.5vw,18px)] h-[clamp(12px,1.5vw,18px)]"
  
  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className={iconClass} />
      case "youtube":
        return <Youtube className={iconClass} />
      case "facebook":
        return <Facebook className={iconClass} />
      case "x":
      case "twitter":
        return <Twitter className={iconClass} />
      case "tiktok":
        return <Music2 className={iconClass} />
      case "snapchat":
        return <Music2 className={iconClass} />
      case "website":
        return <Globe className={iconClass} />
      default:
        return <Globe className={iconClass} />
    }
  }

  const getColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
      case "youtube":
        return "bg-red-600 hover:bg-red-700"
      case "facebook":
        return "bg-blue-600 hover:bg-blue-700"
      case "x":
      case "twitter":
        return "bg-black hover:bg-gray-900"
      case "tiktok":
        return "bg-black hover:bg-gray-900"
      case "snapchat":
        return "bg-yellow-400 hover:bg-yellow-500 text-black"
      case "website":
        return "bg-slate-700 hover:bg-slate-800"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  // Show something even while loading to prevent layout shift
  const activeLinks = socialLinks.filter((link) => link.url && link.url.trim() !== "")

  if (!loading && activeLinks.length === 0) {
    return null // Don't show anything if no links found
  }

  return (
    <div
      className={`flex ${variant === "horizontal" ? "flex-row items-center justify-center" : "flex-col items-start"} gap-[clamp(4px,0.5vw,12px)]`}
    >
      {showLabels && (
        <span className="text-[clamp(10px,1.2vw,14px)] font-semibold text-muted-foreground whitespace-nowrap">
          Follow Us:
        </span>
      )}
      <div className={`flex ${variant === "horizontal" ? "flex-row justify-center" : "flex-col"} gap-[clamp(4px,0.5vw,8px)]`}>
        {activeLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
            aria-label={`Follow us on ${link.platform}`}
          >
            <Button 
              size="sm" 
              className={`${getColor(link.icon || link.platform)} text-white border-0 h-[clamp(24px,3vw,36px)] px-[clamp(6px,1vw,16px)] text-[clamp(10px,1.2vw,14px)]`}
            >
              {getIcon(link.icon || link.platform)}
              {showLabels && <span className="ml-[clamp(2px,0.3vw,8px)] capitalize">{link.platform}</span>}
            </Button>
          </a>
        ))}
      </div>
    </div>
  )
}
