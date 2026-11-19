import { useEffect } from 'react'
import { Platform } from 'react-native'

export const APP_NAME = 'RARE'
export const DEFAULT_PAGE_TITLE = 'RARE — Digital Collectibles'

export interface PageTitleOptions {
  /** Optional subtitle or context (e.g., subject name, edition, or category) */
  subtitle?: string | null
  /** When true, uses the exact title string without appending the brand suffix */
  raw?: boolean
}

/**
 * Formats a clean, standardized browser document title.
 *
 * Rules:
 * - Empty/null -> "RARE — Digital Collectibles"
 * - Title only -> "${title} · RARE"
 * - Title + Subtitle -> "${title} · ${subtitle} · RARE"
 * - Raw -> "${title}"
 */
export function formatPageTitle(title?: string | null, options?: PageTitleOptions): string {
  if (!title || !title.trim()) {
    return DEFAULT_PAGE_TITLE
  }

  const cleanTitle = title.trim()
  if (options?.raw) {
    return cleanTitle
  }

  if (options?.subtitle && options.subtitle.trim()) {
    return `${cleanTitle} · ${options.subtitle.trim()} · ${APP_NAME}`
  }

  return `${cleanTitle} · ${APP_NAME}`
}

/**
 * Resolves a sensible baseline fallback title from the current route pathname.
 */
export function resolveRouteTitle(pathname: string): string {
  if (!pathname) return DEFAULT_PAGE_TITLE

  const path = pathname.split('?')[0].replace(/\/$/, '') || '/'

  if (path === '' || path === '/' || path === '/(tabs)' || path === '/(tabs)/index') {
    return 'Discover · RARE'
  }
  if (path.startsWith('/cards/studio')) {
    return 'Card Studio · RARE'
  }
  if (path.startsWith('/collection') || path === '/(tabs)/collection') {
    return 'Collection · RARE'
  }
  if (path.startsWith('/account') || path === '/(tabs)/account') {
    return 'Personal · RARE'
  }
  if (path.startsWith('/gallery')) {
    return 'Flagship Gallery · RARE'
  }
  if (path.startsWith('/login')) {
    return 'Sign In · RARE'
  }
  if (path.startsWith('/register')) {
    return 'Create Account · RARE'
  }
  if (path.startsWith('/players/create') || path.startsWith('/people/create')) {
    return 'Add Person · RARE'
  }
  if (path.startsWith('/players') || path.startsWith('/people')) {
    return 'Cultural Icons · RARE'
  }
  if (path.startsWith('/cards')) {
    return 'Collectibles · RARE'
  }
  if (path.startsWith('/storefronts')) {
    return 'Storefront · RARE'
  }

  return DEFAULT_PAGE_TITLE
}

/**
 * Safely updates document.title on Web platforms.
 */
export function setDocumentTitle(formattedTitle: string): void {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.title = formattedTitle
  }
}

/**
 * Centralized React hook that dynamically sets the document title.
 * Restores previous title on unmount.
 */
export function usePageTitle(title?: string | null, options?: PageTitleOptions): void {
  useEffect(() => {
    if (Platform.OS !== 'web' || !title) return

    const formatted = formatPageTitle(title, options)
    const prev = typeof document !== 'undefined' ? document.title : ''
    setDocumentTitle(formatted)

    return () => {
      if (prev && typeof document !== 'undefined') {
        document.title = prev
      }
    }
  }, [title, options?.subtitle, options?.raw])
}
