"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Save } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { FileUploader } from "@/components/admin/file-uploader"

interface EventsPageContent {
  id: string
  page_title: string
  page_subtitle: string | null
  hero_image_url: string | null
  hero_video_url: string | null
  welcome_text: string | null
  is_active: boolean
}

export default function EventsContentClient() {
  const [content, setContent] = useState<EventsPageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadContent()
  }, [])

  async function loadContent() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("events_page_content").select("*").eq("is_active", true).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows found" which is okay
        console.error("[v0] Error loading events page content:", error.message)
      }

      if (data) {
        setContent(data)
      } else {
        // Create a default content object if none exists
        setContent({
          id: "",
          page_title: "Upcoming Events",
          page_subtitle: null,
          hero_image_url: null,
          hero_video_url: null,
          welcome_text: null,
          is_active: true,
        })
      }
    } catch (err) {
      console.error("[v0] Exception loading events page content:", err)
      // Set default content on error
      setContent({
        id: "",
        page_title: "Upcoming Events",
        page_subtitle: null,
        hero_image_url: null,
        hero_video_url: null,
        welcome_text: null,
        is_active: true,
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!content) return

    setLoading(true)
    try {
      if (content.id) {
        // Update existing
        const { error } = await supabase.from("events_page_content").update(content).eq("id", content.id)

        if (error) {
          toast({
            title: "Error",
            description: "Failed to update events page content",
            variant: "destructive",
          })
          console.error("[v0] Update error:", error)
        } else {
          toast({
            title: "Success",
            description: "Events page content updated successfully",
          })
          loadContent()
        }
      } else {
        // Insert new
        const { error, data } = await supabase.from("events_page_content").insert([content]).select().single()

        if (error) {
          toast({
            title: "Error",
            description: "Failed to create events page content",
            variant: "destructive",
          })
          console.error("[v0] Insert error:", error)
        } else {
          toast({
            title: "Success",
            description: "Events page content created successfully",
          })
          setContent(data)
        }
      }
    } catch (err) {
      console.error("[v0] Exception saving content:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <BackButton fallbackUrl="/admin" className="mb-4" />

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Events Page Content</h1>
          <p className="text-muted-foreground">Customize the content displayed on your events page</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Content</CardTitle>
            <CardDescription>Edit the title, description, and media for your events page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Page Title *</Label>
              <Input
                value={content.page_title}
                onChange={(e) => setContent({ ...content, page_title: e.target.value })}
                placeholder="Upcoming Events"
              />
            </div>
            <div>
              <Label>Page Subtitle</Label>
              <Input
                value={content.page_subtitle || ""}
                onChange={(e) => setContent({ ...content, page_subtitle: e.target.value })}
                placeholder="Experience the best nightlife has to offer"
              />
            </div>
            <div>
              <Label>Welcome Text</Label>
              <Textarea
                rows={4}
                value={content.welcome_text || ""}
                onChange={(e) => setContent({ ...content, welcome_text: e.target.value })}
                placeholder="Browse our upcoming events and get your tickets..."
              />
            </div>
            <div>
              <Label>Hero Image</Label>
              <FileUploader
                value={content.hero_image_url || ""}
                onChange={(url) => setContent({ ...content, hero_image_url: url })}
                accept="image/*"
                folder="events-page"
              />
            </div>
            <div>
              <Label>Hero Video (optional)</Label>
              <FileUploader
                value={content.hero_video_url || ""}
                onChange={(url) => setContent({ ...content, hero_video_url: url })}
                accept="video/*"
                folder="events-page"
              />
            </div>
            <Button onClick={handleSave} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
