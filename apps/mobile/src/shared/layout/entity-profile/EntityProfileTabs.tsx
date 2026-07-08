import { Pressable, View } from 'react-native'
import { cn } from '@/lib/utils'
import { Text } from '@/shared/ui/Text'

export interface EntityProfileTabsProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
  className?: string
}

export function EntityProfileTabs({ tabs, active, onChange, className }: EntityProfileTabsProps) {
  return (
    <View className={cn('flex-row border-b border-border px-lg', className)}>
      {tabs.map((tab) => {
        const isActive = tab === active
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            hitSlop={8}
            className={cn('py-md mr-lg border-b-2', isActive ? 'border-sport-accent' : 'border-transparent')}
          >
            <Text className={cn('font-semibold', isActive ? 'text-sport-accent' : 'text-muted-text')}>{tab}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
