"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import Autoplay from "embla-carousel-autoplay"
import type { EventVideo } from "@/lib/types"

interface VideoCarouselProps {
  videos: EventVideo[]
  autoplay?: boolean
}

export function VideoCarousel({ videos, autoplay = true }: VideoCarouselProps) {
  const [currentVideo, setCurrentVideo] = React.useState<string | null>(null)

  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }))

  if (!videos || videos.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No videos available</div>
  }

  // Filter short videos for carousel
  const shortVideos = videos.filter((v) => v.video_type === "short")

  return (
    <div className="w-full">
      <Carousel
        plugins={autoplay ? [plugin.current] : []}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {shortVideos.map((video, index) => (
            <CarouselItem key={video.id}>
              <Card className="border-0 bg-transparent">
                <CardContent className="p-0 relative">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    {currentVideo === video.id ? (
                      <video src={video.video_url} controls autoPlay className="w-full h-full object-cover">
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <>
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url || "/guvnor-logo.png"}
                            alt={video.title || "Event video thumbnail"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          // Show video element with controls hidden as thumbnail preview
                          <video
                            src={video.video_url}
                            className="w-full h-full object-cover"
                            style={{ pointerEvents: "none" }}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                          <Button
                            size="lg"
                            className="rounded-full w-16 h-16"
                            onClick={() => setCurrentVideo(video.id)}
                          >
                            <Play className="h-6 w-6" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  {video.title && (
                    <div className="mt-2 text-center">
                      <h4 className="font-semibold">{video.title}</h4>
                      {video.description && <p className="text-sm text-muted-foreground">{video.description}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {shortVideos.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>
    </div>
  )
}
