/**
 * Canonical trading-card geometry.
 *
 * The screen representation is the 2.5 x 3.5 inch trim size: 5:7, or
 * 1500 x 2100 px at 600 DPI. A production print export adds 0.125 inch
 * outside every trim edge, producing a 2.75 x 3.75 inch (1650 x 2250 px)
 * file. Bleed is deliberately not included in the on-screen aspect ratio.
 */
export const CARD_GEOMETRY = {
  aspectRatio: 5 / 7,
  /** Canonical CSS-pixel display size. Cards do not grow by surface. */
  displayPixels: { width: 320, height: 448 },
  /** Screen-only clearance for each exterior flip control. */
  interactionGutter: 24,
  interactionStageWidth: 368,
  artworkPixels: { width: 1500, height: 2100 },
  trimInches: { width: 2.5, height: 3.5 },
  bleedInches: 0.125,
  printPixels: { width: 1650, height: 2250 },
  printInches: { width: 2.75, height: 3.75 },
  dpi: 600,
} as const

/**
 * Canonical RDC (RARE Digital Collectible) geometry for Card Studio and modern releases.
 * Standard 2:3 aspect ratio (600 x 900 px canvas), preserving physical collectible scale.
 */
export const RDC_CARD_GEOMETRY = {
  aspectRatio: 2 / 3,
  canvasWidth: 600,
  canvasHeight: 900,
  displayPixels: { width: 300, height: 450 },
} as const
