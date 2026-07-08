"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react"
import Image from "next/image"

interface Video {
  id: string
  url: string
  video_type: "short" | "long"
  thumbnail_url?: string
  title?: string
}

interface Photo {
  id: string
  url: string
  caption?: string
}

interface EventMediaGalleryProps {
  shortVideos: Video[]
  longVideos: Video[]
  photos: Photo[]
  eventId: string
}

export function EventMediaGallery({
  shortVideos,
  longVideos,
  photos,
  eventId,
}: EventMediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "video" | "photo"
    data: Video | Photo
    index: number
  } | null>(null)

  const allVideos = [...shortVideos, ...longVideos]
  const allMedia = [...allVideos, ...photos]

  const handlePrevious = () => {
    if (!selectedMedia) return
    const currentIndex = allMedia.findIndex(
      (m) =>
        ("video_type" in m ? m.id === selectedMedia.data.id : m.id === selectedMedia.data.id),
    )
    if (currentIndex > 0) {
      const prev = allMedia[currentIndex - 1]
      setSelectedMedia({
        type: "video_type" in prev ? "video" : "photo",
        data: prev,
        index: currentIndex - 1,
      })
    }
  }

  const handleNext = () => {
    if (!selectedMedia) return
    const currentIndex = allMedia.findIndex(
      (m) =>
        ("video_type" in m ? m.id === selectedMedia.data.id : m.id === selectedMedia.data.id),
    )
    if (currentIndex < allMedia.length - 1) {
      const next = allMedia[currentIndex + 1]
      setSelectedMedia({
        type: "video_type" in next ? "video" : "photo",
        data: next,
        index: currentIndex + 1,
      })
    }
  }

  return (
    <>
      <div className="space-y-8">
        {/* Short Form Videos (Reels/TikToks) */}
        {shortVideos.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Short Videos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {shortVideos.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() =>
                    setSelectedMedia({ type: "video", data: video, index: allMedia.indexOf(video) })
                  }
                  className="relative group overflow-hidden rounded-lg aspect-video bg-black"
                >
                  {video.thumbnail_url && (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title || "Video thumbnail"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Long Form Videos */}
        {longVideos.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Full Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {longVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() =>
                    setSelectedMedia({ type: "video", data: video, index: allMedia.indexOf(video) })
                  }
                  className="relative group overflow-hidden rounded-lg aspect-video bg-black"
                >
                  {video.thumbnail_url && (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title || "Video thumbnail"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <Play className="h-12 w-12 text-white fill-white" />
                  </div>
                  {video.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-white text-sm font-medium text-balance">{video.title}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() =>
                    setSelectedMedia({ type: "photo", data: photo, index: allMedia.indexOf(photo) })
                  }
                  className="relative group overflow-hidden rounded-lg aspect-square bg-gray-900"
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption || "Photo"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Media Viewer Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black border-0">
          {selectedMedia && (
            <div className="relative w-full h-full flex flex-col">
              {/* Close Button */}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Media Display */}
              <div className="flex-1 flex items-center justify-center bg-black">
                {selectedMedia.type === "video" ? (
                  <video
                    key={selectedMedia.data.id}
                    src={(selectedMedia.data as Video).url}
                    controls
                    autoPlay
                    className="max-h-[80vh] max-w-full"
                  />
                ) : (
                  <Image
                    src={(selectedMedia.data as Photo).url}
                    alt={(selectedMedia.data as Photo).caption || "Photo"}
                    fill
                    className="object-contain"
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between p-4 bg-black/80">
                <Button
                  onClick={handlePrevious}
                  disabled={selectedMedia.index === 0}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <span className="text-white text-sm">
                  {selectedMedia.index + 1} / {allMedia.length}
                </span>

                <Button
                  onClick={handleNext}
                  disabled={selectedMedia.index === allMedia.length - 1}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Caption (for photos) */}
              {selectedMedia.type === "photo" && (selectedMedia.data as Photo).caption && (
                <div className="bg-black/80 px-4 py-2 text-white text-sm">
                  {(selectedMedia.data as Photo).caption}
                </div>
              )}

              {/* Title (for long videos) */}
              {selectedMedia.type === "video" && (selectedMedia.data as Video).title && (
                <div className="bg-black/80 px-4 py-2 text-white text-sm">
                  {(selectedMedia.data as Video).title}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
