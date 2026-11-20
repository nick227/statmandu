import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native'
import {
  designRegistry,
  compileAuthoredDesign,
  prestigeGoldDesign,
  PRESTIGE_GOLD_FIXTURES,
  GRADIENT_24K_GOLD,
  PATH_BAROQUE_CORNER_TL,
} from '../index'
import { compileFlagshipDesign } from '@/modules/designs/flagshipDesigns'
import { CardDesignWorkshopScreen } from '../workshop/CardDesignWorkshopScreen'

jest.mock('@/shared/media/SmartImage', () => ({
  SmartImage: ({ uri }: { uri: string }) => {
    const { View, Text } = require('react-native')
    return (
      <View testID="mock-smart-image">
        <Text>{uri}</Text>
      </View>
    )
  },
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}))

describe('RARE Card Design System & Isolated Workshop', () => {
  describe('Authoring Contract & Primitives', () => {
    it('defines an isolated Prestige Gold design adhering to the authoring contract', () => {
      expect(prestigeGoldDesign.id).toBe('prestige-gold')
      expect(prestigeGoldDesign.name).toBe('Prestige Gold')
      expect(prestigeGoldDesign.visualTradition).toContain('Royal')
      expect(prestigeGoldDesign.palette.background).toBe('#07090E')
      expect(prestigeGoldDesign.palette.accent).toBe('#D4AF37')
      expect(prestigeGoldDesign.materials.finish).toBe('metallic')
      expect(prestigeGoldDesign.typography.headlineFont).toBe('serif')
      expect(typeof prestigeGoldDesign.composeFront).toBe('function')
      expect(typeof prestigeGoldDesign.composeBack).toBe('function')
      expect(prestigeGoldDesign.defaultFixture).toBeDefined()
    })

    it('provides multi-stop metallic gradients and SVG vector ornaments', () => {
      expect(GRADIENT_24K_GOLD.type).toBe('linear')
      expect(GRADIENT_24K_GOLD.colors.length).toBeGreaterThanOrEqual(4)
      expect(PATH_BAROQUE_CORNER_TL).toContain('M')
      expect(PATH_BAROQUE_CORNER_TL).toContain('C')
    })
  })

  describe('Authoring Compiler & Composition', () => {
    it('compiles Prestige Gold front and coordinated back with rich layers and true cathedral arch', () => {
      const compiled = compileAuthoredDesign(prestigeGoldDesign)

      // Front Face
      expect(compiled.composition.schemaVersion).toBe(1)
      expect(compiled.composition.canvas).toEqual({ width: 600, height: 900 })
      expect(compiled.composition.layers.length).toBeGreaterThanOrEqual(15)

      // Verify presence of rich layers (gradient, SVG paths, shadows)
      const gradientLayer = compiled.composition.layers.find((l: any) => l.gradient)
      expect(gradientLayer).toBeDefined()

      const svgLayer = compiled.composition.layers.find((l: any) => l.type === 'SVG' || l.pathData)
      expect(svgLayer).toBeDefined()

      const shadowLayer = compiled.composition.layers.find((l: any) => l.shadow)
      expect(shadowLayer).toBeDefined()

      // Verify authentic Cathedral Arched Portrait window geometry
      const portraitFrame = compiled.composition.layers.find((l) => l.id === 'pg-portrait-frame-outer')
      expect(portraitFrame).toBeDefined()
      expect((portraitFrame as any)?.borderTopLeftRadius).toBe(180)
      expect((portraitFrame as any)?.borderTopRightRadius).toBe(180)

      const portraitImage = compiled.composition.layers.find((l) => l.id === 'pg-portrait-image')
      expect(portraitImage).toBeDefined()
      expect((portraitImage as any)?.borderTopLeftRadius).toBe(174)
      expect((portraitImage as any)?.borderTopRightRadius).toBe(174)

      // Back Face is directly attached as first-class composition
      expect(compiled.composition.backComposition).toBeDefined()
      expect(compiled.backComposition.schemaVersion).toBe(1)
      expect(compiled.backComposition.canvas).toEqual({ width: 600, height: 900 })
      expect(compiled.backComposition.layers.length).toBeGreaterThanOrEqual(10)

      // Verify all layers have numeric coordinates
      for (const layer of [...compiled.composition.layers, ...compiled.backComposition.layers]) {
        expect(typeof layer.x).toBe('number')
        expect(typeof layer.y).toBe('number')
        expect(typeof layer.width).toBe('number')
        expect(typeof layer.height).toBe('number')
      }
    })

    it('unifies Studio and Workshop compilation pipelines with 100% layer parity', () => {
      const content = {
        input1: 'Jerry Garcia',
        input2: 'LEAD GUITAR · LIVE FOREVER',
        input3: 'Co-founder and lead guitarist of the Grateful Dead.',
      }

      // Studio calls compileFlagshipDesign
      const studioResult = compileFlagshipDesign('royal-heritage', content)

      // Workshop calls compileAuthoredDesign
      const authored = designRegistry.get('royal-heritage')!
      const workshopResult = compileAuthoredDesign(authored, { content })

      // Both pipelines must produce identical layer definitions and layer counts
      expect(studioResult.composition.layers.length).toBe(workshopResult.composition.layers.length)
      expect(studioResult.backComposition.layers.length).toBe(workshopResult.backComposition.layers.length)

      for (let i = 0; i < studioResult.composition.layers.length; i++) {
        expect(studioResult.composition.layers[i].id).toBe(workshopResult.composition.layers[i].id)
        expect(studioResult.composition.layers[i].type).toBe(workshopResult.composition.layers[i].type)
      }
    })

    it('compiles all development fixtures without layout errors', () => {
      for (const fixture of PRESTIGE_GOLD_FIXTURES) {
        const result = compileAuthoredDesign(prestigeGoldDesign, {
          content: fixture.content,
          person: fixture.person,
          imageAssetId: fixture.imageAssetId,
        })

        expect(result.composition.layers.length).toBeGreaterThanOrEqual(15)
        expect(result.backComposition.layers.length).toBeGreaterThanOrEqual(10)

        // Subject name appears on both front and back
        const frontNameLayer = result.composition.layers.find((l) => l.id === 'slot-input1')
        expect(frontNameLayer?.text).toBe(fixture.content.input1?.toUpperCase())

        const backNameLayer = result.backComposition.layers.find((l) => l.id === 'back-subject-name')
        expect(backNameLayer?.text).toBe(fixture.content.input1)
      }
    })
  })

  describe('Design Registry', () => {
    it('registers and retrieves authored designs', () => {
      const registered = designRegistry.get('prestige-gold')
      expect(registered).toBeDefined()
      expect(registered?.name).toBe('Prestige Gold')

      const all = designRegistry.getAll()
      expect(all.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Card Design Workshop Screen', () => {
    it('renders the interactive workshop with side-by-side preview and fixture selector', async () => {
      const screen = await render(<CardDesignWorkshopScreen />)

      // Workshop Header & Mode Toggles
      expect(screen.getByText('Card Design Workshop')).toBeTruthy()
      expect(screen.getByTestId('view-mode-split')).toBeTruthy()
      expect(screen.getByTestId('view-mode-front')).toBeTruthy()
      expect(screen.getByTestId('view-mode-back')).toBeTruthy()

      // Side-by-side stages
      expect(screen.getByTestId('workshop-front-card-stage')).toBeTruthy()
      expect(screen.getByTestId('workshop-back-card-stage')).toBeTruthy()

      // Fixture Pills
      expect(screen.getByTestId('fixture-pill-fixture-jerry-garcia')).toBeTruthy()
      expect(screen.getByTestId('fixture-pill-fixture-miles-davis')).toBeTruthy()
      expect(screen.getByTestId('fixture-pill-fixture-long-name')).toBeTruthy()

      // Switching fixtures updates the displayed subject
      fireEvent.press(screen.getByTestId('fixture-pill-fixture-miles-davis'))
      await waitFor(() => {
        expect(screen.getAllByText('Miles Dewey Davis III').length).toBeGreaterThanOrEqual(1)
      })

      // Switching to front-only mode hides the back stage
      fireEvent.press(screen.getByTestId('view-mode-front'))
      await waitFor(() => {
        expect(screen.getByTestId('workshop-front-card-stage')).toBeTruthy()
        expect(screen.queryByTestId('workshop-back-card-stage')).toBeNull()
      })

      // Switching to back-only mode hides the front stage
      fireEvent.press(screen.getByTestId('view-mode-back'))
      await waitFor(() => {
        expect(screen.queryByTestId('workshop-front-card-stage')).toBeNull()
        expect(screen.getByTestId('workshop-back-card-stage')).toBeTruthy()
      })
    })
  })
})
