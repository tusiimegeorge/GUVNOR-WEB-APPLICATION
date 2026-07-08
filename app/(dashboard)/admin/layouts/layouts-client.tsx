"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { BackButton } from "@/components/back-button"
import { FileUploader } from "@/components/admin/file-uploader"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"

type LayoutImage = {
  layout_type: string
  blueprint_image_url?: string
}

type Section = {
  id: string
  name: string
  layout_type: string
  blueprint_image_url?: string
  background_image_url?: string
}

const LAYOUT_TYPES = [
  { value: "main", label: "Main Guvnor", description: "The main club area with DJ booth and VIP sections" },
  { value: "back", label: "Back Area", description: "Back area sections away from the main dance floor" },
  { value: "nook", label: "Nook Area", description: "Cozy nook sections for small groups" },
  { value: "40+", label: "40+ Area", description: "Dedicated area for guests 40 and older" },
]

export function LayoutImagesClient({ 
  layoutImages, 
  sectionsByLayout 
}: { 
  layoutImages: Record<string, LayoutImage>
  sectionsByLayout: Record<string, Section[]>
}) {
  const [images, setImages] = useState(layoutImages)
  const [sections, setSections] = useState(sectionsByLayout)
  const [pendingImages, setPendingImages] = useState<Record<string, string>>({})
  const [pendingSectionImages, setPendingSectionImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [savedLayouts, setSavedLayouts] = useState<Record<string, boolean>>({})
  const [savedSections, setSavedSections] = useState<Record<string, boolean>>({})
  const supabase = createClient()
  const router = useRouter()

  // When file is uploaded to storage, store it as pending (not yet saved to DB)
  const handleFileUploaded = (layoutType: string, url: string) => {
    setPendingImages({
      ...pendingImages,
      [layoutType]: url,
    })
  }

  // When section background file is uploaded to storage
  const handleSectionFileUploaded = (sectionId: string, url: string) => {
    setPendingSectionImages({
      ...pendingSectionImages,
      [sectionId]: url,
    })
  }

  // When admin clicks "Save Background" for a section
  const handleSaveSectionBackground = async (sectionId: string, layoutType: string) => {
    const url = pendingSectionImages[sectionId]
    if (!url) return

    try {
      setLoading({ ...loading, [sectionId]: true })
      
      // Update this specific section's background_image_url
      const { error } = await supabase
        .from("club_sections")
        .update({ background_image_url: url })
        .eq("id", sectionId)
      
      if (error) {
        console.error("Error saving section background:", error)
        alert("Failed to save section background image")
        return
      }
      
      // Update local state
      const updatedSections = sections[layoutType].map((s) =>
        s.id === sectionId ? { ...s, background_image_url: url } : s
      )
      setSections({
        ...sections,
        [layoutType]: updatedSections,
      })
      
      // Clear pending state
      const newPending = { ...pendingSectionImages }
      delete newPending[sectionId]
      setPendingSectionImages(newPending)
      
      // Show success indicator
      setSavedSections({ ...savedSections, [sectionId]: true })
      setTimeout(() => {
        setSavedSections({ ...savedSections, [sectionId]: false })
      }, 3000)
      
      router.refresh()
    } catch (error) {
      console.error("Error saving section background:", error)
      alert("Failed to save section background")
    } finally {
      setLoading({ ...loading, [sectionId]: false })
    }
  }

  // When admin clicks "Save Blueprint" button, save to database
  const handleSaveBlueprint = async (layoutType: string) => {
    const url = pendingImages[layoutType]
    if (!url) return

    try {
      setLoading({ ...loading, [layoutType]: true })
      
      // Update all sections with this layout_type to have the same blueprint_image_url
      const { error } = await supabase
        .from("club_sections")
        .update({ blueprint_image_url: url })
        .eq("layout_type", layoutType)
      
      if (error) {
        console.error("Error saving blueprint to database:", error)
        alert("Failed to save blueprint image to database")
        return
      }
      
      // Update local state
      setImages({
        ...images,
        [layoutType]: {
          ...images[layoutType],
          blueprint_image_url: url,
        },
      })
      
      // Clear pending state
      const newPending = { ...pendingImages }
      delete newPending[layoutType]
      setPendingImages(newPending)
      
      // Show success indicator
      setSavedLayouts({ ...savedLayouts, [layoutType]: true })
      setTimeout(() => {
        setSavedLayouts({ ...savedLayouts, [layoutType]: false })
      }, 3000)
      
      // Refresh the page data
      router.refresh()
    } catch (error) {
      console.error("Error saving blueprint:", error)
      alert("Failed to save blueprint image")
    } finally {
      setLoading({ ...loading, [layoutType]: false })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <BackButton fallbackUrl="/admin" className="mb-4" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Manage Layout Blueprints</h1>
        <p className="text-muted-foreground">Upload blueprint images for each club layout</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LAYOUT_TYPES.map((layout) => (
          <Card key={layout.value} className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">{layout.label}</CardTitle>
              <CardDescription>{layout.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {images[layout.value]?.blueprint_image_url && (
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border">
                  <img
                    src={images[layout.value].blueprint_image_url || "/guvnor-logo.png"}
                    alt={`${layout.label} Blueprint`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor={`blueprint-${layout.value}`}>Blueprint Image</Label>
                <FileUploader
                  value={pendingImages[layout.value] || images[layout.value]?.blueprint_image_url || ""}
                  onChange={(url) => handleFileUploaded(layout.value, url)}
                  accept="image/*"
                  folder="layout-blueprints"
                  bucket="event-media"
                  description="Select a blueprint image file"
                />
                
                {pendingImages[layout.value] && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <span>File uploaded to storage - click Save to update database</span>
                    </div>
                    <Button 
                      onClick={() => handleSaveBlueprint(layout.value)}
                      disabled={loading[layout.value]}
                      className="w-full"
                    >
                      {loading[layout.value] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving Blueprint...
                        </>
                      ) : (
                        <>Save Blueprint to Database</>
                      )}
                    </Button>
                  </div>
                )}
                
                {savedLayouts[layout.value] && (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 p-2 rounded">
                    <Check className="w-4 h-4" />
                    <span>Blueprint saved to database successfully!</span>
                  </div>
                )}
              </div>

              {images[layout.value]?.blueprint_image_url && (
                <p className="text-xs text-muted-foreground">
                  Blueprint image will be displayed on the public booking page for the {layout.label} layout
                </p>
              )}

              {/* Section Background Images */}
              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-3">Section Background Images</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload background images for each section in this layout
                </p>
                
                {sections[layout.value]?.length > 0 ? (
                  <div className="space-y-4">
                    {sections[layout.value].map((section) => (
                      <div key={section.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">{section.name}</Label>
                          {section.background_image_url && !pendingSectionImages[section.id] && (
                            <span className="text-xs text-green-600">✓ Has background</span>
                          )}
                        </div>
                        
                        <FileUploader
                          value={pendingSectionImages[section.id] || section.background_image_url || ""}
                          onChange={(url) => handleSectionFileUploaded(section.id, url)}
                          accept="image/*"
                          folder="section-backgrounds"
                          bucket="event-media"
                          description="Select section background image"
                        />
                        
                        {pendingSectionImages[section.id] && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-amber-600">
                              <span>File uploaded - click Save to update database</span>
                            </div>
                            <Button 
                              onClick={() => handleSaveSectionBackground(section.id, layout.value)}
                              disabled={loading[section.id]}
                              size="sm"
                              className="w-full"
                            >
                              {loading[section.id] ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>Save Background</>
                              )}
                            </Button>
                          </div>
                        )}
                        
                        {savedSections[section.id] && (
                          <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 p-2 rounded">
                            <Check className="w-4 h-4" />
                            <span>Background saved!</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No sections found for this layout</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
