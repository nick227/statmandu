import React, { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import {
  DIMENSIONS,
  getFamiliesForDimension,
  getVariationsForFamily,
  getNodeByKey,
} from '@/modules/taxonomy/catalog'
import type {
  TaxonomyDimensionKey,
  TaxonomySelections,
  StyleProperties,
} from '@/modules/taxonomy/types'
import {
  Palette,
  LayoutTemplate,
  ImageIcon,
  Type,
  Sparkles,
  Shuffle,
  Check,
} from 'lucide-react-native'

interface RecipePickerPanelProps {
  selections: TaxonomySelections
  onSelectVariation: (dimension: TaxonomyDimensionKey, variationKey: string) => void
  onRandomizeRecipe: () => void
}

const DIMENSION_ICONS: Record<TaxonomyDimensionKey, React.ComponentType<any>> = {
  style: Palette,
  layout: LayoutTemplate,
  artwork: ImageIcon,
  content: Type,
  effects: Sparkles,
}

export function RecipePickerPanel({
  selections,
  onSelectVariation,
  onRandomizeRecipe,
}: RecipePickerPanelProps) {
  const [activeDimension, setActiveDimension] = useState<TaxonomyDimensionKey>('style')

  // Find the selected variation node to determine its family
  const currentVariationKey = selections[activeDimension]?.key
  const currentVariationNode = getNodeByKey(currentVariationKey)
  const defaultFamilyKey = currentVariationNode?.parentKey || getFamiliesForDimension(activeDimension)[0]?.key

  const [activeFamilyKey, setActiveFamilyKey] = useState<string>(defaultFamilyKey)

  // Sync active family when activeDimension changes
  function handleSelectDimension(dim: TaxonomyDimensionKey) {
    setActiveDimension(dim)
    const varKey = selections[dim]?.key
    const varNode = getNodeByKey(varKey)
    const famKey = varNode?.parentKey || getFamiliesForDimension(dim)[0]?.key
    setActiveFamilyKey(famKey)
  }

  const families = getFamiliesForDimension(activeDimension)
  const variations = getVariationsForFamily(activeFamilyKey)

  return (
    <View className="rounded-2xl border border-border bg-surface p-md">
      {/* Header with Title and Randomize */}
      <View className="mb-sm flex-row items-center justify-between">
        <View>
          <Text className="font-bold text-base text-text">Design Recipe Studio</Text>
          <Text variant="caption">5-Dimensional Interchangeable Creative Library</Text>
        </View>
        <Button
          testID="randomize-recipe-button"
          size="sm"
          variant="ghost"
          icon={Shuffle}
          onPress={onRandomizeRecipe}
        >
          Surprise Me
        </Button>
      </View>

      {/* 5 Dimension Switcher Tabs */}
      <View className="mb-md flex-row gap-xs rounded-xl border border-border bg-card-surface p-1">
        {DIMENSIONS.map((dim) => {
          const isSelected = activeDimension === dim.key
          const IconComponent = DIMENSION_ICONS[dim.key]
          const currentVar = getNodeByKey(selections[dim.key]?.key)

          return (
            <Pressable
              key={dim.key}
              testID={`dimension-tab-${dim.key}`}
              onPress={() => handleSelectDimension(dim.key)}
              className={`flex-1 items-center justify-center rounded-lg py-sm px-1 ${
                isSelected ? 'bg-brand' : 'bg-transparent'
              }`}
            >
              <IconComponent
                size={18}
                color={isSelected ? '#FFFFFF' : '#94A3B8'}
              />
              <Text
                className={`mt-1 text-xs font-bold ${
                  isSelected ? 'text-white' : 'text-muted-text'
                }`}
              >
                {dim.name}
              </Text>
              <Text
                numberOfLines={1}
                className={`text-[10px] ${
                  isSelected ? 'text-white/80' : 'text-muted-text/70'
                }`}
              >
                {currentVar?.name || 'Default'}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* Families Selector (Horizontal Scroll) */}
      <View className="mb-sm">
        <Text variant="caption" className="mb-xs font-semibold uppercase tracking-wider">
          {activeDimension} Families ({families.length})
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-xs"
        >
          {families.map((family) => {
            const isFamilyActive = activeFamilyKey === family.key
            return (
              <Pressable
                key={family.key}
                testID={`family-chip-${family.key}`}
                onPress={() => setActiveFamilyKey(family.key)}
                className={`rounded-full border px-md py-xs ${
                  isFamilyActive
                    ? 'border-brand bg-brand/10'
                    : 'border-border bg-card-surface'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isFamilyActive ? 'text-brand' : 'text-text'
                  }`}
                >
                  {family.name}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Variations List for Active Family */}
      <View className="gap-xs">
        <Text variant="caption" className="font-semibold uppercase tracking-wider">
          Variations
        </Text>
        <View className="gap-xs">
          {variations.map((variation) => {
            const isVariationSelected = selections[activeDimension]?.key === variation.key
            const styleProps = variation.properties as Partial<StyleProperties> | undefined

            return (
              <Pressable
                key={variation.key}
                testID={`variation-card-${variation.key}`}
                onPress={() => onSelectVariation(activeDimension, variation.key)}
                className={`flex-row items-center justify-between rounded-xl border p-sm transition-colors ${
                  isVariationSelected
                    ? 'border-brand bg-brand/5'
                    : 'border-border bg-card-surface hover:border-brand/40'
                }`}
              >
                <View className="flex-1 pr-sm">
                  <View className="flex-row items-center gap-xs">
                    <Text className="font-bold text-sm text-text">
                      {variation.name}
                    </Text>
                    {isVariationSelected && (
                      <View className="rounded-full bg-brand p-0.5">
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  {variation.description && (
                    <Text variant="caption" numberOfLines={2} className="mt-0.5">
                      {variation.description}
                    </Text>
                  )}
                </View>

                {/* Aesthetic preview swatches for style variations */}
                {activeDimension === 'style' && styleProps?.palette && (
                  <View className="flex-row items-center gap-1 rounded-md border border-border p-1 bg-surface">
                    <View
                      style={{ backgroundColor: styleProps.palette.background || '#000000' }}
                      className="h-4 w-4 rounded-full border border-border"
                    />
                    <View
                      style={{ backgroundColor: styleProps.palette.foreground || '#FFFFFF' }}
                      className="h-4 w-4 rounded-full border border-border"
                    />
                    <View
                      style={{ backgroundColor: styleProps.palette.accent || '#3B82F6' }}
                      className="h-4 w-4 rounded-full border border-border"
                    />
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}
