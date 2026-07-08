"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Home,
  UtensilsCrossed,
  Calendar,
  BookOpen,
  Info,
  Images,
  Shield,
  ChevronFirst,
  ChevronLast,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SUPERADMIN_CONFIG } from "@/lib/superadmin-config"

type Item = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const items: Item[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/bookings", label: "Bookings", icon: BookOpen },
  { href: "/about-us", label: "About Us", icon: Info },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
]

interface SidebarProps {
  isAdmin?: boolean
}

export function Sidebar({ isAdmin: _initialIsAdmin = false }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const [hasAdminAccess, setHasAdminAccess] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Client-side auth check - this updates in real-time when auth state changes
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Check if user is superadmin by email first
          if (user.email === SUPERADMIN_CONFIG.email) {
            setHasAdminAccess(true)
          } else {
            // Fall back to checking profiles table for admin role
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single()
              setHasAdminAccess(profile?.role === "admin" || profile?.role === "superadmin")
            } catch (error) {
              setHasAdminAccess(user.email === SUPERADMIN_CONFIG.email)
            }
          }
        } else {
          setHasAdminAccess(false)
        }
      } catch (error) {
        console.error("[v0] Failed to check admin access:", error)
        setHasAdminAccess(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAdminAccess()

    // Listen for auth state changes and update admin access in real-time
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (session.user.email === SUPERADMIN_CONFIG.email) {
          setHasAdminAccess(true)
        } else {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single()
            setHasAdminAccess(profile?.role === "admin" || profile?.role === "superadmin")
          } catch (error) {
            setHasAdminAccess(session.user.email === SUPERADMIN_CONFIG.email)
          }
        }
      } else {
        setHasAdminAccess(false)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open")
    if (saved) setOpen(saved === "1")
  }, [])
  useEffect(() => {
    localStorage.setItem("sidebar-open", open ? "1" : "0")
  }, [open])

  return (
      <aside
      className={`bg-sidebar-gradient text-white transition-[width] duration-300 rounded-l-3xl flex flex-col h-full  ${
        open ? "w-52" : "w-20"
      }`}
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-5">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Club Guvnor" className="size-9 rounded-xl" />
          <span className={`${open ? "block" : "hidden"} text-sm font-semibold`}>Club Guvnor</span>
        </div>
        <button
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg bg-white/20 p-1.5 hover:bg-white/30"
        >
          {open ? <ChevronFirst className="size-5" /> : <ChevronLast className="size-5" />}
        </button>
      </div>

      <nav className="mt-2 flex-1">
        <ul className="flex flex-col gap-1 px-3">
          {items
            .filter(item => !item.adminOnly || hasAdminAccess)
            .map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname?.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                    active ? "bg-white text-brand" : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Icon className={`size-5 ${active ? "text-brand" : "text-white"}`} />
                  <span className={`${open ? "block" : "hidden"} text-sm`}>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-3 pb-5 pt-2">
        <div className={`rounded-2xl bg-white/10 p-3`}>
          <p className="text-xs leading-5">{open ? "Welcome to Club Guvnor" : "Tip"}</p>
        </div>
      </div>
    </aside>
  )
}
