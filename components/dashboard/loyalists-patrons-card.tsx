"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const LOYAL_PATRONS = [
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-06-04%20at%2010.39.02%20PM%20%281%29-LQJSdHTO55yvnzYhxPCBqx3H6xp9Mw.jpeg",
    name: "VIP Loyalist",
    years: "Premium Member",
    description: "Enjoying exclusive experiences at Club Guvnor"
  },
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-06%20at%202.07.16%20PM-NKu69cX4VOYcZ5m1zQsUEw6Oim5L49.jpeg",
    name: "Celebration Vibes",
    years: "Premium Member",
    description: "Making unforgettable memories with friends"
  },
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-06%20at%202.07.11%20PM-ogS63k6ZTn8gBW19Jo3g2CLfSzDTCv.jpeg",
    name: "Champagne Night",
    years: "Premium Member",
    description: "Celebrating in style with premium bottle service"
  },
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-06%20at%202.05.13%20PM%20%281%29-V0i4300Tpc2DM2LnJi0zb7GA6Ig3ov.jpeg",
    name: "Party Enthusiast",
    years: "Premium Member",
    description: "Capturing the vibrant atmosphere and energy"
  },
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-06%20at%202.07.06%20PM%20%284%29-Z1C9xI5jZgjeVOfWrOZNSC0L3kErNx.jpeg",
    name: "Style Icon",
    years: "Premium Member",
    description: "Setting the tone at exclusive club events"
  },
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-07-06%20at%202.05.13%20PM%20%282%29-GWENGQE3ldLP49ia2kgyJlEQRbzCzR.jpeg",
    name: "Friends Forever",
    years: "Premium Members",
    description: "United by amazing nights at Club Guvnor"
  },
]

export function LoyalistsPatronsCard() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LOYAL_PATRONS.length)
    }, 6000) // Auto-scroll every 6 seconds

    return () => clearInterval(interval)
  }, [autoPlay])

  const handlePrev = () => {
    setAutoPlay(false)
    setCurrentIndex((prev) => (prev - 1 + LOYAL_PATRONS.length) % LOYAL_PATRONS.length)
  }

  const handleNext = () => {
    setAutoPlay(false)
    setCurrentIndex((prev) => (prev + 1) % LOYAL_PATRONS.length)
  }

  // Display 3 items at a time
  const visibleIndices = [
    currentIndex,
    (currentIndex + 1) % LOYAL_PATRONS.length,
    (currentIndex + 2) % LOYAL_PATRONS.length,
  ]

  return (
    <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Guvnor Loyalists & Patrons</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            className="h-8 w-8 p-0"
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-8 w-8 p-0"
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="grid gap-3 grid-cols-3 overflow-hidden">
        {visibleIndices.map((index) => {
          const patron = LOYAL_PATRONS[index]
          return (
            <div
              key={index}
              className="group relative rounded-lg overflow-hidden bg-muted aspect-square hover:ring-2 hover:ring-primary transition-all duration-300"
            >
              {/* Patron Image */}
              <Image
                src={patron.image}
                alt={patron.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Text content - visible on hover */}
              <div className="absolute inset-0 p-3 flex flex-col justify-end text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-semibold text-xs">{patron.name}</p>
                <p className="text-xs text-amber-400">{patron.years}</p>
                <p className="text-xs text-white/80 line-clamp-2 mt-1">{patron.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Scroll indicators */}
      <div className="flex gap-1.5 justify-center mt-4">
        {LOYAL_PATRONS.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setAutoPlay(false)
              setCurrentIndex(index)
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-primary w-4"
                : "bg-muted-foreground/40 w-1.5 hover:bg-muted-foreground/60"
            }`}
            aria-label={`Go to patron ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
