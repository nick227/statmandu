import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Check, User, Users } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import type { FixtureSubject } from '../../types/fixtures'

export interface FixtureSelectorProps {
  fixtures: FixtureSubject[]
  activeFixtureId: string
  onSelectFixture: (fixture: FixtureSubject) => void
}

export function FixtureSelector({
  fixtures,
  activeFixtureId,
  onSelectFixture,
}: FixtureSelectorProps) {
  return (
    <View className="p-3 bg-surface border-b border-border">
      <View className="flex-row items-center gap-2 mb-2">
        <Users size={14} className="text-muted-text" />
        <Text className="text-xs font-bold text-text uppercase tracking-wider">
          Test Fixtures (Stress Scenarios)
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
        {fixtures.map((fix) => {
          const isSelected = fix.id === activeFixtureId
          return (
            <Pressable
              key={fix.id}
              testID={`fixture-pill-${fix.id}`}
              accessibilityRole="button"
              onPress={() => {
                onSelectFixture(fix)
              }}
              className={`px-3 py-2 rounded-xl border max-w-xs transition-all ${
                isSelected
                  ? 'border-brand bg-brand/10 shadow-xs'
                  : 'border-border bg-canvas/60 hover:bg-canvas'
              }`}
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-brand' : 'text-text'
                  }`}
                  numberOfLines={1}
                >
                  {fix.label}
                </Text>
                {isSelected && <Check size={12} className="text-brand flex-shrink-0" />}
              </View>
              <Text variant="caption" className="text-[11px] text-muted-text mt-0.5" numberOfLines={1}>
                {fix.description}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
