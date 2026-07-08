"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/back-button"
import { Plus, Edit, Trash2, Save, Users, Wine, ChevronDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type Table = {
  id: string
  table_number: string
  capacity: number
  price_in_cents: number
  section_id: string
  section?: string
  description?: string
  table_image_url?: string
  status: string
  x_position: number
  y_position: number
  club_sections?: {
    name: string
  }
}

type Section = {
  id: string
  name: string
}

type Complementary = {
  id: string
  name: string
  price_in_cents: number
}

type Event = {
  id: string
  title: string
  event_date: string
}

export function TablesClient({
  tables: initialTables,
  sections,
  complementaries,
  events,
  tableComplementaries: initialTableComps,
}: {
  tables: Table[]
  sections: Section[]
  complementaries: Complementary[]
  events: Event[]
  tableComplementaries: any[]
}) {
  const [tables, setTables] = useState(initialTables)
  const [tableComps, setTableComps] = useState(initialTableComps)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedComplementaries, setSelectedComplementaries] = useState<string[]>([])
  const [isComplementariesOpen, setIsComplementariesOpen] = useState(false)
  const [formData, setFormData] = useState({
    table_number: "",
    capacity: 4,
    price_in_cents: 50000,
    section_id: "",
    event_id: "",
    description: "",
    status: "available",
    x_position: 50,
    y_position: 50,
  })

  const supabase = createClient()

  // Calculate automatic position based on section capacity, table capacity, and existing tables
  const calculateAutoPosition = (
    sectionId: string,
    tableCapacity: number,
    sectionCapacity: number
  ): { x: number; y: number } => {
    const sectionTables = tables.filter((t) => t.section_id === sectionId)
    const tableIndex = sectionTables.length

    // Create a grid layout based on section capacity
    const tablesPerRow = Math.ceil(Math.sqrt(sectionCapacity / 4)) // Rough grid distribution
    const gridWidth = 80 // Use 80% of layout space, leaving margins
    const gridHeight = 80
    const spacing = 100 / (tablesPerRow + 1)

    // Calculate position in grid
    const row = Math.floor(tableIndex / tablesPerRow)
    const col = tableIndex % tablesPerRow

    // Add some randomness to avoid perfect grid
    const randomX = (Math.random() - 0.5) * 8
    const randomY = (Math.random() - 0.5) * 8

    const x = Math.min(Math.max(spacing * (col + 1) + randomX, 10), 90)
    const y = Math.min(Math.max(spacing * (row + 1) + randomY, 10), 90)

    return { x: Math.round(x), y: Math.round(y) }
  }

  const handleCreate = () => {
    setEditingTable(null)
    const selectedSection = sections[0]
    const sectionCapacity = selectedSection?.capacity || 100
    const positions = calculateAutoPosition(selectedSection?.id || "", 4, sectionCapacity)

    setFormData({
      table_number: "",
      capacity: 4,
      price_in_cents: 50000,
      section_id: selectedSection?.id || "",
      event_id: "",
      description: "",
      status: "available",
      x_position: positions.x,
      y_position: positions.y,
    })
    setSelectedComplementaries([])
    setIsDialogOpen(true)
  }

  const handleEdit = (table: Table) => {
    setEditingTable(table)
    setFormData({
      table_number: table.table_number,
      capacity: table.capacity,
      price_in_cents: table.price_in_cents,
      section_id: table.section_id,
      event_id: "",
      description: table.description || "",
      status: table.status,
      x_position: table.x_position || 50,
      y_position: table.y_position || 50,
    })
    // Load existing complementaries for this table
    const existingComps = tableComps
      .filter((tc: any) => tc.table_id === table.id)
      .map((tc: any) => tc.complementary_id)
    setSelectedComplementaries(existingComps)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    console.log("[v0] handleSave called, formData:", formData)
    try {
      if (!formData.table_number || !formData.section_id || !formData.event_id) {
        alert("Please fill in all required fields (Event, Table Number, and Section)")
        return
      }

      // Get section name for the section field
      const selectedSection = sections.find((s) => s.id === formData.section_id)
      const sectionName = selectedSection?.name || "Unknown"

      if (editingTable) {
        console.log("[v0] Updating existing table:", editingTable.id)
        // Update existing table
        const { error } = await supabase
          .from("tables")
          .update({
            table_number: formData.table_number,
            capacity: formData.capacity,
            price_in_cents: formData.price_in_cents,
            section_id: formData.section_id,
            description: formData.description || null,
            status: formData.status,
            x_position: formData.x_position,
            y_position: formData.y_position,
          })
          .eq("id", editingTable.id)

        if (error) throw error

        // Update complementaries
        try {
          await supabase.from("table_complementaries").delete().eq("table_id", editingTable.id)

          if (selectedComplementaries.length > 0) {
            const compEntries = selectedComplementaries.map((compId) => ({
              table_id: editingTable.id,
              complementary_id: compId,
              quantity_available: 1,
              is_included: false,
            }))
            await supabase.from("table_complementaries").insert(compEntries)
          }
        } catch (compError) {
          console.log("[v0] Complementaries table not available yet, skipping associations")
        }

        // Upsert table-event association if event selected
        if (formData.event_id) {
          console.log("[v0] Creating table-event for table:", editingTable.id, "event:", formData.event_id)
          try {
            const response = await fetch('/api/admin/table-events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                table_id: editingTable.id,
                event_id: formData.event_id,
                is_active: true,
              }),
            })
            
            const result = await response.json()
            if (!response.ok) {
              console.error("[v0] Table-event API error:", result.error)
            } else {
              console.log("[v0] Table-event created successfully:", result.data)
            }
          } catch (eventError) {
            console.error("[v0] Table-event association error:", eventError)
          }
        }

        // Fetch updated table with section info
        const { data: updatedTable } = await supabase
          .from("tables")
          .select("*, club_sections(*)")
          .eq("id", editingTable.id)
          .single()

        if (updatedTable) {
          setTables(tables.map((t) => (t.id === editingTable.id ? updatedTable : t)))
        }
      } else {
        // Create new table
        const { data, error } = await supabase
          .from("tables")
          .insert({
            table_number: formData.table_number,
            capacity: formData.capacity,
            price_in_cents: formData.price_in_cents,
            section_id: formData.section_id,
            description: formData.description || null,
            status: formData.status,
            x_position: formData.x_position,
            y_position: formData.y_position,
          })
          .select("*, club_sections(*)")
          .single()

        if (error) throw error

        // Add complementaries if selected
        try {
          if (selectedComplementaries.length > 0 && data) {
            const compEntries = selectedComplementaries.map((compId) => ({
              table_id: data.id,
              complementary_id: compId,
              quantity_available: 1,
              is_included: false,
            }))
            await supabase.from("table_complementaries").insert(compEntries)
          }
        } catch (compError) {
          console.log("[v0] Complementaries table not available yet, skipping associations")
        }

        // Add table-event association if event selected
        if (formData.event_id && data) {
          console.log("[v0] Creating table-event association:", {
            table_id: data.id,
            event_id: formData.event_id,
            is_active: true
          })
          try {
            const { data: teData, error: teError } = await supabase.from("table_events").insert({
              table_id: data.id,
              event_id: formData.event_id,
              is_active: true,
            }).select()
            console.log("[v0] Table-event created:", teData)
            console.log("[v0] Table-event error:", teError)
          } catch (eventError) {
            console.log("[v0] Table-event association error:", eventError)
          }
        } else {
          console.log("[v0] No event selected for table:", { hasEventId: !!formData.event_id, hasData: !!data })
        }

        setTables([...tables, data])
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving table:", error)
      alert("Failed to save table")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return

    try {
      const { error } = await supabase.from("tables").delete().eq("id", id)

      if (error) throw error

      setTables(tables.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Error deleting table:", error)
      alert("Failed to delete table")
    }
  }

  // Group tables by section
  const tablesBySection = tables.reduce(
    (acc, table) => {
      const sectionName = table.club_sections?.name || "No Section"
      if (!acc[sectionName]) acc[sectionName] = []
      acc[sectionName].push(table)
      return acc
    },
    {} as Record<string, Table[]>,
  )

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="absolute top-4 left-4 z-10">
        <BackButton fallbackUrl="/admin" />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Tables</h1>
            <p className="text-muted-foreground">Edit table details, pricing, and availability</p>
          </div>
          <Button onClick={handleCreate} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>

        <div className="space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
          {Object.entries(tablesBySection).map(([sectionName, sectionTables]) => (
            <div key={sectionName}>
              <h2 className="text-2xl font-bold mb-4">{sectionName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sectionTables.map((table) => (
                  <Card key={table.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle>Table {table.table_number}</CardTitle>
                        <Badge variant={table.status === "available" ? "default" : "secondary"}>{table.status}</Badge>
                      </div>
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">
                          📍 {table.club_sections?.name || sectionName}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{table.description || "Premium seating"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{table.capacity} guests</span>
                        </div>
                        <span className="font-bold text-lg">UGX {table.price_in_cents.toLocaleString()}</span>
                      </div>

                      {(() => {
                        const tableComplementaries = tableComps.filter((tc: any) => tc.table_id === table.id)
                        return tableComplementaries.length > 0 ? (
                          <div className="border-t pt-2">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Complementaries:</p>
                            <div className="space-y-1">
                              {tableComplementaries.map((tc: any) => {
                                const comp = complementaries.find((c) => c.id === tc.complementary_id)
                                return (
                                  <div key={tc.id} className="text-xs flex items-center gap-1">
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
                        <Button variant="outline" size="sm" onClick={() => handleEdit(table)} className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(table.id)}>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingTable ? "Edit Table" : "Create New Table"}</DialogTitle>
              <DialogDescription>
                Configure table details, pricing, and complementaries. You can reassign tables to different sections or events.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 pr-4">
                <div className="space-y-2">
                  <Label htmlFor="event_id">Event (Required)</Label>
                  <Select
                    value={formData.event_id}
                    onValueChange={(value) => setFormData({ ...formData, event_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {new Date(event.event_date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Select which event this table belongs to</p>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="table_number">Table Number</Label>
                  <Input
                    id="table_number"
                    value={formData.table_number}
                    onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                    placeholder="T-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section_id">Section</Label>
                  <Select
                    value={formData.section_id}
                    onValueChange={(value) => {
                      const selectedSection = sections.find((s) => s.id === value)
                      const positions = calculateAutoPosition(value, formData.capacity, selectedSection?.capacity || 100)
                      setFormData({ ...formData, section_id: value, x_position: positions.x, y_position: positions.y })
                    }}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (guests)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (UGX)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price_in_cents}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_in_cents: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    step="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Premium seating with great views..."
                    rows={3}
                  />
                </div>
              </div>

              <Collapsible open={isComplementariesOpen} onOpenChange={setIsComplementariesOpen}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Complementaries (Optional)</Label>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronDown className={`h-4 w-4 transition-transform ${isComplementariesOpen ? 'rotate-180' : ''}`} />
                        <span className="sr-only">Toggle complementaries</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent>
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
                  </CollapsibleContent>
                </div>
              </Collapsible>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  const selectedSection = sections.find((s) => s.id === formData.section_id)
                  const sectionCapacity = selectedSection?.capacity || 100
                  const positions = calculateAutoPosition(
                    formData.section_id,
                    formData.capacity,
                    sectionCapacity
                  )
                  setFormData((prev) => ({ ...prev, x_position: positions.x, y_position: positions.y }))
                }}
              >
                Auto Calculate Position
              </Button>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Table
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
