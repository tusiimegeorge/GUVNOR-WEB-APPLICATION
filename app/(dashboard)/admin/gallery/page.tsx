import { createClient } from '@/lib/supabase/server'
import GalleryClient from './gallery-client'
import { redirect } from 'next/navigation'

export default async function GalleryAdminPage() {
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch all gallery items
  const { data: items, error } = await supabase
    .from('gallery')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[v0] Error fetching gallery items:', error)
  } else {
    console.log('[v0] Successfully fetched gallery items:', items?.length || 0)
  }

  return <GalleryClient initialItems={items || []} />
}
