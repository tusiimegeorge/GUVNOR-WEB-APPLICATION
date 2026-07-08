'use server'

import { createClient } from '@supabase/supabase-js'

// Use a plain Supabase client for public data queries (no auth session = no lock contention)
function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function getPublicComments() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("[v0] Error fetching comments:", error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error("[v0] Exception in getPublicComments:", err)
    return []
  }
}

export async function submitComment(
  comment: string,
  rating: number
) {
  try {
    const supabase = await createClient()

    // Get current user - must be authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("You must be logged in to submit feedback")
    }

    // Get user profile for user_name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      throw new Error("User profile not found")
    }

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          user_id: user.id,
          user_name: profile.full_name || user.email,
          comment: comment,
          rating: rating,
          is_approved: false,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error submitting comment:", error.message)
      throw new Error(error.message)
    }

    return data
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to submit feedback"
    console.error("[v0] Exception in submitComment:", errorMessage)
    throw new Error(errorMessage)
  }
}

export async function getPublicSlides() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("signature_events")
      .select("*")
      .order("order_position", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching slides:", error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error("[v0] Exception in getPublicSlides:", err)
    return []
  }
}
