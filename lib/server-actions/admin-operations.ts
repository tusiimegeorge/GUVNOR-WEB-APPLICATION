'use server'

import { createClient } from '@/lib/supabase/server'
import { getServiceRoleClient } from '@/lib/supabase/service-role'

// Helper function to check if user is admin
async function verifyAdminAccess() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Profile not found')
    }

    if (!['admin', 'superadmin'].includes(profile.role)) {
      throw new Error('Not authorized - admin access required')
    }

    return { user, authorized: true }
  } catch (err) {
    console.error('[v0] Admin auth check failed:', err)
    throw err
  }
}

// Admin Media Operations - uses service role to bypass RLS

export async function addEventPhoto(
  eventId: string,
  photoUrl: string,
  title: string | null,
  displayOrder: number
) {
  try {
    // Verify admin access first
    await verifyAdminAccess()

    const supabase = getServiceRoleClient()

    const { data, error } = await supabase
      .from('event_photos')
      .insert([
        {
          event_id: eventId,
          photo_url: photoUrl,
          title,
          display_order: displayOrder,
        },
      ])
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error('[v0] Error adding photo:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function addEventVideo(
  eventId: string,
  videoUrl: string,
  title: string | null,
  description: string | null,
  duration: number,
  displayOrder: number
) {
  try {
    // Verify admin access first
    await verifyAdminAccess()

    const supabase = getServiceRoleClient()

    // Generate a simple thumbnail URL from the video URL
    // For now, we'll use a placeholder with the video type
    // In production, you'd extract a frame from the video using FFmpeg or similar
    const thumbnailUrl = `${videoUrl}#t=2` // Try to show frame at 2 seconds if supported

    const { data, error } = await supabase
      .from('event_videos')
      .insert([
        {
          event_id: eventId,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          title,
          description,
          duration_seconds: duration,
          display_order: displayOrder,
        },
      ])
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error('[v0] Error adding video:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteEventPhoto(photoId: string) {
  try {
    // Verify admin access first
    await verifyAdminAccess()

    const supabase = getServiceRoleClient()

    const { error } = await supabase.from('event_photos').delete().eq('id', photoId)

    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error('[v0] Error deleting photo:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteEventVideo(videoId: string) {
  try {
    // Verify admin access first
    await verifyAdminAccess()

    const supabase = getServiceRoleClient()

    const { error } = await supabase.from('event_videos').delete().eq('id', videoId)

    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error('[v0] Error deleting video:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Admin Event Operations

export async function createEvent(eventData: Record<string, any>) {
  try {
    // Verify admin access first
    await verifyAdminAccess()

    const supabase = getServiceRoleClient()

    const { data, error } = await supabase.from('events').insert([eventData]).select()

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error('[v0] Error creating event:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function updateEvent(eventId: string, eventData: Record<string, any>) {
  try {
    // Verify admin access first
    await verifyAdminAccess()

    const supabase = getServiceRoleClient()

    const { data, error } = await supabase.from('events').update(eventData).eq('id', eventId).select()

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error('[v0] Error updating event:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    // Verify admin access first
    await verifyAdminAccess()

    const supabase = getServiceRoleClient()

    const { error } = await supabase.from('events').delete().eq('id', eventId)

    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error('[v0] Error deleting event:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Admin Hero Slide Operations

export async function saveHeroSlide(slide: Record<string, any>) {
  try {
    // Verify admin access first
    await verifyAdminAccess()

    const supabase = getServiceRoleClient()

    if (slide.id) {
      // Update existing slide
      const { data, error } = await supabase
        .from('homepage_hero_slides')
        .update(slide)
        .eq('id', slide.id)
        .select()

      if (error) throw error
      return { success: true, data }
    } else {
      // Create new slide
      const { data, error } = await supabase
        .from('homepage_hero_slides')
        .insert([slide])
        .select()

      if (error) throw error
      return { success: true, data }
    }
  } catch (err) {
    console.error('[v0] Error saving hero slide:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteHeroSlide(slideId: string) {
  try {
    // Verify admin access first
    await verifyAdminAccess()

    const supabase = getServiceRoleClient()

    const { error } = await supabase.from('homepage_hero_slides').delete().eq('id', slideId)

    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error('[v0] Error deleting hero slide:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Admin Comment Operations

export async function approveComment(commentId: string) {
  try {
    const supabase = getServiceRoleClient()

    const { data, error } = await supabase
      .from('comments')
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error('[v0] Error approving comment:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function disapproveComment(commentId: string) {
  try {
    const supabase = getServiceRoleClient()

    const { data, error } = await supabase
      .from('comments')
      .update({ is_approved: false, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error('[v0] Error disapproving comment:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteComment(commentId: string) {
  try {
    const supabase = getServiceRoleClient()

    const { error } = await supabase.from('comments').delete().eq('id', commentId)

    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error('[v0] Error deleting comment:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
