"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface BackButtonProps {
  fallbackUrl?: string
  variant?: "default" | "ghost" | "outline"
  className?: string
}

export function BackButton({ fallbackUrl = "/", variant = "ghost", className = "" }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackUrl)
    }
  }

  return (
    <Button onClick={handleBack} variant={variant} size="icon" className={`rounded-full ${className}`} aria-label="Go back">
      <ArrowLeft className="w-4 h-4" />
    </Button>
  )
}
