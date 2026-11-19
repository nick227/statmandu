import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Check, ChevronDown } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { FLAGSHIP_DESIGNS, type FlagshipDesign } from '@/modules/designs/flagshipDesigns'

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
 * Flagship Design Selector:
 * Clean, floating dropdown selector for visual layout templates.
 * Floats over content below without pushing the page layout down.
 */
export function FlagshipDesignPicker({
  activeFlagshipId,
  activeFlagship,
  isOpen,
  onToggle,
  onSelectDesign,
}: FlagshipDesignPickerProps) {
  return (
    <View className="relative z-20">
      {/* Selected Flagship Button / Dropdown Trigger */}
      <Pressable
        testID="design-picker-dropdown"
        accessibilityRole="button"
        accessibilityLabel={`Design: ${activeFlagship.name}`}
        onPress={onToggle}
        className="flex-row items-center justify-between rounded-xl border border-border bg-card-surface px-md py-3 shadow-sm active:opacity-80"
      >
        <View className="flex-row items-center gap-sm flex-1">
          <View
            style={{ backgroundColor: activeFlagship.palette.background }}
            className="h-4 w-4 rounded-full border border-border flex-shrink-0"
          />
          <View className="flex-1">
            <Text className="font-semibold text-sm text-text">
              {activeFlagship.name}
            </Text>
          </View>
        </View>
        <ChevronDown size={18} className="text-muted-text ml-sm flex-shrink-0" />
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
                  className={`flex-row items-center justify-between px-md py-3 border-b border-border/50 ${
                    isSelected ? 'bg-brand/10' : 'bg-surface hover:bg-canvas active:bg-canvas'
                  }`}
                >
                  <View className="flex-row items-center gap-sm flex-1">
                    <View
                      style={{ backgroundColor: d.palette.background }}
                      className="h-3.5 w-3.5 rounded-full border border-border flex-shrink-0"
                    />
                    <Text
                      className={`text-sm ${
                        isSelected ? 'font-bold text-brand' : 'font-medium text-text'
                      }`}
                    >
                      {d.name}
                    </Text>
                  </View>
                  {isSelected && <Check size={16} className="text-brand flex-shrink-0" />}
                </Pressable>
              )
            })}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

