"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, Loader2 } from "lucide-react"

interface UploadSignatureEventProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function SignatureEventUpload({ onSuccess, onError }: UploadSignatureEventProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        onError?.("Video file size must be less than 500MB")
        return
      }
      if (!file.type.startsWith("video/")) {
        onError?.("Please select a valid video file")
        return
      }
      setVideoFile(file)
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        onError?.("Please select a valid image file")
        return
      }
      setThumbnailFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      onError?.("Please enter a title")
      return
    }

    if (!videoFile) {
      onError?.("Please select a video file")
      return
    }

    setIsUploading(true)
    setProgress(0)

    try {
      // Upload video
      const videoFileName = `${Date.now()}-${videoFile.name}`
      const { error: videoUploadError, data: videoData } = await supabase.storage
        .from("signature-events")
        .upload(videoFileName, videoFile, {
          onUploadProgress: (progress) => {
            setProgress(Math.round((progress.loaded / progress.total) * 80))
          },
        })

      if (videoUploadError) throw videoUploadError

      // Get video URL
      const { data: videoUrlData } = supabase.storage
        .from("signature-events")
        .getPublicUrl(videoFileName)

      const videoUrl = videoUrlData?.publicUrl

      setProgress(85)

      // Upload thumbnail if provided
      let thumbnailUrl: string | null = null
      if (thumbnailFile) {
        const thumbnailFileName = `thumbnails/${Date.now()}-${thumbnailFile.name}`
        const { error: thumbError, data: thumbData } = await supabase.storage
          .from("signature-events")
          .upload(thumbnailFileName, thumbnailFile)

        if (!thumbError) {
          const { data: thumbUrlData } = supabase.storage
            .from("signature-events")
            .getPublicUrl(thumbnailFileName)
          thumbnailUrl = thumbUrlData?.publicUrl
        }
      }

      setProgress(90)

      // Save to database
      const { error: dbError } = await supabase.from("signature_events").insert({
        title: title.trim(),
        description: description.trim() || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        order_position: Date.now(),
      })

      if (dbError) throw dbError

      setProgress(100)

      // Reset form
      setTimeout(() => {
        setTitle("")
        setDescription("")
        setVideoFile(null)
        setThumbnailFile(null)
        setProgress(0)
        setIsOpen(false)
        onSuccess?.()
      }, 500)
    } catch (err) {
      console.error("[v0] Upload error:", err)
      onError?.(
        err instanceof Error ? err.message : "Failed to upload signature event"
      )
      setProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Upload Event Video
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Upload Signature Event</h3>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                  placeholder="e.g., Summer Night Party"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isUploading}
                  placeholder="Describe your signature event"
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Video File
                </label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  disabled={isUploading}
                  className="block w-full text-sm text-muted-foreground"
                />
                {videoFile && (
                  <p className="text-xs text-primary mt-2">
                    Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)}MB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Thumbnail (Optional)
                </label>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                  disabled={isUploading}
                  className="block w-full text-sm text-muted-foreground"
                />
                {thumbnailFile && (
                  <p className="text-xs text-primary mt-2">
                    Selected: {thumbnailFile.name}
                  </p>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{progress}% uploaded</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-background disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
