"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { EventVideo, EventPhoto } from "@/lib/types"

interface EventMediaModalProps {
  isOpen: boolean
  onClose: () => void
  type: "videos" | "photos"
  videos?: EventVideo[]
  photos?: EventPhoto[]
  eventId?: string
}

export function EventMediaModal({ isOpen, onClose, type, videos = [], photos = [], eventId }: EventMediaModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const items = type === "videos" ? videos : photos
  const currentItem = items[currentIndex]

  React.useEffect(() => {
    if (isOpen && currentItem && eventId) {
      trackView()
    }
  }, [isOpen, currentIndex, currentItem, eventId])

  const trackView = async () => {
    if (!currentItem || !eventId) return

    try {
      await fetch("/api/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type === "videos" ? "video" : "photo",
          id: currentItem.id,
          eventId: eventId,
        }),
      })
    } catch (error) {
      console.error("Failed to track view:", error)
    }
  }
  // </CHANGE>

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, currentIndex])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center justify-between">
            <span>
              {type === "videos" ? "Video Gallery" : "Photo Gallery"} ({currentIndex + 1} / {items.length})
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 flex items-center justify-center p-6">
          {/* Navigation Buttons */}
          {items.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 z-10 bg-transparent"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 z-10 bg-transparent"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Content Display */}
          <div className="w-full h-full flex flex-col items-center justify-center">
            {type === "videos" && currentItem && "video_url" in currentItem ? (
              <div className="w-full max-h-[70vh]">
                <video
                  key={currentItem.id}
                  src={currentItem.video_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
                <div className="mt-4 text-center">
                  {currentItem.title && <h3 className="font-semibold text-lg">{currentItem.title}</h3>}
                  {currentItem.description && <p className="text-muted-foreground">{currentItem.description}</p>}
                </div>
              </div>
            ) : currentItem && "photo_url" in currentItem ? (
              <div className="w-full max-h-[70vh] flex flex-col items-center">
                <img
                  key={currentItem.id}
                  src={currentItem.photo_url || "/guvnor-logo.png"}
                  alt={currentItem.title || "Event photo"}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
                <div className="mt-4 text-center">
                  {currentItem.title && <h3 className="font-semibold text-lg">{currentItem.title}</h3>}
                  {currentItem.description && <p className="text-muted-foreground">{currentItem.description}</p>}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="px-6 pb-6">
          <div className="flex gap-2 overflow-x-auto">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex ? "border-primary" : "border-transparent"
                }`}
              >
                <img
                  src={
                    "photo_url" in item
                      ? item.photo_url
                      : "thumbnail_url" in item && item.thumbnail_url
                        ? item.thumbnail_url
                        : "/guvnor-logo.png"
                  }
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
