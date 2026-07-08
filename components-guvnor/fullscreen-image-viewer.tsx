"use client"

import { useState } from "react"
import { X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface FullscreenImageViewerProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export function FullscreenImageViewer({ src, alt, isOpen, onClose }: FullscreenImageViewerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
        >
          <X className="w-6 h-6" />
        </Button>
        <div className="relative w-full h-full">
          <Image
            src={src || "/guvnor-logo.png"}
            alt={alt}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}
