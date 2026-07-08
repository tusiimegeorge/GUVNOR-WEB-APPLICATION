'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SUPERADMIN_CONFIG } from '@/lib/superadmin-config'

interface AdminGuardProps {
  children: React.ReactNode
  isSuperadminRequired?: boolean
}

export function AdminGuard({ children, isSuperadminRequired = false }: AdminGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setHasAccess(false)
          router.push('/')
          return
        }

        if (isSuperadminRequired) {
          // Check if superadmin by email
          if (user.email === SUPERADMIN_CONFIG.email) {
            setHasAccess(true)
            return
          }

          // Check if superadmin by role in database
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single()

            if (profile?.role === 'superadmin') {
              setHasAccess(true)
              return
            }
          } catch (error) {
            // Fall back to email check
          }

          setHasAccess(false)
          router.push('/')
        } else {
          // Check if admin or superadmin
          if (user.email === SUPERADMIN_CONFIG.email) {
            setHasAccess(true)
            return
          }

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single()

            if (profile?.role === 'admin' || profile?.role === 'superadmin') {
              setHasAccess(true)
              return
            }
          } catch (error) {
            // Fall back to email check
          }

          setHasAccess(false)
          router.push('/')
        }
      } catch (error) {
        console.error('[v0] AdminGuard error:', error)
        setHasAccess(false)
        router.push('/')
      }
    }

    checkAccess()
  }, [isSuperadminRequired, router])

  if (hasAccess === null) {
    return <div className="flex items-center justify-center min-h-screen">Checking access...</div>
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}
