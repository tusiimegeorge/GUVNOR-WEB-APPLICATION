"use client"

import { useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageLightboxProps {
  images: { id: string; image_url: string; title: string | null; description: string | null }[]
  currentIndex: number
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

export function ImageLightbox({ images, currentIndex, onClose, onPrevious, onNext }: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrevious()
      if (e.key === "ArrowRight") onNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, onPrevious, onNext])

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-background/20 hover:bg-background/40"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Previous Button */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}

      {/* Next Button */}
      {images.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}

      {/* Image */}
      <div className="relative max-w-6xl max-h-[80vh] flex flex-col items-center">
        <img
          src={currentImage.image_url || "/guvnor-logo.png"}
          alt={currentImage.title || "Gallery image"}
          className="max-w-full max-h-[70vh] object-contain rounded-lg"
        />

        {/* Image Info */}
        {(currentImage.title || currentImage.description) && (
          <div className="mt-4 text-center max-w-2xl">
            {currentImage.title && <h3 className="text-xl font-bold mb-2">{currentImage.title}</h3>}
            {currentImage.description && <p className="text-sm text-muted-foreground">{currentImage.description}</p>}
          </div>
        )}

        {/* Counter */}
        <div className="mt-4 text-sm text-muted-foreground">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Backdrop Click to Close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}
