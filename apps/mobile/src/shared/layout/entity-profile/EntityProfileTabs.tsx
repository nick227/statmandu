import { Pressable, ScrollView, View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'

export type EntityProfileTab = string | { label: string; badge?: number }

export interface EntityProfileTabsProps {
  tabs: EntityProfileTab[]
  active: string
  onChange: (tab: string) => void
  className?: string
}

export function EntityProfileTabs({ tabs, active, onChange, className }: EntityProfileTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      contentContainerClassName={cn('min-w-full flex-row border-b border-border px-lg', className)}
    >
      {tabs.map((tab) => {
        const label = typeof tab === 'string' ? tab : tab.label
        const badge = typeof tab === 'string' ? undefined : tab.badge
        const isActive = label === active
        return (
          <Pressable
            key={label}
            onPress={() => onChange(label)}
            hitSlop={8}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={cn('min-h-11 flex-row items-center gap-xs py-sm mr-lg border-b-2', isActive ? 'border-sport-accent' : 'border-transparent')}
          >
            <Text className={cn('font-semibold', isActive ? 'text-sport-accent' : 'text-muted-text')}>{label}</Text>
            {badge ? (
              <View className="min-w-4 items-center justify-center rounded-pill bg-sport-accent px-xs py-[1px]">
                <Text className="text-[11px] font-semibold text-white">{badge}</Text>
              </View>
            ) : null}
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
