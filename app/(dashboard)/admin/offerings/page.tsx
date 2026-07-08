'use client'

import { useEffect } from 'react'
import { ComplementariesAdmin } from '@/components/admin/complementaries-admin'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BackButton } from "@/components/back-button"

export default function AdminComplementariesPage() {
  useEffect(() => {
    // Load data on component mount
    const loadData = async () => {
      try {
        const response = await fetch('/api/admin/complementaries')
        if (response.ok) {
          console.log('[v0] Complementaries loaded successfully')
        }
      } catch (error) {
        console.error('[v0] Error loading complementaries:', error)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-4">
          <BackButton fallbackUrl="/admin" />
        </div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manage Offerings</h1>
          <p className="text-muted-foreground">
            Configure complementary items, bottles, drinks, and appetizers available at your club
          </p>
        </div>

        <Tabs defaultValue="complementaries" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="complementaries">Complementaries</TabsTrigger>
            <TabsTrigger value="tickets">Tickets & Events</TabsTrigger>
          </TabsList>

          <TabsContent value="complementaries" className="space-y-4">
            <ComplementariesAdmin />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <div className="p-8 text-center text-muted-foreground">
              <p>Tickets management coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
