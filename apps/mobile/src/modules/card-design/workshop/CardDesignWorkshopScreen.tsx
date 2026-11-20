import React, { useState, useMemo } from 'react'
import { View } from 'react-native'
import { Screen } from '@/shared/layout/Screen'
import { designRegistry } from '../registry/designRegistry'
import { compileAuthoredDesign } from '../compiler/compileDesign'
import { PRESTIGE_GOLD_FIXTURES } from '../designs/prestige-gold/fixtures'
import type { FixtureSubject } from '../types/fixtures'
import { WorkshopHeader } from './components/WorkshopHeader'
import { FixtureSelector } from './components/FixtureSelector'
import { SideBySidePreview } from './components/SideBySidePreview'
import { DesignInspector } from './components/DesignInspector'

export function CardDesignWorkshopScreen() {
  const designs = useMemo(() => designRegistry.getAll(), [])
  const [activeDesignId, setActiveDesignId] = useState(designs[0]?.id || 'prestige-gold')
  const activeDesign = useMemo(
    () => designRegistry.get(activeDesignId) || designs[0],
    [activeDesignId, designs],
  )

  const [activeFixture, setActiveFixture] = useState<FixtureSubject>(
    activeDesign?.defaultFixture || PRESTIGE_GOLD_FIXTURES[0],
  )

  const [viewMode, setViewMode] = useState<'split' | 'front' | 'back'>('split')
  const [cardWidth, setCardWidth] = useState(380)

  // Compile active design against the chosen fixture
  const compiled = useMemo(() => {
    return compileAuthoredDesign(activeDesign, {
      content: activeFixture.content,
      person: activeFixture.person,
      imageAssetId: activeFixture.imageAssetId,
    })
  }, [activeDesign, activeFixture])

  return (
    <Screen layout="workspace" insetTop={true} className="h-full bg-neutral-950">
      {/* 1. Dedicated Header */}
      <WorkshopHeader
        selectedDesignName={activeDesign.name}
        selectedFixtureLabel={activeFixture.label}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cardScale={cardWidth}
        onCardScaleChange={setCardWidth}
        totalLayers={{
          front: compiled.composition.layers.length,
          back: compiled.backComposition.layers.length,
        }}
      />

      {/* 2. Fixture Selector Strip */}
      <FixtureSelector
        fixtures={PRESTIGE_GOLD_FIXTURES}
        activeFixtureId={activeFixture.id}
        onSelectFixture={setActiveFixture}
      />

      {/* 3. Main Workspace: Canvas Stage + Right Side Inspector */}
      <View className="flex-1 flex-row overflow-hidden bg-neutral-950">
        <View className="flex-1 overflow-hidden">
          <SideBySidePreview
            frontComposition={compiled.composition}
            backComposition={compiled.backComposition}
            viewMode={viewMode}
            cardWidth={cardWidth}
            activeFixture={activeFixture}
          />
        </View>

        <DesignInspector
          design={activeDesign}
          frontLayerCount={compiled.composition.layers.length}
          backLayerCount={compiled.backComposition.layers.length}
        />
      </View>
    </Screen>
  )
}
