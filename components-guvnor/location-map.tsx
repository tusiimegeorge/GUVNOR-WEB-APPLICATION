"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "lucide-react"

interface LocationMapProps {
  latitude: number
  longitude: number
  markerText?: string
}

export function LocationMap({ latitude, longitude, markerText = "Guvnor" }: LocationMapProps) {
  const [startLocation, setStartLocation] = useState("")
  const [showDirections, setShowDirections] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Load Leaflet CSS
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.onload = () => setMapLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.head.removeChild(link)
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    const L = (window as any).L
    if (!L) return

    // Clear any existing map
    if (mapRef.current.innerHTML) {
      mapRef.current.innerHTML = ""
    }

    // Create map
    const map = L.map(mapRef.current).setView([latitude, longitude], 15)

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map)
    marker.bindPopup(`<b>${markerText}</b><br>GUVNOR, First Street, Kampala`).openPopup()

    return () => {
      map.remove()
    }
  }, [mapLoaded, latitude, longitude, markerText, showDirections])

  const handleGetDirections = () => {
    if (startLocation.trim()) {
      const destination = "GUVNOR, First Street, Kampala, Uganda"
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(destination)}&travelmode=driving`
      window.open(url, "_blank")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-card border-b">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter your starting location..."
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGetDirections()
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleGetDirections} disabled={!startLocation.trim()} className="gap-2">
            <Navigation className="w-4 h-4" />
            Get Directions
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enter your location to get turn-by-turn directions to Guvnor
        </p>
      </div>

      <div ref={mapRef} className="flex-1 w-full" style={{ minHeight: "400px" }} />
    </div>
  )
}
