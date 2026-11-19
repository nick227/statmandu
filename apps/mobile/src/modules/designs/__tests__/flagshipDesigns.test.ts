import {
  FLAGSHIP_DESIGNS,
  compileFlagshipDesign,
  getFlagshipDesignById,
} from '../flagshipDesigns'

describe('RARE 20 Flagship Designs & Positional Content Engine', () => {
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

    test('each design defines 3 positional text slots (input1, input2, input3)', () => {
      for (const design of FLAGSHIP_DESIGNS) {
        expect(design.slots.input1).toBeDefined()
        expect(design.slots.input2).toBeDefined()
        expect(design.slots.input3).toBeDefined()

        expect(design.slots.input1.bounds.preferredFontSize).toBeGreaterThanOrEqual(
          design.slots.input1.bounds.minFontSize,
        )
        expect(design.slots.input2.bounds.preferredFontSize).toBeGreaterThanOrEqual(
          design.slots.input2.bounds.minFontSize,
        )
        expect(design.slots.input3.bounds.preferredFontSize).toBeGreaterThanOrEqual(
          design.slots.input3.bounds.minFontSize,
        )
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
        expect(result.fittedFontSizes.input1).toBeGreaterThanOrEqual(design.slots.input1.bounds.minFontSize)
        expect(result.fittedFontSizes.input1).toBeLessThanOrEqual(design.slots.input1.bounds.preferredFontSize)
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
      expect(result.fittedFontSizes.input3).toBe(FLAGSHIP_DESIGNS[0].slots.input3.bounds.minFontSize)
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

      expect(designA.composition.metadata?.flagship?.inputs).toEqual(userInputs)
      expect(designB.composition.metadata?.flagship?.inputs).toEqual(userInputs)

      // Both cards retain the exact text across distinct visual architectures
      const slot1A = designA.composition.layers.find((l) => l.id === 'slot-input1')
      const slot1B = designB.composition.layers.find((l) => l.id === 'slot-input1')

      expect(slot1A?.text).toBe('MILES DAVIS') // allCaps in arcade
      expect(slot1B?.text).toBe('MILES DAVIS') // allCaps in prestige
    })
  })
})
