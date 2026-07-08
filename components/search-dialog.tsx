"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { UtensilsCrossed, Calendar, Images, Loader2 } from "lucide-react"

interface SearchResult {
  id: string
  type: "menu" | "event" | "gallery"
  title: string
  description?: string
  subtitle?: string
  metadata?: Record<string, any>
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const handleSearch = async () => {
      if (!query || query.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error("Search failed:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(handleSearch, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false)
    
    switch (result.type) {
      case "menu":
        router.push(`/menu?scroll=${result.id}`)
        break
      case "event":
        router.push(`/events/${result.id}`)
        break
      case "gallery":
        router.push(`/gallery?item=${result.id}`)
        break
    }
    setQuery("")
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "menu":
        return <UtensilsCrossed className="w-4 h-4" />
      case "event":
        return <Calendar className="w-4 h-4" />
      case "gallery":
        return <Images className="w-4 h-4" />
      default:
        return null
    }
  }

  const menuItems = results.filter((r) => r.type === "menu")
  const events = results.filter((r) => r.type === "event")
  const gallery = results.filter((r) => r.type === "gallery")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-input-wrapper]_svg]:hidden [&_[cmdk-input]]:border-0 [&_[cmdk-input]]:py-3">
          <CommandInput
            placeholder="Search Club Guvnor - Menu, Events, Gallery..."
            value={query}
            onValueChange={setQuery}
            className="text-base"
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && query.length < 2 && (
              <CommandEmpty className="py-6 text-sm text-muted-foreground">
                Type at least 2 characters to search...
              </CommandEmpty>
            )}
            {!loading && query.length >= 2 && results.length === 0 && (
              <CommandEmpty className="py-6 text-sm text-muted-foreground">
                No results found for "{query}"
              </CommandEmpty>
            )}

            {menuItems.length > 0 && (
              <CommandGroup heading="Menu" className="overflow-hidden">
                {menuItems.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3 w-full">
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{result.title}</div>
                        {result.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </div>
                        )}
                        {result.metadata?.price && (
                          <div className="text-xs text-primary font-medium">
                            ${result.metadata.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {events.length > 0 && (
              <CommandGroup heading="Events" className="overflow-hidden">
                {events.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3 w-full">
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-xs text-muted-foreground">
                            {result.subtitle}
                          </div>
                        )}
                        {result.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {gallery.length > 0 && (
              <CommandGroup heading="Gallery" className="overflow-hidden">
                {gallery.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3 w-full">
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{result.title}</div>
                        {result.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          <span className="inline-block mr-4">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd> to select
          </span>
          <span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">esc</kbd> to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
