import React from 'react'
import { View, ScrollView } from 'react-native'
import { CardCompositionRenderer } from '@/modules/cards/CardCompositionRenderer'
import { Text } from '@/shared/ui/Text'
import type { CardComposition } from '../../types/layerSpec'
import type { FixtureSubject } from '../../types/fixtures'

export interface SideBySidePreviewProps {
  frontComposition: CardComposition
  backComposition: CardComposition
  viewMode: 'split' | 'front' | 'back'
  cardWidth: number
  activeFixture: FixtureSubject
}

export function SideBySidePreview({
  frontComposition,
  backComposition,
  viewMode,
  cardWidth,
  activeFixture,
}: SideBySidePreviewProps) {
  const showFront = viewMode === 'split' || viewMode === 'front'
  const showBack = viewMode === 'split' || viewMode === 'back'

  return (
    <ScrollView
      contentContainerClassName="p-6 items-center justify-center min-h-full"
      showsVerticalScrollIndicator={true}
    >
      <View className="flex-row items-start justify-center flex-wrap gap-8 w-full max-w-6xl">
        {/* Front Face Panel */}
        {showFront && (
          <View className="items-center gap-3">
            <View className="flex-row items-center justify-between w-full px-2">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-emerald-500" />
                <Text className="text-xs font-bold text-text uppercase tracking-wider">
                  Card Front (Obverse)
                </Text>
              </View>
              <Text variant="caption" className="text-xs text-muted-text">
                {frontComposition.layers.length} layers · 600×900
              </Text>
            </View>

            <View testID="workshop-front-card-stage" className="shadow-2xl rounded-2xl bg-neutral-950 p-1">
              <CardCompositionRenderer
                composition={frontComposition}
                person={activeFixture.person}
                width={cardWidth}
                isPreview={true}
              />
            </View>
          </View>
        )}

        {/* Back Face Panel */}
        {showBack && (
          <View className="items-center gap-3">
            <View className="flex-row items-center justify-between w-full px-2">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-amber-500" />
                <Text className="text-xs font-bold text-text uppercase tracking-wider">
                  Card Back (Reverse)
                </Text>
              </View>
              <Text variant="caption" className="text-xs text-muted-text">
                {backComposition.layers.length} layers · 600×900
              </Text>
            </View>

            <View testID="workshop-back-card-stage" className="shadow-2xl rounded-2xl bg-neutral-950 p-1">
              <CardCompositionRenderer
                composition={backComposition}
                person={activeFixture.person}
                width={cardWidth}
                isPreview={true}
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
