"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon, Video } from "lucide-react"
import { uploadFile } from "@/lib/supabase/storage"
import { useToast } from "@/hooks/use-toast"

interface MediaUploaderProps {
  bucket: string
  path?: string
  accept?: string
  maxSize?: number
  onUploadComplete?: (url: string) => void
  multiple?: boolean
}

export function MediaUploader({
  bucket,
  path = "",
  accept = "image/*,video/*",
  maxSize = 50 * 1024 * 1024,
  onUploadComplete,
  multiple = false,
}: MediaUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    setFiles(multiple ? [...files, ...validFiles] : validFiles)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
        const filePath = path ? `${path}/${fileName}` : fileName

        const result = await uploadFile({
          bucket,
          path: filePath,
          file,
          upsert: false,
        })

        setProgress(((index + 1) / files.length) * 100)

        if (result.error) {
          throw result.error
        }

        return result.url
      })

      const urls = await Promise.all(uploadPromises)

      toast({
        title: "Upload successful",
        description: `${files.length} file(s) uploaded successfully`,
      })

      if (onUploadComplete) {
        urls.forEach((url) => url && onUploadComplete(url))
      }

      setFiles([])
      setProgress(0)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
        <CardDescription>
          Upload images or videos to {bucket} storage. Max size: {maxSize / 1024 / 1024}MB per file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            multiple={multiple}
            className="hidden"
            id="media-upload"
            disabled={uploading}
          />
          <label
            htmlFor="media-upload"
            className="cursor-pointer flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Upload className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to select {multiple ? "files" : "a file"} or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">Supports images and videos</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Selected Files ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border border-border rounded-lg">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Video className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)}MB</span>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(index)} disabled={uploading}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">Uploading... {Math.round(progress)}%</p>
          </div>
        )}

        <Button onClick={handleUpload} disabled={files.length === 0 || uploading} className="w-full">
          {uploading ? "Uploading..." : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
        </Button>
      </CardContent>
    </Card>
  )
}
