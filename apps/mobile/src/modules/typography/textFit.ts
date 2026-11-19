/**
 * Deterministic Adaptive Typography Engine
 *
 * Implements bounded binary search text-fitting across geometric slots.
 * Features:
 * - Word wrapping respecting maxLines and bounds.
 * - Width & height constraints.
 * - Actual rendered font measurement via HTML5 Canvas when available,
 *   with fallback to weighted character metrics.
 * - Overflow detection when text cannot fit at minFontSize.
 * - LRU / Map caching for high performance.
 */

export type FontRole = 'sans' | 'serif' | 'mono' | 'display' | 'condensed'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface DesignInput {
  id: string
  bounds: Rect
  preferredFontSize: number
  minFontSize: number
  maxLines: number
  required: boolean
  label?: string
  fill?: string
  fontRole?: FontRole
  allCaps?: boolean
}

export interface TextSlotBounds {
  width: number
  height: number
  preferredFontSize: number
  minFontSize: number
  maxLines: number
  fontRole?: FontRole
  lineHeightRatio?: number // default 1.25
}

export interface TextFitResult {
  fontSize: number
  lines: string[]
  isOverflow: boolean
  totalHeight: number
  maxLineWidth: number
}

// Character width factor relative to font size for different roles (fallback)
const FONT_ROLE_WIDTH_RATIOS: Record<FontRole, number> = {
  sans: 0.54,
  serif: 0.52,
  mono: 0.60,
  display: 0.58,
  condensed: 0.46,
}

const FONT_ROLE_CSS_FAMILIES: Record<FontRole, string> = {
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  serif: "'Georgia', 'Times New Roman', Times, serif",
  mono: "'SF Mono', Monaco, Menlo, 'Courier New', monospace",
  display: "'Impact', 'Arial Black', sans-serif",
  condensed: "'Arial Narrow', sans-serif",
}

// Canvas measurement context for actual rendered font metrics
let offscreenCanvasCtx: CanvasRenderingContext2D | null = null

function getCanvasMeasurementContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  if (!offscreenCanvasCtx) {
    try {
      const canvas = document.createElement('canvas')
      offscreenCanvasCtx = canvas.getContext('2d')
    } catch {
      offscreenCanvasCtx = null
    }
  }
  return offscreenCanvasCtx
}

// Global cache for computed fits
const FIT_CACHE = new Map<string, TextFitResult>()
const MAX_CACHE_SIZE = 1000

/**
 * Estimates text width using weighted character heuristic (fallback for Node / non-DOM).
 */
export function estimateTextWidth(text: string, fontSize: number, fontRole: FontRole = 'sans'): number {
  if (!text) return 0
  const ratio = FONT_ROLE_WIDTH_RATIOS[fontRole] || 0.54

  let unitCount = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if ('ijl|!.,;:I1\'" '.includes(ch)) {
      unitCount += 0.5
    } else if ('WMmw@#%&'.includes(ch)) {
      unitCount += 1.4
    } else if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) {
      unitCount += 1.15
    } else {
      unitCount += 0.95
    }
  }

  return unitCount * fontSize * ratio
}

/**
 * Measures actual rendered font width using Canvas measureText when available,
 * otherwise falls back to character metric estimation.
 */
export function measureTextWidth(text: string, fontSize: number, fontRole: FontRole = 'sans'): number {
  if (!text) return 0
  const ctx = getCanvasMeasurementContext()
  if (ctx) {
    const family = FONT_ROLE_CSS_FAMILIES[fontRole] || FONT_ROLE_CSS_FAMILIES.sans
    ctx.font = `600 ${fontSize}px ${family}`
    return ctx.measureText(text).width
  }
  return estimateTextWidth(text, fontSize, fontRole)
}

/**
 * Splits text into lines fitting within maxWidth at fontSize.
 */
