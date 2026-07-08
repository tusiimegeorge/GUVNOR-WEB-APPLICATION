"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface SignatureEventVideo {
  id: string
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  date?: string
}

interface SignatureEventsVideoCarouselProps {
  videos: SignatureEventVideo[]
  autoPlayInterval?: number
}

export function SignatureEventsVideoCarousel({
  videos,
  autoPlayInterval = 5000,
}: SignatureEventsVideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlayingWithSound, setIsPlayingWithSound] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  const currentVideo = videos[currentIndex]

  useEffect(() => {
    // Autoplay video muted when slide changes
    if (videoRef.current && !isPlayingWithSound) {
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {})
    }
  }, [currentIndex, isPlayingWithSound])

  useEffect(() => {
    if (isPaused || isPlayingWithSound || videos.length === 0) return

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1))
    }, autoPlayInterval)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentIndex, isPaused, isPlayingWithSound, autoPlayInterval, videos.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1))
  }

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.muted = false
      videoRef.current.play().catch(() => {})
      setIsPlayingWithSound(true)
    }
  }

  if (!videos.length) {
    return (
      <div className="w-full h-96 flex items-center justify-center rounded-2xl bg-card border border-border">
        <p className="text-muted-foreground">No events available</p>
      </div>
    )
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-black h-96 md:h-[500px] group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="relative w-full h-full">
        {/* Video Slides */}
        <div className="relative w-full h-full overflow-hidden">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <video
                ref={index === currentIndex ? videoRef : null}
                src={video.video_url}
                poster={video.thumbnail_url}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Play Button Overlay - Only show when not playing with sound */}
              {index === currentIndex && !isPlayingWithSound && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors z-20">
                  <button
                    onClick={handlePlayClick}
                    className="rounded-full bg-primary/90 hover:bg-primary p-5 transition-colors shadow-lg"
                    aria-label="Play video with sound"
                  >
                    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-white drop-shadow-lg">
                  {video.title}
                </h3>
                {video.date && (
                  <p className="text-xs sm:text-sm text-primary font-semibold mb-2 drop-shadow-md">
                    {video.date}
                  </p>
                )}
                {video.description && (
                  <p className="text-sm sm:text-base md:text-lg text-gray-100 line-clamp-2 sm:line-clamp-none drop-shadow-md">
                    {video.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 sm:p-3 rounded-full hover:bg-background transition-colors z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 sm:p-3 rounded-full hover:bg-background transition-colors z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Indicator Dots - Positioned at bottom of carousel */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-2 z-20">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsPlayingWithSound(false)
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-primary w-6 sm:w-8" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
