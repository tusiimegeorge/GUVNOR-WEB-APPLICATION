'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Upload, LucideVideo, LucideImageDown as LucideImageIcon, Trash2, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/back-button'
import { FileUploader } from '@/components/admin/file-uploader'
import { addEventPhoto, addEventVideo, deleteEventPhoto, deleteEventVideo } from '@/lib/server-actions/admin-operations'

interface EventPhoto {
  id: string
  event_id: string
  photo_url: string
  title: string | null
  description: string | null
  display_order: number
  created_at: string
}

interface EventVideo {
  id: string
  event_id: string
  video_url: string
  title: string | null
  description: string | null
  duration_seconds: number
  thumbnail_url: string | null
  display_order: number
  created_at: string
}

export default function AdminMediaClient({ events }: { events: any[] }) {
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [mediaType, setMediaType] = useState<"video" | "photo">("video")
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<EventPhoto[]>([])
  const [videos, setVideos] = useState<EventVideo[]>([])
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string>("")
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (selectedEvent) {
      loadMedia()
    }
  }, [selectedEvent])

  async function loadMedia() {
    const { data: photosData } = await supabase
      .from("event_photos")
      .select("*")
      .eq("event_id", selectedEvent)
      .order("display_order", { ascending: true })

    const { data: videosData } = await supabase
      .from("event_videos")
      .select("*")
      .eq("event_id", selectedEvent)
      .order("display_order", { ascending: true })

    if (photosData) setPhotos(photosData)
    if (videosData) setVideos(videosData)
  }

  async function handleUpload(formData: FormData) {
    if (!selectedEvent) {
      toast({
        title: "Error",
        description: "Please select an event first",
        variant: "destructive",
      })
      return
    }

    if (!uploadedMediaUrl) {
      toast({
        title: "Error",
        description: "Please upload a file first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const title = formData.get("title") as string
    const description = formData.get("description") as string

    try {
      if (mediaType === "video") {
        const duration = Number.parseInt(formData.get("duration") as string) || 30

        const result = await addEventVideo(
          selectedEvent,
          uploadedMediaUrl,
          title,
          description,
          duration,
          videos.length
        )

        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || "Failed to add video",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Video added successfully",
          })
          setUploadedMediaUrl("")
          setMediaType("video")
          await loadMedia()
        }
      } else {
        const result = await addEventPhoto(
          selectedEvent,
          uploadedMediaUrl,
          title,
          photos.length
        )

        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || "Failed to add photo",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Photo added successfully",
          })
          setUploadedMediaUrl("")
          setMediaType("photo")
          await loadMedia()
        }
      }
    } catch (err) {
      console.error('[v0] Upload error:', err)
      toast({
        title: "Error",
        description: "Upload failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeletePhoto(id: string) {
    setLoading(true)
    try {
      const result = await deleteEventPhoto(id)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete photo",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Photo deleted successfully",
        })
        loadMedia()
      }
    } catch (err) {
      console.error('[v0] Delete error:', err)
      toast({
          title: "Error",
          description: "Delete failed",
          variant: "destructive",
        })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteVideo(id: string) {
    setLoading(true)
    try {
      const result = await deleteEventVideo(id)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete video",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Video deleted successfully",
        })
        loadMedia()
      }
    } catch (err) {
      console.error('[v0] Delete error:', err)
      toast({
          title: "Error",
          description: "Delete failed",
          variant: "destructive",
        })
    } finally {
      setLoading(false)
    }
  }

  const selectedEventData = events.find((e) => e.id === selectedEvent)

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <BackButton fallbackUrl="/admin" className="mb-4" />

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Event Media Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Upload and manage photos and videos for events</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-8">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Upload Media</CardTitle>
                <CardDescription className="text-sm">Add photos or videos to your events</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleUpload(new FormData(e.currentTarget))
                    e.currentTarget.reset()
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Select Event *</Label>
                    <Select value={selectedEvent} onValueChange={setSelectedEvent} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Media Type</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant={mediaType === "video" ? "default" : "outline"}
                        onClick={() => setMediaType("video")}
                        className="flex-1"
                        size="sm"
                      >
                        <LucideVideo className="w-4 h-4 mr-1" />
                        Video
                      </Button>
                      <Button
                        type="button"
                        variant={mediaType === "photo" ? "default" : "outline"}
                        onClick={() => setMediaType("photo")}
                        className="flex-1"
                        size="sm"
                      >
                        <LucideImageIcon className="w-4 h-4 mr-1" />
                        Photo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <FileUploader
                      label={mediaType === "video" ? "Video File" : "Photo File"}
                      accept={mediaType === "video" ? "video/*" : "image/*"}
                      maxSizeMB={mediaType === "video" ? 100 : 10}
                      onUploadComplete={(url) => setUploadedMediaUrl(url)}
                      currentUrl={uploadedMediaUrl}
                      description={`Upload a ${mediaType} file`}
                      bucket="event-media"
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Title / Caption</Label>
                    <Input id="title" name="title" placeholder="Event highlight" />
                  </div>

                  {mediaType === "video" && (
                    <>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Describe this video..." rows={2} />
                      </div>

                      <div>
                        <Label htmlFor="duration">Duration (seconds)</Label>
                        <Input id="duration" name="duration" type="number" min="1" max="300" defaultValue="30" />
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={loading || !selectedEvent || !uploadedMediaUrl} className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedEvent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Event Media</CardTitle>
                  <CardDescription className="text-sm">
                    {selectedEventData?.title} - {photos.length} photos, {videos.length} videos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="photos">
                    <TabsList className="mb-4 w-full sm:w-auto">
                      <TabsTrigger value="photos" className="flex-1 sm:flex-none">
                        Photos ({photos.length})
                      </TabsTrigger>
                      <TabsTrigger value="videos" className="flex-1 sm:flex-none">
                        Videos ({videos.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="photos">
                      {photos.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {photos.map((photo) => (
                            <Card key={photo.id}>
                              <CardContent className="p-4">
                                <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                                  <img
                                    src={photo.photo_url || "/guvnor-logo.png"}
                                    alt={photo.caption || "Event photo"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm mb-1 truncate">
                                      {photo.caption || "Untitled"}
                                    </h4>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(photo.photo_url, "_blank")}
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" disabled={loading}>
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeletePhoto(photo.id)}>
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                          No photos uploaded yet for this event
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="videos">
                      {videos.length > 0 ? (
                        <div className="space-y-4">
                          {videos.map((video) => (
                            <Card key={video.id}>
                              <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                  <div className="w-full sm:w-32 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                    <LucideVideo className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-2">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold mb-1 truncate">
                                          {video.title || "Untitled Video"}
                                        </h4>
                                        <div className="flex gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {video.duration_seconds}s
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="flex gap-1 flex-shrink-0">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(video.video_url, "_blank")}
                                        >
                                          <Eye className="w-3 h-3" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm" disabled={loading}>
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete Video</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure? This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeleteVideo(video.id)}>
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                    {video.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                          No videos uploaded yet for this event
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <LucideImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select an event to view and manage its media</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
