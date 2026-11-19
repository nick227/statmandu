/**
 * Deterministic Adaptive Typography Engine
 *
 * Implements bounded binary search text-fitting across geometric slots.
 * Features:
 * - Word wrapping respecting maxLines and horizontal bounds.
 * - Vertical bounding box & actual rendered glyph bounds validation.
 * - Line height validation matching renderer line spacing (default 1.2).
 * - Actual rendered font measurements via HTML5 Canvas (width, ascent, descent) when available,
 *   with fallback to weighted character metrics.
 * - Font loading validation (document.fonts readiness & cache invalidation).
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
  textAlign?: 'left' | 'center' | 'right'
}

export interface TextSlotBounds {
  width: number
  height: number
  preferredFontSize: number
  minFontSize: number
  maxLines: number
  fontRole?: FontRole
  lineHeightRatio?: number // default 1.2
}

export interface TextLineMetrics {
  width: number
  actualBoundingBoxAscent: number
  actualBoundingBoxDescent: number
  actualHeight: number
  fontHeight: number
}

export interface TextFitResult {
  fontSize: number
  lines: string[]
  isOverflow: boolean
  totalHeight: number
  maxLineWidth: number
  lineHeight: number
  renderedBounds: {
    width: number
    height: number
  }
}

// Character width factor relative to font size for different roles (fallback)
const FONT_ROLE_WIDTH_RATIOS: Record<FontRole, number> = {
  sans: 0.54,
  serif: 0.52,
  mono: 0.60,
  display: 0.58,
  condensed: 0.46,
}

export const FONT_ROLE_CSS_FAMILIES: Record<FontRole, string> = {
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
 * Clears the text fit computation cache (e.g. after web fonts have loaded).
 */
export function clearFitCache(): void {
  FIT_CACHE.clear()
}

/**
 * Checks whether document fonts are ready in the browser.
 */
export function areFontsReady(): boolean {
  if (typeof document === 'undefined' || !('fonts' in document)) return true
  return document.fonts.status === 'loaded'
}

/**
 * Waits for document fonts to load, then invalidates the fit cache.
 */
export async function waitForFontsLoaded(timeoutMs = 1500): Promise<boolean> {
  if (typeof document === 'undefined' || !('fonts' in document)) return true
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ])
    clearFitCache()
    return true
  } catch {
    return false
  }
}

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
 * Measures actual rendered font metrics (width, ascent, descent, height)
 * using Canvas measureText when available, otherwise falling back to character estimation.
 */
export function measureTextLine(text: string, fontSize: number, fontRole: FontRole = 'sans'): TextLineMetrics {
  if (!text) {
    return {
      width: 0,
      actualBoundingBoxAscent: 0,
      actualBoundingBoxDescent: 0,
      actualHeight: 0,
      fontHeight: fontSize * 1.2,
    }
  }

  const ctx = getCanvasMeasurementContext()
  if (ctx) {
    const family = FONT_ROLE_CSS_FAMILIES[fontRole] || FONT_ROLE_CSS_FAMILIES.sans
    ctx.font = `600 ${fontSize}px ${family}`
    const metrics = ctx.measureText(text)

    const ascent = typeof metrics.actualBoundingBoxAscent === 'number'
      ? metrics.actualBoundingBoxAscent
      : fontSize * 0.8
    const descent = typeof metrics.actualBoundingBoxDescent === 'number'
      ? metrics.actualBoundingBoxDescent
      : fontSize * 0.2
    const fontAscent = typeof metrics.fontBoundingBoxAscent === 'number'
      ? metrics.fontBoundingBoxAscent
      : fontSize * 0.9
    const fontDescent = typeof metrics.fontBoundingBoxDescent === 'number'
      ? metrics.fontBoundingBoxDescent
      : fontSize * 0.3

    return {
      width: metrics.width,
      actualBoundingBoxAscent: ascent,
      actualBoundingBoxDescent: descent,
      actualHeight: ascent + descent,
      fontHeight: fontAscent + fontDescent,
    }
  }

  const width = estimateTextWidth(text, fontSize, fontRole)
  return {
    width,
    actualBoundingBoxAscent: fontSize * 0.8,
    actualBoundingBoxDescent: fontSize * 0.2,
    actualHeight: fontSize,
    fontHeight: fontSize * 1.2,
  }
}

/**
 * Measures actual rendered font width.
 */
export function measureTextWidth(text: string, fontSize: number, fontRole: FontRole = 'sans'): number {
  return measureTextLine(text, fontSize, fontRole).width
}

/**
 * Splits text into lines fitting within maxWidth at fontSize.
 */
