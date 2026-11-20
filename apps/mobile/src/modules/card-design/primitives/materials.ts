import type { CardMaterialSpec } from '../types/designContract'

export const MATERIAL_24K_METALLIC: CardMaterialSpec = {
  finish: 'metallic',
  sheenIntensity: 0.85,
  foilRegions: ['outer-frame', 'nameplate-border', 'crest', 'serial-badge'],
}

export const MATERIAL_REFRACTOR_HOLO: CardMaterialSpec = {
  finish: 'holographic',
  sheenIntensity: 0.9,
  foilRegions: ['full-bleed'],
}

export const MATERIAL_MATTE_CARDSTOCK: CardMaterialSpec = {
  finish: 'matte',
  sheenIntensity: 0.15,
}
