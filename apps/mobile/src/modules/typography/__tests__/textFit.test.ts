import {
  fitTextToSlot,
  estimateTextWidth,
  breakTextIntoLines,
  type TextSlotBounds,
} from '../textFit'

describe('Deterministic Adaptive Typography (textFit)', () => {
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
    // All original words must be present
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

  test('respects character weighting: wide characters require more width than narrow characters', () => {
    const narrowWidth = estimateTextWidth('iiiiiii', 20, 'sans')
    const wideWidth = estimateTextWidth('WWWWWWW', 20, 'sans')
    expect(wideWidth).toBeGreaterThan(narrowWidth * 2)
  })

  test('caches results for identical parameters', () => {
    const res1 = fitTextToSlot('Cached Headline Text', defaultSlot)
    const res2 = fitTextToSlot('Cached Headline Text', defaultSlot)
    expect(res1).toBe(res2) // Referential equality from map cache
  })
})
