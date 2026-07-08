"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, Wine } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackButton } from "@/components/back-button"
import { FileUploader } from "@/components/admin/file-uploader"

type Section = {
  id: string
  name: string
  slug: string
  description: string
  background_image_url?: string
  blueprint_image_url?: string
  capacity: number
  is_active: boolean
  display_order: number
  layout_type: string
}

type Complementary = {
  id: string
  name: string
  price_in_cents: number
}

export function SectionsClient({
  sections: initialSections,
  complementaries,
  sectionComplementaries: initialSectionComps,
}: {
  sections: Section[]
  complementaries: Complementary[]
  sectionComplementaries: any[]
}) {
  const [sections, setSections] = useState(initialSections)
  const [sectionComps, setSectionComps] = useState(initialSectionComps)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedComplementaries, setSelectedComplementaries] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    background_image_url: "",
    blueprint_image_url: "",
    capacity: 0,
    layout_type: "main",
    is_active: true,
  })

  const supabase = createClient()

  const handleCreate = () => {
    setEditingSection(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      background_image_url: "",
      blueprint_image_url: "",
      capacity: 0,
      layout_type: "main",
      is_active: true,
    })
    setSelectedComplementaries([])
    setIsDialogOpen(true)
  }

  const handleEdit = (section: Section) => {
    setEditingSection(section)
    setFormData({
      name: section.name,
      slug: section.slug,
      description: section.description,
      background_image_url: section.background_image_url || "",
      capacity: section.capacity,
      layout_type: section.layout_type,
      is_active: section.is_active,
    })
    // Load existing complementaries for this section
    const existingComps = sectionComps
      .filter((sc: any) => sc.section_id === section.id)
      .map((sc: any) => sc.complementary_id)
    setSelectedComplementaries(existingComps)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingSection) {
        // Update existing section
        const { error } = await supabase
          .from("club_sections")
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            background_image_url: formData.background_image_url || null,
            capacity: formData.capacity,
            layout_type: formData.layout_type,
            is_active: formData.is_active,
          })
          .eq("id", editingSection.id)

        if (error) throw error

        // Update complementaries
        try {
          await supabase.from("section_complementaries").delete().eq("section_id", editingSection.id)

          if (selectedComplementaries.length > 0) {
            const compEntries = selectedComplementaries.map((compId) => ({
              section_id: editingSection.id,
              complementary_id: compId,
              quantity: 1,
              is_included: false,
            }))
            await supabase.from("section_complementaries").insert(compEntries)
          }
        } catch (compError) {
          console.log("[v0] Complementaries table not available yet, skipping associations")
        }

        setSections(
          sections.map((s) =>
            s.id === editingSection.id
              ? { ...s, ...formData, background_image_url: formData.background_image_url || undefined }
              : s,
          ),
        )
      } else {
        // Create new section
        const { data, error } = await supabase
          .from("club_sections")
          .insert({
            ...formData,
            background_image_url: formData.background_image_url || null,
            blueprint_image_url: formData.blueprint_image_url || null,
            display_order: sections.length,
          })
          .select()
          .single()

        if (error) throw error

        // Add complementaries if selected
        try {
          if (selectedComplementaries.length > 0 && data) {
            const compEntries = selectedComplementaries.map((compId) => ({
              section_id: data.id,
              complementary_id: compId,
              quantity: 1,
              is_included: false,
            }))
            await supabase.from("section_complementaries").insert(compEntries)
          }
        } catch (compError) {
          console.log("[v0] Complementaries table not available yet, skipping associations")
        }

        setSections([...sections, data])
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving section:", error)
      alert("Failed to save section")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    try {
      const { error } = await supabase.from("club_sections").delete().eq("id", id)

      if (error) throw error

      setSections(sections.filter((s) => s.id !== id))
    } catch (error) {
      console.error("Error deleting section:", error)
      alert("Failed to delete section")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <BackButton fallbackUrl="/admin" className="mb-4" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Sections</h1>
          <p className="text-muted-foreground">Edit club sections, descriptions, and backgrounds</p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Card key={section.id} className="border-2">
            <div
              className="h-32 w-full bg-cover bg-center"
              style={{
                backgroundImage: section.background_image_url
                  ? `url(${section.background_image_url})`
                  : "linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.05) 100%)",
              }}
            />
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{section.name}</CardTitle>
                <Badge variant={section.is_active ? "default" : "secondary"}>
                  {section.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const sectionComplementaries = sectionComps.filter((sc: any) => sc.section_id === section.id)
                  return sectionComplementaries.length > 0 ? (
                    <div className="border-b pb-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Complementaries:</p>
                      <div className="space-y-1">
                        {sectionComplementaries.map((sc: any) => {
                          const comp = complementaries.find((c) => c.id === sc.complementary_id)
                          return (
                            <div key={sc.id} className="text-xs flex items-center gap-1">
                              <Wine className="w-3 h-3" />
                              <span>{comp?.name || "Unknown"}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null
                })()}

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(section)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(section.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Add New Section"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Section Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Guvnor - DJ Booth"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., dj-booth"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enticing description of this section..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">Section Background Image</Label>
              <FileUploader
                value={formData.background_image_url}
                onChange={(url) => setFormData({ ...formData, background_image_url: url })}
                accept="image/*"
                folder="section-backgrounds"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blueprint">Layout Blueprint Image</Label>
              <FileUploader
                value={formData.blueprint_image_url}
                onChange={(url) => setFormData({ ...formData, blueprint_image_url: url })}
                accept="image/*"
                folder="layout-blueprints"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Total Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="layout_type">Layout Type</Label>
                <Select
                  value={formData.layout_type}
                  onValueChange={(value) => setFormData({ ...formData, layout_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Guvnor</SelectItem>
                    <SelectItem value="back">Back Area</SelectItem>
                    <SelectItem value="nook">Nook Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Section is active</Label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Complementaries (Optional)</Label>
                <span className="text-xs text-muted-foreground">Select none to disable complementaries for this section</span>
              </div>
              <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                {complementaries.length > 0 ? (
                  complementaries.map((comp) => (
                    <div key={comp.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`comp_${comp.id}`}
                        checked={selectedComplementaries.includes(comp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedComplementaries([...selectedComplementaries, comp.id])
                          } else {
                            setSelectedComplementaries(selectedComplementaries.filter((id) => id !== comp.id))
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`comp_${comp.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between text-sm">
                          <span>{comp.name}</span>
                          <span className="text-muted-foreground">UGX {comp.price_in_cents.toLocaleString()}</span>
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No complementaries available</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
