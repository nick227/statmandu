import type { ShadowSpec } from '../types/layerSpec'

/**
 * Raised Plaque Shadow:
 * Lifts metallic nameplates, badges, and headers physically off the canvas surface.
 */
export const SHADOW_RAISED_PLAQUE: ShadowSpec = {
  color: 'rgba(0, 0, 0, 0.65)',
  offsetX: 0,
  offsetY: 6,
  blur: 14,
  opacity: 0.65,
}

/**
 * Medium Frame Shadow:
 * Gives the outer border and inner mat depth over the card substrate.
 */
export const SHADOW_FRAME_DEPTH: ShadowSpec = {
  color: 'rgba(0, 0, 0, 0.5)',
  offsetX: 0,
  offsetY: 4,
  blur: 10,
  opacity: 0.5,
}

/**
 * Subtle Embossed Inset:
 * Micro-shadow under buttons, rivets, and medallion emblems.
 */
export const SHADOW_EMBOSSED_DETAIL: ShadowSpec = {
  color: 'rgba(0, 0, 0, 0.4)',
  offsetX: 0,
  offsetY: 2,
  blur: 4,
  opacity: 0.4,
}

/**
 * Dramatic Artwork Spotlight Glow:
 * Subtle warm backlight around hero portraits.
 */
export const SHADOW_GOLD_AURA: ShadowSpec = {
  color: 'rgba(212, 175, 55, 0.35)',
  offsetX: 0,
  offsetY: 0,
  blur: 24,
  opacity: 0.35,
}
