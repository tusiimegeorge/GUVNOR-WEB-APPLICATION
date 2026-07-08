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

interface BookingsPageContent {
  id: string
  page_title: string
  page_subtitle: string | null
  hero_image_url: string | null
  welcome_text: string | null
  terms_and_conditions: string | null
  cancellation_policy: string | null
  is_active: boolean
}

export default function BookingsContentClient() {
  const [content, setContent] = useState<BookingsPageContent | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadContent()
  }, [])

  async function loadContent() {
    const { data } = await supabase.from("bookings_page_content").select("*").eq("is_active", true).single()

    if (data) setContent(data)
  }

  async function handleSave() {
    if (!content) return

    setLoading(true)
    const { error } = await supabase.from("bookings_page_content").update(content).eq("id", content.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update bookings page content",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Bookings page content updated successfully",
      })
      loadContent()
    }
    setLoading(false)
  }

  if (!content) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <BackButton fallbackUrl="/admin" className="mb-4" />

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bookings Page Content</h1>
          <p className="text-muted-foreground">Customize the content displayed on your bookings page</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Content</CardTitle>
            <CardDescription>Edit the title, description, policies, and media for your bookings page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Page Title *</Label>
              <Input
                value={content.page_title}
                onChange={(e) => setContent({ ...content, page_title: e.target.value })}
                placeholder="Book Your Table"
              />
            </div>
            <div>
              <Label>Page Subtitle</Label>
              <Input
                value={content.page_subtitle || ""}
                onChange={(e) => setContent({ ...content, page_subtitle: e.target.value })}
                placeholder="Reserve your spot at Club Guvnor"
              />
            </div>
            <div>
              <Label>Welcome Text</Label>
              <Textarea
                rows={3}
                value={content.welcome_text || ""}
                onChange={(e) => setContent({ ...content, welcome_text: e.target.value })}
                placeholder="Choose from VIP booths or regular seating..."
              />
            </div>
            <div>
              <Label>Hero Image</Label>
              <FileUploader
                value={content.hero_image_url || ""}
                onChange={(url) => setContent({ ...content, hero_image_url: url })}
                accept="image/*"
                folder="bookings-page"
              />
            </div>
            <div>
              <Label>Terms and Conditions</Label>
              <Textarea
                rows={6}
                value={content.terms_and_conditions || ""}
                onChange={(e) => setContent({ ...content, terms_and_conditions: e.target.value })}
                placeholder="Enter your terms and conditions..."
              />
            </div>
            <div>
              <Label>Cancellation Policy</Label>
              <Textarea
                rows={4}
                value={content.cancellation_policy || ""}
                onChange={(e) => setContent({ ...content, cancellation_policy: e.target.value })}
                placeholder="Enter your cancellation policy..."
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
