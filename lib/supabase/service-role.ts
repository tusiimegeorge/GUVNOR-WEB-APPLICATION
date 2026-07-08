import { createClient } from '@supabase/supabase-js'

// Service Role Client - Bypasses all RLS policies
// IMPORTANT: Only use on server-side (API routes, server actions)
// Never expose the service role key to the client

export function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('[v0] Service Role Client Debug:')
  console.log('[v0] URL exists:', !!supabaseUrl)
  console.log('[v0] Service Role Key exists:', !!serviceRoleKey)
  console.log('[v0] Service Role Key length:', serviceRoleKey?.length || 0)

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable - add it to your Vercel project Vars')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Helper to get data bypassing RLS - use with application-level access checks
export async function getPublicData(
  table: string,
  options?: {
    select?: string
    filters?: Record<string, unknown>
    limit?: number
    order?: { column: string; ascending?: boolean }
  }
) {
  try {
    const client = getServiceRoleClient()
    let query = client.from(table).select(options?.select || '*')

    // Apply filters
    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        query = query.eq(key, value)
      }
    }

    // Apply ordering
    if (options?.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending ?? true,
      })
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  } catch (err) {
    console.error(`[v0] Error fetching ${table}:`, err)
    return []
  }
}
