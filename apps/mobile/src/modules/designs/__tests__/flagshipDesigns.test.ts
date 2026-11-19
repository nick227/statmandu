import {
  FLAGSHIP_DESIGNS,
  compileFlagshipDesign,
  getFlagshipDesignById,
} from '../flagshipDesigns'

describe('RARE Flagship Designs & Variable Positional Content Engine', () => {
  describe('Catalog Specification', () => {
    test('contains exactly 20 distinct flagship designs', () => {
      expect(FLAGSHIP_DESIGNS).toHaveLength(20)
    })

    test('all 20 designs have unique IDs and distinct names', () => {
      const ids = new Set(FLAGSHIP_DESIGNS.map((d) => d.id))
      const names = new Set(FLAGSHIP_DESIGNS.map((d) => d.name))
      expect(ids.size).toBe(20)
      expect(names.size).toBe(20)
    })

    test('each design defines variable positional inputs conforming to DesignInput', () => {
      for (const design of FLAGSHIP_DESIGNS) {
        expect(Array.isArray(design.inputs)).toBe(true)
        expect(design.inputs.length).toBeGreaterThanOrEqual(2)

        for (const input of design.inputs) {
          expect(typeof input.id).toBe('string')
          expect(typeof input.bounds.x).toBe('number')
          expect(typeof input.bounds.y).toBe('number')
          expect(typeof input.bounds.width).toBe('number')
          expect(typeof input.bounds.height).toBe('number')
          expect(input.preferredFontSize).toBeGreaterThanOrEqual(input.minFontSize)
          expect(input.maxLines).toBeGreaterThanOrEqual(1)
          expect(typeof input.required).toBe('boolean')
        }
      }
    })
  })

  describe('Adaptive Typography Compilation', () => {
    test('compiles all 20 designs with identical benchmark subject data', () => {
      const benchmarkInputs = {
        input1: 'MAYA ANGELOU',
        input2: 'POET & CIVIL RIGHTS ICON',
        input3: 'Phenomenal Woman, presidential poet, and civil rights champion whose literary voice moved generations.',
      }

      for (const design of FLAGSHIP_DESIGNS) {
        const result = compileFlagshipDesign(design.id, benchmarkInputs)

        expect(result.composition.schemaVersion).toBe(1)
        expect(result.composition.canvas).toEqual({ width: 600, height: 900 })
        expect(result.composition.layers.length).toBeGreaterThanOrEqual(5)
        expect(result.composition.layers.length).toBeLessThanOrEqual(100)

        // All layers must have numeric coordinates
        for (const layer of result.composition.layers) {
          expect(typeof layer.x).toBe('number')
          expect(typeof layer.y).toBe('number')
          expect(typeof layer.width).toBe('number')
          expect(typeof layer.height).toBe('number')
        }

        // Font sizes must be within slot bounds
        const slot1 = design.inputs.find((i) => i.id === 'input1')!
        expect(result.fittedFontSizes.input1).toBeGreaterThanOrEqual(slot1.minFontSize)
        expect(result.fittedFontSizes.input1).toBeLessThanOrEqual(slot1.preferredFontSize)
      }
    })

    test('scales down font size when text is longer', () => {
      const shortResult = compileFlagshipDesign('classic-collector', {
        input1: 'Short Name',
      })
      const longResult = compileFlagshipDesign('classic-collector', {
        input1: 'Dr. Maya Angelou — Presidential Medal of Freedom Recipient',
      })

      expect(longResult.fittedFontSizes.input1).toBeLessThanOrEqual(shortResult.fittedFontSizes.input1)
    })

    test('detects overflow when input exceeds bounds even at minFontSize', () => {
      const hugeBio = 'This is an excessively long biography designed to trigger overflow detection. '.repeat(10)
      const result = compileFlagshipDesign('classic-collector', {
        input3: hugeBio,
      })

      expect(result.isOverflow.input3).toBe(true)
      const slot3 = FLAGSHIP_DESIGNS[0].inputs.find((i) => i.id === 'input3')!
      expect(result.fittedFontSizes.input3).toBe(slot3.minFontSize)
    })
  })

  describe('Content Preservation Across Design Switching', () => {
    test('switching between any two designs preserves entered positional inputs', () => {
      const userInputs = {
        input1: 'Miles Davis',
        input2: 'Jazz Trumpeter & Innovator',
        input3: 'Pioneered modal jazz and fusion with Kind of Blue and Bitches Brew.',
      }

      const designA = compileFlagshipDesign('arcade-1985', userInputs)
      const designB = compileFlagshipDesign('prestige-gold', userInputs)

      expect(designA.composition.metadata?.flagship?.inputs.input1).toBe('Miles Davis')
      expect(designB.composition.metadata?.flagship?.inputs.input1).toBe('Miles Davis')

      // Both cards retain the exact text across distinct visual architectures
      const slot1A = designA.composition.layers.find((l) => l.id === 'slot-input1')
      const slot1B = designB.composition.layers.find((l) => l.id === 'slot-input1')

      expect(slot1A?.text).toBe('MILES DAVIS') // allCaps in arcade
      expect(slot1B?.text).toBe('MILES DAVIS') // allCaps in prestige
    })

    test('preserves design-independent content store when switching from 6 fields to 2 fields and back', () => {
      // 1. User on Sports Legend (6 fields)
      const sportsLegendInputs = {
        input1: 'WILMA RUDOLPH',
        input2: 'OLYMPIC SPRINTING CHAMPION',
        input3: 'Overcame childhood polio to become the fastest woman in the world, winning three gold medals at the 1960 Rome Games.',
        input4: '3x OLYMPIC GOLD',
        input5: '1960 ROME GAMES',
        input6: 'HALL OF FAME #1',
      }

      const sportsResult = compileFlagshipDesign('sports-legend', sportsLegendInputs)
      expect(sportsResult.design.inputs.length).toBe(6)
      expect(sportsResult.composition.metadata?.flagship?.contentStore).toEqual(sportsLegendInputs)

      // 2. User switches to Minimalist (2 fields)
      const minimalistResult = compileFlagshipDesign('minimalist-swiss', sportsResult.contentStore)
      expect(minimalistResult.design.inputs.length).toBe(2)
      // The 4 inactive fields MUST NOT be deleted from contentStore
      expect(minimalistResult.contentStore.input4).toBe('3x OLYMPIC GOLD')
      expect(minimalistResult.contentStore.input5).toBe('1960 ROME GAMES')
      expect(minimalistResult.contentStore.input6).toBe('HALL OF FAME #1')
      expect(minimalistResult.composition.metadata?.flagship?.contentStore.input4).toBe('3x OLYMPIC GOLD')

      // 3. User switches back to Sports Legend
      const restoredSportsResult = compileFlagshipDesign('sports-legend', minimalistResult.contentStore)
      expect(restoredSportsResult.contentStore).toEqual(sportsLegendInputs)
      const slot4 = restoredSportsResult.composition.layers.find((l) => l.id === 'slot-input4')
      const slot5 = restoredSportsResult.composition.layers.find((l) => l.id === 'slot-input5')
      const slot6 = restoredSportsResult.composition.layers.find((l) => l.id === 'slot-input6')

      expect(slot4?.text).toBe('3X OLYMPIC GOLD')
      expect(slot5?.text).toBe('1960 ROME GAMES')
      expect(slot6?.text).toBe('HALL OF FAME #1')
    })
  })

  describe('Card Types (3 Core Templates)', () => {
    test('contains 3 distinct card templates with fields', () => {
      const { CARD_TYPES } = require('../cardTypes')
      expect(CARD_TYPES).toHaveLength(3)
      const ids = new Set(CARD_TYPES.map((t: any) => t.id))
      expect(ids.size).toBe(3)
      expect(ids.has('standard')).toBe(true)
      expect(ids.has('stats')).toBe(true)
      expect(ids.has('minimal')).toBe(true)
      for (const t of CARD_TYPES) {
        expect(Array.isArray(t.fields)).toBe(true)
        expect(t.fields.length).toBeGreaterThanOrEqual(3)
      }
    })

    test('compiles with custom cardTypeId and persists in metadata', () => {
      const result = compileFlagshipDesign('classic-collector', {}, undefined, undefined, 'stats')
      expect(result.composition.metadata?.flagship?.cardTypeId).toBe('stats')
    })
  })

  describe('Artwork Selection & Persistence', () => {
    test('contains curated artwork presets including default', () => {
      const { CURATED_ARTWORKS, DEFAULT_ARTWORK } = require('../curatedArtwork')
      expect(CURATED_ARTWORKS.length).toBeGreaterThanOrEqual(6)
      expect(DEFAULT_ARTWORK.id).toBe('art-angelou')
    })

    test('compiling with selectedImageId sets image layer asset and metadata', () => {
      const result = compileFlagshipDesign(
        'classic-collector',
        {},
        undefined,
        undefined,
        'profile',
        'art-miles',
      )
      const imgLayer = result.composition.layers.find((l) => l.type === 'IMAGE')
      expect(imgLayer?.imageAssetId).toBe('art-miles')
      expect(result.composition.metadata?.flagship?.selectedImageId).toBe('art-miles')
    })
  })

  describe('Typography Engine & FontRole Layer Synchronization', () => {
    test('attaches fontRole to every compiled text layer', () => {
      for (const design of FLAGSHIP_DESIGNS) {
        const result = compileFlagshipDesign(design.id)
        const textLayers = result.composition.layers.filter((l) => l.type === 'TEXT')
        expect(textLayers.length).toBeGreaterThanOrEqual(2)

        for (const layer of textLayers) {
          expect((layer as any).fontRole).toBeDefined()
          expect(['serif', 'sans', 'mono', 'display']).toContain((layer as any).fontRole)
        }
      }
    })
  })
})
