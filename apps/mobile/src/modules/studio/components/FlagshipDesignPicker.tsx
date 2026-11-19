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
 * Clean floating dropdown selecting the visual layout template.
 * Floats over content without pushing layout down.
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
      {/* Selected Flagship Button */}
      <Pressable
        testID="design-picker-dropdown"
        onPress={onToggle}
        className="flex-row items-center justify-between rounded-xl border border-border bg-card-surface px-md py-sm"
      >
        <View className="flex-row items-center gap-sm">
          <View
            style={{ backgroundColor: activeFlagship.palette.background }}
            className="h-4 w-4 rounded-full border border-border"
          />
          <Text className="font-semibold text-sm text-text">{activeFlagship.name}</Text>
          <Text variant="caption">({activeFlagship.family})</Text>
        </View>
        <ChevronDown size={18} className="text-muted-text" />
      </Pressable>

      {/* Floating Flagship Options List */}
      {isOpen && (
        <View className="absolute top-full left-0 right-0 mt-1 max-h-64 rounded-xl border border-border bg-card-surface shadow-2xl overflow-hidden z-50">
          <ScrollView nestedScrollEnabled style={{ maxHeight: 250 }}>
            {FLAGSHIP_DESIGNS.map((d) => {
              const isSelected = d.id === activeFlagshipId
              return (
                <Pressable
                  key={d.id}
                  testID={`design-option-${d.id}`}
                  onPress={() => onSelectDesign(d.id)}
                  className={`flex-row items-center justify-between px-md py-sm border-b border-border/50 ${
                    isSelected ? 'bg-brand/10' : 'hover:bg-canvas'
                  }`}
                >
                  <View className="flex-row items-center gap-sm">
                    <View
                      style={{ backgroundColor: d.palette.background }}
                      className="h-3 w-3 rounded-full border border-border"
                    />
                    <Text
                      className={`text-sm ${
                        isSelected ? 'font-bold text-brand' : 'font-medium text-text'
                      }`}
                    >
                      {d.name}
                    </Text>
                    <Text variant="caption">{d.family}</Text>
                  </View>
                  {isSelected && <Check size={16} className="text-brand" />}
                </Pressable>
              )
            })}
          </ScrollView>
        </View>
      )}
    </View>
  )
}
