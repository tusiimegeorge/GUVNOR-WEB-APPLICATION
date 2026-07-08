"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { BackButton } from "@/components/back-button"
import { Save } from "lucide-react"

interface LocationContent {
  id: string
  page_title: string
  page_subtitle: string | null
  address_line1: string
  address_line2: string | null
  city: string
  country: string
  latitude: number
  longitude: number
  phone: string | null
  email: string | null
  opening_hours: string | null
  map_marker_text: string
  directions_text: string | null
  parking_info: string | null
  public_transport_info: string | null
  is_active: boolean
}

export default function LocationContentClient() {
  const [content, setContent] = useState<LocationContent | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadContent()
  }, [])

  async function loadContent() {
    const { data } = await supabase.from("location_content").select("*").eq("is_active", true).single()

    if (data) setContent(data)
  }

  async function handleSave() {
    if (!content) return

    setLoading(true)
    const { error } = await supabase.from("location_content").update(content).eq("id", content.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update location content",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Location content updated successfully",
      })
      loadContent()
    }
    setLoading(false)
  }

  if (!content) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <BackButton fallbackUrl="/admin" />
        </div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Location Content</h1>
          <p className="text-muted-foreground">Manage the location page content (Superadmin Only)</p>
        </div>

        <div className="space-y-6">
          {/* Page Header */}
          <Card>
            <CardHeader>
              <CardTitle>Page Header</CardTitle>
              <CardDescription>Main heading and subtitle for the location page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Page Title</Label>
                <Input
                  value={content.page_title}
                  onChange={(e) => setContent({ ...content, page_title: e.target.value })}
                  placeholder="Find Us"
                />
              </div>
              <div>
                <Label>Page Subtitle</Label>
                <Input
                  value={content.page_subtitle || ""}
                  onChange={(e) => setContent({ ...content, page_subtitle: e.target.value })}
                  placeholder="Located in the heart of Kampala"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Physical address and map coordinates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Address Line 1 *</Label>
                  <Input
                    value={content.address_line1}
                    onChange={(e) => setContent({ ...content, address_line1: e.target.value })}
                    placeholder="Plot 3-5 Kampala Road"
                  />
                </div>
                <div>
                  <Label>Address Line 2</Label>
                  <Input
                    value={content.address_line2 || ""}
                    onChange={(e) => setContent({ ...content, address_line2: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={content.city}
                    onChange={(e) => setContent({ ...content, city: e.target.value })}
                    placeholder="Kampala"
                  />
                </div>
                <div>
                  <Label>Country *</Label>
                  <Input
                    value={content.country}
                    onChange={(e) => setContent({ ...content, country: e.target.value })}
                    placeholder="Uganda"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude *</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={content.latitude}
                    onChange={(e) => setContent({ ...content, latitude: Number.parseFloat(e.target.value) })}
                    placeholder="0.3136"
                  />
                </div>
                <div>
                  <Label>Longitude *</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={content.longitude}
                    onChange={(e) => setContent({ ...content, longitude: Number.parseFloat(e.target.value) })}
                    placeholder="32.5811"
                  />
                </div>
              </div>
              <div>
                <Label>Map Marker Text</Label>
                <Input
                  value={content.map_marker_text}
                  onChange={(e) => setContent({ ...content, map_marker_text: e.target.value })}
                  placeholder="Club Guvnor"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Phone, email, and opening hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={content.phone || ""}
                    onChange={(e) => setContent({ ...content, phone: e.target.value })}
                    placeholder="+256 700 000 000"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={content.email || ""}
                    onChange={(e) => setContent({ ...content, email: e.target.value })}
                    placeholder="info@clubguvnor.com"
                  />
                </div>
              </div>
              <div>
                <Label>Opening Hours (JSON format)</Label>
                <Textarea
                  rows={4}
                  value={content.opening_hours || ""}
                  onChange={(e) => setContent({ ...content, opening_hours: e.target.value })}
                  placeholder='{"wednesday":"9:00 PM - 6:00 AM","thursday":"9:00 PM - 6:00 AM"}'
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter days and times in JSON format for structured display
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Directions, parking, and transport details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Directions Text</Label>
                <Textarea
                  rows={3}
                  value={content.directions_text || ""}
                  onChange={(e) => setContent({ ...content, directions_text: e.target.value })}
                  placeholder="We're located in the heart of Kampala..."
                />
              </div>
              <div>
                <Label>Parking Information</Label>
                <Textarea
                  rows={3}
                  value={content.parking_info || ""}
                  onChange={(e) => setContent({ ...content, parking_info: e.target.value })}
                  placeholder="Free parking available..."
                />
              </div>
              <div>
                <Label>Public Transport Information</Label>
                <Textarea
                  rows={3}
                  value={content.public_transport_info || ""}
                  onChange={(e) => setContent({ ...content, public_transport_info: e.target.value })}
                  placeholder="Accessible by bus routes..."
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={loading} className="w-full" size="lg">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
