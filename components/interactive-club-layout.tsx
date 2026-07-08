"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Users, DollarSign } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

type Table = {
  id: string
  table_number: string
  capacity: number
  price_in_cents: number
  section_id: string
  description?: string
  status: string
  position_x?: number
  position_y?: number
}

type Section = {
  id: string
  name: string
  slug: string
  description: string
  tables: Table[]
}

type Props = {
  layoutImage: string
  sections: Section[]
  layoutType: "main" | "back" | "nook"
  user?: any
}

export function InteractiveClubLayout({ layoutImage, sections, layoutType, user }: Props) {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const router = useRouter()

  // Table positions on the layout (percentage-based for responsiveness)
  const tablePositions: Record<string, { x: string; y: string }> = {
    // Main Guvnor tables
    "28": { x: "20%", y: "15%" },
    "29": { x: "12%", y: "22%" },
    "30": { x: "20%", y: "10%" },
    "31": { x: "35%", y: "10%" },
    "32": { x: "48%", y: "10%" },
    "33": { x: "58%", y: "18%" },
    "27": { x: "25%", y: "45%" },
    "26": { x: "18%", y: "58%" },
    "25": { x: "12%", y: "72%" },
    "24": { x: "25%", y: "72%" },
    "15": { x: "62%", y: "45%" },
    "16": { x: "62%", y: "56%" },
    "17": { x: "62%", y: "68%" },
    "18": { x: "62%", y: "82%" },
    "19": { x: "75%", y: "82%" },
    "20": { x: "80%", y: "70%" },
    "21": { x: "75%", y: "58%" },
    "22": { x: "75%", y: "50%" },
    "23": { x: "75%", y: "42%" },
    // Back Area tables
    AA: { x: "15%", y: "45%" },
    BB: { x: "28%", y: "45%" },
    CC: { x: "15%", y: "60%" },
    DD: { x: "28%", y: "60%" },
    "9": { x: "58%", y: "68%" },
    "10": { x: "75%", y: "68%" },
    "11": { x: "75%", y: "78%" },
    "12": { x: "52%", y: "82%" },
    "13": { x: "42%", y: "82%" },
    "14": { x: "38%", y: "70%" },
    // Nook Area tables
    "6": { x: "58%", y: "32%" },
    "7": { x: "68%", y: "42%" },
    "8": { x: "52%", y: "42%" },
  }

  const handleTableClick = (table: Table) => {
    if (table.status !== "available") return

    setSelectedTable(table)

    // If user is not logged in, show login prompt
    if (!user) {
      setShowLoginPrompt(true)
    }
  }

  const handleBookNow = () => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    if (selectedTable) {
      // Redirect to booking page with table ID
      const section = sections.find((s) => s.tables.some((t) => t.id === selectedTable.id))
      if (section) {
        router.push(`/bookings/${section.slug}/${selectedTable.id}`)
      }
    }
  }

  const handleLogin = () => {
    // Store the intended destination
    if (selectedTable) {
      const section = sections.find((s) => s.tables.some((t) => t.id === selectedTable.id))
      if (section) {
        sessionStorage.setItem("bookingRedirect", `/bookings/${section.slug}/${selectedTable.id}`)
      }
    }
    router.push("/auth/login")
  }

  return (
    <div className="space-y-6">
      {/* Layout Image with Clickable Tables */}
      <div className="relative w-full max-w-full rounded-lg overflow-hidden border-2 shadow-lg bg-background">
        <Image
          src={layoutImage || "/guvnor-logo.png"}
          alt={`${layoutType} club layout`}
          width={1200}
          height={800}
          className="w-full h-auto object-cover"
          priority
          style={{ maxWidth: "100%", height: "auto" }}
        />

        {/* Overlay clickable tables */}
        {sections.map((section) =>
          section.tables
            .filter((table) => tablePositions[table.table_number])
            .map((table) => {
              const pos = tablePositions[table.table_number]
              const isAvailable = table.status === "available"

              return (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  disabled={!isAvailable}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                    isAvailable ? "hover:scale-110 cursor-pointer" : "opacity-50 cursor-not-allowed"
                  }`}
                  style={{ left: pos.x, top: pos.y }}
                  title={`Table ${table.table_number} - ${isAvailable ? "Available" : "Booked"}`}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full font-bold text-white shadow-lg border-2 ${
                      isAvailable ? "bg-green-500 border-green-300 hover:bg-green-600" : "bg-gray-500 border-gray-400"
                    }`}
                  >
                    <span className="text-xs md:text-sm">{table.table_number}</span>
                  </div>
                </button>
              )
            }),
        )}
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const availableTables = section.tables.filter((t) => t.status === "available").length
          const totalTables = section.tables.length

          return (
            <Card key={section.id} className="p-4 border-2 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{section.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{section.description}</p>
                  </div>
                  <Badge variant={availableTables > 0 ? "default" : "secondary"}>
                    {availableTables}/{totalTables}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {section.tables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => handleTableClick(table)}
                      disabled={table.status !== "available"}
                      className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                        table.status === "available"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {table.table_number}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Table Details Dialog */}
      <Dialog open={!!selectedTable && !showLoginPrompt} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table {selectedTable?.table_number}</DialogTitle>
            <DialogDescription>{selectedTable?.description || "Premium club seating"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-semibold">Up to {selectedTable?.capacity} guests</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold">UGX {(selectedTable?.price_in_cents || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <Button onClick={handleBookNow} className="w-full" size="lg">
              Book This Table
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to book a table. Please log in or create an account to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button onClick={handleLogin} className="w-full" size="lg">
              Login to Book
            </Button>
            <Button
              onClick={() => {
                setShowLoginPrompt(false)
                setSelectedTable(null)
              }}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
