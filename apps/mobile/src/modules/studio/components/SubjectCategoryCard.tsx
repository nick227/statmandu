import React from 'react'
import { Pressable, View } from 'react-native'
import { User, Unlink, UserPlus, Check, ChevronDown } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Avatar } from '@/shared/ui/Avatar'
import { useNativeColor } from '@/lib/theme'
import type { UniversalProfile } from '@/modules/profiles/profileTaxonomy'

export interface SubjectCategoryCardProps {
  activeProfile: UniversalProfile | null
  people: Array<{ id: string; displayName?: string | null; bio?: string | null }>
  isOpen: boolean
  onToggle: () => void
  onSelectPerson: (person: any) => void
  onUnlink: () => void
}

export function SubjectCategoryCard({
  activeProfile,
  people,
  isOpen,
  onToggle,
  onSelectPerson,
  onUnlink,
}: SubjectCategoryCardProps) {
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

  return (
    <View className="rounded-xl border border-border/80 bg-surface p-4 gap-3 shadow-2xs">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <User size={15} color={brandColor} />
          <Text className="text-[11px] font-extrabold uppercase tracking-widest text-muted-text">
            Subject
          </Text>
        </View>

        {activeProfile ? (
          <Badge tone="brand">Linked</Badge>
        ) : (
          <Badge tone="muted-text">Independent</Badge>
        )}
      </View>

      {/* Profile info or Independent status */}
      {activeProfile ? (
        <View className="flex-row items-center justify-between gap-3 bg-canvas/60 rounded-lg p-2.5 border border-border/50">
          <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
            <Avatar
              uri={activeProfile.avatarUrl ?? null}
              fallback={activeProfile.displayName || 'Subject'}
              size="sm"
            />
            <View className="flex-1 min-w-0">
              <Text className="text-sm font-bold text-text truncate" numberOfLines={1}>
                {activeProfile.displayName}
              </Text>
              <Text variant="caption" className="text-xs text-muted-text truncate" numberOfLines={1}>
                {activeProfile.hometown || activeProfile.calling || 'Subject Reference'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onPress={onToggle}
              testID="change-subject-button"
            >
              Change
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={Unlink}
              onPress={onUnlink}
              testID="unlink-subject-button"
            >
              Unlink
            </Button>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-between gap-3 bg-canvas/40 rounded-lg p-2.5 border border-border/40">
          <View className="flex-1 min-w-0">
            <Text className="text-xs font-semibold text-text">
              Original Creative Work
            </Text>
            <Text variant="caption" className="text-[11px] text-muted-text">
              No subject linked. Card is authored independently.
            </Text>
          </View>
          <Button
            size="sm"
            variant="secondary"
            icon={UserPlus}
            onPress={onToggle}
            testID="select-subject-button"
          >
            Attach
          </Button>
        </View>
      )}

      {/* Dropdown for selecting a canonical person */}
      {isOpen && (
        <View
          testID="subject-picker-dropdown"
          className="rounded-lg border border-border bg-canvas p-2 gap-1.5 shadow-md"
        >
          <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-text px-2 pt-1">
            Select Canonical Subject
          </Text>

          {people.length === 0 ? (
            <Text variant="caption" className="text-xs text-muted-text px-2 py-2 italic">
              No profiles available in directory.
            </Text>
          ) : (
            people.map((p) => {
              const isSelected = activeProfile?.id === p.id
              return (
                <Pressable
                  key={p.id}
                  testID={`subject-option-${p.id}`}
                  onPress={() => onSelectPerson(p)}
                  className="flex-row items-center justify-between rounded-md px-2.5 py-2 hover:bg-surface active:bg-surface"
                >
                  <Text className="text-xs font-medium text-text">
                    {p.displayName || 'Unnamed'}
                  </Text>
                  {isSelected ? <Check size={14} color={brandColor} /> : null}
                </Pressable>
              )
            })
          )}
        </View>
      )}
    </View>
  )
}
