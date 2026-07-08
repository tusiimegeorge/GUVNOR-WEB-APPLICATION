export function Scenes() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border min-h-24 flex flex-col">
        <div className="text-sm font-semibold text-foreground mb-2">Scene 1</div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
          [Content]
        </div>
      </div>
      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border min-h-24 flex flex-col">
        <div className="text-sm font-semibold text-foreground mb-2">Scene 2</div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
          [Content]
        </div>
      </div>
    </div>
  )
}
