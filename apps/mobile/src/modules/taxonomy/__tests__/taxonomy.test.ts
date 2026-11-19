import {
  DIMENSIONS,
  DEFAULT_TAXONOMY_SELECTIONS,
  getFamiliesForDimension,
  getVariationsForFamily,
  getNodeByKey,
} from '../catalog'
import {
  resolveTaxonomyRecipe,
  compileDesignRecipe,
  extractTaxonomySelections,
} from '../compiler'
import type { TaxonomySelections } from '../types'

describe('RARE Design Taxonomy System', () => {
  describe('Catalog Structure', () => {
    test('defines all 5 foundational dimensions', () => {
      expect(DIMENSIONS).toHaveLength(5)
      const keys = DIMENSIONS.map((d) => d.key)
      expect(keys).toEqual(['style', 'layout', 'artwork', 'content', 'effects'])
    })

    test('each dimension has families and each family has variations', () => {
      for (const dim of DIMENSIONS) {
        const families = getFamiliesForDimension(dim.key)
        expect(families.length).toBeGreaterThanOrEqual(3)

        for (const family of families) {
          const variations = getVariationsForFamily(family.key)
          expect(variations.length).toBeGreaterThanOrEqual(1)
          for (const variation of variations) {
            expect(variation.parentKey).toBe(family.key)
            expect(variation.type).toBe('VARIATION')
          }
        }
      }
    })

    test('lookup by key works for dimensions, families, and variations', () => {
      const styleNode = getNodeByKey('style')
      expect(styleNode?.type).toBe('DIMENSION')

      const arcadeNode = getNodeByKey('style.arcade')
      expect(arcadeNode?.type).toBe('FAMILY')

      const neonNode = getNodeByKey('style.arcade.neon-07')
      expect(neonNode?.type).toBe('VARIATION')
    })
  })

  describe('3-Tier Property Inheritance', () => {
    test('resolves inheritance from Dimension Defaults -> Family -> Variation', () => {
      const selections: TaxonomySelections = {
        style: { key: 'style.arcade.neon-07', version: 1 },
        layout: { key: 'layout.portrait-hero.standard', version: 1 },
        artwork: { key: 'artwork.studio-portrait.clean', version: 1 },
        content: { key: 'content.prestige-debut.official', version: 1 },
        effects: { key: 'effects.cyber-glow.neon-trim', version: 1 },
      }

      const recipe = resolveTaxonomyRecipe(selections)

      // Neon-07 overrides foreground to #00F5FF
      expect(recipe.resolved.style.palette.foreground).toBe('#00F5FF')
      // Inherits typography nameRole: 'pixel-display' from Arcade family
      expect(recipe.resolved.style.typography.nameRole).toBe('pixel-display')
      // Inherits labelRole: 'mono' from Arcade family
      expect(recipe.resolved.style.typography.labelRole).toBe('mono')
    })

    test('applies user overrides on top of resolved variation properties', () => {
      const selections: TaxonomySelections = { ...DEFAULT_TAXONOMY_SELECTIONS }
      const overrides = {
        style: {
          palette: {
            accent: '#FFCC00',
          } as any,
        },
      }

      const recipe = resolveTaxonomyRecipe(selections, overrides)
      expect(recipe.resolved.style.palette.accent).toBe('#FFCC00')
    })
  })

  describe('Interchangeability Guarantee', () => {
    test('changing Style preserves Layout, Artwork, Content, and Effects unchanged', () => {
      const initialSelections: TaxonomySelections = {
        style: { key: 'style.arcade.neon-07', version: 1 },
        layout: { key: 'layout.split-editorial.balanced', version: 1 },
        artwork: { key: 'artwork.framed-vignette.archival', version: 1 },
        content: { key: 'content.editorial-feature.pullquote', version: 1 },
        effects: { key: 'effects.gold-foil.24k-rim', version: 1 },
      }

      const updatedSelections: TaxonomySelections = {
        ...initialSelections,
        style: { key: 'style.prestige.gilded-noir', version: 1 }, // Changed only Style
      }

      const beforeRecipe = resolveTaxonomyRecipe(initialSelections)
      const afterRecipe = resolveTaxonomyRecipe(updatedSelections)

      // Style changes
      expect(afterRecipe.resolved.style.palette.foreground).not.toBe(
        beforeRecipe.resolved.style.palette.foreground,
      )

      // Other 4 dimensions remain identical
      expect(afterRecipe.resolved.layout).toEqual(beforeRecipe.resolved.layout)
      expect(afterRecipe.resolved.artwork).toEqual(beforeRecipe.resolved.artwork)
      expect(afterRecipe.resolved.content).toEqual(beforeRecipe.resolved.content)
      expect(afterRecipe.resolved.effects).toEqual(beforeRecipe.resolved.effects)
    })

    test('changing Layout preserves Style, Artwork, Content, and Effects unchanged', () => {
      const initialSelections: TaxonomySelections = { ...DEFAULT_TAXONOMY_SELECTIONS }
      const updatedSelections: TaxonomySelections = {
        ...initialSelections,
        layout: { key: 'layout.full-bleed.overlay', version: 1 }, // Changed only Layout
      }

      const beforeRecipe = resolveTaxonomyRecipe(initialSelections)
      const afterRecipe = resolveTaxonomyRecipe(updatedSelections)

      expect(afterRecipe.resolved.layout.type).toBe('full-bleed')
      expect(afterRecipe.resolved.style).toEqual(beforeRecipe.resolved.style)
      expect(afterRecipe.resolved.artwork).toEqual(beforeRecipe.resolved.artwork)
      expect(afterRecipe.resolved.content).toEqual(beforeRecipe.resolved.content)
      expect(afterRecipe.resolved.effects).toEqual(beforeRecipe.resolved.effects)
    })
  })

  describe('Compiler Output (rdc-composition-v1)', () => {
    test('compiles selections into a valid rdc-composition-v1 document', () => {
      const comp = compileDesignRecipe(DEFAULT_TAXONOMY_SELECTIONS)

      expect(comp.schemaVersion).toBe(1)
      expect(comp.canvas).toEqual({ width: 600, height: 900 })
      expect(comp.layers.length).toBeGreaterThan(0)
      expect(comp.layers.length).toBeLessThanOrEqual(100)

      // All layers must have valid numeric coordinates and dimensions
      for (const layer of comp.layers) {
        expect(typeof layer.id).toBe('string')
        expect(['RECTANGLE', 'IMAGE', 'TEXT']).toContain(layer.type)
        expect(typeof layer.x).toBe('number')
        expect(typeof layer.y).toBe('number')
        expect(typeof layer.width).toBe('number')
        expect(typeof layer.height).toBe('number')
      }

      // Metadata contains taxonomy selections
      expect(comp.metadata?.rendererVersion).toBe('rdc-composition-v1')
      expect(comp.metadata?.taxonomy?.selections).toEqual(DEFAULT_TAXONOMY_SELECTIONS)

      // Extraction helper restores selections
      const extracted = extractTaxonomySelections(comp)
      expect(extracted).toEqual(DEFAULT_TAXONOMY_SELECTIONS)
    })

    test('compiles every curated variation cleanly without errors', () => {
      for (const dim of DIMENSIONS) {
        const families = getFamiliesForDimension(dim.key)
        for (const family of families) {
          const variations = getVariationsForFamily(family.key)
          for (const variation of variations) {
            const testSelections: TaxonomySelections = {
              ...DEFAULT_TAXONOMY_SELECTIONS,
              [dim.key]: { key: variation.key, version: 1 },
            }
            const comp = compileDesignRecipe(testSelections)
            expect(comp.layers.length).toBeGreaterThan(3)
            expect(comp.canvas.width).toBe(600)
            expect(comp.canvas.height).toBe(900)
          }
        }
      }
    })
  })
})
