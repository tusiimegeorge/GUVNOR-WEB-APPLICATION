"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"

export interface MediaItem {
  id: string
  type: "image" | "video"
  src: string
  title: string
  description?: string
}

interface MediaCarouselProps {
  items: MediaItem[]
  autoPlay?: boolean
  autoPlayInterval?: number
  videoAutoPlay?: boolean
}

export function MediaCarousel({
  items,
  autoPlay = true,
  autoPlayInterval = 5000,
  videoAutoPlay = false,
}: MediaCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!autoPlay || !items.length) return

    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % items.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, items.length])

  const scrollPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const scrollNext = () => {
    setSelectedIndex((prev) => (prev + 1) % items.length)
  }

  const scrollTo = (index: number) => {
    setSelectedIndex(index)
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-b from-primary/20 to-accent/20 p-6 text-center text-muted-foreground">
        No media items available
      </div>
    )
  }

  const currentItem = items[selectedIndex]

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black">
      {/* Carousel Display */}
      <div className="relative w-full aspect-video overflow-hidden">
        {currentItem.type === "image" ? (
          <img
            src={currentItem.src}
            alt={currentItem.title}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="relative w-full h-full bg-black">
            <video
              src={currentItem.src}
              className="w-full h-full object-cover"
              controls
              autoPlay={videoAutoPlay}
              muted={videoAutoPlay}
              loop={videoAutoPlay}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors pointer-events-none">
              <Play className="w-16 h-16 text-white opacity-70" />
            </div>
          </div>
        )}

        {/* Media Info Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
          <h3 className="text-xl font-bold text-white">{currentItem.title}</h3>
          {currentItem.description && (
            <p className="mt-2 text-sm text-white/80">{currentItem.description}</p>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all ${
              index === selectedIndex
                ? "w-8 h-2 bg-primary"
                : "w-2 h-2 bg-white/40 hover:bg-white/60"
            } rounded-full`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-white/20 text-white text-sm">
        {selectedIndex + 1} / {items.length}
      </div>
    </div>
  )
}
