import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Check, ChevronDown } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { CARD_TYPES, type CardType } from '@/modules/designs/cardTypes'

export interface CardTypeSelectorProps {
  /** Currently active card type id */
  activeCardTypeId: string
  /** Resolved card type entity */
  activeCardType: CardType
  /** Dropdown open state */
  isOpen: boolean
  /** Toggle dropdown callback */
  onToggle: () => void
  /** Card type selection callback */
  onSelectType: (typeId: string) => void
}

/**
 * Card Type Selector:
 * Clean floating selector determining schema and fields.
 * Floats over content below without pushing the page down.
 */
export function CardTypeSelector({
  activeCardTypeId,
  activeCardType,
  isOpen,
  onToggle,
  onSelectType,
}: CardTypeSelectorProps) {
  return (
    <View className="relative z-30">
      {/* Selected Card Type Button */}
      <Pressable
        testID="card-type-dropdown"
        onPress={onToggle}
        className="flex-row items-center justify-between rounded-xl border border-border bg-card-surface px-md py-sm"
      >
        <View className="flex-1">
          <Text variant="caption" className="text-muted-text uppercase text-[10px] tracking-wider font-bold">
            Template
          </Text>
          <Text className="font-semibold text-sm text-text">
            {activeCardType.name}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {activeCardType.description}
          </Text>
        </View>
        <ChevronDown size={18} className="text-muted-text ml-sm" />
      </Pressable>

      {/* Floating Type Options Dropdown */}
      {isOpen && (
        <View className="absolute top-full left-0 right-0 mt-1 max-h-64 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden z-50">
          <ScrollView nestedScrollEnabled style={{ maxHeight: 240 }} className="bg-surface">
            {CARD_TYPES.map((t) => {
              const isSelected = t.id === activeCardTypeId
              return (
                <Pressable
                  key={t.id}
                  testID={`card-type-option-${t.id}`}
                  onPress={() => onSelectType(t.id)}
                  className={`flex-row items-center justify-between px-md py-sm border-b border-border/50 ${
                    isSelected ? 'bg-brand/10' : 'bg-surface hover:bg-canvas'
                  }`}
                >
                  <View className="flex-1 mr-sm">
                    <Text
                      className={`text-sm ${
                        isSelected ? 'font-bold text-brand' : 'font-medium text-text'
                      }`}
                    >
                      {t.name}
                    </Text>
                    <Text variant="caption" numberOfLines={1}>
                      {t.description}
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
