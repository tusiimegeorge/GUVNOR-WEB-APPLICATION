"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const PREMIUM_MENU_IMAGES = [
  {
    id: 1,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-06%20at%202.05.14%20PM-gVhRA7UmAwFTGeGhWKA4sfJUM2SnfB.jpeg",
    title: "Premium Tequila",
    category: "Spirits",
  },
  {
    id: 2,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-06%20at%202.07.04%20PM%20%281%29-B65L2U4DWkcMhw5jPYa5jKB6MgIkyk.jpeg",
    title: "Donini 1942 Champagne",
    category: "Champagne",
  },
  {
    id: 3,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-06%20at%202.07.04%20PM-Z7UlKHCxRWUJepJn1uvb61TYonSDKS.jpeg",
    title: "Premium Champagne",
    category: "Champagne",
  },
  {
    id: 4,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-06%20at%202.07.06%20PM-dNWQ0NmC5HBfx0jfY7PPwwqmFfBsTq.jpeg",
    title: "Neon Champagne",
    category: "Champagne",
  },
  {
    id: 5,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-06-04%20at%2010.38.56%20PM%20%282%29-rDOoOa1cm87PGkat7h7HgfZMNHUNQS.jpeg",
    title: "Signature Bottle Service",
    category: "Premium Bottles",
  },
  {
    id: 6,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-06-04%20at%2010.38.57%20PM-qx4WP4IyzkD4iXNgrKZHF2gPguACSJ.jpeg",
    title: "Celebration Bottle",
    category: "Premium Bottles",
  },
  {
    id: 7,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-06-18%20at%207.20.53%20PM%20%281%29-AyKyFe4CQ6UpZuXEQBES0BIsceKM5x.jpeg",
    title: "Fresh Fruit Platter",
    category: "Appetizers",
  },
  {
    id: 8,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-06-18%20at%207.21.59%20PM-lLHrukSq1HTziFVbjUBj3dJ58Y61ka.jpeg",
    title: "Premium Beef with Fries",
    category: "Main Course",
  },
  {
    id: 9,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-06-21%20at%2012.52.35%20AM%20%281%29-j3bpeL8js8MXSe0sCVFGi3edRn56Wo.jpeg",
    title: "Grilled Skewers",
    category: "Main Course",
  },
  {
    id: 10,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-06-18%20at%207.20.54%20PM-f1wqO08WLqs2pxyGBhKLPgdpjfYNRy.jpeg",
    title: "Grilled Fish Fillet",
    category: "Main Course",
  },
  {
    id: 11,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-06-18%20at%207.20.53%20PM-Qb0m6KzYl8W3zWYpTIEy6m71gnURne.jpeg",
    title: "Seafood Platter",
    category: "Main Course",
  },
  {
    id: 12,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-06-20%20at%209.38.11%20PM-CLCnw2gdaz7slTY83Xcq1PsZr8XSPa.jpeg",
    title: "Lamb Ribs",
    category: "Main Course",
  },
  {
    id: 13,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-06-18%20at%207.21.59%20PM%20%281%29-6i4e1WaxzEWAY0zkkDfInvDHBG9lU9.jpeg",
    title: "Salmon in Orange Sauce",
    category: "Main Course",
  },
  {
    id: 14,
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-06%20at%202.07.02%20PM%20%281%29-s02wqtOGypBspZ2KxxdWS2EgXQyDiK.jpeg",
    title: "Bottle Service Celebration",
    category: "Premium Bottles",
  },
]

export default function MenuShowcaseCard() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return
    
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % PREMIUM_MENU_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [autoPlay])

  const nextImage = () => {
    setAutoPlay(false)
    setCurrentImageIndex((prev) => (prev + 1) % PREMIUM_MENU_IMAGES.length)
  }

  const prevImage = () => {
    setAutoPlay(false)
    setCurrentImageIndex((prev) => (prev - 1 + PREMIUM_MENU_IMAGES.length) % PREMIUM_MENU_IMAGES.length)
  }

  // Display 3 items at a time
  const visibleIndices = [
    currentImageIndex,
    (currentImageIndex + 1) % PREMIUM_MENU_IMAGES.length,
    (currentImageIndex + 2) % PREMIUM_MENU_IMAGES.length,
  ]

  return (
    <Card className="col-span-full rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden shadow-lg">
      <CardContent className="pt-6">
        {/* Premium Menu Carousel - 3 Items Display */}
        <div className="mb-8 rounded-2xl overflow-hidden border border-border/50 bg-card">
          {/* Navigation Controls */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="w-12" /> {/* Spacer for alignment */}
            <div className="flex gap-2">
              <button
                onClick={prevImage}
                className="bg-primary/20 hover:bg-primary/40 text-foreground p-2 rounded-lg transition-all"
                onMouseEnter={() => setAutoPlay(false)}
                onMouseLeave={() => setAutoPlay(true)}
                aria-label="Previous items"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="bg-primary/20 hover:bg-primary/40 text-foreground p-2 rounded-lg transition-all"
                onMouseEnter={() => setAutoPlay(false)}
                onMouseLeave={() => setAutoPlay(true)}
                aria-label="Next items"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3-Image Grid Carousel */}
          <div className="grid gap-3 grid-cols-3 p-4 overflow-hidden">
            {visibleIndices.map((index) => {
              const item = PREMIUM_MENU_IMAGES[index]
              return (
                <div
                  key={index}
                  className="group relative rounded-lg overflow-hidden bg-muted aspect-square hover:ring-2 hover:ring-primary transition-all duration-300 cursor-pointer"
                >
                  {/* Premium Item Image */}
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Text content - visible on hover */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-end text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-xs font-semibold text-primary mb-1">{item.category}</p>
                    <p className="font-semibold text-xs line-clamp-2">{item.title}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Carousel Indicators */}
          <div className="flex gap-1.5 justify-center p-4 border-t border-border/50">
            {PREMIUM_MENU_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setAutoPlay(false)
                  setCurrentImageIndex(index)
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "bg-primary w-4"
                    : "bg-primary/20 w-1.5 hover:bg-primary/40"
                }`}
                aria-label={`Go to item ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">Ready to experience the best?</p>
              <p className="text-sm text-muted-foreground">
                Explore our complete menu featuring over 25 premium categories and culinary masterpieces
              </p>
            </div>
            <Button asChild className="gap-2 whitespace-nowrap bg-primary hover:bg-primary/90">
              <a href="/menu">
                View Full Menu
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
