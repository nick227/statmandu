import { Pressable, View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/Text'

export interface EntityTabsProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
  className?: string
}

// Same shell pattern across entity types, different tab labels per type
// (Player: Stats/Games/Media/Sources; Team: Roster/Stats/Games; etc.) —
// per docs: "Tabs vary by entity type but keep same shell pattern."
export function EntityTabs({ tabs, active, onChange, className }: EntityTabsProps) {
  return (
    <View className={cn('flex-row border-b border-border px-lg', className)}>
      {tabs.map((tab) => {
        const isActive = tab === active
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            className={cn('py-sm mr-lg border-b-2', isActive ? 'border-brand' : 'border-transparent')}
          >
            <Text className={cn('font-semibold', isActive ? 'text-brand' : 'text-muted-text')}>{tab}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
