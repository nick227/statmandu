import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Check, ChevronDown, User } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import {
  BENCHMARK_PROFILES,
  type UniversalProfile,
} from '@/modules/profiles/profileTaxonomy'

export interface SubjectProfileSelectorProps {
  /** The currently active subject profile */
  activeProfile: UniversalProfile | null
  /** Whether the profile selector dropdown is open */
  isOpen: boolean
  /** Toggle dropdown */
  onToggle: () => void
  /** Callback when user selects a profile */
  onSelectProfile: (person: any) => void
  /** Custom profiles created by the user */
  customPeople?: any[]
}

/**
 * Subject Profile Selector:
 * Clean, floating selector linking card content dynamically to real cultural figures.
 * Drops down over content without pushing layout down.
 */
export function SubjectProfileSelector({
  activeProfile,
  isOpen,
  onToggle,
  onSelectProfile,
  customPeople = [],
}: SubjectProfileSelectorProps) {
  return (
    <View className="relative z-40">
      {/* Selected Profile Toggle Button */}
      <Pressable
        testID="person-selector-dropdown"
        onPress={onToggle}
        className="flex-row items-center justify-between rounded-xl border border-border bg-card-surface px-md py-sm"
      >
        <View className="flex-row items-center gap-sm flex-1">
          <View className="h-8 w-8 rounded-full bg-brand/10 items-center justify-center">
            <User size={16} className="text-brand" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-sm text-text">
              {activeProfile?.displayName || 'Select Profile'}
            </Text>
            <Text variant="caption" numberOfLines={1}>
              {activeProfile ? (activeProfile.originEra || activeProfile.hometown || 'Universal Profile') : 'No subject selected'}
            </Text>
          </View>
        </View>
        <ChevronDown size={18} className="text-muted-text ml-sm" />
      </Pressable>

      {/* Floating Dropdown Menu (Overlays content without pushing down) */}
      {isOpen && (
        <View className="absolute top-full left-0 right-0 mt-1 max-h-64 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden z-50">
          <ScrollView nestedScrollEnabled style={{ maxHeight: 240 }} className="bg-surface">
            {/* Benchmark Cultural Profiles */}
            <Text variant="caption" className="px-md py-1.5 font-bold text-muted-text bg-canvas border-b border-border/40">
              Benchmark Profiles (Dev Fixtures)
            </Text>
            {BENCHMARK_PROFILES.map((p) => {
              const isSelected = p.id === activeProfile?.id
              return (
                <Pressable
                  key={p.id}
                  testID={`benchmark-person-${p.slug}`}
                  onPress={() => onSelectProfile(p)}
                  className={`flex-row items-center justify-between px-md py-sm border-b border-border/50 ${
                    isSelected ? 'bg-brand/10' : 'bg-surface hover:bg-canvas'
                  }`}
                >
                  <View className="flex-1">
                    <Text
                      className={`text-sm ${
                        isSelected ? 'font-bold text-brand' : 'font-medium text-text'
                      }`}
                    >
                      {p.displayName}
                    </Text>
                    <Text variant="caption" numberOfLines={1}>
                      {p.specializations.map((s) => s.type).join(' · ')}
                    </Text>
                  </View>
                  {isSelected && <Check size={16} className="text-brand flex-shrink-0" />}
                </Pressable>
              )
            })}

            {/* Custom Profiles */}
            {customPeople && customPeople.length > 0 && (
              <>
                <Text variant="caption" className="px-md py-1.5 font-bold text-muted-text bg-canvas border-b border-border/40">
                  Custom Profiles
                </Text>
                {customPeople.map((p) => (
                  <Pressable
                    key={p.id}
                    testID={`custom-person-${p.id}`}
                    onPress={() => onSelectProfile(p)}
                    className="flex-row items-center justify-between px-md py-sm border-b border-border/50 bg-surface hover:bg-canvas"
                  >
                    <Text className="text-sm font-medium text-text">{p.displayName}</Text>
                  </Pressable>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  )
}
