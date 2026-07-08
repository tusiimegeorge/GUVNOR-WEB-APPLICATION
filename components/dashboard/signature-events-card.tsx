"use client"

import { useEffect, useState } from "react"
import { SignatureEventsVideoCarousel, type SignatureEventVideo } from "./signature-events-video-carousel"

export function SignatureEventsCard() {
  const [videos, setVideos] = useState<SignatureEventVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSignatureEvents = async () => {
      try {
        const response = await fetch("/api/public/homepage-slides")
        const data = await response.json()
        
        if (data.slides && Array.isArray(data.slides)) {
          const formattedVideos: SignatureEventVideo[] = data.slides.map((slide: any) => ({
            id: slide.id,
            title: slide.title || "",
            description: slide.description || "",
            video_url: slide.video_url || "",
            thumbnail_url: slide.image_url || slide.thumbnail_url || slide.poster_url || "",
          }))
          setVideos(formattedVideos)
        }
      } catch (err) {
        console.error("[v0] Failed to load signature events:", err)
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    loadSignatureEvents()
  }, [])

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <p className="text-sm font-bold text-primary mb-2">"Looking For A Vibe! Guvnor Has Got You Covered"</p>
        <h2 className="text-2xl md:text-3xl font-bold">Our Signature Events</h2>
        <p className="text-muted-foreground mt-2">Experience unforgettable moments at our legendary events</p>
      </div>

      {loading ? (
        <div className="w-full h-96 flex items-center justify-center rounded-2xl bg-card border border-border">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading signature events...</p>
          </div>
        </div>
      ) : videos.length > 0 ? (
        <SignatureEventsVideoCarousel videos={videos} autoPlayInterval={5000} />
      ) : (
        <div className="w-full h-96 flex items-center justify-center rounded-2xl bg-card border border-border">
          <p className="text-muted-foreground">No signature events available</p>
        </div>
      )}
    </div>
  )
}

// Kept for backwards compatibility
export function RoomCard({ title }: { title: string }) {
  return <SignatureEventsCard />
}
