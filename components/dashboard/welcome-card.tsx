"use client"

import { MediaCarousel, type MediaItem } from "./media-carousel"

export function WelcomeCard() {
  const mediaItems: MediaItem[] = [
    {
      id: "1",
      type: "video",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CLUB%20GUVNOR-u2iKgYTusshpOngG4O86KnkOlzXj62.mp4",
      title: "Club Guvnor",
      description: "Welcome to the ultimate entertainment experience",
    },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-6 text-white">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left Side - Welcome Message */}
        <div className="max-w-xl md:w-2/5">
          <h1 className="text-balance text-3xl font-semibold">Welcome to Club Guvnor</h1>
          <p className="mt-2 text-sm leading-6 text-white/90">
            Experience the ultimate in entertainment and exclusive events. Join our vibrant community and discover premium experiences like never before.
          </p>
          <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
            <span className="text-2xl font-bold">✨</span>
            <div>
              <div className="font-medium">Premium Member Benefits</div>
              <div className="text-white/80">Exclusive access to all events</div>
            </div>
          </div>
        </div>

        {/* Right Side - Video Carousel */}
        <div className="w-full md:w-3/5 rounded-2xl overflow-hidden">
          <MediaCarousel
            items={mediaItems}
            autoPlay={false}
            videoAutoPlay={true}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
    </section>
  )
}
