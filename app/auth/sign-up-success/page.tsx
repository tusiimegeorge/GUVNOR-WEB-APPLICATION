"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Mail, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function SignUpSuccessPage() {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleResendEmail = async () => {
    setResendLoading(true)
    setResendMessage(null)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        setResendMessage({
          type: "error",
          text: data.error || "Failed to resend verification email. Please try again.",
        })
      } else {
        setResendMessage({
          type: "success",
          text: "Verification email resent! Please check your inbox and spam folder.",
        })
      }
    } catch (error) {
      console.error("[v0] Resend email error:", error)
      setResendMessage({
        type: "error",
        text: "Failed to resend email. Please check your connection and try again.",
      })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Account Created Successfully!</CardTitle>
            <CardDescription>
              Your account has been created. Please verify your email to complete the process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Check Your Email</p>
                    <p className="text-sm text-blue-700 mt-1">
                      We&apos;ve sent a verification link to your email address. Click the link to confirm your account and start using Club Guvnor.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">Don&apos;t see the email? Check your spam or junk folder.</p>
                  </div>
                </div>
              </div>

              {resendMessage && (
                <div
                  className={`border rounded-lg p-4 ${
                    resendMessage.type === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex gap-3">
                    <AlertCircle
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        resendMessage.type === "success" ? "text-green-600" : "text-red-600"
                      }`}
                    />
                    <p
                      className={`text-sm ${
                        resendMessage.type === "success" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {resendMessage.text}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button onClick={handleResendEmail} disabled={resendLoading} variant="outline" className="w-full">
                  {resendLoading ? "Sending..." : "Resend Verification Email"}
                </Button>
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full">Go to Login</Button>
                </Link>
                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Already verified? You can now log in with your credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
