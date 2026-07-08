"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Save, Wine } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackButton } from "@/components/back-button"
import { FileUploader } from "@/components/admin/file-uploader"
import type { Complementary, SectionComplementary, TableComplementary } from "@/lib/types"

type Section = {
  id: string
  name: string
}

type Table = {
  id: string
  table_number: string
  section_id: string
  club_sections: Section
}

export function ComplementariesClient({
  complementaries: initialComplementaries,
  sections,
  sectionComplementaries: initialSectionComps,
  tables,
  tableComplementaries: initialTableComps,
}: {
  complementaries: Complementary[]
  sections: Section[]
  sectionComplementaries: SectionComplementary[]
  tables: Table[]
  tableComplementaries: TableComplementary[]
}) {
  const [complementaries, setComplementaries] = useState(initialComplementaries)
  const [sectionComps, setSectionComps] = useState(initialSectionComps)
  const [tableComps, setTableComps] = useState(initialTableComps)
  const [editingComp, setEditingComp] = useState<Complementary | null>(null)
  const [isCompDialogOpen, setIsCompDialogOpen] = useState(false)
  const [isSectionCompDialogOpen, setIsSectionCompDialogOpen] = useState(false)
  const [isTableCompDialogOpen, setIsTableCompDialogOpen] = useState(false)
  const [compFormData, setCompFormData] = useState({
    name: "",
    description: "",
    category: "bottle",
    price_in_cents: 30000,
    image_url: "",
    is_available: true,
  })
  const [sectionCompFormData, setSectionCompFormData] = useState({
    section_id: "",
    complementary_id: "",
    quantity: 1,
    is_included: false,
  })
  const [tableCompFormData, setTableCompFormData] = useState({
    table_id: "",
    complementary_id: "",
    quantity: 1,
    is_included: false,
  })

  const supabase = createClient()

  // Complementary management
  const handleCreateComp = () => {
    setEditingComp(null)
    setCompFormData({
      name: "",
      description: "",
      category: "bottle",
      price_in_cents: 30000,
      image_url: "",
      is_available: true,
    })
    setIsCompDialogOpen(true)
  }

  const handleEditComp = (comp: Complementary) => {
    setEditingComp(comp)
    setCompFormData({
      name: comp.name,
      description: comp.description,
      category: comp.category,
      price_in_cents: comp.price_in_cents,
      image_url: comp.image_url || "",
      is_available: comp.is_available,
    })
    setIsCompDialogOpen(true)
  }

  const handleSaveComp = async () => {
    try {
      if (editingComp) {
        const { error } = await supabase
          .from("complementaries")
          .update({
            name: compFormData.name,
            description: compFormData.description,
            category: compFormData.category,
            price_in_cents: compFormData.price_in_cents,
            image_url: compFormData.image_url || null,
            is_available: compFormData.is_available,
          })
          .eq("id", editingComp.id)

        if (error) throw error

        setComplementaries(complementaries.map((c) => (c.id === editingComp.id ? { ...c, ...compFormData } : c)))
      } else {
        const { data, error } = await supabase
          .from("complementaries")
          .insert({
            ...compFormData,
            image_url: compFormData.image_url || null,
          })
          .select()
          .single()

        if (error) throw error

        setComplementaries([...complementaries, data])
      }

      setIsCompDialogOpen(false)
    } catch (error) {
      console.error("Error saving complementary:", error)
      alert("Failed to save complementary")
    }
  }

  const handleDeleteComp = async (id: string) => {
    if (!confirm("Are you sure you want to delete this complementary?")) return

    try {
      const { error } = await supabase.from("complementaries").delete().eq("id", id)

      if (error) throw error

      setComplementaries(complementaries.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting complementary:", error)
      alert("Failed to delete complementary")
    }
  }

  // Section-Complementary association management
  const handleAddSectionComp = () => {
    setSectionCompFormData({
      section_id: sections[0]?.id || "",
      complementary_id: complementaries[0]?.id || "",
      quantity: 1,
      is_included: false,
    })
    setIsSectionCompDialogOpen(true)
  }

  const handleSaveSectionComp = async () => {
    try {
      const { data, error } = await supabase
        .from("section_complementaries")
        .insert(sectionCompFormData)
        .select("*, complementaries(*), club_sections(*)")
        .single()

      if (error) throw error

      setSectionComps([...sectionComps, data])
      setIsSectionCompDialogOpen(false)
    } catch (error) {
      console.error("Error saving section complementary:", error)
      alert("Failed to add complementary to section")
    }
  }

  const handleDeleteSectionComp = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section complementary?")) return

    try {
      const { error } = await supabase.from("section_complementaries").delete().eq("id", id)

      if (error) throw error

      setSectionComps(sectionComps.filter((sc) => sc.id !== id))
    } catch (error) {
      console.error("Error deleting section complementary:", error)
      alert("Failed to delete section complementary")
    }
  }

  // Table-Complementary association management
  const handleAddTableComp = () => {
    setTableCompFormData({
      table_id: tables[0]?.id || "",
      complementary_id: complementaries[0]?.id || "",
      quantity: 1,
      is_included: false,
    })
    setIsTableCompDialogOpen(true)
  }

  const handleSaveTableComp = async () => {
    try {
      const { data, error } = await supabase
        .from("table_complementaries")
        .insert(tableCompFormData)
        .select("*, complementaries(*), tables(*, club_sections(name))")
        .single()

      if (error) throw error

      setTableComps([...tableComps, data])
      setIsTableCompDialogOpen(false)
    } catch (error) {
      console.error("Error saving table complementary:", error)
      alert("Failed to add complementary to table")
    }
  }

  const handleDeleteTableComp = async (id: string) => {
    if (!confirm("Remove this complementary from the table?")) return

    try {
      const { error } = await supabase.from("table_complementaries").delete().eq("id", id)

      if (error) throw error

      setTableComps(tableComps.filter((tc) => tc.id !== id))
    } catch (error) {
      console.error("Error removing table complementary:", error)
      alert("Failed to remove complementary")
    }
  }

  const groupedComps = complementaries.reduce(
    (acc, comp) => {
      if (!acc[comp.category]) acc[comp.category] = []
      acc[comp.category].push(comp)
      return acc
    },
    {} as Record<string, Complementary[]>,
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <BackButton fallbackUrl="/admin" className="mb-4" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Manage Complementaries</h1>
        <p className="text-muted-foreground">Edit bottles, platters, wines, and their pricing</p>
      </div>

      <Tabs defaultValue="complementaries" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="complementaries">Complementaries</TabsTrigger>
          <TabsTrigger value="sections">Section Associations</TabsTrigger>
          <TabsTrigger value="tables">Table Associations</TabsTrigger>
        </TabsList>

        <TabsContent value="complementaries">
          <div className="flex justify-end mb-6">
            <Button onClick={handleCreateComp} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Complementary
            </Button>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedComps).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4 capitalize">{category}s</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((comp) => (
                    <Card key={comp.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{comp.name}</CardTitle>
                          <Badge variant={comp.is_available ? "default" : "secondary"}>
                            {comp.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{comp.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-2xl font-bold">UGX {comp.price_in_cents.toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditComp(comp)} className="flex-1">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteComp(comp.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sections">
          <div className="flex justify-end mb-6">
            <Button onClick={handleAddSectionComp} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add to Section
            </Button>
          </div>

          <div className="space-y-6">
            {sections.map((section) => {
              const sectionItems = sectionComps.filter((sc) => sc.section_id === section.id)
              return (
                <Card key={section.id} className="border-2">
                  <CardHeader>
                    <CardTitle>{section.name}</CardTitle>
                    <CardDescription>
                      {sectionItems.length} complementar{sectionItems.length === 1 ? "y" : "ies"} associated
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sectionItems.length > 0 ? (
                      <div className="space-y-2">
                        {sectionItems.map((sc) => (
                          <div
                            key={sc.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Wine className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-medium">
                                  {sc.quantity}x {sc.complementaries.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {sc.is_included ? "Included in base price" : "Available as add-on"}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSectionComp(sc.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No complementaries associated with this section yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <div className="flex justify-end mb-6">
            <Button onClick={handleAddTableComp} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add to Table
            </Button>
          </div>

          <div className="space-y-6">
            {tables.map((table) => {
              const tableItems = tableComps.filter((tc) => tc.table_id === table.id)
              return (
                <Card key={table.id} className="border-2">
                  <CardHeader>
                    <CardTitle>
                      Table {table.table_number} - {table.club_sections?.name}
                    </CardTitle>
                    <CardDescription>
                      {tableItems.length} complementar{tableItems.length === 1 ? "y" : "ies"} associated
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tableItems.length > 0 ? (
                      <div className="space-y-2">
                        {tableItems.map((tc) => (
                          <div
                            key={tc.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Wine className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-medium">
                                  {tc.quantity}x {tc.complementaries.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {tc.is_included ? "Included in base price" : "Available as add-on"}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTableComp(tc.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No complementaries associated with this table yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Complementary Dialog */}
      <Dialog open={isCompDialogOpen} onOpenChange={setIsCompDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingComp ? "Edit Complementary" : "Add New Complementary"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comp_name">Name</Label>
              <Input
                id="comp_name"
                value={compFormData.name}
                onChange={(e) => setCompFormData({ ...compFormData, name: e.target.value })}
                placeholder="e.g., Premium Whiskey Bottle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comp_description">Description</Label>
              <Textarea
                id="comp_description"
                value={compFormData.description}
                onChange={(e) => setCompFormData({ ...compFormData, description: e.target.value })}
                placeholder="Description of the complementary..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comp_category">Category</Label>
                <Select
                  value={compFormData.category}
                  onValueChange={(value) => setCompFormData({ ...compFormData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottle">Bottle</SelectItem>
                    <SelectItem value="platter">Platter</SelectItem>
                    <SelectItem value="wine">Wine</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comp_price">Price (UGX)</Label>
                <Input
                  id="comp_price"
                  type="number"
                  value={compFormData.price_in_cents}
                  onChange={(e) =>
                    setCompFormData({
                      ...compFormData,
                      price_in_cents: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  step="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comp_image">Image (optional)</Label>
              <FileUploader
                value={compFormData.image_url}
                onChange={(url) => setCompFormData({ ...compFormData, image_url: url })}
                accept="image/*"
                folder="complementaries"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="comp_available"
                checked={compFormData.is_available}
                onChange={(e) => setCompFormData({ ...compFormData, is_available: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="comp_available">Available for purchase</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCompDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveComp}>
                <Save className="w-4 h-4 mr-2" />
                Save Complementary
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Section Complementary Dialog */}
      <Dialog open={isSectionCompDialogOpen} onOpenChange={setIsSectionCompDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Complementary to Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sc_section">Section</Label>
              <Select
                value={sectionCompFormData.section_id}
                onValueChange={(value) => setSectionCompFormData({ ...sectionCompFormData, section_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sc_comp">Complementary</Label>
              <Select
                value={sectionCompFormData.complementary_id}
                onValueChange={(value) => setSectionCompFormData({ ...sectionCompFormData, complementary_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {complementaries.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name} - UGX {comp.price_in_cents.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sc_quantity">Quantity</Label>
              <Input
                id="sc_quantity"
                type="number"
                min={1}
                value={sectionCompFormData.quantity}
                onChange={(e) =>
                  setSectionCompFormData({ ...sectionCompFormData, quantity: Number.parseInt(e.target.value) || 1 })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sc_included"
                checked={sectionCompFormData.is_included}
                onChange={(e) => setSectionCompFormData({ ...sectionCompFormData, is_included: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="sc_included">Included in base price (not an add-on)</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSectionCompDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSectionComp}>
                <Save className="w-4 h-4 mr-2" />
                Add to Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table Complementary Dialog */}
      <Dialog open={isTableCompDialogOpen} onOpenChange={setIsTableCompDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Complementary to Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tc_table">Table</Label>
              <Select
                value={tableCompFormData.table_id}
                onValueChange={(value) => setTableCompFormData({ ...tableCompFormData, table_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Table {table.table_number} - {table.club_sections?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tc_comp">Complementary</Label>
              <Select
                value={tableCompFormData.complementary_id}
                onValueChange={(value) => setTableCompFormData({ ...tableCompFormData, complementary_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {complementaries.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name} - UGX {comp.price_in_cents.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tc_quantity">Quantity</Label>
              <Input
                id="tc_quantity"
                type="number"
                min={1}
                value={tableCompFormData.quantity}
                onChange={(e) =>
                  setTableCompFormData({ ...tableCompFormData, quantity: Number.parseInt(e.target.value) || 1 })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tc_included"
                checked={tableCompFormData.is_included}
                onChange={(e) => setTableCompFormData({ ...tableCompFormData, is_included: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="tc_included">Included in base price (not an add-on)</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTableCompDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTableComp}>
                <Save className="w-4 h-4 mr-2" />
                Add to Table
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
