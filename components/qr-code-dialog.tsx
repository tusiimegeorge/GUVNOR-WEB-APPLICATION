"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, Download } from "lucide-react"
import { QRCode } from "@/components/qr-code"

export function QRCodeDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const homeUrl = typeof window !== "undefined" ? window.location.origin : "https://guvnor.club"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Share QR Code</span>
          <span className="sm:hidden">QR</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan to Visit Guvnor</DialogTitle>
          <DialogDescription>Share this QR code to direct people to our website</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <QRCode url={homeUrl} size={250} />
          <p className="text-sm text-muted-foreground text-center">{homeUrl}</p>
          <Button
            variant="outline"
            className="w-full gap-2 bg-transparent"
            onClick={() => {
              const canvas = document.querySelector("canvas")
              if (canvas) {
                const url = canvas.toDataURL("image/png")
                const link = document.createElement("a")
                link.download = "guvnor-qr-code.png"
                link.href = url
                link.click()
              }
            }}
          >
            <Download className="w-4 h-4" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
