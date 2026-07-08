"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { BackButton } from "@/components/back-button"
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MenuItem {
  id: string
  label: string
  href: string
  icon_name: string | null
  display_order: number
  is_active: boolean
}

const AVAILABLE_ICONS = [
  "Home",
  "UtensilsCrossed",
  "Calendar",
  "Table",
  "MapPin",
  "User",
  "Settings",
  "Info",
  "Phone",
  "Mail",
  "ShoppingBag",
  "Music",
  "Users",
]

export default function NavigationMenuClient() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadMenuItems()
  }, [])

  async function loadMenuItems() {
    const { data } = await supabase
      .from("navigation_menu_items")
      .select("*")
      .order("display_order", { ascending: true })

    if (data) setMenuItems(data)
  }

  async function handleSaveItem(item: Partial<MenuItem>) {
    setLoading(true)
    let error

    if (item.id) {
      const { error: updateError } = await supabase.from("navigation_menu_items").update(item).eq("id", item.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("navigation_menu_items")
        .insert([{ ...item, display_order: menuItems.length }])
      error = insertError
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
        description: "Menu item saved successfully",
      })
      setDialogOpen(false)
      setEditingItem(null)
      loadMenuItems()
    }
    setLoading(false)
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("Are you sure you want to delete this menu item?")) return

    setLoading(true)
    const { error } = await supabase.from("navigation_menu_items").delete().eq("id", id)

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
    setLoading(false)
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const { error } = await supabase.from("navigation_menu_items").update({ is_active: isActive }).eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      })
    } else {
      loadMenuItems()
    }
  }

  return (
    <div className="min-h-screen p-8 relative">
      <div className="absolute top-4 left-4 z-10">
        <BackButton fallbackUrl="/admin" />
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Navigation Menu</h1>
          <p className="text-muted-foreground">Manage the main navigation menu items (Superadmin Only)</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Add, edit, or remove navigation menu items</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingItem(null)
                      setDialogOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Edit" : "Add"} Menu Item</DialogTitle>
                    <DialogDescription>Configure a navigation menu item</DialogDescription>
                  </DialogHeader>
                  <MenuItemForm
                    item={editingItem}
                    onSave={handleSaveItem}
                    loading={loading}
                    onCancel={() => {
                      setDialogOpen(false)
                      setEditingItem(null)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {menuItems.map((item) => (
                <Card key={item.id} className={!item.is_active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                        <div className="flex items-center gap-3">
                          {item.is_active ? (
                            <Eye className="w-5 h-5 text-green-500" />
                          ) : (
                            <EyeOff className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-semibold">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.href}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item)
                            setDialogOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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

function MenuItemForm({
  item,
  onSave,
  loading,
  onCancel,
}: {
  item: MenuItem | null
  onSave: (item: Partial<MenuItem>) => void
  loading: boolean
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Partial<MenuItem>>(
    item || {
      label: "",
      href: "",
      icon_name: "Home",
      is_active: true,
    },
  )

  return (
    <div className="space-y-4">
      <div>
        <Label>Label *</Label>
        <Input
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="Home"
        />
      </div>
      <div>
        <Label>Link (href) *</Label>
        <Input
          value={formData.href}
          onChange={(e) => setFormData({ ...formData, href: e.target.value })}
          placeholder="/"
        />
      </div>
      <div>
        <Label>Icon</Label>
        <Select
          value={formData.icon_name || "Home"}
          onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_ICONS.map((icon) => (
              <SelectItem key={icon} value={icon}>
                {icon}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label>Active</Label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)} disabled={loading || !formData.label || !formData.href}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </div>
  )
}
