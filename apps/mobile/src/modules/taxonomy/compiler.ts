/**
 * RARE Design Taxonomy Compiler
 *
 * Deterministically resolves property inheritance across the 3 tiers:
 * Dimension Defaults -> Family Overrides -> Variation Overrides -> User Overrides
 *
 * Compiles the resolved selections into a 100% valid rdc-composition-v1 CardComposition.
 */

import type {
  CardComposition,
  CardCompositionLayer,
} from '@/modules/cards/CardCompositionRenderer'
import {
  DEFAULT_STYLE_PROPERTIES,
  DEFAULT_LAYOUT_PROPERTIES,
  DEFAULT_ARTWORK_PROPERTIES,
  DEFAULT_CONTENT_PROPERTIES,
  DEFAULT_EFFECTS_PROPERTIES,
  getNodeByKey,
  DEFAULT_TAXONOMY_SELECTIONS,
} from './catalog'
import type {
  TaxonomyDimensionKey,
  TaxonomySelections,
  TaxonomyOverrides,
  ResolvedTaxonomyRecipe,
  StyleProperties,
  LayoutProperties,
  ArtworkProperties,
  ContentProperties,
  EffectsProperties,
} from './types'

// Deep merge utility that replaces arrays and preserves object shapes
function deepMerge<T extends Record<string, any>>(target: T, source?: Record<string, any>): T {
  if (!source) return { ...target }
  const output = { ...target }

  for (const key of Object.keys(source)) {
    const sourceVal = source[key]
    const targetVal = (target as any)[key]

    if (sourceVal === undefined) continue

    if (
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      ;(output as any)[key] = deepMerge(targetVal, sourceVal)
    } else {
      ;(output as any)[key] = sourceVal
    }
  }

  return output
}

/**
 * Resolves 5-dimensional property inheritance for a given set of selections & overrides.
 */
export function resolveTaxonomyRecipe(
  selections: TaxonomySelections = DEFAULT_TAXONOMY_SELECTIONS,
  overrides?: TaxonomyOverrides,
): ResolvedTaxonomyRecipe {
  // 1. Resolve Style
  const styleVariation = getNodeByKey(selections.style.key)
  const styleFamily = styleVariation?.parentKey ? getNodeByKey(styleVariation.parentKey) : undefined
  const resolvedStyle = deepMerge(
    deepMerge(
      deepMerge(DEFAULT_STYLE_PROPERTIES, styleFamily?.properties),
      styleVariation?.properties,
    ),
    overrides?.style,
  ) as StyleProperties

  // 2. Resolve Layout
  const layoutVariation = getNodeByKey(selections.layout.key)
  const layoutFamily = layoutVariation?.parentKey ? getNodeByKey(layoutVariation.parentKey) : undefined
  const resolvedLayout = deepMerge(
    deepMerge(
      deepMerge(DEFAULT_LAYOUT_PROPERTIES, layoutFamily?.properties),
      layoutVariation?.properties,
    ),
    overrides?.layout,
  ) as LayoutProperties

  // 3. Resolve Artwork
  const artworkVariation = getNodeByKey(selections.artwork.key)
  const artworkFamily = artworkVariation?.parentKey ? getNodeByKey(artworkVariation.parentKey) : undefined
  const resolvedArtwork = deepMerge(
    deepMerge(
      deepMerge(DEFAULT_ARTWORK_PROPERTIES, artworkFamily?.properties),
      artworkVariation?.properties,
    ),
    overrides?.artwork,
  ) as ArtworkProperties

  // 4. Resolve Content
  const contentVariation = getNodeByKey(selections.content.key)
  const contentFamily = contentVariation?.parentKey ? getNodeByKey(contentVariation.parentKey) : undefined
  const resolvedContent = deepMerge(
    deepMerge(
      deepMerge(DEFAULT_CONTENT_PROPERTIES, contentFamily?.properties),
      contentVariation?.properties,
    ),
    overrides?.content,
  ) as ContentProperties

  // 5. Resolve Effects
  const effectsVariation = getNodeByKey(selections.effects.key)
  const effectsFamily = effectsVariation?.parentKey ? getNodeByKey(effectsVariation.parentKey) : undefined
  const resolvedEffects = deepMerge(
    deepMerge(
      deepMerge(DEFAULT_EFFECTS_PROPERTIES, effectsFamily?.properties),
      effectsVariation?.properties,
    ),
    overrides?.effects,
  ) as EffectsProperties

  return {
    taxonomyVersion: 1,
    selections,
    resolved: {
      style: resolvedStyle,
      layout: resolvedLayout,
      artwork: resolvedArtwork,
      content: resolvedContent,
      effects: resolvedEffects,
    },
    overrides,
  }
}

/**
 * Compiles a resolved recipe into an rdc-composition-v1 CardComposition.
 */
