"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { parseAuthError } from "@/lib/auth-errors"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { BackButton } from "@/components/back-button"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const router = useRouter()

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("[v0] Testing Supabase connection...")
        const supabase = createClient()

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error("[v0] Missing Supabase environment variables!")
          setConnectionStatus("error")
          setError("Supabase configuration error. Please check your environment variables.")
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("[v0] Supabase connection successful!")
        setConnectionStatus("connected")
      } catch (err) {
        console.error("[v0] Unexpected error testing connection:", err)
        setConnectionStatus("error")
        setError("Unable to connect to the database.")
      }
    }

    testConnection()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Client-side validation
    if (!email.trim()) {
      setError("Please enter a valid email address.")
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match. Please ensure both password fields are identical.")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Attempting sign up for:", email)
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` : "http://localhost:3000/auth/callback"

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      })

      if (authError) {
        console.error("[v0] Sign up error:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        })

        const parsedError = parseAuthError(authError)
        setError(parsedError.userMessage)
        setIsLoading(false)
        return
      }

      console.log("[v0] Sign up successful!", data.user?.id)
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      const parsedError = parseAuthError(error)
      console.error("[v0] Sign up failed:", parsedError.message)
      setError(parsedError.userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting Google sign up...")
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent("/dashboard")}`,
        },
      })

      if (authError) {
        console.error("[v0] Google sign up error:", authError.message)
        setError("Failed to sign up with Google. Please try again.")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during Google sign up"
      console.error("[v0] Google sign up failed:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 relative">
      <div className="absolute top-4 left-4 z-10">
        <BackButton fallbackUrl="/" />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Sign up</CardTitle>
              <CardDescription>Create a new account to start booking</CardDescription>
              {connectionStatus === "checking" && (
                <p className="text-xs text-muted-foreground">Checking connection...</p>
              )}
              {connectionStatus === "error" && (
                <p className="text-xs text-destructive">Connection error - see details below</p>
              )}
              {connectionStatus === "connected" && <p className="text-xs text-green-600">Connected to database</p>}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={connectionStatus === "error"}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0700123456"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={connectionStatus === "error"}
                    />
                  </div>
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
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={connectionStatus === "error"}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">Repeat Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
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
                    {isLoading ? "Creating account..." : "Sign up"}
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
                    onClick={handleGoogleSignUp}
                    disabled={isLoading || connectionStatus === "error"}
                  >
                    {isLoading ? "Signing up..." : "Google"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
