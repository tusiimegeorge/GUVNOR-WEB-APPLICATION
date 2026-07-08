'use client'

import { ZoomIn } from 'lucide-react'
import { useState } from 'react'

interface LayoutCardProps {
  title: string
  imageUrl: string
  onZoom: () => void
}

export function LayoutCard({ title, imageUrl, onZoom }: LayoutCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  return (
    <div 
      className="relative overflow-hidden rounded-2xl border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 group cursor-pointer"
      onClick={onZoom}
      style={{
        backgroundImage: `url('${imageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background Image Container */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-background/20 to-background/40 overflow-hidden">
        
        {/* Dark Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 transition-all duration-300 group-hover:from-black/70 group-hover:via-black/30" />

        {/* Title and Zoom Icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-lg mb-4 px-4">
            {title}
          </h3>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-primary/80 transition-all duration-300">
            <ZoomIn className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Instruction Text */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-xs md:text-sm text-white/80 drop-shadow-md">
            Click to view fullscreen
          </p>
        </div>
      </div>
    </div>
  )
}
