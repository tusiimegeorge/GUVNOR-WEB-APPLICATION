"use client"

import { useEffect, useState } from "react"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function FooterQRCode() {
  const [url, setUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.origin)
    }
  }, [])

  const downloadQRCode = () => {
    const svg = document.getElementById("footer-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")

      const downloadLink = document.createElement("a")
      downloadLink.download = "guvnor-club-qr-code.png"
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  if (!url) return null

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="bg-white dark:bg-card p-4 rounded-lg">
        <QRCode id="footer-qr-code" value={url} size={128} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold mb-2">Scan to visit Club Guvnor</p>
        <Button onClick={downloadQRCode} variant="outline" size="sm" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Download QR
        </Button>
      </div>
    </div>
  )
}
