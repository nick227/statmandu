/**
 * Deterministic Adaptive Typography Engine
 *
 * Implements bounded binary search text-fitting across geometric slots.
 * Features:
 * - Word wrapping respecting maxLines and bounds.
 * - Width & height constraints.
 * - Font role character measurement approximations (sans, serif, mono, display, condensed).
 * - Overflow detection when text cannot fit at minFontSize.
 * - LRU / Map caching for high performance.
 */

export type FontRole = 'sans' | 'serif' | 'mono' | 'display' | 'condensed'

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

// Character width factor relative to font size for different roles
const FONT_ROLE_WIDTH_RATIOS: Record<FontRole, number> = {
  sans: 0.54,
  serif: 0.52,
  mono: 0.60,
  display: 0.58,
  condensed: 0.46,
}

// Global cache for computed fits
const FIT_CACHE = new Map<string, TextFitResult>()
const MAX_CACHE_SIZE = 1000

/**
 * Estimates the width of a given text string at a given font size.
 */
export function estimateTextWidth(text: string, fontSize: number, fontRole: FontRole = 'sans'): number {
  if (!text) return 0
  const ratio = FONT_ROLE_WIDTH_RATIOS[fontRole] || 0.54

  // Weighted character widths (narrow chars like i, l, t vs wide chars like W, M, m)
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
  let maxLineWidth = estimateTextWidth(currentLine, fontSize, fontRole)

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const testLine = `${currentLine} ${word}`
    const testWidth = estimateTextWidth(testLine, fontSize, fontRole)

    if (testWidth <= maxWidth) {
      currentLine = testLine
      if (testWidth > maxLineWidth) maxLineWidth = testWidth
    } else {
      lines.push(currentLine)
      currentLine = word
      const wordWidth = estimateTextWidth(word, fontSize, fontRole)
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

  // Up to 8 iterations guarantees 0.5px precision across a 100px range
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

  // 3. If even min font size doesn't fit, mark overflow
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
