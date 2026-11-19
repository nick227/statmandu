import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Check, ChevronDown, Sparkles } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { cn } from '@/lib/utils'
import {
  FLAGSHIP_DESIGNS,
  CURATED_PREFAB_DESIGNS,
  type FlagshipDesign,
} from '@/modules/designs/flagshipDesigns'

export interface FlagshipDesignPickerProps {
  /** Selected flagship template ID */
  activeFlagshipId: string
  /** Resolved flagship design entity */
  activeFlagship: FlagshipDesign
  /** Dropdown menu state */
  isOpen: boolean
  /** Toggle dropdown callback */
  onToggle: () => void
  /** Design selection callback */
  onSelectDesign: (designId: string) => void
}

/**
 * Flagship Design Selector & Visual Curated Gallery:
 * Displays the 6 curated prefab designs as rich visual collectible cards,
 * with harmonic palette swatches and artistic direction tags.
 * Also preserves the full design dropdown for legacy archives and backwards compatibility.
 */
export function FlagshipDesignPicker({
  activeFlagshipId,
  activeFlagship,
  isOpen,
  onToggle,
  onSelectDesign,
}: FlagshipDesignPickerProps) {
  return (
    <View className="gap-3">
      {/* 1. Curated Prefab Gallery Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Sparkles size={14} className="text-brand" />
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-text">
            Curated Collectible Designs
          </Text>
        </View>
        <Text variant="caption" className="text-[11px] text-muted-text">
          {CURATED_PREFAB_DESIGNS.length} Prefabs
        </Text>
      </View>

      {/* 2. Visual Prefab Cards Grid */}
      <View className="gap-2">
        {CURATED_PREFAB_DESIGNS.map((prefab) => {
          const isSelected = prefab.id === activeFlagshipId
          return (
            <Pressable
              key={prefab.id}
              testID={`design-gallery-${prefab.id}`}
              onPress={() => onSelectDesign(prefab.id)}
              className={cn(
                'rounded-xl border p-3 transition-all active:opacity-80',
                isSelected
                  ? 'border-brand bg-brand/5 shadow-xs'
                  : 'border-border bg-card-surface hover:bg-canvas',
              )}
              accessibilityRole="button"
              accessibilityLabel={`Select ${prefab.name} design`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5 flex-1 min-w-0 pr-2">
                  {/* Palette Swatch Bar */}
                  <View className="flex-row items-center rounded-full overflow-hidden border border-border flex-shrink-0">
                    <View
                      style={{ backgroundColor: prefab.palette.background }}
                      className="h-4 w-2.5"
                    />
                    <View
                      style={{ backgroundColor: prefab.palette.accent }}
                      className="h-4 w-2.5"
                    />
                    <View
                      style={{ backgroundColor: prefab.palette.border }}
                      className="h-4 w-2.5"
                    />
                  </View>

                  <View className="flex-1 min-w-0">
                    <Text
                      className={cn(
                        'text-sm font-bold',
                        isSelected ? 'text-brand' : 'text-text',
                      )}
                      numberOfLines={1}
                    >
                      {prefab.name}
                    </Text>
                    <Text
                      variant="caption"
                      className="text-[11px] text-muted-text"
                      numberOfLines={1}
                    >
                      {prefab.visualTradition}
                    </Text>
                  </View>
                </View>

                {isSelected ? (
                  <View className="h-5 w-5 rounded-full bg-brand items-center justify-center flex-shrink-0">
                    <Check size={12} color="#FFFFFF" />
                  </View>
                ) : (
                  <View className="h-5 w-5 rounded-full border border-border flex-shrink-0" />
                )}
              </View>
            </Pressable>
          )
        })}
      </View>

      {/* 3. Dropdown Selector (for All Archive Designs & Test Compatibility) */}
      <View className="relative z-20 pt-1">
        <Pressable
          testID="design-picker-dropdown"
          accessibilityRole="button"
          accessibilityLabel={`Design: ${activeFlagship.name}`}
          onPress={onToggle}
          className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-md py-2.5 shadow-xs active:opacity-80"
        >
          <View className="flex-row items-center gap-sm flex-1">
            <View
              style={{ backgroundColor: activeFlagship.palette.background }}
              className="h-3.5 w-3.5 rounded-full border border-border flex-shrink-0"
            />
            <View className="flex-1">
              <Text className="font-semibold text-xs text-text" numberOfLines={1}>
                Browse All Designs ({activeFlagship.name})
              </Text>
            </View>
          </View>
          <ChevronDown size={16} className="text-muted-text ml-sm flex-shrink-0" />
        </Pressable>

        {/* Floating Flagship Options Dropdown */}
        {isOpen && (
          <View className="absolute top-full left-0 right-0 mt-1 max-h-64 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden z-50">
            <ScrollView nestedScrollEnabled style={{ maxHeight: 240 }} className="bg-surface">
              {FLAGSHIP_DESIGNS.map((d) => {
                const isSelected = d.id === activeFlagshipId
                return (
                  <Pressable
                    key={d.id}
                    testID={`design-option-${d.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${d.name} design`}
                    onPress={() => onSelectDesign(d.id)}
                    className={`flex-row items-center justify-between px-md py-2.5 border-b border-border/50 ${
                      isSelected ? 'bg-brand/10' : 'bg-surface hover:bg-canvas active:bg-canvas'
                    }`}
                  >
                    <View className="flex-row items-center gap-sm flex-1">
                      <View
                        style={{ backgroundColor: d.palette.background }}
                        className="h-3.5 w-3.5 rounded-full border border-border flex-shrink-0"
                      />
                      <Text
                        className={`text-xs ${
                          isSelected ? 'font-bold text-brand' : 'font-medium text-text'
                        }`}
                      >
                        {d.name}
                      </Text>
                    </View>
                    {isSelected && <Check size={14} className="text-brand flex-shrink-0" />}
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  )
}
