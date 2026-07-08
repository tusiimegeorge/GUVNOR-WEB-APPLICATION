const RECENT_SEARCHES_KEY = "guvnor_recent_searches"
const MAX_RECENT_SEARCHES = 5

export interface RecentSearch {
  query: string
  timestamp: number
}

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addRecentSearch(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return
  
  try {
    const searches = getRecentSearches()
    
    // Remove if already exists (to avoid duplicates)
    const filtered = searches.filter(s => s.query.toLowerCase() !== query.toLowerCase())
    
    // Add new search at the beginning
    const updated = [
      { query: query.trim(), timestamp: Date.now() },
      ...filtered
    ].slice(0, MAX_RECENT_SEARCHES)
    
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Rank search results by relevance
 * - Exact matches get highest priority
 * - Title matches get higher priority than description matches
 * - Shorter titles get slightly higher priority (more specific)
 */
export function rankResults(results: any[], query: string) {
  const lowerQuery = query.toLowerCase()
  
  return results.sort((a, b) => {
    const aTitle = a.title.toLowerCase()
    const bTitle = b.title.toLowerCase()
    
    // Exact title match
    if (aTitle === lowerQuery && bTitle !== lowerQuery) return -1
    if (bTitle === lowerQuery && aTitle !== lowerQuery) return 1
    
    // Title starts with query
    if (aTitle.startsWith(lowerQuery) && !bTitle.startsWith(lowerQuery)) return -1
    if (bTitle.startsWith(lowerQuery) && !aTitle.startsWith(lowerQuery)) return 1
    
    // Title contains query
    if (aTitle.includes(lowerQuery) && !bTitle.includes(lowerQuery)) return -1
    if (bTitle.includes(lowerQuery) && !aTitle.includes(lowerQuery)) return 1
    
    // Shorter title (more specific) gets priority
    return aTitle.length - bTitle.length
  })
}
