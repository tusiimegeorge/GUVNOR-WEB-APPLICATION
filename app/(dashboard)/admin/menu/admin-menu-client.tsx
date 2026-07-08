"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/back-button"
import type { MenuItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, Plus } from "lucide-react"

const CATEGORIES = [
  "Soft Drinks",
  "Beers",
  "Vodka",
  "Sherries",
  "Vermouths",
  "Rums",
  "Bitters and Mixers",
  "Liqueurs",
  "Gin",
  "Brandy",
  "Whiskies/Scotch Whiskys",
  "Bourbons",
  "Johnnie Walker",
  "Single Malts",
  "Non Alcoholic",
  "Red Wines",
  "Port Wine",
  "White Wine",
  "Sweet Wine",
  "Sparkling and Bubbly Wines",
  "Champagne",
  "Cocktails",
  "Warm Starters",
  "Main Course",
  "Side Orders",
]

export default function AdminMenuClient() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadMenuItems()
  }, [selectedCategory])

  async function loadMenuItems() {
    let query = supabase.from("menu_items").select("*").order("category").order("name")

    if (selectedCategory !== "all") {
      query = query.eq("category", selectedCategory)
    }

    const { data } = await query

    if (data) {
      setMenuItems(data as MenuItem[])
    }
  }

  async function handleSave(formData: FormData) {
    setLoading(true)
    const itemData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      bottle_size: formData.get("bottle_size") as string,
      bottle_price_in_cents: Number.parseInt(formData.get("bottle_price") as string) || 0,
      tots_price_in_cents:
        formData.get("has_tots") === "on" ? Number.parseInt(formData.get("tots_price") as string) || 0 : null,
      has_tots: formData.get("has_tots") === "on",
      is_available: formData.get("is_available") === "on",
    }

    let error
    if (editingItem) {
      const result = await supabase.from("menu_items").update(itemData).eq("id", editingItem.id)
      error = result.error
    } else {
      const result = await supabase.from("menu_items").insert([itemData])
      error = result.error
    }

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Menu item ${editingItem ? "updated" : "added"} successfully`,
      })
      setIsDialogOpen(false)
      setEditingItem(null)
      loadMenuItems()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return

    const { error } = await supabase.from("menu_items").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      })
      loadMenuItems()
    }
  }

  return (
    <div className="min-h-screen p-8 relative">
      <div className="absolute top-4 left-4 z-10">
        <BackButton fallbackUrl="/admin" />
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Edit Menu</h1>
            <p className="text-muted-foreground">Add, update, or remove menu items</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingItem(null)
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSave(new FormData(e.currentTarget))
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" name="name" defaultValue={editingItem?.name} required />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingItem?.description || ""}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingItem?.category} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bottle_size">Bottle Size (e.g., 750ml, Plate)</Label>
                  <Input id="bottle_size" name="bottle_size" defaultValue={editingItem?.bottle_size || ""} />
                </div>

                <div>
                  <Label htmlFor="bottle_price">Bottle/Item Price (UGX)</Label>
                  <Input
                    id="bottle_price"
                    name="bottle_price"
                    type="number"
                    defaultValue={editingItem?.bottle_price_in_cents || ""}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="has_tots" name="has_tots" defaultChecked={editingItem?.has_tots} />
                  <Label htmlFor="has_tots">Has Tots/Small Size</Label>
                </div>

                <div>
                  <Label htmlFor="tots_price">Tot/Small Price (UGX)</Label>
                  <Input
                    id="tots_price"
                    name="tots_price"
                    type="number"
                    defaultValue={editingItem?.tots_price_in_cents || ""}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_available"
                    name="is_available"
                    defaultChecked={editingItem?.is_available !== false}
                  />
                  <Label htmlFor="is_available">Available</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {editingItem ? "Update" : "Add"} Item
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditingItem(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Label>Filter by Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {menuItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {item.name}
                      <Badge variant="secondary">{item.category}</Badge>
                      {!item.is_available && <Badge variant="destructive">Unavailable</Badge>}
                    </CardTitle>
                    {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingItem(item)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Size</p>
                    <p className="text-muted-foreground">{item.bottle_size || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Bottle/Item Price</p>
                    <p className="text-muted-foreground">
                      UGX {item.bottle_price_in_cents ? item.bottle_price_in_cents.toLocaleString() : "N/A"}
                    </p>
                  </div>
                  {item.has_tots && (
                    <div>
                      <p className="font-semibold">Tot Price</p>
                      <p className="text-muted-foreground">
                        UGX {item.tots_price_in_cents ? item.tots_price_in_cents.toLocaleString() : "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
