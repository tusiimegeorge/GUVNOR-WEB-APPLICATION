"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { X, ChevronLeft, ChevronRight, Video } from "lucide-react"
import type { EventVideo, EventPhoto } from "@/lib/types"

interface EventMediaModalProps {
  isOpen: boolean
  onClose: () => void
  type: "videos" | "photos" | "all"
  videos?: EventVideo[]
  photos?: EventPhoto[]
  eventId?: string
}

export function EventMediaModal({ isOpen, onClose, type, videos = [], photos = [], eventId }: EventMediaModalProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<"all" | "videos" | "photos">("all")
  const [selectedMediaId, setSelectedMediaId] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<"grid" | "detail">("grid")
  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set())

  // Get filtered media based on selected category
  const getFilteredMedia = (): (EventVideo | EventPhoto)[] => {
    if (selectedCategory === "all") {
      return [...(videos || []), ...(photos || [])]
    } else if (selectedCategory === "videos") {
      return videos || []
    } else {
      return photos || []
    }
  }

  const filteredMedia = React.useMemo(getFilteredMedia, [selectedCategory, videos, photos])
  const currentItem = selectedMediaId 
    ? filteredMedia.find(m => m.id === selectedMediaId) 
    : filteredMedia[0]
  const currentIndex = filteredMedia.findIndex(m => m.id === currentItem?.id)

  React.useEffect(() => {
    if (isOpen && currentItem && eventId) {
      trackView()
    }
  }, [isOpen, selectedMediaId, currentItem, eventId])

  const trackView = async () => {
    if (!currentItem || !eventId) return

    try {
      await fetch("/api/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video_url" in currentItem ? "video" : "photo",
          id: currentItem.id,
          eventId: eventId,
        }),
      })
    } catch (error) {
      console.error("Failed to track view:", error)
    }
  }

  const handlePrevious = () => {
    if (filteredMedia.length > 0) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : filteredMedia.length - 1
      setSelectedMediaId(filteredMedia[newIndex].id)
    }
  }

  const handleNext = () => {
    if (filteredMedia.length > 0) {
      const newIndex = currentIndex < filteredMedia.length - 1 ? currentIndex + 1 : 0
      setSelectedMediaId(filteredMedia[newIndex].id)
    }
  }

  const handleMediaClick = (mediaId: string) => {
    setSelectedMediaId(mediaId)
    setViewMode("detail")
  }

  const handleCategoryChange = (category: "all" | "videos" | "photos") => {
    setSelectedCategory(category)
    setSelectedMediaId(null)
    setViewMode("grid")
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
      if (e.key === "Escape") setViewMode("grid")
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, filteredMedia, currentIndex])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Event Gallery</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Category Tabs */}
        <div className="px-6 flex flex-wrap items-center justify-center gap-2 flex-shrink-0">
          <Badge
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer px-3 py-1 text-xs"
            onClick={() => handleCategoryChange("all")}
          >
            All ({(videos?.length || 0) + (photos?.length || 0)})
          </Badge>
          <Badge
            variant={selectedCategory === "videos" ? "default" : "outline"}
            className="cursor-pointer px-3 py-1 text-xs"
            onClick={() => handleCategoryChange("videos")}
          >
            Videos ({videos?.length || 0})
          </Badge>
          <Badge
            variant={selectedCategory === "photos" ? "default" : "outline"}
            className="cursor-pointer px-3 py-1 text-xs"
            onClick={() => handleCategoryChange("photos")}
          >
            Images ({photos?.length || 0})
          </Badge>
        </div>

        {/* Grid or Detail View */}
        {viewMode === "grid" ? (
          // Grid View
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMedia.map((item) => {
                  const isVideo = "video_url" in item
                  const imageSrc = isVideo 
                    ? (item.thumbnail_url || "/guvnor-logo.png")
                    : ("photo_url" in item ? item.photo_url : "/guvnor-logo.png")
                  const imageLoadFailed = failedImages.has(item.id)
                  
                  return (
                    <Card
                      key={item.id}
                      className="group cursor-pointer overflow-hidden border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20"
                      onClick={() => handleMediaClick(item.id)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-700 to-purple-900">
                        {/* Only show image if URL is not the fallback logo */}
                        {imageSrc !== "/guvnor-logo.png" && (
                          <img
                            src={imageSrc}
                            alt={("caption" in item ? item.caption : "") || ("title" in item ? item.title : "") || "Media"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                              setFailedImages(prev => new Set([...prev, item.id]))
                            }}
                          />
                        )}
                        
                        {/* Fallback content - only show if image load failed or no URL available */}
                        {(imageLoadFailed || imageSrc === "/guvnor-logo.png") && (
                          <div className="absolute inset-0 flex items-center justify-center p-3 text-center bg-gradient-to-br from-pink-600 via-purple-700 to-purple-900">
                            <div className="flex flex-col items-center gap-2">
                              {isVideo ? (
                                <>
                                  <Video className="w-10 h-10 text-white drop-shadow-lg" />
                                  <p className="text-white text-sm font-bold line-clamp-2">
                                    {"title" in item && item.title ? item.title : "Video"}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-white text-sm font-bold">📷</p>
                                  <p className="text-white text-xs font-semibold">
                                    {"caption" in item && item.caption ? item.caption : "Photo"}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Video indicator overlay - only on successful video loads */}
                        {isVideo && !imageLoadFailed && imageSrc !== "/guvnor-logo.png" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors pointer-events-none">
                            <div className="w-14 h-14 bg-pink-500/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Video className="w-7 h-7 text-white fill-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No media in this category
              </div>
            )}
          </div>
        ) : (
          // Detail View
          <div className="flex-1 overflow-y-auto px-6 py-6 relative flex items-center justify-center">
            {/* Navigation Buttons */}
            {filteredMedia.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 z-10"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 z-10"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Content Display */}
            <div className="w-full h-full flex flex-col items-center justify-center">
              {currentItem && "video_url" in currentItem ? (
                <div className="w-full max-h-[60vh]">
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
                <div className="w-full max-h-[60vh] flex flex-col items-center">
                  <img
                    key={currentItem.id}
                    src={currentItem.photo_url}
                    alt={currentItem.caption || "Event photo"}
                    className="max-w-full max-h-[55vh] object-contain rounded-lg"
                  />
                  <div className="mt-4 text-center">
                    {currentItem.caption && <p className="text-muted-foreground">{currentItem.caption}</p>}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Back to Grid Button */}
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 left-6"
              onClick={() => setViewMode("grid")}
            >
              ← Back to Grid
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
