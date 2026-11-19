import {
  fitTextToSlot,
  estimateTextWidth,
  measureTextWidth,
  measureTextLine,
  breakTextIntoLines,
  areFontsReady,
  waitForFontsLoaded,
  clearFitCache,
  type TextSlotBounds,
} from '../textFit'

describe('Deterministic Adaptive Typography (textFit)', () => {
  beforeEach(() => {
    clearFitCache()
  })

  const defaultSlot: TextSlotBounds = {
    width: 480,
    height: 70,
    preferredFontSize: 36,
    minFontSize: 16,
    maxLines: 2,
    fontRole: 'sans',
  }

  test('short text fits at preferred font size without scaling down', () => {
    const result = fitTextToSlot('Maya Angelou', defaultSlot)
    expect(result.fontSize).toBe(36)
    expect(result.lines).toEqual(['Maya Angelou'])
    expect(result.isOverflow).toBe(false)
    expect(result.renderedBounds.height).toBeGreaterThan(0)
  })

  test('medium text dynamically scales down within [minFontSize, preferredFontSize]', () => {
    const result = fitTextToSlot('Dr. Maya Angelou — Poet, Author & Civil Rights Icon', defaultSlot)
    expect(result.fontSize).toBeLessThan(36)
    expect(result.fontSize).toBeGreaterThanOrEqual(16)
    expect(result.lines.length).toBeLessThanOrEqual(2)
    expect(result.isOverflow).toBe(false)
  })

  test('multi-word text wraps cleanly into lines', () => {
    const text = 'The Complete Collection of Modernist Poetry and Essays'
    const { lines } = breakTextIntoLines(text, 24, 300, 'sans')
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.join(' ')).toBe(text)
  })

  test('detects overflow when text cannot fit even at minFontSize within maxLines', () => {
    const tinySlot: TextSlotBounds = {
      width: 100,
      height: 30,
      preferredFontSize: 24,
      minFontSize: 14,
      maxLines: 1,
    }
    const longText = 'Supercalifragilisticexpialidocious Unbreakable World Record'
    const result = fitTextToSlot(longText, tinySlot)
    expect(result.fontSize).toBe(14)
    expect(result.isOverflow).toBe(true)
  })

  test('validates vertical bounds when height is strictly constrained', () => {
    const heightConstrainedSlot: TextSlotBounds = {
      width: 400,
      height: 20, // very tight height constraint
      preferredFontSize: 24,
      minFontSize: 10,
      maxLines: 3,
    }
    const multiLineText = 'First line of text that needs to wrap into multiple lines for height check'
    const result = fitTextToSlot(multiLineText, heightConstrainedSlot)
    // Should scale down font size to fit vertical height constraint or mark overflow
    expect(result.fontSize).toBeLessThan(24)
    expect(result.totalHeight).toBeGreaterThan(0)
  })

  test('respects character weighting: wide characters require more width than narrow characters', () => {
    const narrowWidth = estimateTextWidth('iiiiiii', 20, 'sans')
    const wideWidth = estimateTextWidth('WWWWWWW', 20, 'sans')
    expect(wideWidth).toBeGreaterThan(narrowWidth * 2)
  })

  test('measureTextWidth calculates rendered metrics and falls back gracefully', () => {
    const width = measureTextWidth('Maya Angelou', 32, 'serif')
    expect(width).toBeGreaterThan(0)
  })

  test('measureTextLine provides vertical metrics including ascent, descent, and height', () => {
    const metrics = measureTextLine('MAYA ANGELOU', 24, 'display')
    expect(metrics.width).toBeGreaterThan(0)
    expect(metrics.actualBoundingBoxAscent).toBeGreaterThan(0)
    expect(metrics.actualBoundingBoxDescent).toBeGreaterThanOrEqual(0)
    expect(metrics.actualHeight).toBeGreaterThan(0)
  })

  test('font readiness check and cache clearing operate reliably', async () => {
    expect(areFontsReady()).toBe(true) // Node environment has no document.fonts
    const ready = await waitForFontsLoaded(50)
    expect(ready).toBe(true)
  })

  test('caches results for identical parameters and clears cache properly', () => {
    const res1 = fitTextToSlot('Cached Headline Text', defaultSlot)
    const res2 = fitTextToSlot('Cached Headline Text', defaultSlot)
    expect(res1).toBe(res2) // Referential equality from map cache

    clearFitCache()
    const res3 = fitTextToSlot('Cached Headline Text', defaultSlot)
    expect(res3).toEqual(res1)
  })
})
