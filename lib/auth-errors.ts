/**
 * Authentication Error Handler
 * Maps Supabase and application errors to user-friendly messages
 */

export interface AuthError {
  code?: string
  message: string
  userMessage: string
}

export function parseAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Email already exists
    if (message.includes("user already exists") || message.includes("duplicate key")) {
      return {
        code: "USER_EXISTS",
        message: error.message,
        userMessage: "This email is already registered. Please sign in instead or use a different email.",
      }
    }

    // Invalid email format
    if (message.includes("invalid email") || message.includes("valid email")) {
      return {
        code: "INVALID_EMAIL",
        message: error.message,
        userMessage: "Please enter a valid email address.",
      }
    }

    // Password too weak
    if (message.includes("password") || message.includes("weak")) {
      return {
        code: "WEAK_PASSWORD",
        message: error.message,
        userMessage: "Password should be at least 6 characters long.",
      }
    }

    // Invalid credentials
    if (message.includes("invalid login credentials") || message.includes("incorrect")) {
      return {
        code: "INVALID_CREDENTIALS",
        message: error.message,
        userMessage: "Invalid email or password. Please try again.",
      }
    }

    // User not found
    if (message.includes("user not found") || message.includes("no user")) {
      return {
        code: "USER_NOT_FOUND",
        message: error.message,
        userMessage: "No account found with this email. Please sign up first.",
      }
    }

    // Email not confirmed
    if (message.includes("email not confirmed") || message.includes("verify")) {
      return {
        code: "EMAIL_NOT_CONFIRMED",
        message: error.message,
        userMessage: "Please verify your email address. Check your inbox for the confirmation link.",
      }
    }

    // Rate limiting
    if (message.includes("rate limit") || message.includes("too many requests")) {
      return {
        code: "RATE_LIMITED",
        message: error.message,
        userMessage: "Too many attempts. Please wait a few minutes before trying again.",
      }
    }

    // Network error
    if (message.includes("network") || message.includes("fetch")) {
      return {
        code: "NETWORK_ERROR",
        message: error.message,
        userMessage: "Network error. Please check your connection and try again.",
      }
    }

    // Default error
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      userMessage: "An error occurred. Please try again or contact support if the problem persists.",
    }
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Unknown error",
    userMessage: "An unexpected error occurred. Please try again.",
  }
}

export function isAuthError(error: unknown): error is Error {
  return error instanceof Error
}
