import { ScrollView, View } from 'react-native'
import { Filter } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { SidebarChip } from '@/shared/layout/SidebarRail'
import { useNativeColor } from '@/lib/theme'

export interface GlobalFilterBarProps {
  sports?: string[]
  activeSport?: string
  onSelectSport?: (sport: string) => void
}

export function GlobalFilterBar({ 
  sports = ['All Sports', 'Basketball', 'Football', 'Soccer', 'Volleyball', 'Baseball'], 
  activeSport = 'All Sports', 
  onSelectSport 
}: GlobalFilterBarProps) {
  const iconColor = useNativeColor('text')
  
  return (
    <View className="mb-md flex-row items-center gap-sm border-b border-border pb-sm">
      <View className="flex-row items-center gap-xs pr-xs border-r border-border">
        <Filter size={16} color={iconColor} />
        <Text variant="statLabel">Filter</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-xs pr-md">
        {sports.map((sport) => (
          <SidebarChip 
            key={sport} 
            label={sport} 
            active={activeSport === sport} 
            onPress={() => onSelectSport?.(sport)} 
          />
        ))}
      </ScrollView>
    </View>
  )
}
