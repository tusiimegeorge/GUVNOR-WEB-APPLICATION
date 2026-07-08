"use client"

import { useEffect, useRef } from "react"
import QRCodeStyling from "qr-code-styling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface QRCodeProps {
  url: string
  title?: string
  description?: string
  size?: number
}

export function QRCode({ url, title = "Scan QR Code", description, size = 200 }: QRCodeProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const qrCode = new QRCodeStyling({
      width: size,
      height: size,
      data: url,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "Q",
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 0,
      },
      dotsOptions: {
        type: "rounded",
        color: "#000000",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#000000",
      },
      cornersDotOptions: {
        type: "dot",
        color: "#000000",
      },
    })

    if (ref.current) {
      ref.current.innerHTML = ""
      qrCode.append(ref.current)
    }
  }, [url, size])

  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div ref={ref} className="flex items-center justify-center bg-white p-4 rounded-lg" />
      </CardContent>
    </Card>
  )
}
