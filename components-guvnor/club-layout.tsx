"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Table } from "@/lib/types"

interface ClubLayoutProps {
  tables: Table[]
  onTableSelect: (table: Table) => void
  selectedTableId?: string
}

export function ClubLayout({ tables, onTableSelect, selectedTableId }: ClubLayoutProps) {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-secondary via-background to-secondary rounded-2xl border-2 border-border overflow-hidden">
      {/* Stage */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-20 bg-gradient-to-b from-primary/30 to-accent/20 rounded-lg border-2 border-primary/50 flex items-center justify-center">
        <span className="text-sm font-bold text-primary">STAGE / DJ BOOTH</span>
      </div>

      {/* Bar Areas */}
      <div className="absolute bottom-4 left-4 w-32 h-40 bg-muted/30 rounded-lg border border-muted-foreground/30 flex items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground rotate-90">BAR</span>
      </div>
      <div className="absolute bottom-4 right-4 w-32 h-40 bg-muted/30 rounded-lg border border-muted-foreground/30 flex items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground rotate-90">BAR</span>
      </div>

      {/* Dance Floor */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground">DANCE FLOOR</span>
      </div>

      {/* Tables */}
      {tables.map((table) => {
        const isSelected = selectedTableId === table.id
        const isHovered = hoveredTable === table.id
        const isBooked = table.status === "booked"
        const isReserved = table.status === "reserved"
        const price = table.price_in_cents.toLocaleString()

        return (
          <button
            key={table.id}
            onClick={() => !isBooked && !isReserved && onTableSelect(table)}
            onMouseEnter={() => setHoveredTable(table.id)}
            onMouseLeave={() => setHoveredTable(null)}
            disabled={isBooked || isReserved}
            className={cn(
              "absolute w-16 h-16 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1",
              isBooked || isReserved
                ? "bg-destructive/20 border-destructive/50 cursor-not-allowed opacity-50"
                : isSelected
                  ? "bg-primary border-primary scale-110 shadow-lg shadow-primary/50"
                  : isHovered
                    ? "bg-accent/50 border-accent scale-105"
                    : "bg-card border-border hover:border-primary/50",
            )}
            style={{
              left: `${table.x_position}%`,
              top: `${table.y_position}%`,
              transform: `translate(-50%, -50%) ${isSelected ? "scale(1.1)" : isHovered ? "scale(1.05)" : ""}`,
            }}
          >
            <span
              className={cn(
                "text-xs font-bold",
                isBooked || isReserved
                  ? "text-destructive"
                  : isSelected
                    ? "text-primary-foreground"
                    : "text-foreground",
              )}
            >
              {table.table_number}
            </span>
            <span
              className={cn(
                "text-xs",
                isBooked || isReserved
                  ? "text-destructive/70"
                  : isSelected
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground",
              )}
            >
              {isBooked ? "Booked" : isReserved ? "Reserved" : `UGX ${price}`}
            </span>
          </button>
        )
      })}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary border-2 border-primary" />
          <span className="text-xs">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-card border-2 border-border" />
          <span className="text-xs">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/20 border-2 border-destructive/50" />
          <span className="text-xs">Booked</span>
        </div>
      </div>

      {/* Info Panel */}
      {hoveredTable && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm rounded-lg border-2 border-primary p-4 min-w-64">
          {(() => {
            const table = tables.find((t) => t.id === hoveredTable)
            if (!table) return null
            return (
              <div className="space-y-1">
                <p className="text-sm font-bold">{table.table_number}</p>
                <p className="text-xs text-muted-foreground">
                  Section: {table.section} • Capacity: {table.capacity} people
                </p>
                {table.status === "booked" || table.status === "reserved" ? (
                  <p className="text-sm font-semibold text-destructive capitalize">{table.status}</p>
                ) : (
                  <p className="text-sm font-semibold text-primary">
                    UGX {table.price_in_cents.toLocaleString()}
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
