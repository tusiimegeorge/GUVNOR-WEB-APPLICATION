"use client"

import { useEffect, useState } from "react"
import { Footer } from "@/components/footer"

export default function MenuPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay for smooth transition
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className="w-full min-h-screen relative">
        {isLoading && (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading menu...</p>
            </div>
          </div>
        )}

        <iframe
          src="https://guvnormenuhosted.vercel.app/"
          className="w-full min-h-screen border-0"
          title="GUVNOR Menu"
          onLoad={() => setIsLoading(false)}
          allow="fullscreen"
        />
      </div>
      <Footer />
    </>
  )
}
