"use client"

import { useEffect, useState } from "react"
import { Instagram, Facebook, Twitter, Youtube, Globe } from "lucide-react"

interface SocialLink {
  id: string
  platform: string
  url: string
  icon?: string
}

const TikTokIcon = () => (
  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.08 1.61 2.88 2.88 0 0 1 4.47-2.63 3.16 3.16 0 0 0 1.1-2.16V6.72a5.79 5.79 0 0 0-5.48 3.72 4.38 4.38 0 0 1 3.86 4.28 4.37 4.37 0 0 1-4.31 4.41 4.36 4.36 0 0 1-4.35-4.35v-4.3A6.16 6.16 0 0 0 2.55 14.85v-3.97a6.16 6.16 0 0 0 6.67-5.59" />
  </svg>
)

const SnapchatIcon = () => (
  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.765 4.651A8.055 8.055 0 0 0 12.062 2c-4.464 0-8.29 3.31-8.29 7.388 0 2.023.815 3.913 2.14 5.268-.132.38-.22.783-.22 1.212 0 2.2 1.792 3.98 4 3.98h.29l.066.586c.108.967.992 1.735 2.055 1.735s1.947-.768 2.054-1.735l.066-.586h.29c2.208 0 4-1.78 4-3.98 0-.43-.088-.833-.22-1.212 1.325-1.355 2.14-3.245 2.14-5.268 0-.486-.04-.967-.12-1.438z" />
  </svg>
)

export function SocialMediaIcons() {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const fetchLinks = async () => {
      try {
        const response = await fetch("/api/public/social-media-links")
        if (!response.ok) {
          console.error("[v0] Failed to fetch social media links:", response.statusText)
          return
        }
        
        const data = await response.json()
        if (data.links && Array.isArray(data.links)) {
          setLinks(data.links)
        }
      } catch (err) {
        console.error("[v0] Failed to load social media links:", err)
      }
    }

    fetchLinks()
  }, [])

  if (!isMounted || links.length === 0) {
    return null
  }

  const getIcon = (platform: string, icon?: string) => {
    // Use icon field if provided, otherwise fall back to platform
    const iconType = icon ? icon.toLowerCase().replace(/[^a-z]/g, '') : platform.toLowerCase().replace(/[^a-z]/g, '')
    
    switch (iconType) {
      case 'instagram':
        return <Instagram className="size-5" />
      case 'facebook':
        return <Facebook className="size-5" />
      case 'tiktok':
        return <TikTokIcon />
      case 'snapchat':
        return <SnapchatIcon />
      case 'youtube':
        return <Youtube className="size-5" />
      case 'twitter':
      case 'x':
      case 'xtwitter':
        return <Twitter className="size-5" />
      case 'website':
        return <Globe className="size-5" />
      default:
        return null
    }
  }

  return (
    <div className="flex items-center gap-2">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-primary transition-colors p-1.5 hover:bg-muted rounded-full"
          aria-label={`Visit our ${link.platform}`}
        >
          {getIcon(link.platform, link.icon)}
        </a>
      ))}
    </div>
  )
}
