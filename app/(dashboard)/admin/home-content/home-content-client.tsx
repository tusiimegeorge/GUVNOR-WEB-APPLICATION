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
import { FileUploader } from "@/components/admin/file-uploader"
import { Plus, Trash2, Save, ImageIcon, Video } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { saveHeroSlide, deleteHeroSlide } from "@/lib/server-actions/admin-operations"

interface HeroSlide {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  image_url: string | null
  video_url: string | null
  cta_text: string | null
  cta_link: string | null
  display_order: number
  is_active: boolean
  media_type: "image" | "video"
}

interface HomepageSection {
  id: string
  section_key: string
  title: string
  subtitle: string | null
  content: string | null
  display_order: number
  is_active: boolean
}

export default function HomeContentClient() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadContent()
  }, [])

  async function loadContent() {
    const { data: slidesData } = await supabase
      .from("homepage_hero_slides")
      .select("*")
      .order("display_order", { ascending: true })

    const { data: sectionsData } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("display_order", { ascending: true })

    if (slidesData) setHeroSlides(slidesData)
    if (sectionsData) setSections(sectionsData)
  }

  async function handleSaveSlide(slide: Partial<HeroSlide>) {
    setLoading(true)
    try {
      const result = await saveHeroSlide(slide)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to save hero slide",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Hero slide saved successfully",
        })
        setDialogOpen(false)
        setEditingSlide(null)
        loadContent()
      }
    } catch (err) {
      console.error('[v0] Error saving slide:', err)
      toast({
        title: "Error",
        description: "Failed to save hero slide",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteSlide(id: string) {
    setLoading(true)
    try {
      const result = await deleteHeroSlide(id)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete hero slide",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Hero slide deleted successfully",
        })
        loadContent()
      }
    } catch (err) {
      console.error('[v0] Error deleting slide:', err)
      toast({
          title: "Error",
          description: "Failed to delete hero slide",
          variant: "destructive",
        })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateSection(section: HomepageSection) {
    setLoading(true)
    const { error } = await supabase.from("homepage_sections").update(section).eq("id", section.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Section updated successfully",
      })
      loadContent()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <BackButton fallbackUrl="/admin" className="mb-4" />

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Home Page Content</h1>
          <p className="text-muted-foreground">Manage your homepage hero slides, sections, and media</p>
        </div>

        {/* Hero Slides Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hero Carousel Slides</CardTitle>
                <CardDescription>Manage the main carousel on your homepage</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingSlide(null)
                      setDialogOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingSlide ? "Edit" : "Add"} Hero Slide</DialogTitle>
                    <DialogDescription>Create an engaging slide for your homepage carousel</DialogDescription>
                  </DialogHeader>
                  <HeroSlideForm
                    slide={editingSlide}
                    onSave={handleSaveSlide}
                    loading={loading}
                    onCancel={() => {
                      setDialogOpen(false)
                      setEditingSlide(null)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {heroSlides.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hero slides yet. Add your first slide to get started.
                </p>
              ) : (
                heroSlides.map((slide) => (
                  <Card key={slide.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {slide.image_url && <ImageIcon className="w-5 h-5 text-primary" />}
                            {slide.video_url && <Video className="w-5 h-5 text-primary" />}
                            <h3 className="text-lg font-bold">{slide.title}</h3>
                            {!slide.is_active && <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>}
                          </div>
                          {slide.subtitle && <p className="text-sm text-muted-foreground mb-2">{slide.subtitle}</p>}
                          {slide.description && <p className="text-sm mb-2">{slide.description}</p>}
                          {slide.cta_text && <p className="text-sm text-primary">CTA: {slide.cta_text}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingSlide(slide)
                              setDialogOpen(true)
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSlide(slide.id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Homepage Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Homepage Sections</CardTitle>
            <CardDescription>Edit the content for each section of your homepage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sections.map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{section.section_key}</CardTitle>
                      <Switch
                        checked={section.is_active}
                        onCheckedChange={(checked) => {
                          handleUpdateSection({ ...section, is_active: checked })
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={section.title}
                        onChange={(e) =>
                          setSections(sections.map((s) => (s.id === section.id ? { ...s, title: e.target.value } : s)))
                        }
                      />
                    </div>
                    <div>
                      <Label>Subtitle</Label>
                      <Input
                        value={section.subtitle || ""}
                        onChange={(e) =>
                          setSections(
                            sections.map((s) => (s.id === section.id ? { ...s, subtitle: e.target.value } : s)),
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        rows={3}
                        value={section.content || ""}
                        onChange={(e) =>
                          setSections(
                            sections.map((s) => (s.id === section.id ? { ...s, content: e.target.value } : s)),
                          )
                        }
                      />
                    </div>
                    <Button onClick={() => handleUpdateSection(section)} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Section
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function HeroSlideForm({
  slide,
  onSave,
  loading,
  onCancel,
}: {
  slide: HeroSlide | null
  onSave: (slide: Partial<HeroSlide>) => void
  loading: boolean
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<HeroSlide>>(
    slide || {
      title: "",
      subtitle: "",
      description: "",
      image_url: "",
      video_url: "",
      cta_text: "",
      cta_link: "",
      is_active: true,
      media_type: "image",
    },
  )

  return (
    <div className="space-y-4">
      <div>
        <Label>Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter slide title"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={formData.subtitle || ""}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          placeholder="Enter subtitle"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          rows={3}
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter description"
        />
      </div>
      <div>
        <Label>Display Media Type *</Label>
        <Select
          value={formData.media_type || "image"}
          onValueChange={(value) =>
            setFormData({ ...formData, media_type: value as "image" | "video" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose media type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Slide Image</Label>
        <FileUploader
          value={formData.image_url || ""}
          onChange={(url) => setFormData({ ...formData, image_url: url })}
          accept="image/*"
          folder="hero-slides"
        />
      </div>
      <div>
        <Label>Slide Video (optional)</Label>
        <FileUploader
          value={formData.video_url || ""}
          onChange={(url) => setFormData({ ...formData, video_url: url })}
          accept="video/*"
          folder="hero-slides"
        />
      </div>
      <div>
        <Label>Call-to-Action Text</Label>
        <Input
          value={formData.cta_text || ""}
          onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
          placeholder="Learn More"
        />
      </div>
      <div>
        <Label>CTA Link</Label>
        <Input
          value={formData.cta_link || ""}
          onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
          placeholder="/events"
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>Active</Label>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)} disabled={loading || !formData.title}>
          {loading ? "Saving..." : "Save Slide"}
        </Button>
      </div>
    </div>
  )
}
