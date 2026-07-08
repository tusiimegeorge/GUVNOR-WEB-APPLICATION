"use client"

export function LightControls() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4 min-h-40 flex flex-col">
        <h3 className="text-sm font-semibold text-foreground">Light Intensity</h3>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          [Light Intensity Content]
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 min-h-40 flex flex-col">
        <h3 className="text-sm font-semibold text-foreground">Light Color</h3>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          [Light Color Content]
        </div>
      </div>
    </div>
  )
}