export function compileDesignRecipe(
  selections: TaxonomySelections = DEFAULT_TAXONOMY_SELECTIONS,
  overrides?: TaxonomyOverrides,
): CardComposition {
  const recipe = resolveTaxonomyRecipe(selections, overrides)
  const { style, layout, artwork, content, effects } = recipe.resolved

  const layers: CardCompositionLayer[] = []

  // --------------------------------------------------------------------------
  // Layer 1: Base Card Background
  // --------------------------------------------------------------------------
  layers.push({
    id: 'base-background',
    type: 'RECTANGLE',
    x: 0,
    y: 0,
    width: 600,
    height: 900,
    fill: style.palette.background,
  })

  // --------------------------------------------------------------------------
  // Layer 2: Perimeter Frame Accent
  // --------------------------------------------------------------------------
  if (style.frame.thickness > 0) {
    const inset = Math.max(8, style.frame.inset)
    layers.push({
      id: 'frame-border',
      type: 'RECTANGLE',
      x: inset,
      y: inset,
      width: 600 - inset * 2,
      height: 900 - inset * 2,
      fill: style.frame.color || style.palette.border,
    })

    // Inner surface fill inside the frame
    const innerInset = inset + style.frame.thickness
    layers.push({
      id: 'frame-surface',
      type: 'RECTANGLE',
      x: innerInset,
      y: innerInset,
      width: 600 - innerInset * 2,
      height: 900 - innerInset * 2,
      fill: style.palette.surface,
    })
  }

  // --------------------------------------------------------------------------
  // Layer 3: Header Area / Brand Bar
  // --------------------------------------------------------------------------
  if (layout.headerArea.visible) {
    layers.push({
      id: 'header-brand-kicker',
      type: 'TEXT',
      x: layout.headerArea.x,
      y: layout.headerArea.y,
      width: 520,
      height: layout.headerArea.height,
      text: content.eyebrowText || 'RARE COLLECTIBLE',
      fontSize: 13,
      fill: style.palette.accent,
    })
  }

  // --------------------------------------------------------------------------
  // Layer 4: Artwork Backdrop & Matting
  // --------------------------------------------------------------------------
  const artX = layout.artArea.x
  const artY = layout.artArea.y
  const artW = layout.artArea.width
  const artH = layout.artArea.height

  layers.push({
    id: 'artwork-backdrop',
    type: 'RECTANGLE',
    x: artX,
    y: artY,
    width: artW,
    height: artH,
    fill: artwork.backdropTint,
  })

  // --------------------------------------------------------------------------
  // Layer 5: Artwork Subject Image
  // --------------------------------------------------------------------------
  const padding = layout.type === 'full-bleed' ? 0 : 4
  layers.push({
    id: 'artwork-subject-image',
    type: 'IMAGE',
    x: artX + padding,
    y: artY + padding,
    width: artW - padding * 2,
    height: artH - padding * 2,
  })

  // --------------------------------------------------------------------------
  // Layer 6: Artwork Framing Border / Mask Trim
  // --------------------------------------------------------------------------
  if (artwork.matteBorderWidth > 0 && layout.type !== 'full-bleed') {
    // Subtle accent line under artwork
    layers.push({
      id: 'artwork-trim-bottom',
      type: 'RECTANGLE',
      x: artX,
      y: artY + artH - 2,
      width: artW,
      height: 2,
      fill: style.palette.accent,
    })
  }

  // --------------------------------------------------------------------------
  // Layer 7: Content Area Plaque & Background Scrim
  // --------------------------------------------------------------------------
  const contentX = layout.contentArea.x
  const contentY = layout.contentArea.y
  const contentW = layout.contentArea.width
  const contentH = layout.contentArea.height

  if (layout.type === 'full-bleed') {
    // Translucent dark scrim on full bleed
    layers.push({
      id: 'content-scrim',
      type: 'RECTANGLE',
      x: contentX - 16,
      y: contentY - 16,
      width: contentW + 32,
      height: contentH + 32,
      fill: style.palette.background,
    })
  } else if (layout.type === 'split' || layout.type === 'framed') {
    layers.push({
      id: 'content-plate-surface',
      type: 'RECTANGLE',
      x: contentX - 8,
      y: contentY - 8,
      width: contentW + 16,
      height: contentH + 16,
      fill: style.palette.surface,
    })
  }

  // --------------------------------------------------------------------------
  // Layer 8: Category / Subhead Eyebrow
  // --------------------------------------------------------------------------
  let currentY = contentY
  if (content.showCategoryEyebrow && !layout.headerArea.visible) {
    layers.push({
      id: 'content-eyebrow',
      type: 'TEXT',
      x: contentX,
      y: currentY,
      width: contentW,
      height: 24,
      text: content.eyebrowText || 'RARE PROFILE',
      fontSize: 12,
      fill: style.palette.accent,
    })
    currentY += 28
  }

  // --------------------------------------------------------------------------
  // Layer 9: Subject Name Plate
  // --------------------------------------------------------------------------
  const nameHeight = Math.max(48, content.nameSize + 16)
  layers.push({
    id: 'subject-name',
    type: 'TEXT',
    x: contentX,
    y: currentY,
    width: contentW,
    height: nameHeight,
    personField: 'displayName',
    text: 'CARD SUBJECT',
    fontSize: content.nameSize,
    fill: style.palette.foreground,
  })
  currentY += nameHeight + 6

  // --------------------------------------------------------------------------
  // Layer 10: Discipline / Origins
  // --------------------------------------------------------------------------
  if (content.showDiscipline) {
    layers.push({
      id: 'subject-discipline',
      type: 'TEXT',
      x: contentX,
      y: currentY,
      width: contentW,
      height: 28,
      personField: 'hometown',
      text: 'CREATOR & VISIONARY',
      fontSize: 14,
      fill: style.palette.accent,
    })
    currentY += 32
  }

  // --------------------------------------------------------------------------
  // Layer 11: Biography / Statement
  // --------------------------------------------------------------------------
  const remainingBioHeight = Math.max(40, contentY + contentH - currentY)
  layers.push({
    id: 'subject-bio',
    type: 'TEXT',
    x: contentX,
    y: currentY,
    width: contentW,
    height: remainingBioHeight,
    personField: 'bio',
    text: 'First edition collectible card published on the RARE digital platform.',
    fontSize: content.bioSize,
    fill: style.palette.subtext,
  })

  // --------------------------------------------------------------------------
  // Layer 12-14: Effects Overlays (Foil, Cyber, Holographic, Grain)
  // --------------------------------------------------------------------------
  if (effects.type === 'foil') {
    // 24k Gold Foil Inset Borders
    const foilInset = style.frame.inset + 6
    layers.push({
      id: 'effect-foil-frame-outer',
      type: 'RECTANGLE',
      x: foilInset,
      y: foilInset,
      width: 600 - foilInset * 2,
      height: 2,
      fill: effects.primaryEffectColor,
    })
    layers.push({
      id: 'effect-foil-frame-bottom',
      type: 'RECTANGLE',
      x: foilInset,
      y: 900 - foilInset - 2,
      width: 600 - foilInset * 2,
      height: 2,
      fill: effects.primaryEffectColor,
    })
  } else if (effects.type === 'cyber') {
    // Neon Laser Accent Lines
    layers.push({
      id: 'effect-cyber-neon-top',
      type: 'RECTANGLE',
      x: 20,
      y: 12,
      width: 140,
      height: 3,
      fill: effects.primaryEffectColor, // Cyan
    })
    layers.push({
      id: 'effect-cyber-neon-bottom',
      type: 'RECTANGLE',
      x: 440,
      y: 885,
      width: 140,
      height: 3,
      fill: effects.secondaryEffectColor || '#FF31C8', // Magenta
    })
  } else if (effects.type === 'holographic') {
    // Holographic Prismatic Edge Bands
    layers.push({
      id: 'effect-holo-band-1',
      type: 'RECTANGLE',
      x: 18,
      y: 18,
      width: 6,
      height: 60,
      fill: effects.primaryEffectColor, // Sky blue
    })
    layers.push({
      id: 'effect-holo-band-2',
      type: 'RECTANGLE',
      x: 18,
      y: 82,
      width: 6,
      height: 60,
      fill: effects.secondaryEffectColor || '#F472B6', // Pink
    })
  } else if (effects.type === 'grain') {
    // Darkroom film registration frame lines
    layers.push({
      id: 'effect-grain-tick-left',
      type: 'RECTANGLE',
      x: 10,
      y: 440,
      width: 12,
      height: 2,
      fill: effects.primaryEffectColor,
    })
    layers.push({
      id: 'effect-grain-tick-right',
      type: 'RECTANGLE',
      x: 578,
      y: 440,
      width: 12,
      height: 2,
      fill: effects.primaryEffectColor,
    })
  }

  // Ensure layer count is within 100
  const validatedLayers = layers.slice(0, 100)

  // Construct valid rdc-composition-v1 document with embedded taxonomy metadata
  const composition: CardComposition = {
    schemaVersion: 1,
    canvas: { width: 600, height: 900 },
    layers: validatedLayers,
    metadata: {
      rendererVersion: 'rdc-composition-v1',
      taxonomy: {
        version: 1,
        selections,
        overrides,
      },
    },
  }

  return composition
}

/**
 * Extracts taxonomy selections from an existing CardComposition if present.
 */
export function extractTaxonomySelections(
  composition?: CardComposition | null,
): TaxonomySelections | null {
  if (!composition?.metadata?.taxonomy?.selections) {
    return null
  }
  return composition.metadata.taxonomy.selections as TaxonomySelections
}
