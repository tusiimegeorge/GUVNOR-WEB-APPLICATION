'use client'

import { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  description?: string
  backgroundImageUrl?: string
  children?: ReactNode
  className?: string
}

export function SectionCard({
  title,
  description,
  backgroundImageUrl,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <div
        className={`relative overflow-hidden rounded-lg min-h-[200px] p-8 shadow-lg border border-primary/20 ${className}`}
        style={backgroundImageUrl ? {
          backgroundImage: `url('${backgroundImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
        } : {}}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 rounded-lg" />

        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  )
}