export function breakTextIntoLines(
  text: string,
  fontSize: number,
  maxWidth: number,
  fontRole: FontRole = 'sans',
): { lines: string[]; maxLineWidth: number } {
  const words = text.trim().split(/\s+/)
  if (words.length === 0 || !words[0]) {
    return { lines: [''], maxLineWidth: 0 }
  }

  const lines: string[] = []
  let currentLine = words[0]
  let maxLineWidth = measureTextWidth(currentLine, fontSize, fontRole)

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const testLine = `${currentLine} ${word}`
    const testWidth = measureTextWidth(testLine, fontSize, fontRole)

    if (testWidth <= maxWidth) {
      currentLine = testLine
      if (testWidth > maxLineWidth) maxLineWidth = testWidth
    } else {
      lines.push(currentLine)
      currentLine = word
      const wordWidth = measureTextWidth(word, fontSize, fontRole)
      if (wordWidth > maxLineWidth) maxLineWidth = wordWidth
    }
  }

  lines.push(currentLine)
  return { lines, maxLineWidth }
}

/**
 * Checks if a given fontSize allows text to fit within width, height, and maxLines.
 */
function doesTextFit(
  text: string,
  fontSize: number,
  bounds: TextSlotBounds,
): { fits: boolean; lines: string[]; totalHeight: number; maxLineWidth: number } {
  const fontRole = bounds.fontRole || 'sans'
  const lineHeightRatio = bounds.lineHeightRatio || 1.25
  const lineHeight = fontSize * lineHeightRatio

  const { lines, maxLineWidth } = breakTextIntoLines(text, fontSize, bounds.width, fontRole)
  const totalHeight = lines.length * lineHeight

  const fitsWidth = maxLineWidth <= bounds.width + 1 // 1px tolerance
  const fitsHeight = totalHeight <= bounds.height + 1
  const fitsLines = lines.length <= bounds.maxLines

  const fits = fitsWidth && fitsHeight && fitsLines

  return { fits, lines, totalHeight, maxLineWidth }
}

/**
 * Calculates the optimal fitting font size using bounded binary search.
 */
export function fitTextToSlot(
  text: string,
  bounds: TextSlotBounds,
): TextFitResult {
  const cleanText = (text || '').trim()
  if (!cleanText) {
    return {
      fontSize: bounds.preferredFontSize,
      lines: [''],
      isOverflow: false,
      totalHeight: 0,
      maxLineWidth: 0,
    }
  }

  const cacheKey = `${cleanText}:${bounds.width}:${bounds.height}:${bounds.preferredFontSize}:${bounds.minFontSize}:${bounds.maxLines}:${bounds.fontRole}`
  if (FIT_CACHE.has(cacheKey)) {
    return FIT_CACHE.get(cacheKey)!
  }

  const preferred = Math.max(8, bounds.preferredFontSize)
  const min = Math.max(6, Math.min(bounds.minFontSize, preferred))

  // 1. Check if preferred size fits
  const preferredCheck = doesTextFit(cleanText, preferred, bounds)
  if (preferredCheck.fits) {
    const result: TextFitResult = {
      fontSize: preferred,
      lines: preferredCheck.lines,
      isOverflow: false,
      totalHeight: preferredCheck.totalHeight,
      maxLineWidth: preferredCheck.maxLineWidth,
    }
    if (FIT_CACHE.size > MAX_CACHE_SIZE) FIT_CACHE.clear()
    FIT_CACHE.set(cacheKey, result)
    return result
  }

  // 2. Binary search between min and preferred
  let low = min
  let high = preferred
  let bestFitSize = min
  let bestFitCheck = doesTextFit(cleanText, min, bounds)

  for (let iter = 0; iter < 8; iter++) {
    const mid = Math.floor((low + high) / 2)
    const check = doesTextFit(cleanText, mid, bounds)

    if (check.fits) {
      bestFitSize = mid
      bestFitCheck = check
      low = mid + 1 // Try larger font size
    } else {
      high = mid - 1 // Too large, step down
    }

    if (low > high) break
  }

  const isOverflow = !bestFitCheck.fits

  const result: TextFitResult = {
    fontSize: bestFitSize,
    lines: bestFitCheck.lines,
    isOverflow,
    totalHeight: bestFitCheck.totalHeight,
    maxLineWidth: bestFitCheck.maxLineWidth,
  }

  if (FIT_CACHE.size > MAX_CACHE_SIZE) FIT_CACHE.clear()
  FIT_CACHE.set(cacheKey, result)

  return result
}
