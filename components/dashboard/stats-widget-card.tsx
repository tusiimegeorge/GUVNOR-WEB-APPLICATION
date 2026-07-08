"use client"

type Props = {
  title: string
  icon?: "pc" | "fridge" | "washer" | "ac"
}

export function DeviceCard({ title, icon = "pc" }: Props) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border min-h-24 flex flex-col">
      <h4 className="text-xs font-semibold text-foreground mb-4">{title}</h4>
      {/* Content placeholder - customize as needed */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        [Device Content]
      </div>
    </div>
  )
}
