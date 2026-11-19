/**
 * RARE Design Taxonomy Types
 *
 * Implements the 5-dimensional, 3-tier creative hierarchy:
 * Dimension -> Family -> Variation
 *
 * Supported Dimensions:
 * 1. Style (palette, typography role, ornament, frame styling)
 * 2. Layout (spatial geometry of art area, content area, header)
 * 3. Artwork (framing mode, backdrop tint, placeholder matte)
 * 4. Content (information hierarchy, font sizes, badges, eyebrows)
 * 5. Effects (foil, cyber glow, holographic prism, grain, none)
 */

export type DesignNodeType = 'DIMENSION' | 'FAMILY' | 'VARIATION'

export type TaxonomyDimensionKey = 'style' | 'layout' | 'artwork' | 'content' | 'effects'

// --- Style Dimension Properties ---
export interface StylePalette {
  background: string
  surface: string
  foreground: string
  accent: string
  border: string
  subtext: string
}

export interface StyleTypography {
  nameRole: 'sans' | 'serif' | 'display' | 'pixel-display' | 'mono'
  labelRole: 'sans' | 'serif' | 'mono'
  allCaps?: boolean
}

export interface StyleOrnament {
  density: number // 0.0 to 1.0
  style?: 'minimal' | 'arcade' | 'serif' | 'cyber' | 'vintage' | 'brutalist'
}

export interface StyleFrame {
  thickness: number
  inset: number
  color?: string
}

export interface StyleProperties {
  palette: StylePalette
  typography: StyleTypography
  ornament: StyleOrnament
  frame: StyleFrame
}

// --- Layout Dimension Properties ---
export interface AreaGeometry {
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutProperties {
  type: 'portrait' | 'split' | 'full-bleed' | 'framed' | 'poster'
  artArea: AreaGeometry
  contentArea: AreaGeometry
  headerArea: {
    x: number
    y: number
    height: number
    visible: boolean
  }
}

// --- Artwork Dimension Properties ---
export interface ArtworkProperties {
  framing: 'hero' | 'inset' | 'window' | 'bleed' | 'vignette'
  aspectRatio: '4:5' | '1:1' | '16:9' | 'full'
  backdropTint: string
  showPlaceholderMatte: boolean
  matteBorderWidth: number
}

// --- Content Dimension Properties ---
export interface ContentProperties {
  preset: 'debut' | 'feature' | 'archival' | 'minimal'
  nameSize: number
  bioSize: number
  showCategoryEyebrow: boolean
  eyebrowText: string
  showDiscipline: boolean
}

// --- Effects Dimension Properties ---
export interface EffectsProperties {
  type: 'none' | 'foil' | 'cyber' | 'holographic' | 'grain'
  intensity: number // 0.0 to 1.0
  primaryEffectColor: string
  secondaryEffectColor?: string
}

// Map dimension keys to property schemas
export interface DimensionPropertyMap {
  style: StyleProperties
  layout: LayoutProperties
  artwork: ArtworkProperties
  content: ContentProperties
  effects: EffectsProperties
}

// Generic Node representing Dimension, Family, or Variation
export interface TaxonomyNode<K extends TaxonomyDimensionKey = TaxonomyDimensionKey> {
  id: string
  key: string
  type: DesignNodeType
  dimension: K
  parentKey?: string
  name: string
  description?: string
  thumbnail?: string
  sortOrder?: number
  version: number
  properties: Partial<DimensionPropertyMap[K]>
}

export type DimensionNode = TaxonomyNode & { type: 'DIMENSION' }
export type FamilyNode = TaxonomyNode & { type: 'FAMILY'; parentKey: string }
export type VariationNode = TaxonomyNode & { type: 'VARIATION'; parentKey: string }

// Selections made for a card design across the 5 dimensions
export interface DimensionSelection {
  key: string
  version: number
}

export interface TaxonomySelections {
  style: DimensionSelection
  layout: DimensionSelection
  artwork: DimensionSelection
  content: DimensionSelection
  effects: DimensionSelection
}

// User-level overrides
export interface TaxonomyOverrides {
  style?: Partial<StyleProperties>
  layout?: Partial<LayoutProperties>
  artwork?: Partial<ArtworkProperties>
  content?: Partial<ContentProperties>
  effects?: Partial<EffectsProperties>
}

// Resolved / Compiled Properties after tree inheritance
export interface ResolvedTaxonomyRecipe {
  taxonomyVersion: 1
  selections: TaxonomySelections
  resolved: {
    style: StyleProperties
    layout: LayoutProperties
    artwork: ArtworkProperties
    content: ContentProperties
    effects: EffectsProperties
  }
  overrides?: TaxonomyOverrides
}