export function breakTextIntoLines(
  text: string,
  fontSize: number,
  maxWidth: number,
  fontRole: FontRole = 'sans',
): { lines: string[]; maxLineWidth: number; lineMetrics: TextLineMetrics[] } {
  const words = text.trim().split(/\s+/)
  if (words.length === 0 || !words[0]) {
    return { lines: [''], maxLineWidth: 0, lineMetrics: [] }
  }

  const lines: string[] = []
  const lineMetrics: TextLineMetrics[] = []
  let currentLine = words[0]
  let currentMetrics = measureTextLine(currentLine, fontSize, fontRole)
  let maxLineWidth = currentMetrics.width

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const testLine = `${currentLine} ${word}`
    const testMetrics = measureTextLine(testLine, fontSize, fontRole)

    if (testMetrics.width <= maxWidth) {
      currentLine = testLine
      currentMetrics = testMetrics
      if (testMetrics.width > maxLineWidth) maxLineWidth = testMetrics.width
    } else {
      lines.push(currentLine)
      lineMetrics.push(currentMetrics)
      currentLine = word
      currentMetrics = measureTextLine(word, fontSize, fontRole)
      if (currentMetrics.width > maxLineWidth) maxLineWidth = currentMetrics.width
    }
  }

  lines.push(currentLine)
  lineMetrics.push(currentMetrics)
  return { lines, maxLineWidth, lineMetrics }
}

/**
 * Validates whether a given fontSize allows text to fit within width, height, line-height, and maxLines.
 */
function doesTextFit(
  text: string,
  fontSize: number,
  bounds: TextSlotBounds,
): {
  fits: boolean
  lines: string[]
  totalHeight: number
  maxLineWidth: number
  lineHeight: number
} {
  const fontRole = bounds.fontRole || 'sans'
  const lineHeightRatio = bounds.lineHeightRatio || 1.2
  const lineHeight = fontSize * lineHeightRatio

  const { lines, maxLineWidth, lineMetrics } = breakTextIntoLines(text, fontSize, bounds.width, fontRole)

  // Height calculation with actual vertical bounds:
  // For 1 line: vertical span is max(actualHeight, lineHeight)
  // For N lines: (N - 1) * lineHeight + actualHeight of first ascent + last descent
  let totalHeight: number
  if (lines.length <= 1) {
    const singleHeight = lineMetrics[0]?.actualHeight || fontSize
    totalHeight = Math.max(singleHeight, lineHeight)
  } else {
    const firstAscent = lineMetrics[0]?.actualBoundingBoxAscent || (fontSize * 0.8)
    const lastDescent = lineMetrics[lineMetrics.length - 1]?.actualBoundingBoxDescent || (fontSize * 0.2)
    const glyphSpan = (lines.length - 1) * lineHeight + (firstAscent + lastDescent)
    totalHeight = Math.max(lines.length * lineHeight, glyphSpan)
  }

  const fitsWidth = maxLineWidth <= bounds.width + 0.5 // 0.5px tolerance
  const fitsHeight = totalHeight <= bounds.height + 0.5
  const fitsLines = lines.length <= bounds.maxLines

  const fits = fitsWidth && fitsHeight && fitsLines

  return { fits, lines, totalHeight, maxLineWidth, lineHeight }
}

/**
 * Calculates the optimal fitting font size using bounded binary search.
 */
export function fitTextToSlot(
  text: string,
  bounds: TextSlotBounds,
): TextFitResult {
  const cleanText = (text || '').trim()
  const lineHeightRatio = bounds.lineHeightRatio || 1.2

  if (!cleanText) {
    const fallbackSize = bounds.preferredFontSize
    const fallbackLineHeight = fallbackSize * lineHeightRatio
    return {
      fontSize: fallbackSize,
      lines: [''],
      isOverflow: false,
      totalHeight: 0,
      maxLineWidth: 0,
      lineHeight: fallbackLineHeight,
      renderedBounds: { width: 0, height: 0 },
    }
  }

  const cacheKey = `${cleanText}:${bounds.width}:${bounds.height}:${bounds.preferredFontSize}:${bounds.minFontSize}:${bounds.maxLines}:${bounds.fontRole}:${lineHeightRatio}`
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
      lineHeight: preferredCheck.lineHeight,
      renderedBounds: {
        width: preferredCheck.maxLineWidth,
        height: preferredCheck.totalHeight,
      },
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
    lineHeight: bestFitCheck.lineHeight,
    renderedBounds: {
      width: bestFitCheck.maxLineWidth,
      height: bestFitCheck.totalHeight,
    },
  }

  if (FIT_CACHE.size > MAX_CACHE_SIZE) FIT_CACHE.clear()
  FIT_CACHE.set(cacheKey, result)

  return result
}
