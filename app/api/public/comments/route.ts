import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    // Use anon key for public view (no RLS restrictions from this perspective)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    console.log('[v0] Fetching comments for userId:', userId || 'anonymous')

    // Fetch all comments
    const { data: allComments, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching comments:', error.message)
      return NextResponse.json({ comments: [], error: error.message }, { status: 200 })
    }

    // Filter comments: show approved comments OR user's own comments (pending or approved)
    const filteredComments = (allComments || []).filter((comment) => {
      if (comment.is_approved) {
        return true // Show all approved comments to everyone
      }
      if (userId && comment.user_id === userId) {
        return true // Show user their own comments even if pending approval
      }
      return false // Hide unapproved comments from other users
    })

    console.log('[v0] Returning', filteredComments.length, 'comments')
    return NextResponse.json({ comments: filteredComments || [] }, { status: 200 })
  } catch (error: any) {
    console.error('[v0] Exception in comments route:', error?.message || error)
    return NextResponse.json({ comments: [], error: error?.message || 'Unknown error' }, { status: 200 })
  }
}
