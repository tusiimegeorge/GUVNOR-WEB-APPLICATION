"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadFile } from "@/lib/supabase/storage"

interface FileUploaderProps {
  label?: string
  accept?: string
  maxSizeMB?: number
  onUploadComplete?: (url: string) => void
  onChange?: (url: string) => void
  currentUrl?: string
  value?: string
  description?: string
  bucket?: string
  folder?: string
}

export function FileUploader({
  label = "Upload File",
  accept = "image/*,video/*",
  maxSizeMB = 100,
  onUploadComplete,
  onChange,
  currentUrl,
  value,
  description,
  bucket = "event-media",
  folder = "uploads",
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || currentUrl || null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle both onUploadComplete and onChange callbacks
  const handleUploadComplete = (url: string) => {
    if (onUploadComplete) {
      onUploadComplete(url)
    } else if (onChange) {
      onChange(url)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      const filePath = `${folder}/${fileName}`

      const result = await uploadFile({
        bucket,
        path: filePath,
        file,
        upsert: false,
      })

      if (result.error || !result.url) {
        throw new Error(result.error?.message || "Upload failed")
      }

      setUploadProgress(100)
      handleUploadComplete(result.url)
      setError(null)
    } catch (err: any) {
      console.error("[v0] Upload error:", err)
      setError(err.message || "Failed to upload file. Please try again.")
      setPreviewUrl(currentUrl || null)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    handleUploadComplete("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isImage = previewUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || previewUrl?.startsWith("data:image/")
  const isVideo = previewUrl?.match(/\.(mp4|webm|ogg)$/i) || previewUrl?.startsWith("data:video/")

  return (
    <div className="space-y-3">
      <div>
        <Label>{label}</Label>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>

      {previewUrl && (
        <div className="relative border rounded-lg p-2 bg-muted/50">
          {isImage && (
            <img
              src={previewUrl || "/guvnor-logo.png"}
              alt="Preview"
              className="max-h-48 mx-auto rounded object-contain"
            />
          )}
          {isVideo && (
            <video src={previewUrl} controls className="max-h-48 mx-auto rounded">
              Your browser does not support the video tag.
            </video>
          )}
          {!isImage && !isVideo && (
            <div className="flex items-center gap-2 p-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm truncate">{previewUrl}</span>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id={`file-upload-${label}`}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading... {uploadProgress > 0 ? `${uploadProgress}%` : ""}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {previewUrl ? "Change File" : "Upload File"}
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-muted-foreground">Max file size: {maxSizeMB}MB • Uploads to Supabase Storage</p>
    </div>
  )
}
