import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // Get the current user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "User not found or not authenticated. Please sign up again.",
        },
        { status: 401 }
      )
    }

    // Check if email is already verified
    if (user.email_confirmed_at) {
      return NextResponse.json(
        {
          error: "Your email is already verified. You can now log in.",
        },
        { status: 400 }
      )
    }

    // Resend verification email
    const { error: resendError } = await supabase.auth.resendEnrollmentEmail(user.email!)

    if (resendError) {
      console.error("[v0] Resend email error:", resendError)
      return NextResponse.json(
        {
          error: "Failed to resend verification email. Please try again later or contact support.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Verification email sent to ${user.email}. Please check your inbox and spam folder.`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Resend verification error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again or contact support.",
      },
      { status: 500 }
    )
  }
}
