"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

export interface HeroSlide {
  id: string
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  order_position?: number
}

interface HeroCarouselProps {
  slides: HeroSlide[]
  autoPlayInterval?: number
  onSlideChange?: (index: number) => void
}

export function HeroCarousel({
  slides,
  autoPlayInterval = 5000,
  onSlideChange,
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({})
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-96 md:h-[500px] bg-gradient-to-b from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No signature events to display</p>
        </div>
      </div>
    )
  }

  const currentVideoSlide = slides[currentSlide]

  const startAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current)
    }
    if (playingVideoId) return // Don't auto-play when video is playing with sound

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, autoPlayInterval)
  }

  const stopAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }
  }

  useEffect(() => {
    onSlideChange?.(currentSlide)
  }, [currentSlide, onSlideChange])

  useEffect(() => {
    if (isPlaying && !playingVideoId) {
      startAutoPlay()
    } else {
      stopAutoPlay()
    }

    return () => stopAutoPlay()
  }, [isPlaying, playingVideoId, autoPlayInterval])

  const handlePrevSlide = () => {
    stopAutoPlay()
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setPlayingVideoId(null)
  }

  const handleNextSlide = () => {
    stopAutoPlay()
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setPlayingVideoId(null)
  }

  const goToSlide = (index: number) => {
    stopAutoPlay()
    setCurrentSlide(index)
    setPlayingVideoId(null)
  }

  const toggleVideoPlayback = () => {
    const video = videoRefs.current[currentVideoSlide.id]
    if (!video) return

    if (video.paused) {
      video.play()
      setPlayingVideoId(currentVideoSlide.id)
    } else {
      video.pause()
      setPlayingVideoId(null)
    }
  }

  const toggleMute = () => {
    const video = videoRefs.current[currentVideoSlide.id]
    if (video) {
      video.muted = !video.muted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Main Hero Video Container */}
      <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden bg-black group">
        {/* Video Display */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === currentSlide ? "opacity-100" : "opacity-0"
            )}
          >
            <video
              ref={(el) => {
                if (el) videoRefs.current[slide.id] = el
              }}
              src={slide.video_url}
              poster={slide.thumbnail_url}
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
              {slide.description && (
                <p className="text-sm md:text-base text-gray-200 line-clamp-2">{slide.description}</p>
              )}
            </div>

            {/* Play Button Indicator */}
            {index === currentSlide && !playingVideoId && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={toggleVideoPlayback}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4 transition-colors"
                  aria-label="Play video"
                >
                  <Play className="w-8 h-8 text-white fill-white" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Video Controls */}
        {playingVideoId && (
          <div className="absolute bottom-6 right-6 flex gap-2 z-20">
            <button
              onClick={toggleVideoPlayback}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
              aria-label="Pause video"
            >
              <Pause className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={toggleMute}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        )}

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-semibold z-20">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-primary/30 hover:bg-primary/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Grid */}
      {slides.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "relative h-20 rounded-lg overflow-hidden transition-all group",
                index === currentSlide ? "ring-2 ring-primary" : "hover:opacity-80"
              )}
            >
              <video
                src={slide.video_url}
                poster={slide.thumbnail_url}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
