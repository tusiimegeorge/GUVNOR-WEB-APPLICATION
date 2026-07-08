"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const NIGHTLIFE_IMAGES = [
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/club-4dcBjNmrSuS9drONnHQ5bXTklmr9hb.jpeg", alt: "Energetic club atmosphere with dancing crowd" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tip-ajXyG5pSXXZ9kiI2goOHWeA9rBoSDw.jpeg", alt: "Premium bottle service in VIP lounge" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/brown-hckLmuZOn2r4q0n0F1bgsdrqTQxNGi.jpeg", alt: "VIP lounge with stylish patrons" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dancer-dK7oHMMYVB86NbTvLYkRIOdHjBD72F.jpeg", alt: "Dynamic dance floor with vibrant lighting" },
  { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/selfie-TXyjnhwQi4L5UAoMuyTWC0p7EnVLiU.jpeg", alt: "Friends enjoying night life with neon lights" },
]

export function NightlifeCarousel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % NIGHTLIFE_IMAGES.length)
    }, 5000) // Auto-scroll every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="rounded-2xl bg-card overflow-hidden shadow-sm ring-1 ring-border min-h-96 flex flex-col relative group">
      {/* Auto-scrolling Image Background */}
      <div className="absolute inset-0 overflow-hidden">
        {NIGHTLIFE_IMAGES.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 1200px) 100vw, 33vw"
            />
          </div>
        ))}
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between">
        <h3 className="text-lg font-bold text-white drop-shadow-lg">Night Life Express</h3>
        <div className="flex-1 flex items-center">
          <p className="text-sm text-white/90 drop-shadow-md leading-relaxed max-w-xs">
            Experience the pulse of Uganda&apos;s most iconic nightlife destination. From electrifying dance floors to exclusive VIP lounges, immerse yourself in an unforgettable atmosphere where world-class entertainment meets premium hospitality. Every night is a celebration at Club Guvnor.
          </p>
        </div>

        {/* Image indicators */}
        <div className="flex gap-2 mt-4">
          {NIGHTLIFE_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-white w-6"
                  : "bg-white/50 w-1.5 hover:bg-white/70"
              }`}
              aria-label={`Go to nightlife image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
