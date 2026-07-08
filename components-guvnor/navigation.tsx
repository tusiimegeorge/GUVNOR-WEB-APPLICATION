"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Calendar, MapPin, Table, Home, UtensilsCrossed, LogOut, Shield, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { ThemeToggle } from "@/components/theme-toggle"
import { SUPERADMIN_CONFIG } from "@/lib/superadmin-config"

export function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [hasAdminAccess, setHasAdminAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Check if user is superadmin by email first (hardcoded)
          if (user.email === SUPERADMIN_CONFIG.email) {
            setHasAdminAccess(true)
          } else {
            // Fall back to checking profiles table
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single()
              setHasAdminAccess(profile?.role === "admin" || profile?.role === "superadmin")
            } catch (error) {
              console.log("[v0] Could not fetch profile role, checking email fallback")
              // If profiles table fails, check email
              setHasAdminAccess(user.email === SUPERADMIN_CONFIG.email)
            }
          }
        } else {
          setHasAdminAccess(false)
        }
      } catch (error) {
        // Silently handle any errors - treat as logged out
        setUser(null)
        setHasAdminAccess(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Check if user is superadmin by email first (hardcoded)
        if (session.user.email === SUPERADMIN_CONFIG.email) {
          setHasAdminAccess(true)
        } else {
          // Fall back to checking profiles table
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data }) => {
              setHasAdminAccess(data?.role === "admin" || data?.role === "superadmin")
            })
            .catch(() => {
              // If profiles table fails, check email
              setHasAdminAccess(session.user.email === SUPERADMIN_CONFIG.email)
            })
        }
      } else {
        setHasAdminAccess(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/book-table", label: "Booking", icon: Table },
    { href: "/location", label: "Location", icon: MapPin },
    { href: "/gallery", label: "Gallery", icon: ImageIcon },
  ]

  return (
    <div>
      {/* Fixed Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[var(--header-height)] bg-card border-b border-primary/20 shadow-md">
        <div className="flex items-center justify-between h-full px-[var(--padding-x)] pl-[calc(var(--sidebar-width)+var(--space-2))]">
          {/* Left: Logo and Branding */}
          <Link href="/" className="flex items-center gap-[var(--gap-sm)] flex-shrink-0">
            <div className="w-[var(--icon-md)] h-[var(--icon-md)] rounded-md flex items-center justify-center overflow-hidden bg-black flex-shrink-0">
              <Image src="/guvnor-logo.png" alt="Guvnor Logo" width={32} height={32} className="object-contain w-full h-full" />
            </div>
            <span className="text-[var(--font-size-base)] font-bold">Guvnor</span>
          </Link>

          {/* Right: Theme Toggle and Auth */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button variant="outline" size="sm" onClick={handleLogout} className="bg-transparent gap-[var(--gap-sm)] h-[calc(var(--header-height)*0.6)] text-[var(--font-size-xs)] px-[var(--space-2)]">
                <LogOut className="w-[var(--icon-sm)] h-[var(--icon-sm)]" />
                <span>Logout</span>
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="text-[var(--font-size-xs)] bg-transparent h-[calc(var(--header-height)*0.6)] px-[var(--space-2)]">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Fixed Left Sidebar - narrow, full screen height, no scrollbar */}
      <aside className="fixed left-0 z-40 flex flex-col w-[var(--sidebar-width)] bg-card/95 backdrop-blur-sm border-r border-primary/20 shadow-lg"
        style={{
          top: '0',
          bottom: '0',
          paddingTop: 'calc(3.5rem + 8px)',
        }}
      >
        <nav className="flex flex-col items-center justify-between h-full py-3 px-1">
          <div className="flex flex-col items-center gap-1 w-full">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 w-full py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                  )}
                  title={link.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[10px] font-medium leading-tight">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {!isLoading && hasAdminAccess && (
            <div className="w-full mt-auto pt-2 border-t border-primary/20">
              <Link
                href="/admin"
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-full py-2 rounded-lg transition-all duration-200",
                  pathname.startsWith("/admin")
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10",
                )}
                title="Admin"
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span className="text-[10px] font-medium leading-tight">Admin</span>
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </div>
  )
}
