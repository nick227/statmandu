import React from 'react'
import { Pressable, View } from 'react-native'
import {
  Layout,
  Type,
  Palette,
  Square,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { useNativeColor } from '@/lib/theme'
import type { AppearanceGroup } from '../types/panelNavigation'

export interface AppearanceGroupListProps {
  onSelectGroup: (group: AppearanceGroup) => void
}

const GROUPS: Array<{
  id: AppearanceGroup
  title: string
  description: string
  icon: typeof Layout
}> = [
  {
    id: 'layout',
    title: 'Layout',
    description: 'Geometry, plate positioning, and slot alignment',
    icon: Layout,
  },
  {
    id: 'typography',
    title: 'Typography',
    description: 'Font roles, scale fitting, and letter spacing',
    icon: Type,
  },
  {
    id: 'colors',
    title: 'Colors',
    description: 'Background tint, accent highlights, and contrast',
    icon: Palette,
  },
  {
    id: 'framing',
    title: 'Framing',
    description: 'Border thickness, inner mats, and outer rim',
    icon: Square,
  },
  {
    id: 'effects',
    title: 'Effects',
    description: 'Textures, grain, holographic sheen, and vignettes',
    icon: Sparkles,
  },
]

export function AppearanceGroupList({ onSelectGroup }: AppearanceGroupListProps) {
  const brandColor = useNativeColor('brand')
  const mutedColor = useNativeColor('mutedText')

  return (
    <View className="gap-2.5">
      <Text className="text-xs font-semibold text-muted-text px-1">
        Customize the card&apos;s visual presentation across five property groups:
      </Text>

      {GROUPS.map((group) => {
        const Icon = group.icon
        return (
          <Pressable
            key={group.id}
            testID={`appearance-group-${group.id}`}
            onPress={() => onSelectGroup(group.id)}
            className="flex-row items-center justify-between rounded-xl border border-border/80 bg-surface p-3.5 hover:border-brand/50 active:opacity-70 transition-all shadow-2xs"
            accessibilityRole="button"
            accessibilityLabel={`Open ${group.title} controls`}
          >
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View className="h-9 w-9 rounded-lg bg-brand/10 items-center justify-center">
                <Icon size={18} color={brandColor} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-text">
                  {group.title}
                </Text>
                <Text variant="caption" className="text-xs text-muted-text" numberOfLines={1}>
                  {group.description}
                </Text>
              </View>
            </View>

            <ChevronRight size={16} color={mutedColor} />
          </Pressable>
        )
      })}
    </View>
  )
}
