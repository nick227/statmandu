import type { GradientSpec } from '../types/layerSpec'

/**
 * 24k Gold Foil Sheen Gradient:
 * Realistic polished gold metalwork with high specular highlight and warm bronze undertones.
 */
export const GRADIENT_24K_GOLD: GradientSpec = {
  type: 'linear',
  colors: ['#D4AF37', '#FFF3B0', '#F59E0B', '#FFFDF0', '#B45309', '#D4AF37'],
  locations: [0, 0.22, 0.48, 0.65, 0.85, 1],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}

/**
 * Obsidian Velvet Matte Gradient:
 * Deep, atmospheric background gradient receding from near-black to dark midnight slate.
 */
export const GRADIENT_OBSIDIAN_DEPTH: GradientSpec = {
  type: 'linear',
  colors: ['#04060A', '#0D1117', '#161B22', '#080A0E'],
  locations: [0, 0.4, 0.75, 1],
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
}

/**
 * Ivory Ceramic / Enamel Plaque Gradient:
 * Warm, dimensional antique ivory surface for struck nameplates and stat panels.
 */
export const GRADIENT_IVORY_PLAQUE: GradientSpec = {
  type: 'linear',
  colors: ['#FFFDF9', '#FAF6EE', '#EFE8D8', '#FAF6EE'],
  locations: [0, 0.35, 0.8, 1],
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
}

/**
 * Bottom Scrim Vignette:
 * Gradient transition to darken the lower portion of hero artwork for razor-sharp typography legibility.
 */
export const GRADIENT_VIGNETTE_BOTTOM: GradientSpec = {
  type: 'linear',
  colors: ['transparent', 'rgba(4,6,10,0.4)', 'rgba(4,6,10,0.85)', '#04060A'],
  locations: [0, 0.45, 0.8, 1],
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
}

/**
 * Rose Copper Metallic Gradient:
 * Premium warm copper alloy reflection.
 */
export const GRADIENT_ROSE_COPPER: GradientSpec = {
  type: 'linear',
  colors: ['#FB7185', '#FED7AA', '#E11D48', '#FDA4AF'],
  locations: [0, 0.3, 0.7, 1],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0.8 },
}
