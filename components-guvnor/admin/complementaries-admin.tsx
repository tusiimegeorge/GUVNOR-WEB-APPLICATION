'use client';

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit2, Plus, Loader2 } from 'lucide-react'

interface Complementary {
  id: string
  name: string
  category: string
  description?: string
  image_url?: string
  is_available: boolean
  created_at: string
}

export function ComplementariesAdmin() {
  const [complementaries, setComplementaries] = useState<Complementary[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'bottle_service',
    description: '',
    image_url: '',
  })

  const categories = ['bottle_service', 'appetizer', 'drink', 'dessert', 'other']

  const loadComplementaries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/complementaries')
      const data = await response.json()
      setComplementaries(data)
    } catch (error) {
      console.error('[v0] Error loading complementaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const method = editing ? 'PUT' : 'POST'
      const url = editing ? `/api/admin/complementaries/${editing}` : '/api/admin/complementaries'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: '', category: 'bottle_service', description: '', image_url: '' })
        setEditing(null)
        await loadComplementaries()
      }
    } catch (error) {
      console.error('[v0] Error saving complementary:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this complementary item?')) return

    try {
      const response = await fetch(`/api/admin/complementaries/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await loadComplementaries()
      }
    } catch (error) {
      console.error('[v0] Error deleting complementary:', error)
    }
  }

  const handleEdit = (item: Complementary) => {
    setEditing(item.id)
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      image_url: item.image_url || '',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Complementary Item</CardTitle>
          <CardDescription>Add new bottles, appetizers, drinks, or desserts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g., Dom Pérignon Champagne"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              {editing ? 'Update Item' : 'Add Item'}
            </Button>

            {editing && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(null)
                  setFormData({ name: '', category: 'bottle_service', description: '', image_url: '' })
                }}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complementary Items</CardTitle>
          <CardDescription>{complementaries.length} items</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : complementaries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complementaries.map((item) => (
                <Card key={item.id} className="border">
                  <CardContent className="pt-4">
                    {item.image_url && (
                      <img src={item.image_url || "/guvnor-logo.png"} alt={item.name} className="w-full h-40 object-cover rounded mb-3" />
                    )}
                    <h4 className="font-semibold">{item.name}</h4>
                    <Badge variant="outline" className="mt-2 mb-2">
                      {item.category.replace(/_/g, ' ')}
                    </Badge>
                    {item.description && <p className="text-sm text-muted-foreground mb-3">{item.description}</p>}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        className="flex-1"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No complementary items yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
