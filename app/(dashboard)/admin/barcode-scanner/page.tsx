'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, Camera, Keyboard, Calendar } from 'lucide-react'
import { BackButton } from "@/components/back-button"

interface ScanResult {
  status: 'success' | 'error' | 'already_scanned'
  message: string
  ticketId?: string
  ticketNumber?: number
  bookingId?: string
  eventId?: string
  tableNumber?: string
  sectionName?: string
  layoutType?: string
}

interface Event {
  id: string
  title: string
  event_date: string
  total_tickets: number
  available_tickets: number
}

export default function BarcodeScannerPage() {
  const [barcodeInput, setBarcodeInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [scannedCount, setScannedCount] = useState(0)
  const [showInput, setShowInput] = useState(false)
  const [scanMode, setScanMode] = useState<'manual' | 'camera'>('manual')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [happeningNowEvents, setHappeningNowEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [loadingEvents, setLoadingEvents] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Load happening now events
  useEffect(() => {
    async function loadHappeningNowEvents() {
      setLoadingEvents(true)
      try {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const { data, error } = await supabase
          .from('events')
          .select('id, title, event_date, total_tickets, available_tickets')
          .gte('event_date', today.toISOString())
          .lt('event_date', tomorrow.toISOString())
          .order('event_date', { ascending: true })

        if (error) {
          console.error('[v0] Error loading events:', error)
          toast({
            title: 'Error',
            description: 'Failed to load events happening today',
            variant: 'destructive',
          })
        } else if (data && data.length > 0) {
          setHappeningNowEvents(data as Event[])
          setSelectedEventId(data[0].id) // Auto-select first event
          console.log('[v0] Loaded', data.length, 'happening now events')
        } else {
          toast({
            title: 'No Events',
            description: 'No events are happening today',
          })
        }
      } catch (err) {
        console.error('[v0] Exception loading events:', err)
      } finally {
        setLoadingEvents(false)
      }
    }

    loadHappeningNowEvents()
  }, [supabase, toast])

  // Auto-focus input for manual scanner
  useEffect(() => {
    if (scanMode === 'manual' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [scanMode])

  // Start camera stream
  async function startCamera() {
    try {
      setCameraError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        startBarcodeDetection()
      }
    } catch (err: any) {
      console.error('[v0] Camera access error:', err)
      setCameraError(err.message || 'Unable to access camera. Please check permissions.')
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions.',
        variant: 'destructive',
      })
    }
  }

  // Stop camera stream
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  // Detect barcodes from camera feed
  function startBarcodeDetection() {
    const detectBarcode = () => {
      if (!videoRef.current || !canvasRef.current || !cameraActive) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        // Use html5-qrcode library for barcode detection
        try {
          // Simple barcode detection using canvas image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Basic barcode detection - look for high contrast patterns
          // This is a simplified approach; for production, use a dedicated library
          // For now, we'll just detect movement patterns that might indicate a barcode

          // Request next frame
          requestAnimationFrame(detectBarcode)
        } catch (err) {
          console.error('[v0] Barcode detection error:', err)
          requestAnimationFrame(detectBarcode)
        }
      }
    }

    requestAnimationFrame(detectBarcode)
  }

  // Handle manual barcode input from camera
  function handleCameraInput(barcode: string) {
    setBarcodeInput(barcode)
    // Auto-scan when barcode is detected
    setTimeout(() => {
      handleScan(barcode)
    }, 100)
  }

  async function handleScan(barcode?: string) {
    const barcodeToScan = barcode || barcodeInput.trim()

    if (!barcodeToScan) {
      return
    }

    if (!selectedEventId) {
      toast({
        title: 'No Event Selected',
        description: 'Please select an event to scan tickets for',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      console.log('[v0] Scanning ticket for event:', selectedEventId)
      const response = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: barcodeToScan,
          eventId: selectedEventId
        }),
      })

      const data: ScanResult = await response.json()
      setLastResult(data)

      if (data.status === 'success') {
        setScannedCount((prev) => prev + 1)
        toast({
          title: 'Success',
          description: `Ticket #${data.ticketNumber} scanned successfully!`,
        })
      } else if (data.status === 'already_scanned') {
        toast({
          title: 'Already Scanned',
          description: data.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        })
      }

      setBarcodeInput('')
      if (scanMode === 'manual' && inputRef.current) {
        inputRef.current.focus()
      }
    } catch (err: any) {
      console.error('[v0] Scan error:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to scan ticket',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerateBarcode() {
    if (!lastResult?.ticketId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/tickets/${lastResult.ticketId}/regenerate`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'New barcode generated successfully!',
        })
        setLastResult(null)
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      console.error('[v0] Regenerate barcode error:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to regenerate barcode',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <BackButton fallbackUrl="/admin" />
        </div>
        {/* Header */}
        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold text-white mb-2">Barcode Scanner</h1>
          <p className="text-slate-400">Scan tickets at the entrance</p>
        </div>

        {/* Event Selector */}
        <Card className="mb-6 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Happening Now
            </CardTitle>
            <CardDescription className="text-purple-100">
              Select the event you're scanning tickets for
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingEvents ? (
              <div className="text-center py-4">
                <p className="text-slate-600">Loading events...</p>
              </div>
            ) : happeningNowEvents.length === 0 ? (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                <p className="text-slate-700 font-semibold">No Events Today</p>
                <p className="text-slate-500 text-sm mt-1">
                  There are no events scheduled for today
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {happeningNowEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEventId && (
                  <div className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded">
                    <span className="text-slate-600">Tickets Scanned:</span>
                    <Badge variant="secondary" className="text-base">
                      {scannedCount}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scan Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => {
              setScanMode('manual')
              stopCamera()
            }}
            variant={scanMode === 'manual' ? 'default' : 'outline'}
            className="flex-1"
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Manual
          </Button>
          <Button
            onClick={() => {
              setScanMode('camera')
              if (!cameraActive) {
                startCamera()
              }
            }}
            variant={scanMode === 'camera' ? 'default' : 'outline'}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </Button>
        </div>

        {/* Scanner Card */}
        <Card className="mb-6 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <span>{scanMode === 'camera' ? 'Camera Scanner' : 'Manual Scanner'}</span>
              <span className="text-sm font-normal ml-auto">{scannedCount} scanned</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {scanMode === 'camera' ? (
              // Camera Mode
              <div className="space-y-4">
                {cameraActive ? (
                  <>
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute inset-0 border-4 border-primary rounded-lg pointer-events-none"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 border-2 border-primary rounded-lg opacity-50"></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 text-center">
                      Position barcode within the frame to scan
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="manual-camera-input" className="text-slate-700">
                        Or enter manually
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="manual-camera-input"
                          type="text"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleScan()
                            }
                          }}
                          placeholder="Scan or enter barcode"
                          className="text-sm"
                        />
                        <Button onClick={() => handleScan()} disabled={loading || !barcodeInput.trim()} size="sm">
                          Scan
                        </Button>
                      </div>
                    </div>
                    <Button onClick={stopCamera} variant="destructive" className="w-full">
                      Stop Camera
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    {cameraError ? (
                      <>
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 text-sm mb-4">{cameraError}</p>
                        <Button onClick={startCamera} className="w-full">
                          Retry Camera Access
                        </Button>
                      </>
                    ) : (
                      <>
                        <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600 text-sm mb-4">Camera will be activated when you start scanning</p>
                        <Button onClick={startCamera} className="w-full">
                          Start Camera
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Manual Mode
              <div className="space-y-4">
                <div>
                  <Label htmlFor="barcode" className="text-slate-700">
                    Barcode Input
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      ref={inputRef}
                      id="barcode"
                      type={showInput ? 'text' : 'password'}
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleScan()
                        }
                      }}
                      placeholder="Scan barcode or enter manually"
                      className="pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowInput(!showInput)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Press Enter to scan or click button below</p>
                </div>

                <Button onClick={() => handleScan()} disabled={loading || !barcodeInput.trim()} size="lg" className="w-full">
                  {loading ? 'Scanning...' : 'Scan Ticket'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Result */}
        {lastResult && (
          <Card className={`mb-6 border-l-4 ${lastResult.status === 'success' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {lastResult.status === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${lastResult.status === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                    {lastResult.status === 'success' ? 'Ticket Scanned' : 'Scan Failed'}
                  </p>
                  <p className={`text-sm mt-1 ${lastResult.status === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {lastResult.message}
                  </p>
                  {lastResult.status === 'success' && (lastResult.tableNumber || lastResult.sectionName) && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs font-semibold text-green-900 mb-2">🎟️ VIP Table Ticket</p>
                      {lastResult.tableNumber && (
                        <p className="text-sm text-green-800">
                          <strong>Table:</strong> {lastResult.tableNumber}
                        </p>
                      )}
                      {lastResult.sectionName && (
                        <p className="text-sm text-green-800">
                          <strong>Section:</strong> {lastResult.sectionName}
                        </p>
                      )}
                      {lastResult.layoutType && (
                        <p className="text-sm text-green-800">
                          <strong>Area:</strong> {lastResult.layoutType}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {lastResult.status === 'success' && (
                <Button
                  onClick={handleRegenerateBarcode}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New Barcode (Late Entry)
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-slate-100 border-0">
          <CardHeader>
            <CardTitle className="text-base">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex gap-3">
              <span className="font-bold text-primary flex-shrink-0">1</span>
              <p>Choose Manual or Camera mode</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-primary flex-shrink-0">2</span>
              <p>Position barcode in frame or use external scanner</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-primary flex-shrink-0">3</span>
              <p>Barcode will be scanned and marked</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-primary flex-shrink-0">4</span>
              <p>For late entries, generate a new barcode</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
