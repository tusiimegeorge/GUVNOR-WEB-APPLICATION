"use client"

import { useState, useEffect } from "react"
import { ImageLightbox } from "@/components/image-lightbox"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { BackButton } from "@/components/back-button"
import { Footer } from "@/components/footer"
import type { GalleryImage } from "@/lib/types"

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.from("gallery").select("*").order("display_order", { ascending: true })

      if (data && !error) {
        setImages(data as GalleryImage[])
        setFilteredImages(data as GalleryImage[])
      }
      setLoading(false)
    }

    fetchImages()

    const interval = setInterval(fetchImages, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      setFilteredImages(images.filter((img) => img.category === selectedCategory))
    } else {
      setFilteredImages(images)
    }
  }, [selectedCategory, images])

  const categories = Array.from(new Set(images.map((img) => img.category).filter(Boolean))) as string[]

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? filteredImages.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === filteredImages.length - 1 ? 0 : prevIndex + 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-[var(--space-16)] relative">
      <div className="absolute top-[var(--space-3)] left-[var(--space-3)] z-10">
        <BackButton fallbackUrl="/" />
      </div>
      <div className="w-[95vw] max-w-7xl mx-auto px-[var(--padding-x)] py-[var(--space-6)]">
        <div className="text-center mb-[var(--space-6)]">
          <h1 className="text-[var(--text-4xl)] font-bold mb-[var(--space-2)] text-balance">Gallery</h1>
          <p className="text-[var(--font-size-base)] text-muted-foreground w-[95vw] max-w-2xl mx-auto text-pretty">
            Relive the energy and excitement from our past events
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-[var(--gap-sm)] mb-[var(--space-4)]">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-xs"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 text-xs"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Image Grid - Fixed 2 columns that scale proportionally */}
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-[var(--gap-md)]">
            {filteredImages.map((image, index) => (
              <Card
                key={image.id}
                className="group cursor-pointer overflow-hidden border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20"
                onClick={() => openLightbox(index)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={image.image_url || "/guvnor-logo.png"}
                    alt={image.title || "Gallery image"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {image.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs font-semibold text-balance">{image.title}</p>
                      {image.category && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {image.category}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">No images found in this category.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={filteredImages}
          currentIndex={currentImageIndex}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}
      <Footer />
    </div>
  )
}
