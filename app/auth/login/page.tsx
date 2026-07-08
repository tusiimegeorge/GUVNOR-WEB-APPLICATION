"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { parseAuthError } from "@/lib/auth-errors"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { BackButton } from "@/components/back-button"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/"

  useEffect(() => {
    let cancelled = false

    const testConnection = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          if (!cancelled) {
            setConnectionStatus("error")
            setError("Supabase configuration error. Please check your environment variables.")
          }
          return
        }

        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!cancelled) {
          setConnectionStatus("connected")
        }
      } catch (err: unknown) {
        if (cancelled) return
        if (err instanceof Error && err.name === "AbortError") return
        setConnectionStatus("error")
        setError("Unable to connect to the database. Please check your configuration.")
      }
    }

    testConnection()

    return () => {
      cancelled = true
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    router.back()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting login for:", email)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("[v0] Login error:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        })

        const parsedError = parseAuthError(authError)
        setError(parsedError.userMessage)
        setIsLoading(false)
        return
      }

      console.log("[v0] Login successful!", data.user?.id, "email:", data.user?.email)
      
      // CRITICAL: Wait for browser cookies to be set AND middleware to sync them
      // This ensures the server-side session is available when we navigate
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Verify the session was synced on the server
      try {
        const checkResponse = await fetch('/api/admin/check-status', {
          credentials: 'include'
        })
        const checkData = await checkResponse.json()
        console.log("[v0] Session verification after login:", { authenticated: checkData.authenticated, email: checkData.userEmail })
      } catch (error) {
        console.error("[v0] Session verification failed:", error)
      }
      
      router.push(returnTo || "/dashboard")
    } catch (error: unknown) {
      const parsedError = parseAuthError(error)
      console.error("[v0] Login failed:", parsedError.message)
      setError(parsedError.userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting Google login...")
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
        },
      })

      if (authError) {
        console.error("[v0] Google login error:", authError.message)
        setError("Failed to sign in with Google. Please try again.")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during Google login"
      console.error("[v0] Google login failed:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <div className="fixed top-4 left-4 z-50">
        <BackButton fallbackUrl="/" />
      </div>
      <DialogContent className="max-w-sm">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
            {connectionStatus === "checking" && <p className="text-xs text-muted-foreground">Checking connection...</p>}
            {connectionStatus === "error" && (
              <p className="text-xs text-destructive">Connection error - see details below</p>
            )}
            {connectionStatus === "connected" && <p className="text-xs text-green-600">Connected to database</p>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={connectionStatus === "error"}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/auth/forgot-password" className="text-xs underline underline-offset-4">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={connectionStatus === "error"}
                  />
                </div>
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive font-semibold mb-1">Error</p>
                    <p className="text-xs text-destructive">{error}</p>
                    {connectionStatus === "error" && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Check browser console (F12) for detailed error information.
                      </p>
                    )}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || connectionStatus === "error"}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleLogin}
                  disabled={isLoading || connectionStatus === "error"}
                >
                  {isLoading ? "Signing in..." : "Google"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
