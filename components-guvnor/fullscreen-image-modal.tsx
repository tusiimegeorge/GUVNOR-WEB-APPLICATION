"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"

interface FullscreenImageModalProps {
  isOpen: boolean
  imageUrl: string
  title: string
  onClose: () => void
}

export function FullscreenImageModal({ isOpen, imageUrl, title, onClose }: FullscreenImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/90">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          aria-label="Close fullscreen"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="relative w-full h-[90vh] flex items-center justify-center">
          <Image
            src={imageUrl || "/guvnor-logo.png"}
            alt={title}
            fill
            className="object-contain"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
