"use client"

import { Instagram, Facebook, ExternalLink } from "lucide-react"
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
  
  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "instagram":
        return <Instagram className={iconClass} />
      case "youtube":
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        )
      case "facebook":
        return <Facebook className={iconClass} />
      case "x":
      case "twitter":
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        )
      case "tiktok":
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        )
      case "snapchat":
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.166.096c.456 0 2.691.135 3.727 1.928.474.822.34 2.087.248 2.841l-.016.134c-.062.499-.093.748.12.895.156.107.405.131.765.164l.136.013c.296.027.592.054.875.097.644.099 1.573.419 1.665 1.355.044.448-.16.88-.574 1.215-.637.516-1.586.706-2.164.823l-.159.032c-.356.072-.501.099-.544.192-.042.092.041.238.189.46l.062.094c.883 1.319 2.018 3.015 3.442 3.567.302.117.464.244.498.388.053.227-.13.497-.502.739-.577.375-1.549.526-2.141.626-.128.021-.247.041-.349.063-.11.024-.187.047-.239.068-.115.048-.174.098-.193.153-.055.154.046.385.328.778.062.086.13.177.206.277.74.971 1.918 2.52.844 3.546-.705.674-2.027.828-3.065.95-.36.042-.73.086-1.049.148-.12.024-.258.087-.376.143l-.167.082c-.483.237-1.215.597-2.167.597-.002 0-.004 0-.006 0-.952 0-1.684-.36-2.167-.597l-.167-.082c-.118-.056-.255-.119-.376-.143-.319-.062-.689-.106-1.049-.148-1.037-.122-2.36-.276-3.065-.95-1.073-1.026.104-2.575.844-3.546.076-.1.144-.191.206-.277.282-.393.383-.624.328-.778-.019-.055-.078-.105-.193-.153-.052-.021-.129-.044-.239-.068-.102-.022-.221-.042-.349-.063-.592-.1-1.564-.251-2.141-.626-.372-.242-.555-.512-.502-.739.034-.144.196-.271.498-.388 1.424-.552 2.559-2.248 3.442-3.567l.062-.094c.148-.222.231-.368.189-.46-.043-.093-.188-.12-.544-.192l-.159-.032c-.578-.117-1.527-.307-2.164-.823-.414-.335-.618-.767-.574-1.215.092-.936 1.021-1.256 1.665-1.355.283-.043.579-.07.875-.097l.136-.013c.36-.033.609-.057.765-.164.213-.147.182-.396.12-.895l-.016-.134c-.092-.754-.226-2.019.248-2.841C9.475.231 11.71.096 12.166.096z"/>
          </svg>
        )
      default:
        return <ExternalLink className={iconClass} />
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
            <Button size="sm" className={`${getColor(link.platform)} text-white border-0 h-[clamp(24px,3vw,36px)] px-[clamp(6px,1vw,16px)] text-[clamp(10px,1.2vw,14px)]`}>
              {getIcon(link.platform)}
              {showLabels && <span className="ml-[clamp(2px,0.3vw,8px)] capitalize">{link.platform}</span>}
            </Button>
          </a>
        ))}
      </div>
    </div>
  )
}
