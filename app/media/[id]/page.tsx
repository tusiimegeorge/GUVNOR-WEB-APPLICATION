import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EventMediaGallery } from "@/components/event-media-gallery"
import { BackButton } from "@/components/back-button"

interface EventMediaPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventMediaPage({ params }: EventMediaPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch event with media
  const { data: event, error } = await supabase
    .from("events")
    .select(
      `
      id,
      title,
      image_url,
      event_date,
      venue,
      videos (
        id,
        url,
        video_type,
        thumbnail_url,
        title
      ),
      photos (
        id,
        url,
        caption
      )
    `,
    )
    .eq("id", id)
    .single()

  if (error || !event) {
    notFound()
  }

  const shortVideos = event.videos?.filter((v: any) => v.video_type === "short") || []
  const longVideos = event.videos?.filter((v: any) => v.video_type === "long") || []
  const photos = event.photos || []

  const hasMedia = shortVideos.length > 0 || longVideos.length > 0 || photos.length > 0

  return (
    <div className="min-h-screen pb-16">
      <div className="absolute top-3 left-3 z-10">
        <BackButton fallbackUrl="/events" />
      </div>

      <div className="px-4 py-12 max-w-6xl mx-auto">
        {/* Event Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-balance">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
            <span>
              {new Date(event.event_date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>{event.venue}</span>
          </div>
        </div>

        {/* Media Gallery or Empty State */}
        {hasMedia ? (
          <EventMediaGallery 
            shortVideos={shortVideos}
            longVideos={longVideos}
            photos={photos}
            eventId={id}
          />
        ) : (
          <div className="text-center py-16">
            <div className="text-muted-foreground space-y-3">
              <p className="text-lg font-medium">No media available yet</p>
              <p className="text-sm">Media content for this event will be uploaded soon. Please check back later!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
