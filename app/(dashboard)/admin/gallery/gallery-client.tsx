'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Upload, ImageIcon, Trash2, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/back-button'
import { FileUploader } from '@/components/admin/file-uploader'

interface GalleryItem {
  id: string
  title: string | null
  description: string | null
  image_url: string | null
  category: string | null
  display_order: number
  created_at: string
}

export default function GalleryClient({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string>('')
  const { toast } = useToast()
  const supabase = createClient()

  const handleUploadMedia = async () => {
    if (!uploadedImageUrl || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please upload an image and provide a title",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gallery')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          image_url: uploadedImageUrl,
          category: category.trim() || null,
          display_order: items.length + 1
        })
        .select()
        .single()

      if (error) {
        console.error('[v0] Error adding to gallery:', error)
        throw error
      }

      console.log('[v0] Successfully added to gallery:', data)
      
      toast({
        title: "Success!",
        description: "Image added to gallery successfully"
      })

      // Add to local state
      setItems([data, ...items])
      
      // Reset form
      setUploadedImageUrl('')
      setTitle('')
      setDescription('')
      setCategory('')
      
    } catch (error: any) {
      console.error('[v0] Exception adding to gallery:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add image to gallery",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setItems(items.filter(item => item.id !== itemId))
      
      toast({
        title: "Success",
        description: "Image deleted successfully"
      })
    } catch (error: any) {
      console.error('[v0] Error deleting gallery item:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Public Gallery Management</h1>
          <p className="text-muted-foreground mt-1">Upload and manage images and videos for the public gallery</p>
        </div>
        <BackButton fallbackUrl="/admin" />
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="images">Images ({items.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Image</CardTitle>
              <CardDescription>Upload images to the public gallery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="media">Upload Image</Label>
                <FileUploader
                  value={uploadedImageUrl}
                  onChange={(url) => {
                    console.log("[v0] Gallery upload complete:", url)
                    setUploadedImageUrl(url)
                  }}
                  accept="image/*"
                  bucket="event-media"
                  folder="gallery-images"
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Summer Event 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description for this media (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Events, Venue, Parties (optional)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <Button
                onClick={handleUploadMedia}
                disabled={loading || !uploadedImageUrl || !title.trim()}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Add to Gallery
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          {items.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No images in gallery yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    <img
                      src={item.image_url || '/guvnor-logo.png'}
                      alt={item.title || 'Gallery image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                    )}
                    {item.category && (
                      <Badge variant="secondary" className="mb-3">{item.category}</Badge>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 bg-transparent"
                        onClick={() => window.open(item.image_url || '', '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this image? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteItem(item.id)} className="bg-destructive">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
